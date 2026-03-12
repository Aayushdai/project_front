import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet.markercluster";
import "./Map.css";

/* ==================== LEAFLET ICON FIX ==================== */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

/* ==================== CUSTOM MARKER ICONS ==================== */
const createCustomIcon = (color, emoji) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);">
      <span style="transform:rotate(45deg);font-size:16px;">${emoji}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

const ICONS = {
  origin: createCustomIcon("#22c55e", "🟢"),
  destination: createCustomIcon("#ef4444", "🔴"),
  favorite: createCustomIcon("#f97316", "⭐"),
};

/* ==================== ROUTING COMPONENT ==================== */
const RoutingMachine = ({ waypoints, mode, selectedIndex, onRoutes, onSteps, onBounds }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || waypoints.length < 2) return;
    if (routingControlRef.current) map.removeControl(routingControlRef.current);

    const PROFILES = { drive: "car", walk: "foot", bike: "bike" };

    routingControlRef.current = L.Routing.control({
      waypoints: waypoints.map((w) => L.latLng(w.lat, w.lng)),
      router: L.Routing.osrmv1({ profile: PROFILES[mode] }),
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      showAlternatives: true,
      routeWhileDragging: false,
      lineOptions: { styles: [{ color: "#1976D2", weight: 6, opacity: 0.85 }] },
      altLineOptions: { styles: [{ color: "#94a3b8", weight: 4, opacity: 0.6 }] },
    })
      .on("routesfound", (e) => {
        onRoutes(e.routes);
        const route = e.routes[selectedIndex] || e.routes[0];
        onSteps(route.instructions.map((ins, idx) => ({ id: idx, text: ins.text, distance: ins.distance })));
        onBounds(L.latLngBounds(route.coordinates));
      })
      .addTo(map);

    routingControlRef.current.getContainer().style.display = "none";
    return () => { if (routingControlRef.current) map.removeControl(routingControlRef.current); };
  }, [map, waypoints, mode, selectedIndex]);

  return null;
};

/* ==================== MARKER CLUSTERING ==================== */
const MarkerClusterLayer = ({ favorites }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);

    clusterGroupRef.current = L.markerClusterGroup({ showCoverageOnHover: false, animate: true });

    favorites.forEach((fav) => {
      L.marker([fav.lat, fav.lng], { icon: ICONS.favorite })
        .bindPopup(`<div style="font-family:'Poppins',sans-serif;padding:6px"><b style="font-size:13px">${fav.name}</b><br/>
          <button style="font-size:11px;color:#1976D2;margin-top:4px;cursor:pointer;border:none;background:none;padding:0"
            onclick="window.handleFavoriteClick('${fav.id}')">Use as destination →</button></div>`)
        .addTo(clusterGroupRef.current);
    });

    map.addLayer(clusterGroupRef.current);
    return () => { if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current); };
  }, [map, favorites]);

  return null;
};

