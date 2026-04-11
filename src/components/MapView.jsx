import React, { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet.markercluster";
import "./Map.css";

// ============================================
// CONSTANTS
// ============================================
const COLORS = {
  primary: "#f0c27a",
  text: "#f5f0e8",
  textDim: "#0f0e0d",
  bg: "#07080f",
  bgLight: "#0a0b12",
  bgLighter: "#0f101a",
  border: "rgba(240,194,122,0.08)",
  borderLight: "rgba(240,194,122,0.15)",
  borderHeavy: "rgba(240,194,122,0.5)",
  orange: "#c9973a",
  green: "#34d399",
  red: "#f87171",
};

const SIZES = {
  xs: "4px",
  sm: "8px",
  md: "10px",
  lg: "12px",
  xl: "14px",
  xxl: "16px",
  xxxl: "20px",
};

const BORDER_RADIUS = {
  xs: "6px",
  sm: "8px",
  md: "10px",
  lg: "12px",
};

const FONTS = {
  poppins: "'Poppins', sans-serif",
  montserrat: "'Montserrat', sans-serif",
};

const MAP_STYLES = {
  CSS: `
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Poppins:wght@300;400;500;600&display=swap');
    @keyframes spin { to { transform: rotate(360deg); } }
    * { box-sizing: border-box; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(240,194,122,0.3); border-radius: 4px; }
    input::placeholder { color: rgba(255,255,255,0.2) !important; }
  `,
};

const TAB_ITEMS = [
  { id: "route", label: "Route" },
  { id: "favorites", label: "Saved" },
];

const TRANSPORT_MODES = {
  drive: "car",
  walk: "foot",
  bike: "bike",
};

const MODE_LABELS = {
  drive: "Drive",
  walk: "Walk",
  bike: "Bike",
};

const MARKER_ICONS = {
  origin: "#34d399",
  destination: "#f0c27a",
  favorite: "#1976D2",
};

const INITIAL_MAP_CENTER = [27.7172, 85.324];

// ============================================
// HELPER FUNCTIONS
// ============================================
const createCustomIcon = (color) =>
  L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.8);box-shadow:0 2px 8px rgba(0,0,0,0.4);"></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const createButtonStyle = (isActive = false) => ({
  flex: 1,
  padding: "9px 0",
  borderRadius: BORDER_RADIUS.md,
  border: isActive ? "none" : `1px solid ${COLORS.border}`,
  background: isActive ? `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.primary})` : "rgba(255,255,255,0.04)",
  color: isActive ? COLORS.textDim : "rgba(255,255,255,0.35)",
  fontFamily: FONTS.poppins,
  fontWeight: 600,
  fontSize: "12px",
  boxShadow: isActive ? `0 4px 14px ${COLORS.primary}40` : "none",
  cursor: "pointer",
  transition: "all 0.2s",
});

const createInputStyle = () => ({
  width: "100%",
  paddingLeft: "36px",
  paddingRight: "40px",
  paddingTop: "11px",
  paddingBottom: "11px",
  border: `1px solid ${COLORS.borderLight}`,
  borderRadius: BORDER_RADIUS.md,
  fontSize: "13px",
  fontFamily: FONTS.poppins,
  outline: "none",
  background: "rgba(255,255,255,0.04)",
  color: COLORS.text,
  boxSizing: "border-box",
  transition: "border-color 0.2s",
});

const ICONS = {
  origin: createCustomIcon(MARKER_ICONS.origin),
  destination: createCustomIcon(MARKER_ICONS.destination),
  favorite: createCustomIcon(MARKER_ICONS.favorite),
};

