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
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  MapContainer, TileLayer, Marker,
  Popup, Circle, Polyline, useMap,
} from "react-leaflet";
import {
  Heart, MoreVertical, Navigation2, Globe, Bike, MapPin, Lock, Radio, Archive, Menu, X, Clock, Phone, ExternalLink, BookOpen, Mountain, BarChart3, ArrowRight
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster";

/* ═══════════════════════════════════════════════════════════════
   THEME-AWARE COLOR SYSTEM
═══════════════════════════════════════════════════════════════ */
const getThemeColors = () => {
  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.getAttribute('data-theme') !== 'light'
    : true;
  
  if (isDarkMode) {
    // Dark mode colors — Premium modern travel app aesthetic
    return {
      gold: "#E0B15C",
      goldGradientStart: "#D4A03D",
      goldGradientEnd: "#E0B15C",
      emerald: "#34d399",
      teal: "#5dcaa5",
      blue: "#7b9fd4",
      grey: "#888780",
      liveLocation: "#4285f4",
      altRoute: "#4a5568",
      clusterGold: "#D4A03D",
      gold15: "rgba(224,177,92,.15)",
      gold45: "rgba(224,177,92,.45)",
      gold08: "rgba(224,177,92,.08)",
      gold25: "rgba(224,177,92,.25)",
      gold3: "rgba(224,177,92,.3)",
      gold05: "rgba(224,177,92,.05)",
      gold06: "rgba(224,177,92,.06)",
      gold1: "rgba(224,177,92,.1)",
      errorRed: "#f87171",
      errorBg: "rgba(248,113,113,.08)",
      errorBorder: "rgba(248,113,113,.2)",
      // Dark mode specific — Premium aesthetic
      background: "#0a0b14",
      sidebarBg: "rgba(12,13,25,.92)",
      sidebarBorder: "rgba(224,177,92,.08)",
      cardBg: "rgba(255,255,255,.05)",
      cardBorder: "rgba(224,177,92,.12)",
      text: "#f8f6f1",
      textSecondary: "rgba(255,255,255,.65)",
      textTertiary: "rgba(255,255,255,.35)",
      inputBg: "rgba(255,255,255,.06)",
      dropdownBg: "#0d0e1a",
      popupBg: "#0d0e1a",
      popupText: "#f5f0e8",
    };
  } else {
    // Light mode colors
    return {
      gold: "#ea580c",
      goldGradientStart: "#fb923c",
      goldGradientEnd: "#ea580c",
      emerald: "#059669",
      teal: "#0f766e",
      blue: "#2563eb",
      grey: "#64748b",
      liveLocation: "#2563eb",
      altRoute: "#94a3b8",
      clusterGold: "#ea580c",
      gold15: "rgba(249, 115, 22, 0.14)",
      gold45: "rgba(249, 115, 22, 0.45)",
      gold08: "rgba(249, 115, 22, 0.08)",
      gold25: "rgba(249, 115, 22, 0.25)",
      gold3: "rgba(249, 115, 22, 0.3)",
      gold05: "rgba(249, 115, 22, 0.05)",
      gold06: "rgba(249, 115, 22, 0.06)",
      gold1: "rgba(249, 115, 22, 0.12)",
      errorRed: "#dc2626",
      errorBg: "rgba(220, 38, 38, 0.08)",
      errorBorder: "rgba(220, 38, 38, 0.22)",
      // Light mode specific
      background: "#eef2f7",
      sidebarBg: "rgba(255, 255, 255, 0.96)",
      sidebarBorder: "rgba(148, 163, 184, 0.35)",
      cardBg: "#ffffff",
      cardBorder: "rgba(226, 232, 240, 0.95)",
      text: "#0f172a",
      textSecondary: "#475569",
      textTertiary: "#64748b",
      inputBg: "#f3f4f6",
      dropdownBg: "#ffffff",
      popupBg: "#ffffff",
      popupText: "#0f172a",
    };
  }
};

// Default colors (will be overridden by getThemeColors)
const COLORS = getThemeColors();

/* ═══════════════════════════════════════════════════════════════
   NEPAL CONSTANTS
═══════════════════════════════════════════════════════════════ */
const getNepalBounds = () =>
  L.latLngBounds(L.latLng(26.347, 80.058), L.latLng(30.447, 88.201));

const NEPAL_CENTER = [27.7172, 85.3240];

const ICON_CONFIG = {
  clusterIconSize: [38, 38],
  clusterIconAnchor: [19, 19],
  routeIconSize: 34,
  routeIconAnchor: 17,
  routeIconSmall: 22,
  routeIconSmallAnchor: 11,
  liveIconSize: 28,
  liveIconAnchor: 14,
  clusterBorderWidth: "1.5px",
  routeBorderWidth: "2px",
  routeBorderSmallWidth: "2.5px",
  animationDuration: "1.8s",
};

const RATING_THRESHOLDS = {
  high: 4.5,
  medium: 4.0,
  low: 3.0,
  colorHigh: "#f0c27a",
  colorMedium: "#5dcaa5",
  colorLow: "#7b9fd4",
  colorPoor: "#888780",
};

const ERROR_MESSAGES = {
  osrmHttp: (status) => `OSRM HTTP ${status}`,
  osrmNoRoute: "No route found",
  noAccessToken: "No access token found - redirecting to login",
  kycFetchFailed: "Failed to fetch KYC status",
  geolocationNotSupported: "Geolocation not supported.",
  locationError: (msg) => `Location error: ${msg}`,
};

const MESSAGES = {
  travelNepal: "Travel ",
  nepal: "Explorer",
  route: "Route",
  nearby: "Nearby",
  saved: "Saved",
  chat: "Chat",
  findingRoute: "Finding route…",
  alternative: "Alternative Routes",
  directions: "Directions",
  kycPending: "KYC Pending",
  kycUnderReview: "KYC Under Review",
  completeRegistration: "Complete Registration",
  kycPendingMsg: "Your KYC is submitted and pending verification. You'll be notified once approved!",
  kycReviewMsg: "Your KYC is being reviewed. Check back soon!",
  kycRequiredMsg: "Complete your KYC to start exploring routes across Nepal.",
  completeKyc: "Complete KYC",
  updateKyc: "Update KYC",
  viewStatus: "View Status",
  refresh: "Refresh",
  startPlaceholder: "Start — search anywhere in Nepal…",
  destPlaceholder: "Destination — search Nepal…",
  drive: "Drive",
  walk: "Walk",
  bike: "Bike",
  swap: "Swap",
  save: "Save",
  showRoute: "Show Route →",
  enableLocation: "Enable live location",
  discoverPlaces: "to discover places near you in Nepal",
  noSavedPlaces: "No saved places yet",
  savePlaces: "Save a destination to access it quickly",
  use: "Use",
  remove: "Remove",
  setAsDestination: "Set as Destination",
  origin: "Origin",
  destination: "Destination",
  zoom: {
    in: "Zoom in",
    out: "Zoom out",
    track: "My location",
    stopTrack: "Stop tracking",
    fitNepal: "Fit Nepal",
    fitRoute: "Fit route",
  },
};

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

function StarsDisplay({ rating, size = 13, colors }) {
  return (
    <span style={{ display:"inline-flex", gap:1 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{
          fontSize: size,
          color: (rating >= i || rating >= i-0.5) ? colors.gold : `${colors.textTertiary}90`,
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
    html: `<div style="background:${color};width:34px;height:34px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid rgba(255,255,255,0.95);box-shadow:0 8px 18px rgba(15,23,42,0.35);display:flex;align-items:center;justify-content:center;"><span style="width:10px;height:10px;border-radius:50%;background:white;display:block;transform:rotate(45deg);box-shadow:0 0 0 3px rgba(255,255,255,.25);"></span></div>`,
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
function RouteLayer({ routes, selectedIndex, colors }) {
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
            pathOptions={{ color: colors.altRoute, weight: 4, opacity: 0.45 }}
          />
        ) : null
      )}
      {/* Selected route on top */}
      <Polyline
        key={selectedIndex}
        positions={(routes[selectedIndex] || routes[0]).coords}
        pathOptions={{ color: colors.gold, weight: 5, opacity: 0.9 }}
      />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SEARCH BOX  (Nepal-only Nominatim)
═══════════════════════════════════════════════════════════════ */
function SearchBox({ value, onChange, onSelect, placeholder, dotColor, disabled, colors, S }) {
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

  const isDarkMode = typeof document !== 'undefined' 
    ? document.documentElement.getAttribute('data-theme') !== 'light'
    : true;

  return (
    <div style={{ position:"relative" }}>
      <style>{`
        .tm-search-input::placeholder {
          color: ${isDarkMode ? 'rgba(245,240,232,.4)' : 'rgba(0,0,0,.4)'};
        }
        .tm-search-input {
          color: ${isDarkMode ? '#f5f0e8' : '#0d0d0d'};
        }
      `}</style>
      <div style={{ position:"relative" }}>
        <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", width:9, height:9, borderRadius:"50%", background:dotColor, boxShadow:`0 0 6px ${dotColor}`, zIndex:2 }}/>
        <input
          className="tm-search-input"
          disabled={disabled}
          value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} autoComplete="off" style={{...S.input, opacity: disabled ? 0.5 : 1, cursor: disabled ? 'not-allowed' : 'text'}}
          onFocus={e => !disabled && (e.target.style.borderColor = colors.gold45)}
          onBlur={e  => (e.target.style.borderColor = colors.gold1)}
        />
        {loading && <div style={S.spinner}/>}
      </div>
      {results.length > 0 && !disabled && (
        <div style={S.dropdown}>
          {results.map((r,i) => (
            <div key={i} style={S.dropItem}
              onMouseEnter={e => (e.currentTarget.style.background = colors.gold08)}
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
function PlaceClusterLayer({ places, onSetDest, colors }) {
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
        html: `<div style="width:38px;height:38px;border-radius:50%;background:${colors.gold15};border:${ICON_CONFIG.clusterBorderWidth} solid ${colors.gold45};display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-weight:700;font-size:12px;color:${colors.clusterGold};">${cluster.getChildCount()}</div>`,
        iconSize:ICON_CONFIG.clusterIconSize, iconAnchor:ICON_CONFIG.clusterIconAnchor,
      }),
    });

    places.forEach(p => {
      const tags = p.tags || {};
      const extras = [
        tags["opening_hours"] ? `Hours: ${tags["opening_hours"]}` : null,
        tags.phone || tags["contact:phone"] ? `Phone: ${tags.phone || tags["contact:phone"]}` : null,
        tags.website || tags["contact:website"]
          ? `<a href="${tags.website || tags["contact:website"]}" target="_blank" style="color:#60a5fa;">Website</a>` : null,
        tags.wikipedia
          ? `<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(tags.wikipedia.replace(/^en:/,""))}" target="_blank" style="color:#60a5fa;">Wikipedia</a>` : null,
        tags.ele ? `Elevation: ${tags.ele}m` : null,
      ].filter(Boolean).slice(0, 3).join("<br/>");

      const starsHtml = [1,2,3,4,5].map(i =>
        `<span style="font-size:13px;color:${p.rating>=i||p.rating>=i-.5?colors.clusterGold:"rgba(255,255,255,.18)"};opacity:${(!(p.rating>=i)&&p.rating>=i-.5)?".6":"1"}">★</span>`
      ).join("");

      L.marker([p.lat, p.lng], { icon: makePlaceIcon(p) })
        .bindPopup(L.popup({ maxWidth:270, className:"tm-popup" }).setContent(`
          <div style="font-family:'DM Sans',sans-serif;background:${colors.popupBg};color:${colors.popupText};border-radius:10px;padding:13px 15px;min-width:220px;">
            <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:14px;color:${p.color};margin-bottom:2px;">${p.name}</div>
            ${p.nameNe ? `<div style="font-size:12px;color:${colors.textSecondary};margin-bottom:4px;">${p.nameNe}</div>` : ""}
            <div style="font-size:11px;color:${colors.textTertiary};margin-bottom:8px;">${p.category}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:${extras?"8px":"10px"};">
              ${starsHtml}
              <span style="font-size:13px;font-weight:600;color:${colors.popupText};">${p.rating}</span>
              <span style="font-size:11px;color:${colors.textTertiary};">(${p.reviews.toLocaleString()} reviews)</span>
            </div>
            ${extras ? `<div style="font-size:11px;color:${colors.textSecondary};line-height:1.9;margin-bottom:10px;border-top:.5px solid ${colors.gold1};padding-top:8px;">${extras}</div>` : ""}
            <button onclick="window.__tmSetDest(${p.id})" style="width:100%;padding:8px;border-radius:7px;border:none;background:linear-gradient(135deg,${colors.goldGradientStart},${colors.goldGradientEnd});color:#0f0e0d;font-family:'DM Sans',sans-serif;font-weight:700;font-size:12px;cursor:pointer;">${MESSAGES.setAsDestination}</button>
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
function MapControls({ tracking, onToggleTrack, routeCoords, colors, S }) {
  const map = useMap();
  return (
    <div style={{ position:"absolute", bottom:80, right:16, zIndex:1000, display:"flex", flexDirection:"column", gap:8 }}>
      <button style={S.ctrlBtn} onClick={() => map.zoomIn()} title={MESSAGES.zoom.in}>+</button>
      <button style={S.ctrlBtn} onClick={() => map.zoomOut()} title={MESSAGES.zoom.out}>−</button>
      <button
        style={{ ...S.ctrlBtn, ...(tracking ? S.ctrlActive : {}) }}
        onClick={onToggleTrack} title={tracking ? MESSAGES.zoom.stopTrack : MESSAGES.zoom.track}
      ><MapPin size={18} color={tracking ? colors.clusterGold : colors.text} /></button>
      <button style={S.ctrlBtn} onClick={() => map.fitBounds(getNepalBounds(), { padding:[20,20] })} title={MESSAGES.zoom.fitNepal}><Globe size={18} color={colors.clusterGold} /></button>
      {routeCoords?.length > 0 && (
        <button style={S.ctrlBtn} onClick={() => map.fitBounds(L.latLngBounds(routeCoords), { padding:[60,60] })} title={MESSAGES.zoom.fitRoute}><Navigation2 size={18} color={colors.clusterGold} /></button>
      )}
    </div>
  );
}



/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════ */
export default function NepalMap() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab,   setActiveTab]   = useState("route");
  const [colors, setColors] = useState(getThemeColors());
  const [tileLayer, setTileLayer] = useState("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png");

  // Listen for theme changes
  useEffect(() => {
    const handleThemeChange = () => {
      const newColors = getThemeColors();
      setColors(newColors);
      const isDarkMode = document.documentElement.getAttribute('data-theme') !== 'light';
      setTileLayer(isDarkMode 
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      );
    };

    // Check on mount
    handleThemeChange();

    // Listen for theme changes
    window.addEventListener('theme-changed', handleThemeChange);
    return () => window.removeEventListener('theme-changed', handleThemeChange);
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

  // Recent searches
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tm_recent") || "[]"); } catch { return []; }
  });

  useEffect(() => { localStorage.setItem("tm_recent", JSON.stringify(recentSearches)); }, [recentSearches]);

  const addToRecentSearches = (searchText) => {
    if (!searchText.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s !== searchText);
      return [searchText, ...filtered].slice(0, 6);
    });
  };

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
    if (!navigator.geolocation) { alert(ERROR_MESSAGES.geolocationNotSupported); return; }
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
      err => { setTracking(false); alert(ERROR_MESSAGES.locationError(err.message)); },
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
  const S = getThemeStyles(colors);
  
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

        .tm-sidebar { backdrop-filter: blur(18px); }
        .tm-sidebar-content::-webkit-scrollbar { width: 6px; }
        .tm-sidebar-content::-webkit-scrollbar-track { background: transparent; }
        .tm-sidebar-content::-webkit-scrollbar-thumb { background: rgba(240,194,122,.28); border-radius: 999px; }
        [data-theme="light"] .tm-sidebar-content::-webkit-scrollbar-thumb { background: rgba(249,115,22,.35); }
        [data-theme="light"] .leaflet-control-attribution {
          background: rgba(255,255,255,.92) !important;
          color: #475569 !important;
        }
        [data-theme="light"] .leaflet-container {
          background: #e5e7eb !important;
        }
        [data-theme="light"] .tm-popup .leaflet-popup-content-wrapper {
          box-shadow: 0 18px 50px rgba(15,23,42,.18)!important;
          border: 1px solid rgba(226,232,240,.95)!important;
        }

      `}</style>

      {/* ════════════════════════════════════════ MAP INTERFACE ════════════════════════════════════════ */}
          <div style={{ display:"flex", height:"100vh", width:"100vw", overflow:"hidden", background: colors.background }}>

            {/* ──────────── SIDEBAR ──────────── */}
            <aside
              className="tm-sidebar"
              style={{
                width: sidebarOpen ? 400 : 0,
                minWidth: sidebarOpen ? 400 : 0,
                background: document.documentElement.getAttribute('data-theme') === 'light'
                  ? colors.sidebarBg
                  : "rgba(12,13,25,.94)",
                borderRight: `1px solid ${colors.sidebarBorder}`,
                boxShadow: document.documentElement.getAttribute('data-theme') === 'light'
                  ? "10px 0 35px rgba(15,23,42,.10)"
                  : "20px 0 60px rgba(0,0,0,.55), inset -1px 0 0 rgba(255,255,255,.04)",
                display: "flex",
                flexDirection: "column",
                transition: "all .35s cubic-bezier(.4,0,.2,1)",
                overflow: "hidden",
                zIndex: 1001,
                backdropFilter: document.documentElement.getAttribute('data-theme') === 'light' ? "none" : "blur(18px)",
              }}
            >

          <div className="tm-sidebar-header" style={{ padding:"28px 24px 20px", marginTop:"0", borderBottom:`1px solid ${colors.sidebarBorder}`, flexShrink:0 }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:24, color: colors.text, marginBottom:20, letterSpacing:"-.6px" }}>
              Travel Explorer
            </div>
            {/* Single Route Tab Button */}
            <button 
              onClick={() => setActiveTab("route")} 
              style={{ 
                width: "100%",
                padding: "12px 16px",
                borderRadius: 14,
                border: "none",
                background: colors.gold,
                color: "#0a0b14",
                fontFamily: "'Syne',sans-serif",
                fontWeight: 800,
                fontSize: 13,
                cursor: "pointer",
                letterSpacing: ".4px",
                boxShadow: `0 12px 32px rgba(224,177,92,.25)`,
                transition: "all .3s cubic-bezier(.4,0,.2,1)",
              }}
              onMouseEnter={e => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = `0 16px 40px rgba(224,177,92,.35)`;
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = `0 12px 32px rgba(224,177,92,.25)`;
              }}
            >
              Route
            </button>
          </div>

          {/* Only show Route tab content in sidebar */}
          {activeTab === "route" && (
            <div className="tm-sidebar-content" style={{ flex:1, overflowY:"auto", padding:"24px 24px 28px", display:"flex", flexDirection:"column", gap:18 }}>

              {/* ── ROUTE TAB ── */}
              <div style={{ display: "flex", flexDirection: "column", gap: 18, flex: 1, minHeight: 0 }}>
                {/* Scrollable route controls */}
                <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 18 }}>
                  <>
                  <SearchBox
                    value={originText} onChange={setOriginText}
                    onSelect={p => { addToRecentSearches(p.name); setOrigin(p); setShowRoute(false); setRoutes([]); setSteps([]); }}
                    placeholder={MESSAGES.startPlaceholder}
                    dotColor={colors.emerald}
                    colors={colors}
                    S={S}
                  />
                  <SearchBox
                    value={destText} onChange={setDestText}
                    onSelect={p => { addToRecentSearches(p.name); setDest(p); setShowRoute(false); setRoutes([]); setSteps([]); }}
                    placeholder={MESSAGES.destPlaceholder}
                    dotColor={colors.gold}
                    colors={colors}
                    S={S}
                  />

              <div style={{ display:"flex", gap:6 }}>
                {[{k:"car",l:MESSAGES.drive,icon:Navigation2},{k:"foot",l:MESSAGES.walk,icon:MapPin},{k:"bike",l:MESSAGES.bike,icon:Bike}].map(m => (
                  <button key={m.k}
                    onClick={() => { setMode(m.k); setShowRoute(false); setRoutes([]); setSteps([]); }}
                    style={{ ...S.modeBtn, ...(mode===m.k ? S.modeBtnActive : {}), display:"flex", alignItems:"center", gap:"6px" }}>
                    {m.icon && React.createElement(m.icon, {size:16})} {m.l}
                    </button>
                ))}
              </div>

              {/* Select on map card */}
              <div style={{
                background: `linear-gradient(135deg, rgba(224,177,92,.12), rgba(224,177,92,.06))`,
                border: `1.5px solid rgba(224,177,92,.2)`,
                borderRadius: 16,
                padding: "16px 14px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                cursor: "pointer",
                transition: "all .2s",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = `linear-gradient(135deg, rgba(224,177,92,.18), rgba(224,177,92,.1))`;
                e.currentTarget.style.borderColor = `rgba(224,177,92,.35)`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = `linear-gradient(135deg, rgba(224,177,92,.12), rgba(224,177,92,.06))`;
                e.currentTarget.style.borderColor = `rgba(224,177,92,.2)`;
              }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  background: `linear-gradient(135deg, ${colors.goldGradientStart}, ${colors.goldGradientEnd})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}>
                  <MapPin size={18} color="#0a0b14" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: colors.text, letterSpacing: ".3px" }}>
                    Click on map
                  </div>
                  <div style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>
                    to set destination
                  </div>
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && !showRoute && (
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.8, textTransform: "uppercase", color: colors.gold, marginBottom: 10 }}>Recent</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {recentSearches.map((search, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setDestText(search);
                          setDest({ name: search, lat: 27.7, lng: 85.32 });
                        }}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 20,
                          border: `1.5px solid rgba(224,177,92,.25)`,
                          background: "rgba(224,177,92,.08)",
                          color: colors.textSecondary,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all .2s",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.background = "rgba(224,177,92,.15)";
                          e.currentTarget.style.borderColor = `rgba(224,177,92,.4)`;
                          e.currentTarget.style.color = colors.text;
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.background = "rgba(224,177,92,.08)";
                          e.currentTarget.style.borderColor = `rgba(224,177,92,.25)`;
                          e.currentTarget.style.color = colors.textSecondary;
                        }}
                      >
                        <Clock size={12} style={{ display: "inline", marginRight: 6 }} />
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {origin && destination && (
                <div style={{ display:"flex", gap:8 }}>
                  <button style={{...S.btnSec, display:"flex", alignItems:"center", gap:"6px"}}  onClick={handleSwap}><MoreVertical size={16} style={{rotate:"90deg"}} /> {MESSAGES.swap}</button>
                  <button style={{...S.btnGold, display:"flex", alignItems:"center", gap:"6px"}} onClick={saveFavorite}><Heart size={16} /> {MESSAGES.save}</button>
                </div>
              )}

              {origin && destination && !showRoute && (
                <button 
                  style={{
                    ...S.btnRoute,
                    marginTop: "auto",
                  }} 
                  onClick={() => setShowRoute(true)}
                >
                  Find Route
                </button>
              )}

              {routeLoading && (
                <div style={{ textAlign:"center", padding:"14px 0", color:`${colors.gold}99`, fontSize:12 }}>
                  <div style={{ ...S.spinner, position:"static", display:"inline-block", marginBottom:6 }}/>
                  <div>{MESSAGES.findingRoute}</div>
                </div>
              )}

              {routeError && (
                <div style={{ background: colors.errorBg, border: `.5px solid ${colors.errorBorder}`, borderRadius:10, padding:"10px 13px", fontSize:12, color: colors.errorRed }}>
                  {routeError}
                </div>
              )}

              {routes.length > 1 && (
                <div style={S.card}>
                  <div style={S.cardTitle}>{MESSAGES.alternative}</div>
                  {routes.map((r,i) => (
                    <button key={i} onClick={() => setSelected(i)} style={{ ...S.routeAlt, borderColor:i===selectedRoute?colors.gold45:`rgba(255,255,255,.05)`, background:i===selectedRoute?colors.gold06:"transparent" }}>
                      <div style={{ display:"flex", justifyContent:"space-between" }}>
                        <span style={{ fontSize:13, fontWeight:500, color:i===selectedRoute?colors.gold: colors.textSecondary }}>{`Route ${i+1}`}</span>
                        <span style={{ fontSize:11, color: colors.textTertiary }}>{r.durationMin} min</span>
                      </div>
                      <div style={{ fontSize:11, color: colors.textTertiary, marginTop:2 }}>{r.distanceKm} km</div>
                    </button>
                  ))}
                </div>
              )}

              {steps.length > 0 && (
                <div style={S.card}>
                  <div style={S.cardTitle}>{MESSAGES.directions}</div>
                  <div style={{ maxHeight:300, overflowY:"auto", display:"flex", flexDirection:"column", gap:6 }}>
                    {steps.map((s,i) => (
                      <div key={s.id} style={{ display:"flex", gap:10, padding:"9px 10px", borderRadius:8, background:"rgba(255,255,255,.02)", border:".5px solid rgba(255,255,255,.04)", animation:`tm-slide .15s ease ${i*.025}s both` }}>
                        <div style={{ flexShrink:0, width:20, height:20, borderRadius:"50%", background:`linear-gradient(135deg,${colors.goldGradientStart},${colors.goldGradientEnd})`, display:"flex", alignItems:"center", justifyContent:"center", color:"#0f0e0d", fontSize:9, fontWeight:700 }}>{i+1}</div>
                        <div>
                          <div style={{ fontSize:12, color: colors.textSecondary, lineHeight:1.5 }}>{s.text}</div>
                          <div style={{ fontSize:10, color: colors.textTertiary, marginTop:2 }}>{(s.dist/1000).toFixed(2)} km</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

                  </>
                </div>

                {/* Sticky Find Route Button */}
                {origin && destination && !showRoute && (
                  <button 
                    style={{
                      ...S.btnRoute,
                      flexShrink: 0,
                    }} 
                    onClick={() => setShowRoute(true)}
                  >
                    Find Route
                  </button>
                )}

                {/* Go to Dashboard Button */}
                <button 
                  onClick={() => navigate("/dashboard")}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 14,
                    border: `1.5px solid rgba(224,177,92,.25)`,
                    background: document.documentElement.getAttribute('data-theme') !== 'light' 
                      ? "rgba(12,13,25,.6)" 
                      : "rgba(255,255,255,.9)",
                    color: document.documentElement.getAttribute('data-theme') !== 'light' 
                      ? "rgba(255,255,255,.85)" 
                      : "#475569",
                    fontFamily: "'DM Sans',sans-serif",
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                    flexShrink: 0,
                    transition: "all .2s",
                    boxShadow: document.documentElement.getAttribute('data-theme') !== 'light' 
                      ? "0 8px 24px rgba(224,177,92,.12), inset 0 1px 0 rgba(255,255,255,.06)"
                      : "0 8px 20px rgba(15,23,42,.08)",
                  }}
                  onMouseEnter={e => {
                    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
                    if (isDark) {
                      e.currentTarget.style.background = "rgba(12,13,25,.75)";
                      e.currentTarget.style.borderColor = "rgba(224,177,92,.4)";
                      e.currentTarget.style.boxShadow = "0 10px 32px rgba(224,177,92,.18), inset 0 1px 0 rgba(255,255,255,.08)";
                    } else {
                      e.currentTarget.style.background = "rgba(255,255,255,.96)";
                      e.currentTarget.style.boxShadow = "0 10px 28px rgba(15,23,42,.12)";
                    }
                  }}
                  onMouseLeave={e => {
                    const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
                    if (isDark) {
                      e.currentTarget.style.background = "rgba(12,13,25,.6)";
                      e.currentTarget.style.borderColor = "rgba(224,177,92,.25)";
                      e.currentTarget.style.boxShadow = "0 8px 24px rgba(224,177,92,.12), inset 0 1px 0 rgba(255,255,255,.06)";
                    } else {
                      e.currentTarget.style.background = "rgba(255,255,255,.9)";
                      e.currentTarget.style.boxShadow = "0 8px 20px rgba(15,23,42,.08)";
                    }
                  }}
                  aria-label="Go to Dashboard"
                >
                  <BarChart3 size={16} style={{ flexShrink: 0 }} />
                  <span style={{ flex: 1, textAlign: "center" }}>Go to Dashboard</span>
                  <ArrowRight size={16} style={{ flexShrink: 0 }} />
                </button>
              </div>
            </div>
          )}

          </aside>

          {/* Toggle */}
          <button onClick={() => setSidebarOpen(o => !o)} style={{ ...S.toggleBtn, left: sidebarOpen ? 416 : 16 }} aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
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
                url={tileLayer}
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                maxZoom={19}
              />

              <NepalBoundsEnforcer/>
              <PlaceClusterLayer places={visiblePlaces} onSetDest={handleSetDest} colors={colors}/>

              {/* Route polylines — pure React-Leaflet, no LRM, no crashes */}
              {routes.length > 0 && (
                <RouteLayer routes={routes} selectedIndex={selectedRoute} colors={colors}/>
              )}

              {/* Origin marker */}
              {origin && (
                <Marker position={[origin.lat, origin.lng]} icon={makeRouteIcon(colors.emerald)}>
                  <Popup className="tm-popup">
                    <div style={{ fontFamily:"'DM Sans',sans-serif", background: colors.popupBg, color: colors.popupText, borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color: colors.emerald, marginBottom:4 }}>{MESSAGES.origin}</div>
                      <div style={{ fontSize:12, color: colors.textSecondary, lineHeight:1.5 }}>{origin.name}</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Destination marker */}
              {destination && (
                <Marker position={[destination.lat, destination.lng]} icon={makeRouteIcon(colors.gold)}>
                  <Popup className="tm-popup">
                    <div style={{ fontFamily:"'DM Sans',sans-serif", background: colors.popupBg, color: colors.popupText, borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color: colors.gold, marginBottom:4 }}>{MESSAGES.destination}</div>
                      <div style={{ fontSize:12, color: colors.textSecondary, lineHeight:1.5 }}>{destination.name}</div>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* Live location */}
              {livePos && <>
                <Marker position={[livePos.lat, livePos.lng]} icon={getLiveIcon()} zIndexOffset={1000}>
                  <Popup className="tm-popup">
                    <div style={{ fontFamily:"'DM Sans',sans-serif", background: colors.popupBg, color: colors.popupText, borderRadius:10, padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:14, color:"#4285f4", marginBottom:4 }}>Your Location</div>
                      <div style={{ fontSize:11, color: colors.textSecondary }}>Accuracy: ±{liveAcc}m</div>
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
                colors={colors}
                S={S}
              />
            </MapContainer>

            {/* Accuracy badge */}
            {tracking && liveAcc && (
              <div style={{ position:"absolute", top:14, left:"50%", transform:"translateX(-50%)", zIndex:1000, background:`${colors.sidebarBg}dd`, border:`.5px solid ${colors.sidebarBorder}`, borderRadius:20, padding:"6px 14px", fontSize:11, color: colors.textTertiary, animation:"tm-fade .2s ease", whiteSpace:"nowrap" }}>
                Accuracy: ±{liveAcc}m
              </div>
            )}
          </div>
          </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   THEME-AWARE STYLES
═══════════════════════════════════════════════════════════════ */
const getThemeStyles = (colors) => {
  const isLight = typeof document !== "undefined"
    ? document.documentElement.getAttribute("data-theme") === "light"
    : false;

  const shadow = isLight
    ? "0 12px 30px rgba(15,23,42,.08)"
    : "0 18px 42px rgba(0,0,0,.45)";

  return {
    input: {
      width: "100%",
      paddingLeft: 42,
      paddingRight: 42,
      paddingTop: isLight ? 12 : 14,
      paddingBottom: isLight ? 12 : 14,
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: isLight ? 14 : 16,
      fontSize: isLight ? 13 : 13.5,
      fontFamily: "'DM Sans',sans-serif",
      background: isLight ? colors.inputBg : "rgba(255,255,255,.07)",
      color: colors.text,
      outline: "none",
      transition: "border-color .2s, box-shadow .2s, background .2s",
      boxShadow: isLight ? "0 8px 22px rgba(15,23,42,.04)" : "0 10px 28px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.08)",
      marginBottom: 12,
    },
    spinner: {
      position: "absolute",
      right: 14,
      top: "50%",
      transform: "translateY(-50%)",
      width: 16,
      height: 16,
      border: `2.5px solid ${colors.gold}`,
      borderTopColor: "transparent",
      borderRadius: "50%",
      animation: "tm-spin .7s linear infinite",
    },
    dropdown: {
      position: "absolute",
      width: "100%",
      top: "calc(100% + 8px)",
      background: isLight ? colors.dropdownBg : "rgba(13,14,26,.96)",
      borderRadius: 16,
      border: `1px solid ${colors.cardBorder}`,
      boxShadow: isLight ? "0 18px 45px rgba(15,23,42,.16)" : "0 24px 56px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.06)",
      maxHeight: 240,
      overflowY: "auto",
      zIndex: 9999,
      animation: "tm-fade .15s ease",
      backdropFilter: isLight ? "none" : "blur(12px)",
    },
    dropItem: {
      padding: "12px 16px",
      fontSize: 12.5,
      color: isLight ? colors.textSecondary : "rgba(255,255,255,.65)",
      cursor: "pointer",
      borderBottom: `1px solid ${isLight ? "rgba(226,232,240,.9)" : "rgba(255,255,255,.04)"}`,
      transition: "background .15s, color .15s",
      lineHeight: 1.45,
    },
    tabBtn: {
      padding: "9px 8px",
      borderRadius: 10,
      border: "none",
      cursor: "pointer",
      fontFamily: "'DM Sans',sans-serif",
      fontWeight: 700,
      fontSize: 12,
      transition: "all .2s",
      whiteSpace: "nowrap",
    },
    modeBtn: {
      flex: 1,
      padding: isLight ? "10px 0" : "12px 0",
      borderRadius: isLight ? 12 : 14,
      border: `1px solid ${colors.cardBorder}`,
      cursor: "pointer",
      fontFamily: "'DM Sans',sans-serif",
      fontWeight: 700,
      fontSize: 12.5,
      background: isLight ? colors.cardBg : "rgba(255,255,255,.04)",
      color: colors.textTertiary,
      transition: "all .2s",
      justifyContent: "center",
    },
    modeBtnActive: {
      background: `linear-gradient(135deg,${colors.goldGradientStart},${colors.goldGradientEnd})`,
      color: "#ffffff",
      borderColor: "transparent",
      boxShadow: isLight ? `0 10px 24px ${colors.gold25}` : `0 14px 36px rgba(224,177,92,.32)`,
    },
    btnSec: {
      flex: 1,
      padding: isLight ? 10 : 12,
      borderRadius: isLight ? 12 : 14,
      border: `1px solid ${colors.cardBorder}`,
      background: isLight ? colors.cardBg : "rgba(255,255,255,.05)",
      color: colors.textSecondary,
      fontFamily: "'DM Sans',sans-serif",
      fontWeight: 700,
      fontSize: 12.5,
      cursor: "pointer",
      justifyContent: "center",
      transition: "all .2s",
    },
    btnGold: {
      padding: isLight ? "10px 16px" : "12px 18px",
      borderRadius: isLight ? 12 : 14,
      border: "none",
      background: `linear-gradient(135deg,${colors.goldGradientStart},${colors.goldGradientEnd})`,
      color: isLight ? "#ffffff" : "#0a0b14",
      fontFamily: "'DM Sans',sans-serif",
      fontWeight: 800,
      fontSize: 12.5,
      cursor: "pointer",
      boxShadow: isLight ? `0 10px 24px ${colors.gold25}` : `0 12px 32px rgba(224,177,92,.28)`,
      justifyContent: "center",
      transition: "all .2s",
    },
    btnRoute: {
      width: "100%",
      padding: isLight ? 14 : 16,
      borderRadius: isLight ? 14 : 16,
      border: "none",
      background: `linear-gradient(135deg,${colors.goldGradientStart},${colors.goldGradientEnd})`,
      color: isLight ? "#ffffff" : "#0a0b14",
      fontFamily: "'Syne',sans-serif",
      fontWeight: 800,
      fontSize: isLight ? 13 : 14,
      cursor: "pointer",
      letterSpacing: isLight ? ".4px" : ".5px",
      boxShadow: isLight ? `0 12px 28px ${colors.gold3}` : `0 16px 42px rgba(224,177,92,.32)`,
      transition: "all .2s",
    },
    card: {
      background: isLight ? colors.cardBg : "rgba(255,255,255,.05)",
      border: `1px solid ${colors.cardBorder}`,
      borderRadius: isLight ? 16 : 18,
      padding: isLight ? 15 : 18,
      animation: "tm-fade .2s ease",
      boxShadow: isLight ? "0 10px 28px rgba(15,23,42,.05)" : "0 12px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.05)",
      backdropFilter: isLight ? "none" : "blur(14px)",
    },
    cardTitle: {
      fontFamily: "'Syne',sans-serif",
      fontWeight: 800,
      fontSize: 10,
      letterSpacing: 1.8,
      textTransform: "uppercase",
      color: colors.gold,
      marginBottom: 12,
    },
    routeAlt: {
      padding: isLight ? "11px 12px" : "13px 14px",
      borderRadius: isLight ? 12 : 14,
      cursor: "pointer",
      border: "1px solid",
      background: "transparent",
      textAlign: "left",
      width: "100%",
      marginBottom: 8,
      transition: "all .2s",
    },
    nearbyCard: {
      background: isLight ? colors.cardBg : "rgba(255,255,255,.05)",
      borderRadius: isLight ? 14 : 16,
      padding: isLight ? "12px 13px" : "14px 15px",
      border: `1px solid ${colors.cardBorder}`,
      display: "flex",
      alignItems: "center",
      gap: 13,
      cursor: "pointer",
      transition: "border-color .2s, box-shadow .2s, transform .2s",
      animation: "tm-fade .15s ease",
      boxShadow: isLight ? "0 8px 22px rgba(15,23,42,.04)" : "0 10px 28px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.05)",
    },
    favItem: {
      background: isLight ? colors.cardBg : "rgba(255,255,255,.05)",
      borderRadius: isLight ? 14 : 16,
      padding: isLight ? 13 : 15,
      border: `1px solid ${colors.cardBorder}`,
      animation: "tm-fade .15s ease",
      boxShadow: isLight ? "0 8px 22px rgba(15,23,42,.04)" : "0 10px 28px rgba(0,0,0,.2), inset 0 1px 0 rgba(255,255,255,.05)",
    },
    btnUse: {
      padding: "7px 14px",
      borderRadius: isLight ? 8 : 10,
      border: "none",
      background: `linear-gradient(135deg,${colors.goldGradientStart},${colors.goldGradientEnd})`,
      color: isLight ? "#ffffff" : "#0a0b14",
      fontSize: 11.5,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all .2s",
    },
    btnRemove: {
      padding: "7px 12px",
      borderRadius: isLight ? 8 : 10,
      border: `1px solid ${isLight ? "rgba(220,38,38,.2)" : "rgba(248,113,113,.25)"}`,
      background: isLight ? "rgba(220,38,38,.07)" : "rgba(248,113,113,.08)",
      color: colors.errorRed,
      fontSize: 11.5,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all .2s",
    },
    toggleBtn: {
      position: "absolute",
      zIndex: 1002,
      top: 104,
      width: 44,
      height: 44,
      background: `linear-gradient(135deg,${colors.goldGradientStart},${colors.goldGradientEnd})`,
      border: "none",
      borderRadius: 14,
      color: isLight ? "#ffffff" : "#0a0b14",
      cursor: "pointer",
      boxShadow: isLight ? `0 10px 26px ${colors.gold3}` : `0 14px 38px rgba(224,177,92,.32)`,
      transition: "left .35s cubic-bezier(.4,0,.2,1)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 700,
    },
    ctrlBtn: {
      width: 44,
      height: 44,
      borderRadius: 14,
      border: `1px solid ${colors.sidebarBorder}`,
      background: isLight ? "rgba(255,255,255,.94)" : "rgba(12,13,25,.7)",
      color: colors.text,
      fontSize: 18,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: isLight ? shadow : "0 12px 32px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08)",
      transition: "background .2s, transform .2s",
      fontFamily: "'DM Sans',sans-serif",
      backdropFilter: isLight ? "none" : "blur(10px)",
    },
    ctrlActive: {
      background: isLight ? "rgba(5,150,105,.12)" : "rgba(52,211,153,.2)",
      borderColor: isLight ? "rgba(52,211,153,.3)" : "rgba(52,211,153,.5)",
      color: colors.emerald,
    },
    empty: {
      textAlign: "center",
      padding: isLight ? "52px 18px" : "58px 20px",
      color: colors.textTertiary,
      fontSize: isLight ? 13 : 13.5,
      lineHeight: 1.7,
      background: isLight ? colors.cardBg : "rgba(255,255,255,.04)",
      border: `1px dashed ${colors.cardBorder}`,
      borderRadius: 16,
    },
  };
}