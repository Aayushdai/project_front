import { Search, MapPin, Users, Shield, ArrowDown, Star } from "lucide-react";
import bg from "../assets/bg.png";
export default function Home() {
  return (
    <div style={{ fontFamily: "'Georgia', serif", color: "#1a1a2e", background: "#f8f6f1" }}>

      {/* ── HERO ── */}
      <section
        style={{
          position: "relative",
          height: "100vh",
          marginTop: "-70px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Background */}
        <div
          style={{
  position: "absolute",
  inset: 0,
  backgroundImage: `url(${bg})`,
  backgroundSize: "cover",
  backgroundPosition: "center 30%",
}}
        />

        {/* Dark gradient so text pops */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.45) 50%, rgba(10,15,30,0.92) 100%)",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "0 1.5rem", maxWidth: "760px" }}>

          

          <h1 style={{
            fontSize: "clamp(2.4rem, 6vw, 4.2rem)",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.15,
            marginBottom: "1.2rem",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
            letterSpacing: "-0.02em",
          }}>
            Find Your Partner<br />
            <span style={{ color: "#ffd580" }}>for the Adventure</span>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: "1.1rem",
            marginBottom: "2.5rem",
            lineHeight: 1.7,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 300,
          }}>
            Connect with like-minded travelers, plan trips together,<br />
            and explore the world — one journey at a time.
          </p>

          {/* Search Bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(12px)",
            borderRadius: "100px",
            padding: "8px 8px 8px 24px",
            maxWidth: "560px",
            margin: "0 auto",
            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            gap: "12px",
          }}>
            <Search size={18} color="#9ca3af" style={{ flexShrink: 0 }} />
            <input
              placeholder="Search destination, people, or trips…"
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "0.95rem",
                color: "#374151",
                background: "transparent",
                fontFamily: "system-ui, sans-serif",
              }}
            />
            <button style={{
              background: "linear-gradient(135deg, #f97316, #ea580c)",
              color: "#fff",
              border: "none",
              borderRadius: "100px",
              padding: "10px 28px",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "system-ui, sans-serif",
              whiteSpace: "nowrap",
              boxShadow: "0 4px 15px rgba(249,115,22,0.4)",
            }}>
              Explore →
            </button>
          </div>

          {/* Stats row */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: "2.5rem",
            marginTop: "2.5rem",
            fontFamily: "system-ui, sans-serif",
          }}>
            {[["12K+", "Travelers"], ["340+", "Destinations"], ["4.9★", "Rating"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ color: "#ffd580", fontWeight: 700, fontSize: "1.2rem" }}>{num}</div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          color: "rgba(255,255,255,0.4)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          fontFamily: "system-ui, sans-serif",
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          animation: "bounce 2s infinite",
        }}>
          <span>Scroll</span>
          <ArrowDown size={14} />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        background: "linear-gradient(180deg, #0a0f1e 0%, #111827 100%)",
        padding: "6rem 1.5rem",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>

          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <p style={{
              color: "#ffd580",
              fontFamily: "system-ui, sans-serif",
              fontSize: "0.8rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 600,
              marginBottom: "0.8rem",
            }}>Why Travel Sathi?</p>
            <h2 style={{
              color: "#ffffff",
              fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}>
              Your journey, <em style={{ color: "#ffd580", fontStyle: "italic" }}>elevated</em>
            </h2>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
            {[
              {
                icon: <Users size={28} color="#ffd580" />,
                title: "Smart Matching",
                desc: "Our algorithm connects you with travelers who share your pace, interests, and adventure style — not just your destination.",
                tag: "AI-Powered",
              },
              {
                icon: <MapPin size={28} color="#ffd580" />,
                title: "Trip Planning",
                desc: "Collaboratively build itineraries, split costs, and keep everyone on the same page with real-time shared planning tools.",
                tag: "Collaborative",
              },
              {
                icon: <Shield size={28} color="#ffd580" />,
                title: "Safe & Verified",
                desc: "Every member is verified. Community reviews, trust scores, and 24/7 support keep you safe on every adventure.",
                tag: "Trusted",
              },
            ].map(({ icon, title, desc, tag }) => (
              <div
                key={title}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "20px",
                  padding: "2.5rem 2rem",
                  transition: "transform 0.3s ease, border-color 0.3s ease",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.borderColor = "rgba(255,213,128,0.3)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                <div style={{
                  width: "52px", height: "52px",
                  background: "rgba(255,213,128,0.1)",
                  borderRadius: "14px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  marginBottom: "1.5rem",
                }}>
                  {icon}
                </div>
                <div style={{
                  display: "inline-block",
                  background: "rgba(255,213,128,0.15)",
                  color: "#ffd580",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: "100px",
                  marginBottom: "0.9rem",
                  fontFamily: "system-ui, sans-serif",
                }}>{tag}</div>
                <h3 style={{
                  color: "#ffffff",
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.01em",
                }}>{title}</h3>
                <p style={{
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                  fontSize: "0.92rem",
                  fontFamily: "system-ui, sans-serif",
                  fontWeight: 300,
                }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={{
        background: "linear-gradient(115deg, #a97316 0%, #ea580c 50%, #bb410c 100%)",
        padding: "5rem 1.5rem",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{
            color: "#ffffff",
            fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "1rem",
          }}>Ready for your next adventure?</h2>
          <p style={{
            color: "rgba(255,255,255,0.8)",
            fontSize: "1rem",
            marginBottom: "2rem",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 300,
            lineHeight: 1.6,
          }}>
            Join thousands of travelers already exploring the world together.
          </p>
          <button style={{
            background: "#fff",
            color: "#ea580c",
            border: "none",
            borderRadius: "100px",
            padding: "14px 40px",
            fontSize: "1rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "system-ui, sans-serif",
            boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
            letterSpacing: "-0.01em",
          }}>
            Get Started — It's Free
          </button>
        </div>
      </section>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateX(-50%) translateY(0); }
          50% { transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  );
}