const RoutingMachine = ({ waypoints, mode, selectedIndex, onRoutes, onSteps, onBounds }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || waypoints.length < 2) return;
    if (routingControlRef.current) map.removeControl(routingControlRef.current);

    routingControlRef.current = L.Routing.control({
      waypoints: waypoints.map((w) => L.latLng(w.lat, w.lng)),
      router: L.Routing.osrmv1({ profile: TRANSPORT_MODES[mode] }),
      addWaypoints: false,
      draggableWaypoints: false,
      createMarker: () => null,
      showAlternatives: true,
      routeWhileDragging: false,
      lineOptions: { styles: [{ color: COLORS.primary, weight: 5, opacity: 0.9 }] },
      altLineOptions: { styles: [{ color: "#4a5568", weight: 4, opacity: 0.6 }] },
    }).on("routesfound", (e) => {
      onRoutes(e.routes);
      const route = e.routes[selectedIndex] || e.routes[0];
      onSteps(route.instructions.map((ins, idx) => ({ id: idx, text: ins.text, distance: ins.distance })));
      onBounds(L.latLngBounds(route.coordinates));
    }).addTo(map);

    routingControlRef.current.getContainer().style.display = "none";
    return () => {
      if (routingControlRef.current) map.removeControl(routingControlRef.current);
    };
  }, [map, waypoints, mode, selectedIndex]);

  return null;
};

const MarkerClusterLayer = ({ favorites }) => {
  const map = useMap();
  const clusterGroupRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);

    clusterGroupRef.current = L.markerClusterGroup({ showCoverageOnHover: false, animate: true });

    favorites.forEach((fav) => {
      const popupHtml = `
        <div style="font-family:${FONTS.poppins};padding:8px;background:${COLORS.bgLighter};color:${COLORS.text};border-radius:8px;">
          <b style="font-size:13px;color:${COLORS.primary}">${fav.name}</b><br/>
          <button style="font-size:11px;color:${COLORS.primary};margin-top:6px;cursor:pointer;border:none;background:none;padding:0;font-family:${FONTS.poppins};"
            onclick="window.handleFavoriteClick('${fav.id}')">Use as destination</button>
        </div>
      `;
      L.marker([fav.lat, fav.lng], { icon: ICONS.favorite })
        .bindPopup(popupHtml)
        .addTo(clusterGroupRef.current);
    });

    map.addLayer(clusterGroupRef.current);
    return () => {
      if (clusterGroupRef.current) map.removeLayer(clusterGroupRef.current);
    };
  }, [map, favorites]);

  return null;
};

const MapControls = ({ routeBounds, follow, onFollowToggle }) => {
  const map = useMap();

  const createCtrlButtonStyle = (active = false) => ({
    background: active ? COLORS.primary : `${COLORS.bgLight}dd`,
    border: `1px solid ${COLORS.borderLight}`,
    borderRadius: BORDER_RADIUS.md,
    padding: SIZES.xxl,
    fontSize: "14px",
    cursor: "pointer",
    color: active ? COLORS.textDim : COLORS.text,
    boxShadow: `0 2px 12px rgba(0,0,0,0.4)`,
    transition: "all 0.2s",
    fontFamily: FONTS.poppins,
    fontWeight: 600,
  });

  return (
    <div style={{ position: "absolute", zIndex: 1000, bottom: "96px", right: "16px", display: "flex", flexDirection: "column", gap: SIZES.md }}>
      <button onClick={() => map.zoomIn()} title="Zoom in" style={createCtrlButtonStyle()}>+</button>
      <button onClick={() => map.zoomOut()} title="Zoom out" style={createCtrlButtonStyle()}>-</button>
      <button onClick={() => { onFollowToggle(); if (!follow) map.locate({ watch: true, setView: true, maxZoom: 17 }); }} title="Follow location" style={createCtrlButtonStyle(follow)}>Loc</button>
      {routeBounds && (
        <button onClick={() => map.fitBounds(routeBounds, { padding: [50, 50] })} title="Fit route" style={createCtrlButtonStyle()}>Fit</button>
      )}
    </div>
  );
};

