import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "./Map.css";
import "leaflet.markercluster";

/* ==================== LEAFLET ICON FIX ==================== */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ==================== CUSTOM MARKER ICONS ==================== */
const createCustomIcon = (color, emoji) => {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <span style="transform: rotate(45deg); font-size: 16px;">${emoji}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

const ICONS = {
  origin: createCustomIcon("#22c55e", "🟢"),
  destination: createCustomIcon("#ef4444", "🔴"),
  favorite: createCustomIcon("#f59e0b", "⭐"),
};

/* ==================== ROUTING COMPONENT ==================== */
const RoutingMachine = ({ waypoints, mode, selectedIndex, onRoutes, onSteps, onBounds }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || waypoints.length < 2) return;

    // Remove existing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    const ROUTING_PROFILES = { drive: "car", walk: "foot", bike: "bike" };

    routingControlRef.current = L.Routing.control({
      waypoints: waypoints.map((w) => L.latLng(w.lat, w.lng)),
      router: L.Routing.osrmv1({ profile: ROUTING_PROFILES[mode] }),
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      showAlternatives: true,
      routeWhileDragging: false,
      lineOptions: {
        styles: [{ color: "#2563eb", weight: 6, opacity: 0.8 }],
      },
      altLineOptions: {
        styles: [{ color: "#94a3b8", weight: 4, opacity: 0.6 }],
      },
    })
      .on("routesfound", (e) => {
        onRoutes(e.routes);
        const route = e.routes[selectedIndex] || e.routes[0];
        onSteps(
          route.instructions.map((instruction, idx) => ({
            id: idx,
            text: instruction.text,
            distance: instruction.distance,
          }))
        );
        onBounds(L.latLngBounds(route.coordinates));
      })
      .addTo(map);

    // Hide default UI
    routingControlRef.current.getContainer().style.display = "none";

    return () => {
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, waypoints, mode, selectedIndex, onRoutes, onSteps, onBounds]);

  return null;
};

/* ==================== MARKER CLUSTERING ==================== */
const MarkerClusterLayer = ({ favorites }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing cluster group
    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    clusterGroupRef.current = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      removeOutsideVisibleBounds: true,
      animate: true,
    });

    favorites.forEach((fav) => {
      const marker = L.marker([fav.lat, fav.lng], { icon: ICONS.favorite }).bindPopup(
        `<div class="p-2">
          <b class="text-sm">${fav.name}</b><br/>
          <button class="text-xs text-blue-600 mt-1 hover:underline" onclick="window.handleFavoriteClick('${fav.id}')">
            Use as destination
          </button>
        </div>`
      );
      clusterGroupRef.current.addLayer(marker);
    });

    map.addLayer(clusterGroupRef.current);

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map, favorites]);

  return null;
};

/* ==================== MAP CONTROLS ==================== */
const MapControls = ({ routeBounds, follow, onFollowToggle }) => {
  const map = useMap();

  const handleZoomIn = () => map.zoomIn();
  const handleZoomOut = () => map.zoomOut();
  const handleFollow = () => {
    onFollowToggle();
    if (!follow) {
      map.locate({ watch: true, setView: true, maxZoom: 17 });
    }
  };
  const handleFitBounds = () => {
    if (routeBounds) {
      map.fitBounds(routeBounds, { padding: [50, 50] });
    }
  };

  return (
    <div className="absolute z-[1000] bottom-24 right-4 flex flex-col gap-2">
      <button
        onClick={handleZoomIn}
        className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-xl"
        aria-label="Zoom in"
      >
        ➕
      </button>
      <button
        onClick={handleZoomOut}
        className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-xl"
        aria-label="Zoom out"
      >
        ➖
      </button>
      <button
        onClick={handleFollow}
        className={`bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-xl ${
          follow ? "ring-2 ring-blue-500" : ""
        }`}
        aria-label="Follow location"
      >
        📍
      </button>
      {routeBounds && (
        <button
          onClick={handleFitBounds}
          className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-xl"
          aria-label="Fit route"
        >
          🧭
        </button>
      )}
    </div>
  );
};