/* ==================== MAP CONTROLS ==================== */
const MapControls = ({ routeBounds, follow, onFollowToggle }) => {
  const map = useMap();
  return (
    <div style={{ position: "absolute", zIndex: 1000, bottom: "96px", right: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {[
        { label: "➕", action: () => map.zoomIn(), title: "Zoom in" },
        { label: "➖", action: () => map.zoomOut(), title: "Zoom out" },
        { label: "📍", action: () => { onFollowToggle(); if (!follow) map.locate({ watch: true, setView: true, maxZoom: 17 }); }, title: "Follow", active: follow },
        ...(routeBounds ? [{ label: "🧭", action: () => map.fitBounds(routeBounds, { padding: [50, 50] }), title: "Fit route" }] : []),
      ].map(({ label, action, title, active }) => (
        <button key={title} onClick={action} title={title} style={{
          background: "#fff", border: active ? "2px solid #1976D2" : "1px solid rgba(0,0,0,0.1)",
          borderRadius: "10px", padding: "10px", fontSize: "18px", cursor: "pointer",
          boxShadow: "0 2px 12px rgba(0,0,0,0.12)", transition: "all 0.2s",
        }}>{label}</button>
      ))}
    </div>
  );
};

/* ==================== SEARCH BOX ==================== */
const SearchBox = ({ value, onChange, onSelect, placeholder, icon }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!value.trim()) { setResults([]); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
        setResults(await res.json());
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "18px" }}>{icon}</span>
        <input
          type="text" value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{
            width: "100%", paddingLeft: "44px", paddingRight: "40px", paddingTop: "11px", paddingBottom: "11px",
            border: "1.5px solid #e2e8f0", borderRadius: "10px", fontSize: "13px",
            fontFamily: "'Poppins', sans-serif", outline: "none", background: "#f8fafc",
            color: "#1e293b", boxSizing: "border-box", transition: "border-color 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "#1976D2"}
          onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
        />
        {loading && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
            <div style={{ width: "16px", height: "16px", border: "2px solid #1976D2", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        )}
      </div>
      {results.length > 0 && (
        <div style={{
          position: "absolute", width: "100%", marginTop: "6px", background: "#fff",
          borderRadius: "10px", boxShadow: "0 8px 30px rgba(0,0,0,0.12)", maxHeight: "220px",
          overflowY: "auto", zIndex: 50, border: "1px solid #e2e8f0",
        }}>
          {results.map((r, i) => (
            <div key={i} onClick={() => { onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), name: r.display_name }); onChange(r.display_name); setResults([]); }}
              style={{
                padding: "10px 14px", fontSize: "12px", fontFamily: "'Poppins', sans-serif",
                color: "#334155", cursor: "pointer", borderBottom: i < results.length - 1 ? "1px solid #f1f5f9" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(25,118,210,0.06)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              📍 {r.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ==================== MAIN MAP COMPONENT ==================== */
export default function Map() {
  const [mode, setMode] = useState("drive");
  const [darkMode, setDarkMode] = useState(() => JSON.parse(localStorage.getItem("darkMode") || "false"));
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("route");
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [originText, setOriginText] = useState("");
  const [destText, setDestText] = useState("");
  const [showRoute, setShowRoute] = useState(false);
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState(0);
  const [steps, setSteps] = useState([]);
  const [routeBounds, setRouteBounds] = useState(null);
  const [follow, setFollow] = useState(false);
  const [favorites, setFavorites] = useState(() => JSON.parse(localStorage.getItem("favorites") || "[]"));

  useEffect(() => { localStorage.setItem("darkMode", JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem("favorites", JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => {
    window.handleFavoriteClick = (id) => {
      const fav = favorites.find((f) => f.id === id);
      if (fav) { setDestination(fav); setDestText(fav.name); setShowRoute(false); setActiveTab("route"); }
    };
    return () => delete window.handleFavoriteClick;
  }, [favorites]);

  const handleSwap = () => {
    setOrigin(destination); setDestination(origin);
    setOriginText(destText); setDestText(originText);
    setShowRoute(false); setRoutes([]); setSteps([]);
  };

  const colors = {
    bg: darkMode ? "#0f1117" : "#ffffff",
    surface: darkMode ? "#1a1f2e" : "#f8fafc",
    border: darkMode ? "rgba(255,255,255,0.08)" : "#e2e8f0",
    text: darkMode ? "#f1f5f9" : "#1e293b",
    subtext: darkMode ? "rgba(255,255,255,0.45)" : "#64748b",
    inputBg: darkMode ? "#252d3d" : "#f8fafc",
    inputText: darkMode ? "#f1f5f9" : "#1e293b",
    cardBg: darkMode ? "#1e2535" : "#f1f5f9",
  };

  const modeIcons = { drive: "🚗", walk: "🚶", bike: "🚴" };
  const modeLabels = { drive: "Drive", walk: "Walk", bike: "Bike" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(25,118,210,0.3); border-radius: 4px; }
      `}</style>

      <div style={{ height: "100vh", width: "100vw", display: "flex", fontFamily: "'Poppins', sans-serif", background: colors.bg }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: sidebarOpen ? "360px" : "0",
          minWidth: sidebarOpen ? "360px" : "0",
          background: colors.bg,
          borderRight: `1px solid ${colors.border}`,
          boxShadow: "4px 0 24px rgba(0,0,0,0.08)",
          transition: "all 0.3s ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 1001,
        }}>

          {/* Sidebar Header */}
          <div style={{ padding: "20px 20px 0", borderBottom: `1px solid ${colors.border}`, paddingBottom: "16px" }}>
            <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "20px", color: colors.text, margin: "0 0 14px", display: "flex", alignItems: "center", gap: "8px" }}>
              🗺️ <span>Travel <span style={{ color: "#1976D2" }}>Maps</span></span>
            </h1>

            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", background: colors.surface, padding: "4px", borderRadius: "10px" }}>
              {[{ id: "route", label: "🧭 Route" }, { id: "favorites", label: "⭐ Saved" }].map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  flex: 1, padding: "8px", borderRadius: "8px", border: "none", cursor: "pointer",
                  fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px",
                  background: activeTab === tab.id ? "#1976D2" : "transparent",
                  color: activeTab === tab.id ? "#fff" : colors.subtext,
                  transition: "all 0.2s",
                }}>{tab.label}</button>
              ))}
            </div>
          </div>

          {/* Sidebar Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {activeTab === "route" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>

                {/* Search inputs */}
                <SearchBox value={originText} onChange={setOriginText} onSelect={setOrigin} placeholder="Starting point" icon="🟢" />
                <SearchBox value={destText} onChange={setDestText} onSelect={setDestination} placeholder="Destination" icon="🔴" />

                {/* Travel Mode */}
                <div style={{ display: "flex", gap: "8px" }}>
                  {["drive", "walk", "bike"].map((m) => (
                    <button key={m} onClick={() => { setMode(m); setShowRoute(false); }} style={{
                      flex: 1, padding: "10px 0", borderRadius: "10px", border: "none", cursor: "pointer",
                      fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px",
                      background: mode === m ? "linear-gradient(135deg, #1565C0, #1976D2)" : colors.surface,
                      color: mode === m ? "#fff" : colors.subtext,
                      boxShadow: mode === m ? "0 4px 14px rgba(25,118,210,0.3)" : "none",
                      transition: "all 0.2s",
                    }}>{modeIcons[m]} {modeLabels[m]}</button>
                  ))}
                </div>

                {/* Action Buttons */}
                {(origin && destination) && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={handleSwap} style={{
                      flex: 1, padding: "10px", borderRadius: "10px", border: `1.5px solid ${colors.border}`,
                      background: "transparent", color: colors.text, fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600, fontSize: "12px", cursor: "pointer",
                    }}>🔄 Swap</button>
                    {destination && (
                      <button onClick={() => setFavorites([...favorites, { id: Date.now().toString(), ...destination }])} style={{
                        padding: "10px 16px", borderRadius: "10px", border: "none",
                        background: "linear-gradient(135deg, #ea580c, #f97316)",
                        color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                        fontSize: "13px", cursor: "pointer", boxShadow: "0 4px 14px rgba(249,115,22,0.3)",
                      }}>⭐</button>
                    )}
                  </div>
                )}

                {/* Show Route Button */}
                {origin && destination && !showRoute && (
                  <button onClick={() => setShowRoute(true)} style={{
                    width: "100%", padding: "13px", borderRadius: "10px", border: "none",
                    background: "linear-gradient(135deg, #1565C0, #1976D2, #42a5f5)",
                    color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                    fontSize: "14px", cursor: "pointer", boxShadow: "0 4px 18px rgba(25,118,210,0.35)",
                    letterSpacing: "0.02em",
                  }}>🚀 Show Route</button>
                )}

                {/* Alternative Routes */}
                {routes.length > 1 && (
                  <div style={{ background: colors.surface, borderRadius: "12px", padding: "14px", border: `1px solid ${colors.border}` }}>
                    <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "13px", color: colors.text, margin: "0 0 10px" }}>Alternative Routes</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {routes.map((route, idx) => (
                        <button key={idx} onClick={() => setSelectedRoute(idx)} style={{
                          padding: "10px 12px", borderRadius: "8px", border: selectedRoute === idx ? "2px solid #1976D2" : `1px solid ${colors.border}`,
                          background: selectedRoute === idx ? "rgba(25,118,210,0.08)" : colors.bg,
                          cursor: "pointer", textAlign: "left", transition: "all 0.2s",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "13px", color: selectedRoute === idx ? "#1976D2" : colors.text }}>Route {idx + 1}</span>
                            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: colors.subtext }}>⏱ {Math.round(route.summary.totalTime / 60)} min</span>
                          </div>
                          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: colors.subtext, marginTop: "2px" }}>
                            📏 {(route.summary.totalDistance / 1000).toFixed(1)} km
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Turn-by-Turn Steps */}
                {steps.length > 0 && (
                  <div style={{ background: colors.surface, borderRadius: "12px", padding: "14px", border: `1px solid ${colors.border}` }}>
                    <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 700, fontSize: "13px", color: colors.text, margin: "0 0 10px" }}>Directions</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "300px", overflowY: "auto" }}>
                      {steps.map((step) => (
                        <div key={step.id} style={{
                          display: "flex", gap: "10px", padding: "10px", borderRadius: "8px",
                          background: colors.bg, border: `1px solid ${colors.border}`,
                        }}>
                          <div style={{
                            flexShrink: 0, width: "22px", height: "22px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #1565C0, #1976D2)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#fff", fontSize: "10px", fontWeight: 700,
                          }}>{step.id + 1}</div>
                          <div>
                            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: colors.text, margin: "0 0 2px" }}>{step.text}</p>
                            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: colors.subtext, margin: 0 }}>{(step.distance / 1000).toFixed(2)} km</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Favorites Tab */
              favorites.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: colors.subtext }}>
                  <p style={{ fontSize: "40px", margin: "0 0 8px" }}>⭐</p>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px" }}>No saved places yet</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {favorites.map((fav) => (
                    <div key={fav.id} style={{
                      background: colors.surface, borderRadius: "10px", padding: "12px",
                      border: `1px solid ${colors.border}`,
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", color: colors.text, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fav.name}</p>
                          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: colors.subtext, margin: 0 }}>{fav.lat.toFixed(4)}, {fav.lng.toFixed(4)}</p>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => { setDestination(fav); setDestText(fav.name); setShowRoute(false); setActiveTab("route"); }} style={{
                            padding: "5px 10px", borderRadius: "6px", border: "none",
                            background: "linear-gradient(135deg, #1565C0, #1976D2)",
                            color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                            fontSize: "11px", cursor: "pointer",
                          }}>Use</button>
                          <button onClick={() => setFavorites(favorites.filter((f) => f.id !== fav.id))} style={{
                            padding: "5px 10px", borderRadius: "6px", border: "none",
                            background: "#fee2e2", color: "#ef4444",
                            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                            fontSize: "11px", cursor: "pointer",
                          }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </aside>

        {/* ── SIDEBAR TOGGLE ── */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          position: "absolute", zIndex: 1002, top: "16px", left: sidebarOpen ? "372px" : "16px",
          background: "#1976D2", border: "none", borderRadius: "10px", padding: "10px 14px",
          color: "#fff", fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: "14px",
          cursor: "pointer", boxShadow: "0 4px 14px rgba(25,118,210,0.35)", transition: "left 0.3s ease",
        }}>{sidebarOpen ? "◀" : "▶"}</button>

        {/* ── DARK MODE TOGGLE ── */}
        <button onClick={() => setDarkMode(!darkMode)} style={{
          position: "absolute", zIndex: 1002, top: "16px", right: "16px",
          background: darkMode ? "#1e2535" : "#fff", border: `1px solid ${colors.border}`,
          borderRadius: "10px", padding: "10px", fontSize: "18px", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(0,0,0,0.1)", transition: "all 0.2s",
        }}>{darkMode ? "☀️" : "🌙"}</button>

        {/* ── MAP ── */}
        <main style={{ flex: 1, position: "relative" }}>
          <MapContainer center={[27.7172, 85.324]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer
              attribution={darkMode
                ? '&copy; <a href="https://carto.com/">CARTO</a>'
                : 'Tiles &copy; Esri &mdash; Source: Esri, HERE, Garmin, USGS'}
              url={darkMode
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"}
            />

            {origin && (
              <Marker position={[origin.lat, origin.lng]} icon={ICONS.origin}>
                <Popup><div style={{ fontFamily: "'Poppins',sans-serif", padding: "4px" }}><b>Origin</b><p style={{ fontSize: "12px", margin: "4px 0 0" }}>{origin.name}</p></div></Popup>
              </Marker>
            )}
            {destination && (
              <Marker position={[destination.lat, destination.lng]} icon={ICONS.destination}>
                <Popup><div style={{ fontFamily: "'Poppins',sans-serif", padding: "4px" }}><b>Destination</b><p style={{ fontSize: "12px", margin: "4px 0 0" }}>{destination.name}</p></div></Popup>
              </Marker>
            )}

            <MarkerClusterLayer favorites={favorites} />

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

            <MapControls routeBounds={routeBounds} follow={follow} onFollowToggle={() => setFollow(!follow)} />
          </MapContainer>
        </main>
      </div>
    </>
  );
}