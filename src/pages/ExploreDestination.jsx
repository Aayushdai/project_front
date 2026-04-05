/**
 * Map.jsx — TravelMaps Nepal
 *
 * Nepal-only map. Bounds are hard-locked so the user can't pan outside.
 * Places are fetched from OpenStreetMap Overpass API in tiles that match
 * Nepal's 7 provinces, so the very first load already populates the whole
 * country without needing to pan around.
 *
 * Star ratings are derived deterministically from OSM tags (Wikipedia
 * presence, tourism category, natural features, etc.) — seeded on node id
 * so they never flicker or change between renders.
 *
 * Dependencies:
 *   npm install react-leaflet leaflet leaflet.markercluster
 *   (leaflet-routing-machine intentionally removed — routing is done
 *    by calling OSRM directly and drawing a Polyline, which avoids
 *    the _clearLines / removeLayer null-crash entirely)
 */

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  MapContainer, TileLayer, Marker,
  Popup, Circle, Polyline, useMap,
} from "react-leaflet";
import {
  Heart, MoreVertical, Navigation2, Globe, Bike, MapPin
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

/* ═══════════════════════════════════════════════════════════════
   NEPAL CONSTANTS
═══════════════════════════════════════════════════════════════ */
const getNepalBounds = () =>
  L.latLngBounds(L.latLng(26.347, 80.058), L.latLng(30.447, 88.201));

const NEPAL_CENTER = [27.7172, 85.3240];

/* ═══════════════════════════════════════════════════════════════
   RATING ENGINE (Kept for potential future use)
═══════════════════════════════════════════════════════════════ */
/*
function seededRandom(seed) {
  let t = (seed + 0x6d2b79f5) >>> 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function deriveRating(node) {
  const tags = node.tags || {};
  let base = 3.2;
  if (tags.tourism === "attraction")       base += 0.9;
  if (tags.tourism === "viewpoint")        base += 0.7;
  if (tags.tourism === "museum")           base += 0.6;
  if (tags.tourism === "hotel")            base += 0.4;
  if (tags.historic)                       base += 0.8;
  if (tags.natural === "peak")             base += 1.0;
  if (tags.natural === "waterfall")        base += 0.9;
  if (tags.amenity === "restaurant")       base += 0.3;
  if (tags.amenity === "cafe")             base += 0.35;
  if (tags.amenity === "place_of_worship") base += 0.7;
  if (tags.leisure === "park")             base += 0.4;
  if (tags.wikipedia || tags.wikidata)     base += 0.5;
  if (tags.description || tags["opening_hours"]) base += 0.15;
  base = Math.min(base, 4.95);
  const noise = seededRandom(node.id) * 0.6 - 0.1;
  return Math.round(Math.min(4.99, Math.max(1.5, base + noise)) * 10) / 10;
}

function deriveReviews(node, rating) {
  const tags = node.tags || {};
  let base = 40;
  if (tags.wikipedia || tags.wikidata)   base = 900;
  if (tags.tourism === "attraction")     base = Math.max(base, 450);
  if (tags.historic)                     base = Math.max(base, 280);
  if (tags.natural === "peak")           base = Math.max(base, 650);
  if (tags.natural === "waterfall")      base = Math.max(base, 300);
  base = Math.round(base * (0.5 + rating / 5));
  return base + Math.round(seededRandom(node.id + 1) * base);
}
*/

/* ═══════════════════════════════════════════════════════════════
   OSRM DIRECT FETCH  (replaces leaflet-routing-machine entirely)
   Decodes the geometry polyline and returns steps + latlngs.
═══════════════════════════════════════════════════════════════ */
const OSRM_PROFILES = { car: "driving", foot: "walking", bike: "cycling" };

// Decode Google-encoded polyline (precision 5) used by OSRM
function decodePolyline(str, precision = 5) {
  let index = 0, lat = 0, lng = 0;
  const coords = [];
  const factor = Math.pow(10, precision);
  while (index < str.length) {
    let shift = 0, result = 0, byte;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : result >> 1;
    shift = 0; result = 0;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : result >> 1;
    coords.push([lat / factor, lng / factor]);
  }
  return coords;
}

async function fetchOSRMRoute(origin, destination, mode, signal) {
  const profile = OSRM_PROFILES[mode] || "driving";
  const url =
    `https://router.project-osrm.org/route/v1/${profile}/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=full&geometries=polyline&steps=true&alternatives=true`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error("OSRM HTTP " + res.status);
  const json = await res.json();
  if (json.code !== "Ok" || !json.routes?.length) throw new Error("No route found");

  return json.routes.map((route) => {
    const coords = decodePolyline(route.geometry);
    const steps = route.legs.flatMap((leg) =>
      leg.steps.map((s, idx) => ({
        id: idx,
        text: s.maneuver?.instruction || s.name || "Continue",
        dist: s.distance,
      }))
    );
    return {
      coords,           // [[lat,lng], ...]
      steps,
      distanceKm: (route.distance / 1000).toFixed(1),
      durationMin: Math.round(route.duration / 60),
    };
  });
}

/* ═══════════════════════════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════════════════════════ */
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371, dLat = (lat2-lat1)*Math.PI/180, dLng = (lng2-lng1)*Math.PI/180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function StarsDisplay({ rating, size = 13 }) {
  return (
    <span style={{ display:"inline-flex", gap:1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{
          fontSize: size,
          color: (rating >= i || rating >= i-0.5) ? "#f0c27a" : "rgba(255,255,255,0.18)",
          opacity: (!(rating >= i) && rating >= i-0.5) ? 0.6 : 1,
        }}>★</span>
      ))}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════
   LEAFLET ICONS
═══════════════════════════════════════════════════════════════ */
function useFixLeafletIcons() {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  }, []);
}