/* ==================== SEARCH BOX ==================== */
const SearchBox = ({ value, onChange, onSelect, placeholder, icon }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            value
          )}&limit=5`
        );
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  const handleSelect = (result) => {
    onSelect({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      name: result.display_name,
    });
    onChange(result.display_name);
    setResults([]);
  };

  return (
    <div className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xl">{icon}</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {results.length > 0 && (
        <div className="absolute w-full mt-2 bg-white dark:bg-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 border dark:border-gray-600">
          {results.map((result, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(result)}
              className="px-4 py-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer border-b dark:border-gray-600 last:border-b-0 dark:text-white transition-colors"
            >
              📍 {result.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==================== FAVORITES PANEL ==================== */
const FavoritesPanel = ({ favorites, onDelete, onUse }) => {
  if (favorites.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-4xl mb-2">⭐</p>
        <p className="text-sm">No favorites saved yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {favorites.map((fav) => (
        <div
          key={fav.id}
          className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium dark:text-white truncate">{fav.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {fav.lat.toFixed(4)}, {fav.lng.toFixed(4)}
              </p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => onUse(fav)}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Use
              </button>
              <button
                onClick={() => onDelete(fav.id)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ==================== MAIN MAP COMPONENT ==================== */
export default function Map() {
  // Mode & Theme
  const [mode, setMode] = useState("drive");
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  // UI State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("route");

  // Location State
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originText, setOriginText] = useState("");
  const [destText, setDestText] = useState("");

  // Route State
  const [showRoute, setShowRoute] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [steps, setSteps] = useState([]);
  const [routeBounds, setRouteBounds] = useState(null);

  // Map State
  const [follow, setFollow] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem("favorites");
    return saved ? JSON.parse(saved) : [];
  });

  // Persist dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist favorites
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // Global favorite click handler for map popups
  useEffect(() => {
    window.handleFavoriteClick = (id) => {
      const fav = favorites.find((f) => f.id === id);
      if (fav) {
        setDestination(fav);
        setDestText(fav.name);
        setShowRoute(false);
        setActiveTab("route");
      }
    };
    return () => delete window.handleFavoriteClick;
  }, [favorites]);

  // Handlers
  const handleSwapRoute = () => {
    setOrigin(destination);
    setDestination(origin);
    setOriginText(destText);
    setDestText(originText);
    setShowRoute(false);
    setRoutes([]);
    setSteps([]);
  };

  const handleAddToFavorites = () => {
    if (!destination) return;
    const newFav = {
      id: Date.now().toString(),
      ...destination,
    };
    setFavorites([...favorites, newFav]);
  };

  const handleDeleteFavorite = (id) => {
    setFavorites(favorites.filter((f) => f.id !== id));
  };

  const handleUseFavorite = (fav) => {
    setDestination(fav);
    setDestText(fav.name);
    setShowRoute(false);
    setActiveTab("route");
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setShowRoute(false);
  };

  return (
    <div className={`h-screen w-screen flex ${darkMode ? "dark" : ""}`}>
      {/* SIDEBAR */}
      <aside
        className={`${
          sidebarOpen ? "w-96" : "w-0"
        } bg-white dark:bg-gray-800 shadow-2xl transition-all duration-300 overflow-hidden flex flex-col z-[1001]`}
      >
        {/* Header */}
        <div className="p-4 border-b dark:border-gray-700">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🗺️ Maps
          </h1>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setActiveTab("route")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "route"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-white"
              }`}
            >
              🧭 Route
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === "favorites"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700 dark:text-white"
              }`}
            >
              ⭐ Favorites
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "route" ? (
            <>
              {/* Search Boxes */}
              <div className="space-y-3">
                <SearchBox
                  value={originText}
                  onChange={setOriginText}
                  onSelect={setOrigin}
                  placeholder="Starting point"
                  icon="🟢"
                />
                <SearchBox
                  value={destText}
                  onChange={setDestText}
                  onSelect={setDestination}
                  placeholder="Destination"
                  icon="🔴"
                />
              </div>

              {/* Travel Mode Selection */}
              <div className="flex gap-2">
                {["drive", "walk", "bike"].map((m) => (
                  <button
                    key={m}
                    onClick={() => handleModeChange(m)}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      mode === m
                        ? "bg-blue-500 text-white shadow-lg"
                        : "bg-gray-100 dark:bg-gray-700 dark:text-white"
                    }`}
                  >
                    {m === "drive" ? "🚗 Drive" : m === "walk" ? "🚶 Walk" : "🚴 Bike"}
                  </button>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {origin && destination && (
                  <button
                    onClick={handleSwapRoute}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 dark:text-white rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  >
                    🔄 Swap
                  </button>
                )}
                {destination && (
                  <button
                    onClick={handleAddToFavorites}
                    className="px-4 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-all"
                  >
                    ⭐
                  </button>
                )}
              </div>

              {/* Show Route Button */}
              {origin && destination && !showRoute && (
                <button
                  onClick={() => setShowRoute(true)}
                  className="w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all shadow-lg"
                >
                  🚀 Show Route
                </button>
              )}

              {/* Alternative Routes */}
              {routes.length > 1 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 dark:text-white">Alternative Routes</h3>
                  <div className="space-y-2">
                    {routes.map((route, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedRoute(idx)}
                        className={`w-full text-left p-3 rounded-lg transition-all ${
                          selectedRoute === idx
                            ? "bg-blue-50 dark:bg-blue-900 border-2 border-blue-500"
                            : "bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500"
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium dark:text-white">Route {idx + 1}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-300">
                            ⏱ {Math.round(route.summary.totalTime / 60)} min
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          📏 {(route.summary.totalDistance / 1000).toFixed(1)} km
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Turn-by-Turn Directions */}
              {steps.length > 0 && (
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3 dark:text-white">Directions</h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className="bg-white dark:bg-gray-600 p-3 rounded-lg border border-gray-200 dark:border-gray-500"
                      >
                        <div className="flex gap-3">
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                            {step.id + 1}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm dark:text-white">{step.text}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
                              {(step.distance / 1000).toFixed(2)} km
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <FavoritesPanel
              favorites={favorites}
              onDelete={handleDeleteFavorite}
              onUse={handleUseFavorite}
            />
          )}
        </div>
      </aside>

      {/* SIDEBAR TOGGLE */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute z-[1002] top-4 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? "◀" : "▶"}
      </button>

      {/* DARK MODE TOGGLE */}
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="absolute z-[1002] top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg hover:shadow-xl transition-all text-xl"
        aria-label="Toggle dark mode"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      {/* MAP CONTAINER */}
      <main className="flex-1 relative">
        <MapContainer
          center={[27.7172, 85.324]}
          zoom={13}
          className="h-full w-full"
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={
              darkMode
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            }
          />

          {/* Origin Marker */}
          {origin && (
            <Marker position={[origin.lat, origin.lng]} icon={ICONS.origin}>
              <Popup>
                <div className="p-2">
                  <b className="text-sm">Origin</b>
                  <p className="text-xs mt-1">{origin.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Destination Marker */}
          {destination && (
            <Marker position={[destination.lat, destination.lng]} icon={ICONS.destination}>
              <Popup>
                <div className="p-2">
                  <b className="text-sm">Destination</b>
                  <p className="text-xs mt-1">{destination.name}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Favorites Cluster */}
          <MarkerClusterLayer favorites={favorites} />

          {/* Routing */}
          {showRoute && origin && destination && (
            <RoutingMachine
              waypoints={[origin, destination]}
              mode={mode}
              selectedIndex={selectedRoute}
              onRoutes={setRoutes}
              onSteps={setSteps}
              onBounds={setRouteBounds}
            />
          )}

          {/* Map Controls */}
          <MapControls
            routeBounds={routeBounds}
            follow={follow}
            onFollowToggle={() => setFollow(!follow)}
          />
        </MapContainer>
      </main>
    </div>
  );
}