const SearchBox = ({ value, onChange, onSelect, placeholder, dotColor }) => {
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
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`);
        setResults(await res.json());
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [value]);

  const inputStyle = createInputStyle();

  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "relative" }}>
        <span style={{
          position: "absolute",
          left: "13px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "10px",
          height: "10px",
          borderRadius: "50%",
          background: dotColor,
          display: "block",
          boxShadow: `0 0 6px ${dotColor}`,
        }} />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
          onFocus={(e) => e.target.style.borderColor = COLORS.borderHeavy}
          onBlur={(e) => e.target.style.borderColor = COLORS.borderLight}
        />
        {loading && (
          <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)" }}>
            <div style={{ width: "14px", height: "14px", border: `2px solid ${COLORS.primary}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          </div>
        )}
      </div>
      {results.length > 0 && (
        <div style={{
          position: "absolute",
          width: "100%",
          marginTop: SIZES.md,
          background: COLORS.bgLighter,
          borderRadius: BORDER_RADIUS.md,
          boxShadow: `0 8px 30px rgba(0,0,0,0.5)`,
          maxHeight: "220px",
          overflowY: "auto",
          zIndex: 50,
          border: `1px solid ${COLORS.border}`,
        }}>
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => {
                onSelect({ lat: parseFloat(r.lat), lng: parseFloat(r.lon), name: r.display_name });
                onChange(r.display_name);
                setResults([]);
              }}
              style={{
                padding: `${SIZES.sm} ${SIZES.lg}`,
                fontSize: "12px",
                fontFamily: FONTS.poppins,
                color: "rgba(255,255,255,0.7)",
                cursor: "pointer",
                borderBottom: i < results.length - 1 ? `1px solid ${COLORS.border}` : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = `${COLORS.primary}14`}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {r.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Map() {
  const [mode, setMode] = useState("drive");
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

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

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

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
    setOriginText(destText);
    setDestText(originText);
    setShowRoute(false);
    setRoutes([]);
    setSteps([]);
  };

  const sectionStyle = {
    background: "rgba(255,255,255,0.03)",
    border: `1px solid ${COLORS.border}`,
    borderRadius: BORDER_RADIUS.lg,
    padding: SIZES.lg,
  };

  const sectionTitle = {
    fontFamily: FONTS.poppins,
    fontWeight: 700,
    fontSize: "10px",
    letterSpacing: "2px",
    textTransform: "uppercase",
    color: COLORS.primary,
    margin: "0 0 10px",
  };

  return (
    <>
      <style>{MAP_STYLES.CSS}</style>

      <div style={{ height: "100vh", width: "100vw", display: "flex", fontFamily: FONTS.poppins, background: COLORS.bg }}>

        {/* SIDEBAR */}
        <aside style={{
          width: sidebarOpen ? "340px" : "0",
          minWidth: sidebarOpen ? "340px" : "0",
          background: "rgba(10,11,18,0.98)",
          borderRight: `1px solid ${COLORS.border}`,
          boxShadow: "4px 0 32px rgba(0,0,0,0.4)",
          transition: "all 0.3s ease",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          zIndex: 1001,
        }}>

          {/* Header */}
          <div style={{ padding: "22px 20px 16px", borderBottom: `1px solid ${COLORS.border}` }}>
            <h1 style={{
              fontFamily: FONTS.montserrat,
              fontWeight: 700,
              fontSize: "19px",
              color: COLORS.text,
              margin: "0 0 16px",
            }}>
              Travel <span style={{ color: COLORS.primary }}>Maps</span>
            </h1>

            {/* Tabs */}
            <div style={{ display: "flex", gap: SIZES.md, background: "rgba(255,255,255,0.04)", padding: SIZES.xs, borderRadius: BORDER_RADIUS.md }}>
              {TAB_ITEMS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: SIZES.sm,
                    borderRadius: BORDER_RADIUS.sm,
                    border: "none",
                    cursor: "pointer",
                    fontFamily: FONTS.poppins,
                    fontWeight: 600,
                    fontSize: "12px",
                    background: activeTab === tab.id ? COLORS.primary : "transparent",
                    color: activeTab === tab.id ? COLORS.textDim : "rgba(255,255,255,0.35)",
                    transition: "all 0.2s",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: SIZES.xxl }}>
            {activeTab === "route" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>

                <SearchBox value={originText} onChange={setOriginText} onSelect={setOrigin} placeholder="Starting point" dotColor="#34d399" />
                <SearchBox value={destText} onChange={setDestText} onSelect={setDestination} placeholder="Destination" dotColor={COLORS.primary} />

                {/* Mode Buttons */}
                <div style={{ display: "flex", gap: SIZES.md }}>
                  {Object.keys(MODE_LABELS).map((m) => (
                    <button
                      key={m}
                      onClick={() => {
                        setMode(m);
                        setShowRoute(false);
                      }}
                      style={createButtonStyle(mode === m)}
                    >
                      {MODE_LABELS[m]}
                    </button>
                  ))}
                </div>

                {/* Swap + Save */}
                {origin && destination && (
                  <div style={{ display: "flex", gap: SIZES.md }}>
                    <button
                      onClick={handleSwap}
                      style={{
                        flex: 1,
                        padding: "9px",
                        borderRadius: BORDER_RADIUS.md,
                        border: `1px solid ${COLORS.borderLight}`,
                        background: "transparent",
                        color: "rgba(255,255,255,0.6)",
                        fontFamily: FONTS.poppins,
                        fontWeight: 600,
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      Swap
                    </button>
                    <button onClick={() => setFavorites([...favorites, { id: Date.now().toString(), ...destination }])} style={{
                      padding: "9px 16px", borderRadius: "9px", border: "none",
                      background: "linear-gradient(135deg, #c9973a, #f0c27a)",
                      color: "#0f0e0d", fontFamily: "'Poppins', sans-serif",
                      fontWeight: 700, fontSize: "12px", cursor: "pointer",
                    }}>Save</button>
                  </div>
                )}

                {/* Show Route */}
                {origin && destination && !showRoute && (
                  <button onClick={() => setShowRoute(true)} style={{
                    width: "100%", padding: "12px", borderRadius: "10px", border: "none",
                    background: "linear-gradient(135deg, #c9973a, #f0c27a, #c9973a)",
                    backgroundSize: "200% 100%", backgroundPosition: "right",
                    color: "#0f0e0d", fontFamily: "'Poppins', sans-serif",
                    fontWeight: 700, fontSize: "13px", cursor: "pointer",
                    letterSpacing: "1px", textTransform: "uppercase",
                    boxShadow: "0 4px 18px rgba(240,194,122,0.3)",
                    transition: "background-position 0.4s",
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundPosition = "left"}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundPosition = "right"}
                  >Show Route</button>
                )}

                {/* Alternative Routes */}
                {routes.length > 1 && (
                  <div style={sectionStyle}>
                    <h3 style={sectionTitle}>Alternative Routes</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {routes.map((route, idx) => (
                        <button key={idx} onClick={() => setSelectedRoute(idx)} style={{
                          padding: "10px 12px", borderRadius: "8px", cursor: "pointer", textAlign: "left",
                          border: selectedRoute === idx ? "1px solid rgba(240,194,122,0.5)" : "1px solid rgba(255,255,255,0.05)",
                          background: selectedRoute === idx ? "rgba(240,194,122,0.08)" : "transparent",
                          transition: "all 0.2s",
                        }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "13px", color: selectedRoute === idx ? "#f0c27a" : "rgba(255,255,255,0.7)" }}>Route {idx + 1}</span>
                            <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.35)" }}>{Math.round(route.summary.totalTime / 60)} min</span>
                          </div>
                          <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", color: "rgba(255,255,255,0.3)", marginTop: "2px" }}>
                            {(route.summary.totalDistance / 1000).toFixed(1)} km
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Directions */}
                {steps.length > 0 && (
                  <div style={sectionStyle}>
                    <h3 style={sectionTitle}>Directions</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "300px", overflowY: "auto" }}>
                      {steps.map((step) => (
                        <div key={step.id} style={{
                          display: "flex", gap: "10px", padding: "9px 10px", borderRadius: "8px",
                          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                        }}>
                          <div style={{
                            flexShrink: 0, width: "20px", height: "20px", borderRadius: "50%",
                            background: "linear-gradient(135deg, #c9973a, #f0c27a)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#0f0e0d", fontSize: "9px", fontWeight: 700,
                          }}>{step.id + 1}</div>
                          <div>
                            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.75)", margin: "0 0 2px" }}>{step.text}</p>
                            <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.3)", margin: 0 }}>{(step.distance / 1000).toFixed(2)} km</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              favorites.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.2)" }}>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "13px" }}>No saved places yet</p>
                  <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "11px", marginTop: "6px" }}>Save a destination to see it here</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {favorites.map((fav) => (
                    <div key={fav.id} style={{
                      background: "rgba(255,255,255,0.03)", borderRadius: "10px", padding: "12px",
                      border: "1px solid rgba(240,194,122,0.08)",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "12px", color: "#f0c27a", margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fav.name}</p>
                          <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "10px", color: "rgba(255,255,255,0.25)", margin: 0 }}>{fav.lat.toFixed(4)}, {fav.lng.toFixed(4)}</p>
                        </div>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => { setDestination(fav); setDestText(fav.name); setShowRoute(false); setActiveTab("route"); }} style={{
                            padding: "5px 10px", borderRadius: "6px", border: "none",
                            background: "linear-gradient(135deg, #c9973a, #f0c27a)",
                            color: "#0f0e0d", fontFamily: "'Poppins', sans-serif",
                            fontWeight: 600, fontSize: "11px", cursor: "pointer",
                          }}>Use</button>
                          <button onClick={() => setFavorites(favorites.filter((f) => f.id !== fav.id))} style={{
                            padding: "5px 10px", borderRadius: "6px",
                            border: "1px solid rgba(255,100,100,0.2)",
                            background: "rgba(255,80,80,0.08)", color: "#f87171",
                            fontFamily: "'Poppins', sans-serif", fontWeight: 600,
                            fontSize: "11px", cursor: "pointer",
                          }}>Remove</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </aside>

        {/* Sidebar Toggle */}
        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
          position: "absolute", zIndex: 1002, top: "16px",
          left: sidebarOpen ? "352px" : "16px",
          background: "linear-gradient(135deg, #c9973a, #f0c27a)",
          border: "none", borderRadius: "10px", padding: "10px 14px",
          color: "#0f0e0d", fontFamily: "'Poppins', sans-serif",
          fontWeight: 700, fontSize: "13px", cursor: "pointer",
          boxShadow: "0 4px 14px rgba(240,194,122,0.3)",
          transition: "left 0.3s ease",
        }}>{sidebarOpen ? "Close" : "Menu"}</button>

        {/* Map */}
        <main style={{ flex: 1, position: "relative" }}>
          <MapContainer center={[27.7172, 85.324]} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {origin && (
              <Marker position={[origin.lat, origin.lng]} icon={ICONS.origin}>
                <Popup><div style={{ fontFamily: "'Poppins',sans-serif", padding: "6px", background: "#0f101a", color: "#f5f0e8" }}><b style={{ color: "#34d399" }}>Origin</b><p style={{ fontSize: "12px", margin: "4px 0 0", color: "rgba(255,255,255,0.6)" }}>{origin.name}</p></div></Popup>
              </Marker>
            )}
            {destination && (
              <Marker position={[destination.lat, destination.lng]} icon={ICONS.destination}>
                <Popup><div style={{ fontFamily: "'Poppins',sans-serif", padding: "6px", background: "#0f101a", color: "#f5f0e8" }}><b style={{ color: "#f0c27a" }}>Destination</b><p style={{ fontSize: "12px", margin: "4px 0 0", color: "rgba(255,255,255,0.6)" }}>{destination.name}</p></div></Popup>
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