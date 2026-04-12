import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin } from "lucide-react";
import bg from "../assets/bg.png";
import api from "../API/api";
import PeopleIcon from "@mui/icons-material/People";
import RoomIcon from "@mui/icons-material/Room";
import ShieldIcon from "@mui/icons-material/Shield";

// ──── CONSTANTS ────
const ITEMS_PER_PAGE = 8;
const PLACEHOLDER = "Search destinations, people, or trips…";

const FEATURES = [
  {
    icon: <PeopleIcon style={{ fontSize: 18 }} />,
    title: "Smart Matching",
    desc: "Connect with travelers who share your pace and interests",
    tag: "AI-Powered",
  },
  {
    icon: <RoomIcon style={{ fontSize: 18 }} />,
    title: "Trip Planning",
    desc: "Build itineraries together in real time, no back-and-forth",
    tag: "Collaborative",
  },
  {
    icon: <ShieldIcon style={{ fontSize: 18 }} />,
    title: "Safe & Verified",
    desc: "Verified members and 24/7 support keep every journey safe",
    tag: "Trusted",
  },
];

const STATS = [
  { number: "12k+", label: "Travelers" },
  { number: "340+", label: "Destinations" },
  { number: "8k+",  label: "Trips Planned" },
];

export default function Home() {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([]);
  const [query, setQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    api
      .get("trips/destinations/")
      .then((res) => setDestinations(res.data))
      .catch((err) => console.error("Destinations fetch failed:", err));
  }, []);

  const handleDestinationClick = (destinationName) => {
    navigate("/explore", { state: { destinationName } });
  };

  const filtered = destinations.filter((d) =>
    d.name.toLowerCase().includes(query.toLowerCase())
  );

  const totalPages = Math.ceil(destinations.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = destinations.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleSearch = () => {
    const match = filtered[0];
    if (match) handleDestinationClick(match.name);
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif", background: "#0a0f1e", color: "#fff", minHeight: "100vh" }}>

      {/* ── Hero ── */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "2rem 1rem",
        overflow: "hidden",
        background: "linear-gradient(160deg, #0a0f1e 0%, #111827 55%, #0d1526 100%)",
      }}>
        {/* Gold glow blob */}
        <div style={{
          position: "absolute",
          top: "-140px", left: "50%",
          transform: "translateX(-50%)",
          width: 640, height: 640,
          background: "radial-gradient(circle, rgba(255,213,128,0.07) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />

        {/* Background image overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
          opacity: 0.45,
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(10,15,30,0.3) 0%, rgba(10,15,30,0.55) 60%, #0a0f1e 100%)",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, maxWidth: 560, width: "100%" }}>
          {/* Eyebrow */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 7,
            background: "rgba(255,213,128,0.08)",
            border: "0.5px solid rgba(255,213,128,0.28)",
            borderRadius: 100,
            padding: "5px 15px",
            fontSize: 11, fontWeight: 600,
            color: "#ffd580",
            letterSpacing: "0.07em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#ffd580",
              animation: "pulse 2s infinite",
              flexShrink: 0,
            }} />
            Now live in Nepal
          </div>

          <h1 style={{
            fontSize: "clamp(2.2rem, 5vw, 3.4rem)",
            fontWeight: 700,
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            color: "#fff",
            marginBottom: "1.1rem",
          }}>
            Find Your Partner
            <br />
            <span style={{ color: "#ffd580" }}>for the Adventure</span>
          </h1>

          <p style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.75,
            marginBottom: "2.5rem",
            maxWidth: 440,
            margin: "0 auto 2.5rem",
          }}>
            Connect with like-minded travelers, plan trips together,
            and explore the world — one journey at a time.
          </p>

          {/* Search bar */}
          <div style={{ position: "relative", maxWidth: 520, margin: "0 auto" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "rgba(255,255,255,0.05)",
              border: "0.5px solid rgba(255,255,255,0.12)",
              borderRadius: 100,
              padding: "8px 8px 8px 20px",
              backdropFilter: "blur(12px)",
              transition: "border-color 0.2s",
            }}>
              <svg style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); }}
                placeholder={PLACEHOLDER}
                onKeyDown={(e) => { if (e.key === "Enter" && query.trim()) handleSearch(); }}
                style={{
                  flex: 1, background: "transparent", border: "none",
                  outline: "none", fontSize: 14, color: "#fff",
                  fontFamily: "inherit",
                }}
              />
              <button
                onClick={handleSearch}
                style={{
                  background: "#ffd580", color: "#0a0f1e",
                  border: "none", borderRadius: 100,
                  padding: "9px 22px", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", fontFamily: "inherit",
                  transition: "opacity 0.2s, transform 0.15s",
                  flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.85"; e.currentTarget.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "scale(1)"; }}
              >
                Explore →
              </button>
            </div>

            {/* Dropdown */}
            {query.trim() && (
              <div style={{
                position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0,
                background: "#111827",
                border: "0.5px solid rgba(255,255,255,0.12)",
                borderRadius: 14,
                boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
                zIndex: 50,
                maxHeight: 260,
                overflowY: "auto",
              }}>
                {filtered.length > 0 ? (
                  filtered.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => handleDestinationClick(d.name)}
                      style={{
                        width: "100%", textAlign: "left",
                        padding: "12px 16px",
                        background: "transparent", border: "none",
                        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
                        cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
                        fontFamily: "inherit",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,213,128,0.07)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      {d.image ? (
                        <img src={d.image} alt={d.name} style={{ width: 38, height: 38, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 38, height: 38, borderRadius: 8,
                          background: "rgba(255,213,128,0.1)",
                          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          <MapPin size={16} style={{ color: "#ffd580" }} />
                        </div>
                      )}
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{d.name}</div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 1 }}>{d.location}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{ padding: "16px", textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
                    No destinations found
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: "absolute", bottom: 32, left: "50%",
          transform: "translateX(-50%)",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          color: "rgba(255,255,255,0.22)",
          fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase",
          animation: "scrollBounce 2.5s ease-in-out infinite",
        }}>
          <span>scroll</span>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div style={{
        display: "flex", justifyContent: "center",
        borderTop: "0.5px solid rgba(255,255,255,0.07)",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
        background: "rgba(255,255,255,0.02)",
      }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{
            flex: 1, maxWidth: 200, textAlign: "center",
            padding: "1.4rem 1rem",
            borderRight: i < STATS.length - 1 ? "0.5px solid rgba(255,255,255,0.07)" : "none",
          }}>
            <span style={{ display: "block", fontSize: 22, fontWeight: 700, color: "#ffd580" }}>{s.number}</span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.07em" }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Destinations ── */}
      <section style={{ padding: "5rem 1rem", background: "#0a0f1e" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "2.5rem", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ffd580", marginBottom: 6 }}>
                Explore
              </p>
              <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "#fff" }}>
                Popular Destinations
              </h2>
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", paddingBottom: 4 }}>
              Showing {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, destinations.length)} of {destinations.length}
            </span>
          </div>

          {destinations.length === 0 ? (
            <p style={{ color: "rgba(255,255,255,0.3)", textAlign: "center", padding: "3rem 0" }}>No destinations found</p>
          ) : (
            <>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 16,
              }}>
                {paginated.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleDestinationClick(d.name)}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "0.5px solid rgba(255,255,255,0.09)",
                      borderRadius: 14,
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "transform 0.2s, border-color 0.2s, background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.borderColor = "rgba(255,213,128,0.3)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    }}
                  >
                    {/* Image area */}
                    <div style={{
                      width: "100%", height: 140,
                      background: "linear-gradient(135deg, #1a2236 0%, #0d1526 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      position: "relative", overflow: "hidden",
                    }}>
                      {d.image ? (
                        <img
                          src={d.image}
                          alt={d.name}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
                        />
                      ) : (
                        <MapPin size={32} style={{ color: "rgba(255,255,255,0.1)" }} />
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: "14px 16px 16px" }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 5 }}>{d.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 5 }}>
                        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ffd580", opacity: 0.6, flexShrink: 0 }} />
                        {d.location}
                      </div>
                      {d.description && (
                        <p style={{
                          fontSize: 12, color: "rgba(255,255,255,0.3)",
                          marginTop: 8, lineHeight: 1.5,
                          display: "-webkit-box", WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical", overflow: "hidden",
                        }}>
                          {d.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: "2.5rem" }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    style={paginationBtnStyle(false)}
                  >
                    ← Prev
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      style={paginationBtnStyle(page === currentPage)}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    style={paginationBtnStyle(false)}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{
        padding: "5rem 1rem",
        background: "rgba(255,255,255,0.015)",
        borderTop: "0.5px solid rgba(255,255,255,0.07)",
        borderBottom: "0.5px solid rgba(255,255,255,0.07)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: "2.5rem" }}>
            <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ffd580", marginBottom: 8 }}>
              Why Travel Sathi?
            </p>
            <h2 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 600, color: "#fff" }}>
              Your journey,{" "}
              <em style={{ color: "#ffd580", fontStyle: "italic" }}>elevated</em>
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {FEATURES.map(({ icon, title, desc, tag }) => (
              <div
                key={title}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "0.5px solid rgba(255,255,255,0.08)",
                  borderRadius: 16,
                  padding: 28,
                  transition: "border-color 0.25s, transform 0.25s, background 0.25s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,213,128,0.28)";
                  e.currentTarget.style.background = "rgba(255,213,128,0.03)";
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: "rgba(255,213,128,0.1)",
                  border: "0.5px solid rgba(255,213,128,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#ffd580",
                  marginBottom: 18,
                }}>
                  {icon}
                </div>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#ffd580", opacity: 0.7, marginBottom: 6 }}>
                  {tag}
                </p>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
        @keyframes scrollBounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(8px); }
        }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.3); }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,213,128,0.25); border-radius: 4px; }
      `}</style>
    </div>
  );
}

function paginationBtnStyle(isActive) {
  return {
    background: isActive ? "#ffd580" : "rgba(255,255,255,0.05)",
    border: isActive ? "0.5px solid #ffd580" : "0.5px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    color: isActive ? "#0a0f1e" : "rgba(255,255,255,0.6)",
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: isActive ? 700 : 400,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "all 0.2s",
  };
}