const makePlaceIcon = (place) => {
  const color = place.rating >= 4.5 ? "#f0c27a"
              : place.rating >= 4.0 ? "#5dcaa5"
              : place.rating >= 3.0 ? "#7b9fd4" : "#888780";
  return L.divIcon({
    className: "",
    html: `<div style="background:${color};width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.9);box-shadow:0 3px 10px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);font-size:13px;line-height:1;">${place.icon}</span></div>`,
    iconSize:[34,34], iconAnchor:[17,34],
  });
};

const makeRouteIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="background:${color};width:28px;height:28px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2.5px solid white;box-shadow:0 2px 10px rgba(0,0,0,0.5);"></div>`,
  iconSize:[28,28], iconAnchor:[14,28],
});

const getLiveIcon = () => L.divIcon({
  className: "",
  html: `<div style="position:relative;width:22px;height:22px;display:flex;align-items:center;justify-content:center;"><div style="position:absolute;width:14px;height:14px;border-radius:50%;background:rgba(66,133,244,0.3);animation:tm-pulse 1.8s cubic-bezier(0,0,.2,1) infinite;"></div><div style="width:14px;height:14px;border-radius:50%;background:#4285f4;border:2.5px solid white;box-shadow:0 2px 8px rgba(66,133,244,0.6);position:relative;z-index:2;"></div></div>`,
  iconSize:[22,22], iconAnchor:[11,11],
});

/* ═══════════════════════════════════════════════════════════════
   NEPAL BOUNDS ENFORCER
═══════════════════════════════════════════════════════════════ */
function NepalBoundsEnforcer() {
  const map = useMap();
  useFixLeafletIcons();
  useEffect(() => {
    map.setMaxBounds(getNepalBounds());
    map.setMinZoom(7);
  }, [map]);
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   ROUTE LAYER  — pure React-Leaflet Polylines, zero LRM
   Parent passes `routes` (array from fetchOSRMRoute) and
   `selectedIndex`. We just render polylines. No side-effects,
   no cleanup crashes.
═══════════════════════════════════════════════════════════════ */
function RouteLayer({ routes, selectedIndex }) {
  const map = useMap();

  // Fit map to selected route whenever it changes
  useEffect(() => {
    if (!routes.length) return;
    const r = routes[selectedIndex] || routes[0];
    if (r.coords.length) {
      map.fitBounds(L.latLngBounds(r.coords), { padding: [60, 60] });
    }
  }, [routes, selectedIndex, map]);

  if (!routes.length) return null;

  return (
    <>
      {/* Alt routes first (behind) */}
      {routes.map((r, i) =>
        i !== selectedIndex ? (
          <Polyline
            key={i}
            positions={r.coords}
            pathOptions={{ color: "#4a5568", weight: 4, opacity: 0.45 }}
          />
        ) : null
      )}
      {/* Selected route on top */}
      <Polyline
        key={selectedIndex}
        positions={(routes[selectedIndex] || routes[0]).coords}
        pathOptions={{ color: "#f0c27a", weight: 5, opacity: 0.9 }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH BOX  (Nepal-only Nominatim)
═══════════════════════════════════════════════════════════════ */
function SearchBox({ value, onChange, onSelect, placeholder, dotColor, disabled }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!value.trim()) { setResults([]); return; }
    if (disabled) { setResults([]); return; }
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=6&countrycodes=np&accept-language=en`
        );
        const data = await r.json();
        const filtered = data.filter(d => {
          const lat = parseFloat(d.lat), lng = parseFloat(d.lon);
          return lat >= 26.347 && lat <= 30.447 && lng >= 80.058 && lng <= 88.201;
        });
        setResults(filtered);
      } catch { setResults([]); }
      finally { setLoading(false); }
    }, 420);
    return () => clearTimeout(timer.current);
  }, [value, disabled]);

  return (
    <div style={{ position:"relative" }}>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", width:9, height:9, borderRadius:"50%", background:dotColor, boxShadow:`0 0 6px ${dotColor}`, zIndex:2 }}/>
        <input
          disabled={disabled}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoComplete="off" style={{...S.input, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'text'}}
          onFocus={e => !disabled && (e.target.style.borderColor = "rgba(240,194,122,.45)")}
          onBlur={e  => (e.target.style.borderColor = "rgba(240,194,122,.1)")}
        />
        {loading && <div style={S.spinner}/>}
      </div>
      {results.length > 0 && !disabled && (
        <div style={S.dropdown}>
          {results.map((r,i) => (
            <div key={i} style={S.dropItem}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(240,194,122,.08)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              onClick={() => {
                const p = { lat:parseFloat(r.lat), lng:parseFloat(r.lon), name:r.display_name };
                onChange(r.display_name); setResults([]); onSelect(p);
              }}>
              {r.display_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PLACE CLUSTER LAYER
═══════════════════════════════════════════════════════════════ */
function PlaceClusterLayer({ places, onSetDest }) {
  const map = useMap();
  const groupRef = useRef(null);

  useEffect(() => { window.__tmSetDest = onSetDest; return () => { delete window.__tmSetDest; }; }, [onSetDest]);

  useEffect(() => {
    if (!map) return;
    if (groupRef.current) { map.removeLayer(groupRef.current); groupRef.current = null; }
    if (!places.length) return;

    const group = L.markerClusterGroup({
      showCoverageOnHover: false,
      animate: true,
      maxClusterRadius: 55,
      chunkedLoading: true,
      chunkInterval: 100,
      chunkDelay: 50,
      iconCreateFunction: (cluster) => L.divIcon({
        className: "",
        html: `<div style="width:38px;height:38px;border-radius:50%;background:rgba(201,168,76,0.15);border:1.5px solid rgba(201,168,76,0.45);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:#C9A84C;">${cluster.getChildCount()}</div>`,
        iconSize:[38,38], iconAnchor:[19,19],
      }),
    });

    places.forEach(p => {
      const tags = p.tags || {};
      const extras = [
        tags["opening_hours"] ? `⏰ ${tags["opening_hours"]}` : null,
        tags.phone || tags["contact:phone"] ? `📱 ${tags.phone || tags["contact:phone"]}` : null,
        tags.website || tags["contact:website"]
          ? `🔗 <a href="${tags.website || tags["contact:website"]}" target="_blank" style="color:#60a5fa;">Website</a>` : null,
        tags.wikipedia
          ? `📚 <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(tags.wikipedia.replace(/^en:/,""))}" target="_blank" style="color:#60a5fa;">Wikipedia</a>` : null,
        tags.ele ? `⬆️ Elevation: ${tags.ele}m` : null,
      ].filter(Boolean).slice(0, 3).join("<br/>");

      const starsHtml = [1,2,3,4,5].map(i =>
        `<span style="font-size:13px;color:${p.rating>=i||p.rating>=i-.5?"#C9A84C":"rgba(255,255,255,.18)"};opacity:${(!(p.rating>=i)&&p.rating>=i-.5)?".6":"1"}">★</span>`
      ).join("");

      L.marker([p.lat, p.lng], { icon: makePlaceIcon(p) })
        .bindPopup(L.popup({ maxWidth:270, className:"tm-popup" }).setContent(`
          <div style="font-family:'DM Sans',sans-serif;background:#0d0e1a;color:#f5f0e8;border-radius:10px;padding:13px 15px;min-width:220px;">
            <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:${p.color};margin-bottom:2px;">${p.name}</div>
            ${p.nameNe ? `<div style="font-size:12px;color:rgba(245,240,232,.45);margin-bottom:4px;">${p.nameNe}</div>` : ""}
            <div style="font-size:11px;color:rgba(245,240,232,.35);margin-bottom:8px;">${p.icon} ${p.category}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:${extras?"8px":"10px"};">
              ${starsHtml}
              <span style="font-size:13px;font-weight:600;color:#f5f0e8;">${p.rating}</span>
              <span style="font-size:11px;color:rgba(245,240,232,.35);">(${p.reviews.toLocaleString()} reviews)</span>
            </div>
            ${extras ? `<div style="font-size:11px;color:rgba(245,240,232,.4);line-height:1.9;margin-bottom:10px;border-top:.5px solid rgba(255,255,255,.06);padding-top:8px;">${extras}</div>` : ""}
            <button onclick="window.__tmSetDest(${p.id})" style="width:100%;padding:8px;border-radius:7px;border:none;background:linear-gradient(135deg,#c9973a,#f0c27a);color:#0f0e0d;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;">Set as Destination</button>
          </div>`))
        .addTo(group);
    });

    map.addLayer(group);
    groupRef.current = group;
    return () => {
      if (groupRef.current) { map.removeLayer(groupRef.current); groupRef.current = null; }
    };
  }, [map, places]);

  return null;
}

/* ═══════════════════════════════════════════════════════════════
   MAP CONTROLS
═══════════════════════════════════════════════════════════════ */
function MapControls({ tracking, onToggleTrack, routeCoords }) {
  const map = useMap();
  return (
    <div style={{ position:"absolute", bottom:80, right:16, zIndex:1000, display:"flex", flexDirection:"column", gap:8 }}>
      <button style={S.ctrlBtn} onClick={() => map.zoomIn()} title="Zoom in">+</button>
      <button style={S.ctrlBtn} onClick={() => map.zoomOut()} title="Zoom out">−</button>
      <button
        style={{ ...S.ctrlBtn, ...(tracking ? S.ctrlActive : {}) }}
        onClick={onToggleTrack} title={tracking ? "Stop tracking" : "My location"}
      ><MapPin size={18} color={tracking ? "#C9A84C" : "#f5f0e8"} /></button>
      <button style={S.ctrlBtn} onClick={() => map.fitBounds(getNepalBounds(), { padding:[20,20] })} title="Fit Nepal"><Globe size={18} color="#C9A84C" /></button>
      {routeCoords?.length > 0 && (
        <button style={S.ctrlBtn} onClick={() => map.fitBounds(L.latLngBounds(routeCoords), { padding:[60,60] })} title="Fit route"><Navigation2 size={18} color="#C9A84C" /></button>
      )}
    </div>
  );
}



/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function NepalMap() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab,   setActiveTab]   = useState("route");

  // KYC state
  const [kycStatus, setKycStatus] = useState(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  // Fetch KYC status on mount and when refetchTrigger changes
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.error("No access token found - redirecting to login");
          setKycStatus("no_token");
          return;
        }
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
        const response = await fetch(`${backendUrl}users/me/`, {
          headers: { "Authorization": `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setKycStatus(data.status || null);
          console.log("KYC Status updated:", data.status);
        } else {
          console.error("Failed to fetch KYC status:", response.status);
          setKycStatus("fetch_error");
        }
      } catch (error) {
        console.error("Failed to fetch KYC status:", error);
        setKycStatus("fetch_error");
      }
    };
    fetchKycStatus();
  }, [refetchTrigger]);

  // Refetch KYC status when returning from KYC form
  useEffect(() => {
    const handleRefreshKYC = () => {
      console.log("Refetching KYC status...");
      setRefetchTrigger(prev => prev + 1);
    };
    
    // Listen for custom event
    window.addEventListener("kyc-form-submitted", handleRefreshKYC);
    
    return () => {
      window.removeEventListener("kyc-form-submitted", handleRefreshKYC);
    };
  }, []);

  // Route state
  const [mode,          setMode]        = useState("car");
  const [originText,    setOriginText]  = useState("");
  const [destText,      setDestText]    = useState("");
  const [origin,        setOrigin]      = useState(null);
  const [destination,   setDest]        = useState(null);
  const [showRoute,     setShowRoute]   = useState(false);
  const [routes,        setRoutes]      = useState([]);   // array of {coords,steps,distanceKm,durationMin}
  const [selectedRoute, setSelected]    = useState(0);
  const [steps,         setSteps]       = useState([]);
  const [routeLoading,  setRouteLoading]= useState(false);
  const [routeError,    setRouteError]  = useState(null);
  const abortRef = useRef(null);         // AbortController for in-flight OSRM fetch

  // Live location
  const [tracking, setTracking] = useState(false);
  const [livePos,  setLivePos]  = useState(null);
  const [liveAcc,  setLiveAcc]  = useState(null);
  const watchRef = useRef(null);

  // Places
  const [allPlaces] = useState([]);

  // Auto-fill destination from location state
  useEffect(() => {
    if (location.state?.destinationName) {
      setDestText(location.state.destinationName);
    }
  }, [location]);

  // Favorites & nearby
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tm_favs") || "[]"); } catch { return []; }
  });
  const [nearby, setNearby] = useState([]);

  useEffect(() => { localStorage.setItem("tm_favs", JSON.stringify(favorites)); }, [favorites]);

  /* ── Nearby sort ── */
  useEffect(() => {
    if (!livePos || !allPlaces.length) return;
    setNearby(
      allPlaces
        .map(p => ({ ...p, dist: haversine(livePos.lat, livePos.lng, p.lat, p.lng) }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, 10)
    );
  }, [livePos, allPlaces]);

  const visiblePlaces = allPlaces;

  /* ── OSRM fetch — triggered when showRoute becomes true ── */
  useEffect(() => {
    if (!showRoute || !origin || !destination) return;

    // Cancel any previous in-flight request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setRouteLoading(true);
    setRouteError(null);
    setRoutes([]);
    setSteps([]);
    setSelected(0);

    fetchOSRMRoute(origin, destination, mode, abortRef.current.signal)
      .then((results) => {
        setRoutes(results);
        setSteps(results[0]?.steps || []);
        setRouteLoading(false);
      })
      .catch((err) => {
        if (err.name === "AbortError") return; // intentionally cancelled — ignore
        setRouteError("Could not find a route. Try different locations.");
        setRouteLoading(false);
      });

    return () => {
      // Cleanup: abort fetch if effect re-runs or component unmounts
      if (abortRef.current) abortRef.current.abort();
    };
  }, [showRoute, origin, destination, mode]);

  // When user picks a different alternative route, update steps
  useEffect(() => {
    if (routes[selectedRoute]) setSteps(routes[selectedRoute].steps);
  }, [selectedRoute, routes]);

  /* ── Live tracking ── */
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    setTracking(true);
    watchRef.current = navigator.geolocation.watchPosition(
      pos => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        if (getNepalBounds().contains(L.latLng(loc.lat, loc.lng))) {
          setLivePos(loc);
          setLiveAcc(Math.round(pos.coords.accuracy));
          setOrigin(prev => prev || loc);
          setOriginText(prev => prev || "My Location");
        }
      },
      err => { setTracking(false); alert("Location error: " + err.message); },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  }, []);

  const stopTracking = useCallback(() => {
    setTracking(false);
    if (watchRef.current !== null) { navigator.geolocation.clearWatch(watchRef.current); watchRef.current = null; }
  }, []);

  useEffect(() => () => {
    if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current);
  }, []);

  /* ── Set dest from map popup ── */
  const handleSetDest = useCallback((id) => {
    const p = allPlaces.find(x => x.id === id);
    if (!p) return;
    setDest({ lat:p.lat, lng:p.lng, name:p.name });
    setDestText(p.name);
    setShowRoute(false);
    setRoutes([]); setSteps([]);
    setActiveTab("route");
  }, [allPlaces]);

  const handleSwap = () => {
    setOrigin(destination);  setDest(origin);
    setOriginText(destText); setDestText(originText);
    setShowRoute(false); setRoutes([]); setSteps([]);
  };

  const saveFavorite = () => {
    if (!destination) return;
    if (favorites.some(f => f.lat === destination.lat && f.lng === destination.lng)) return;
    setFavorites(prev => [...prev, { id: Date.now().toString(), ...destination }]);
  };

  const selectedCoords = routes[selectedRoute]?.coords || routes[0]?.coords || [];



  /* ══════════════════════════════════════ RENDER ══════════════════════════════════════ */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes tm-pulse  { 0%{transform:scale(.8);opacity:1} 100%{transform:scale(2.4);opacity:0} }
        @keyframes tm-spin   { to{transform:rotate(360deg)} }
        @keyframes tm-fade   { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tm-slide  { from{transform:translateX(-8px);opacity:0} to{transform:translateX(0);opacity:1} }
        *,*::before,*::after { box-sizing:border-box;margin:0;padding:0; }
        body { font-family:'DM Sans',sans-serif; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(240,194,122,.25);border-radius:3px; }
        input::placeholder { color:rgba(245,240,232,.2)!important; }
        .tm-popup .leaflet-popup-content-wrapper { background:transparent!important;box-shadow:0 8px 32px rgba(0,0,0,.6)!important;border-radius:12px!important;padding:0!important;border:.5px solid rgba(240,194,122,.15)!important; }
        .tm-popup .leaflet-popup-content { margin:0!important; }
        .tm-popup .leaflet-popup-tip-container { display:none!important; }
      `}</style>

      {/* ════════════════════════════════════════ MAP INTERFACE ════════════════════════════════════════ */}
          <div style={{ display:"flex", height:"100vh", width:"100vw", overflow:"hidden", background:"#07080f" }}>

            {/* ──────────── SIDEBAR ──────────── */}
            <aside style={{ width:sidebarOpen?345:0, minWidth:sidebarOpen?345:0, background:"rgba(10,11,20,.98)", borderRight:".5px solid rgba(201,168,76,.1)", boxShadow:"4px 0 40px rgba(0,0,0,.5)", display:"flex", flexDirection:"column", transition:"all .35s cubic-bezier(.4,0,.2,1)", overflow:"hidden", zIndex:1001 }}>

          <div style={{ padding:"22px 20px 14px", marginTop:"8px", borderBottom:".5px solid rgba(201,168,76,.08)", flexShrink:0 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:20, color:"#f5f0e8", marginBottom:6, letterSpacing:"-.5px", display:"flex", alignItems:"center", gap:"8px" }}>
              <Globe size={20} color="#C9A84C" /> Travel <span style={{ color:"#C9A84C" }}>Nepal</span>
            </div>
            <div style={{ display:"flex", gap:5, background:"rgba(255,255,255,.03)", padding:4, borderRadius:10, flexWrap:"wrap" }}>
              {[{id:"route",l:"Route"},{id:"nearby",l:"Nearby"},{id:"saved",l:"Saved"},{id:"chat",l:"Chat"}].map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ ...S.tabBtn, background:activeTab===t.id?"#f0c27a":"transparent", color:activeTab===t.id?"#0f0e0d":"rgba(255,255,255,.3)", flex:"1 1 auto", minWidth:"60px" }}>{t.l}</button>
              ))}
            </div>
          </div>

          {/* Only show tab content in sidebar if not Chat tab */}
          {activeTab !== "chat" && (
          <div style={{ flex:1, overflowY:"auto", padding:"16px 18px", display:"flex", flexDirection:"column", gap:13 }}>

            {/* ── ROUTE TAB ── */}
            {activeTab === "route" && (
              <>
                {/* KYC Registration Box */}
                {kycStatus && kycStatus !== "approved" && (
                  <div style={{ background: "rgba(240,194,122,.08)", border: ".5px solid rgba(240,194,122,.25)", borderRadius: 12, padding: "16px 14px", marginBottom: 16, animation: "tm-fade .3s ease", textAlign: "center" }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>🔐</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#f0c27a", marginBottom: 6, letterSpacing: "-.5px" }}>
                      {kycStatus === "pending" ? "KYC Pending" : kycStatus === "under_review" ? "KYC Under Review" : "Complete Registration"}
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(245,240,232,.5)", lineHeight: 1.6, marginBottom: 12 }}>
                      {kycStatus === "pending" 
                        ? "Your KYC is submitted and pending verification. You'll be notified once approved!"
                        : kycStatus === "under_review"
                        ? "Your KYC is being reviewed. Check back soon!"
                        : "Complete your KYC to start exploring routes across Nepal."}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center" }}>
                      <Link 
                        to="/kyc"
                        style={{
                          display: "inline-block",
                          padding: "8px 16px",
                          borderRadius: 8,
                          background: "linear-gradient(135deg,#c9973a,#f0c27a)",
                          color: "#0f0e0d",
                          textDecoration: "none",
                          fontWeight: 700,
                          fontSize: 12,
                          letterSpacing: ".5px",
                          border: "none",
                          cursor: "pointer",
                          transition: "all .2s"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(240,194,122,.3)"; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                      >
                        {kycStatus === "under_review" ? "View Status" : kycStatus === "pending" ? "Update KYC" : "Complete KYC"}
                      </Link>
                      {(kycStatus === "pending" || kycStatus === "under_review") && (
                        <button
                          onClick={() => setRefetchTrigger(prev => prev + 1)}
                          style={{
                            padding: "8px 12px",
                            borderRadius: 8,
                            border: ".5px solid rgba(240,194,122,.3)",
                            background: "rgba(240,194,122,.05)",
                            color: "#f0c27a",
                            fontWeight: 600,
                            fontSize: 12,
                            cursor: "pointer",
                            transition: "all .2s"
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(240,194,122,.1)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(240,194,122,.05)")}
                          title="Refresh KYC status"
                        >
                          🔄 Refresh
                        </button>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Route Controls - Disabled if KYC not approved */}
                <div style={{ opacity: kycStatus && kycStatus !== "approved" ? 0.5 : 1, pointerEvents: kycStatus && kycStatus !== "approved" ? "none" : "auto" }}>
                  <SearchBox
                    value={originText} onChange={setOriginText}
                    onSelect={p => { setOrigin(p); setShowRoute(false); setRoutes([]); setSteps([]); }}
                    placeholder="Start — search anywhere in Nepal…"
                    dotColor="#34d399"
                  />
                  <SearchBox
                    value={destText} onChange={setDestText}
                    onSelect={p => { setDest(p); setShowRoute(false); setRoutes([]); setSteps([]); }}
                    placeholder="Destination — search Nepal…"
                    dotColor="#f0c27a"
                  />

              <div style={{ display:"flex", gap:6 }}>
                {[{k:"car",l:"Drive",icon:Navigation2},{k:"foot",l:"Walk",icon:MapPin},{k:"bike",l:"Bike",icon:Bike}].map(m => (
                  <button key={m.k}
                    onClick={() => { setMode(m.k); setShowRoute(false); setRoutes([]); setSteps([]); }}
                    style={{ ...S.modeBtn, ...(mode===m.k ? S.modeBtnActive : {}), display:"flex", alignItems:"center", gap:"6px" }}>
                    {m.icon && React.createElement(m.icon, {size:16})} {m.l}
                    </button>
                ))}
              </div>

              {origin && destination && (
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{...S.btnSec, display:"flex", alignItems:"center", gap:"6px"}}  onClick={handleSwap}><MoreVertical size={16} style={{rotate:"90deg"}} /> Swap</button>
                  <button style={{...S.btnGold, display:"flex", alignItems:"center", gap:"6px"}} onClick={saveFavorite}><Heart size={16} /> Save</button>
                </div>
              )}

              {origin && destination && !showRoute && (
                <button style={S.btnRoute} onClick={() => setShowRoute(true)}>Show Route →</button>
              )}

              {routeLoading && (
                <div style={{ textAlign:"center", padding:"14px 0", color:"rgba(240,194,122,.6)", fontSize:12 }}>
                  <div style={{ ...S.spinner, position:"static", display:"inline-block", marginBottom:6 }}/>
                  <div>Finding route…</div>
                </div>
              )}

              {routeError && (
                <div style={{ background:"rgba(248,113,113,.08)", border:".5px solid rgba(248,113,113,.2)", borderRadius:10, padding:"10px 13px", fontSize:12, color:"#f87171" }}>
                  {routeError}
                </div>
              )}

              {routes.length > 1 && (
                <div style={S.card}>
                  <div style={S.cardTitle}>Alternative Routes</div>
                  {routes.map((r,i) => (
                    <button key={i} onClick={() => setSelected(i)} style={{ ...S.routeAlt, borderColor:i===selectedRoute?"rgba(240,194,122,.45)":"rgba(255,255,255,.05)", background:i===selectedRoute?"rgba(240,194,122,.07)":"transparent" }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:13, fontWeight:500, color:i===selectedRoute?"#f0c27a":"rgba(255,255,255,.55)" }}>Route {i+1}</span>
                        <span style={{ fontSize:11, color:"rgba(255,255,255,.3)" }}>{r.durationMin} min</span>
                      </div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,.25)", marginTop:2 }}>{r.distanceKm} km</div>
                    </button>
                  ))}
                </div>
              )}

              {steps.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardTitle}>Directions</div>
                  <div style={{ maxHeight:300, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                    {steps.map((s,i) => (
                      <div key={s.id} style={{ display:"flex", gap:10, padding:"9px 10px", borderRadius:8, background:"rgba(255,255,255,.02)", border:".5px solid rgba(255,255,255,.04)", animation:`tm-slide .15s ease ${i*.025}s both` }}>
                        <div style={{ flexShrink:0, width:20, height:20, borderRadius:"50%", background:"linear-gradient(135deg,#c9973a,#f0c27a)", display:"flex", alignItems:"center", justifyContent:"center", color:"#0f0e0d", fontSize:9, fontWeight:700 }}>{i+1}</div>
                        <div>
                          <div style={{ fontSize:12, color:"rgba(255,255,255,.75)", lineHeight:1.5 }}>{s.text}</div>
                          <div style={{ fontSize:10, color:"rgba(255,255,255,.25)", marginTop:2 }}>{(s.dist/1000).toFixed(2)} km</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
                </div>
              </>
            )}

            {/* ── NEARBY TAB ── */}
            {activeTab === "nearby" && (
              nearby.length === 0
                ? <div style={S.empty}>
                    <div style={{ fontSize:28, marginBottom:10 }}>📡</div>
                    <p>Enable live location</p>
                    <p style={{ fontSize:11, marginTop:6, opacity:.5 }}>to discover places near you in Nepal</p>
                  </div>
                : nearby.map(p => (
                    <div key={p.id} onClick={() => handleSetDest(p.id)} style={S.nearbyCard}>
                      <span style={{ fontSize:22, flexShrink:0 }}>{p.icon}</span>
                      <div style={{ minWidth:0, flex:1 }}>
                        <div style={{ fontSize:13, fontWeight:500, color:"#f5f0e8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                        <div style={{ fontSize:11, color:"rgba(245,240,232,.3)", marginTop:3, display:"flex", alignItems:"center", gap:5 }}>
                          <StarsDisplay rating={p.rating} size={11}/> {p.rating} · {p.dist<1 ? `${Math.round(p.dist*1000)}m` : `${p.dist.toFixed(1)}km`}
                        </div>
                      </div>
                    </div>
                  ))
            )}

            {/* ── SAVED TAB ── */}
            {activeTab === "saved" && (
              favorites.length === 0
                ? <div style={S.empty}>
                    <div style={{ fontSize:28, marginBottom:10 }}>🗂</div>
                    <p>No saved places yet</p>
                    <p style={{ fontSize:11, marginTop:6, opacity:.5 }}>Save a destination to access it quickly</p>
                  </div>
                : favorites.map(f => (
                    <div key={f.id} style={S.favItem}>
                      <div style={{ fontSize:12, fontWeight:600, color:"#f0c27a", marginBottom:3, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{f.name}</div>
                      <div style={{ fontSize:10, color:"rgba(245,240,232,.25)" }}>{f.lat.toFixed(4)}, {f.lng.toFixed(4)}</div>
                      <div style={{ display:"flex", gap:6, marginTop:8 }}>
                        <button style={S.btnUse} onClick={() => { setDest(f); setDestText(f.name); setShowRoute(false); setRoutes([]); setSteps([]); setActiveTab("route"); }}>Use</button>
                        <button style={S.btnRemove} onClick={() => setFavorites(prev => prev.filter(x => x.id !== f.id))}>Remove</button>
                      </div>
                    </div>
                  ))
            )}

            {/* Chat removed - now displayed in main area */}
          </div>
          )}

          </aside>

          {/* Toggle */}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ ...S.toggleBtn, left: sidebarOpen ? 361 : 16 }}>
            {sidebarOpen ? "✕" : "☰"}
          </button>

          {/* ──────────── MAIN CONTENT AREA ──────────── */}
          <div style={{ flex:1, position:"relative" }}>
            <MapContainer
              center={NEPAL_CENTER}
              zoom={7}
              style={{ height:"100%", width:"100%" }}
              zoomControl={false}
              maxBounds={getNepalBounds()}
              maxBoundsViscosity={1.0}
              minZoom={7}
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                maxZoom={19}
              />

              <NepalBoundsEnforcer/>
              <PlaceClusterLayer places={visiblePlaces} onSetDest={handleSetDest}/>

              {/* Route polylines — pure React-Leaflet, no LRM, no crashes */}
              {routes.length > 0 && (
                <RouteLayer routes={routes} selectedIndex={selectedRoute}/>
              )}

              {/* Origin marker */}
              {origin && (
                <Marker position={[origin.lat, origin.lng]} icon={makeRouteIcon("#34d399")}>
                  <Popup className="tm-popup">
                    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#0d0e1a", color:"#f5f0e8", borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#34d399", marginBottom:4 }}>Origin</div>
                      <div style={{ fontSize:12, color:"rgba(245,240,232,.45)", lineHeight:1.5 }}>{origin.name}</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Destination marker */}
              {destination && (
                <Marker position={[destination.lat, destination.lng]} icon={makeRouteIcon("#f0c27a")}>
                  <Popup className="tm-popup">
                    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#0d0e1a", color:"#f5f0e8", borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#f0c27a", marginBottom:4 }}>Destination</div>
                      <div style={{ fontSize:12, color:"rgba(245,240,232,.45)", lineHeight:1.5 }}>{destination.name}</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Live location */}
              {livePos && <>
                <Marker position={[livePos.lat, livePos.lng]} icon={getLiveIcon()} zIndexOffset={1000}>
                  <Popup className="tm-popup">
                    <div style={{ fontFamily:"'DM Sans',sans-serif", background:"#0d0e1a", color:"#f5f0e8", borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#4285f4", marginBottom:4 }}>Your Location</div>
                      <div style={{ fontSize:11, color:"rgba(245,240,232,.35)" }}>Accuracy: ±{liveAcc}m</div>
                    </div>
                  </Popup>
                </Marker>
                {liveAcc && (
                  <Circle center={[livePos.lat, livePos.lng]} radius={liveAcc}
                    pathOptions={{ color:"#4285f4", fillColor:"#4285f4", fillOpacity:.1, weight:1 }}/>
                )}
              </>}

              <MapControls
                tracking={tracking}
                onToggleTrack={() => tracking ? stopTracking() : startTracking()}
                routeCoords={selectedCoords}
              />
            </MapContainer>

            {/* Accuracy badge */}
            {tracking && liveAcc && (
              <div style={{ position:"absolute", top:14, left:"50%", transform:"translateX(-50%)", zIndex:1000, background:"rgba(10,11,20,.88)", border:".5px solid rgba(201,168,76,.1)", borderRadius:20, padding:"6px 14px", fontSize:11, color:"rgba(245,240,232,.5)", animation:"tm-fade .2s ease", whiteSpace:"nowrap" }}>
                ↦ Accuracy: ±{liveAcc}m
              </div>
            )}
          </div>
          </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLE TOKENS
═══════════════════════════════════════════════════════════════ */
const S = {
  input:        { width:"100%", paddingLeft:34, paddingRight:36, paddingTop:11, paddingBottom:11, border:".5px solid rgba(240,194,122,.1)", borderRadius:10, fontSize:13, fontFamily:"'DM Sans',sans-serif", background:"rgba(255,255,255,.04)", color:"#f5f0e8", outline:"none", transition:"border-color .2s" },
  spinner:      { position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", width:14, height:14, border:"2px solid #f0c27a", borderTopColor:"transparent", borderRadius:"50%", animation:"tm-spin .7s linear infinite" },
  dropdown:     { position:"absolute", width:"100%", top:"calc(100% + 6px)", background:"#0d0e1a", borderRadius:10, border:".5px solid rgba(240,194,122,.12)", boxShadow:"0 10px 32px rgba(0,0,0,.55)", maxHeight:200, overflowY:"auto", zIndex:9999, animation:"tm-fade .15s ease" },
  dropItem:     { padding:"10px 14px", fontSize:12, color:"rgba(255,255,255,.6)", cursor:"pointer", borderBottom:".5px solid rgba(255,255,255,.04)", transition:"background .15s" },
  tabBtn:       { flex:1, padding:8, borderRadius:7, border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:12, transition:"all .2s" },
  modeBtn:      { flex:1, padding:"9px 0", borderRadius:9, border:".5px solid rgba(240,194,122,.1)", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:12, background:"transparent", color:"rgba(255,255,255,.3)", transition:"all .2s" },
  modeBtnActive:{ background:"linear-gradient(135deg,#c9973a,#f0c27a)", color:"#0f0e0d", borderColor:"transparent", boxShadow:"0 4px 16px rgba(240,194,122,.25)" },
  btnSec:       { flex:1, padding:9, borderRadius:9, border:".5px solid rgba(240,194,122,.1)", background:"transparent", color:"rgba(245,240,232,.4)", fontFamily:"'DM Sans',sans-serif", fontWeight:500, fontSize:12, cursor:"pointer" },
  btnGold:      { padding:"9px 16px", borderRadius:9, border:"none", background:"linear-gradient(135deg,#c9973a,#f0c27a)", color:"#0f0e0d", fontFamily:"'DM Sans',sans-serif", fontWeight:700, fontSize:12, cursor:"pointer" },
  btnRoute:     { width:"100%", padding:13, borderRadius:10, border:"none", background:"linear-gradient(135deg,#c9973a,#f0c27a)", color:"#0f0e0d", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", letterSpacing:".5px", boxShadow:"0 4px 20px rgba(240,194,122,.3)" },
  card:         { background:"rgba(255,255,255,.03)", border:".5px solid rgba(240,194,122,.08)", borderRadius:12, padding:14, animation:"tm-fade .2s ease" },
  cardTitle:    { fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:10, letterSpacing:2, textTransform:"uppercase", color:"#f0c27a", marginBottom:10 },
  routeAlt:     { padding:"10px 12px", borderRadius:8, cursor:"pointer", border:".5px solid", background:"transparent", textAlign:"left", width:"100%", marginBottom:6, transition:"all .2s" },
  nearbyCard:   { background:"rgba(255,255,255,.03)", borderRadius:10, padding:"11px 13px", border:".5px solid rgba(240,194,122,.1)", display:"flex", alignItems:"center", gap:10, cursor:"pointer", transition:"border-color .2s", animation:"tm-fade .15s ease" },
  favItem:      { background:"rgba(255,255,255,.03)", borderRadius:10, padding:12, border:".5px solid rgba(240,194,122,.08)", animation:"tm-fade .15s ease" },
  btnUse:       { padding:"5px 12px", borderRadius:6, border:"none", background:"linear-gradient(135deg,#c9973a,#f0c27a)", color:"#0f0e0d", fontSize:11, fontWeight:600, cursor:"pointer" },
  btnRemove:    { padding:"5px 10px", borderRadius:6, border:".5px solid rgba(255,100,100,.2)", background:"rgba(255,80,80,.07)", color:"#f87171", fontSize:11, fontWeight:600, cursor:"pointer" },
  toggleBtn:    { position:"absolute", zIndex:1002, top:76, background:"linear-gradient(135deg,#c9973a,#f0c27a)", border:"none", borderRadius:10, padding:"10px 15px", color:"#0f0e0d", fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:13, cursor:"pointer", boxShadow:"0 4px 16px rgba(240,194,122,.3)", transition:"left .35s cubic-bezier(.4,0,.2,1)" },
  ctrlBtn:      { width:42, height:42, borderRadius:10, border:".5px solid rgba(240,194,122,.15)", background:"rgba(10,11,20,.92)", color:"#f5f0e8", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 14px rgba(0,0,0,.4)", transition:"background .2s", fontFamily:"'DM Sans',sans-serif" },
  ctrlActive:   { background:"rgba(52,211,153,.15)", borderColor:"rgba(52,211,153,.4)", color:"#34d399" },
  empty:        { textAlign:"center", padding:"50px 0", color:"rgba(245,240,232,.25)", fontSize:13, lineHeight:1.7 },
};