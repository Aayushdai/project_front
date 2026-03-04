import React, { useEffect, useRef, useState } from "react";
import { MapPin, Users, Compass, Heart, Globe, Zap } from "lucide-react";

// Simple hook to detect when element enters viewport
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

const team = [
  {
    name: "Aarav Sharma",
    role: "Full Stack Developer",
    bio: "Passionate about building scalable travel tech. Loves trekking in the Himalayas on weekends.",
    avatar: "AS",
    color: "#ffd580",
    bg: "#1a1400",
  },
  {
    name: "Priya Thapa",
    role: "UI/UX Designer",
    bio: "Crafts beautiful, intuitive interfaces. Believes great design is invisible — it just feels right.",
    avatar: "PT",
    color: "#86efac",
    bg: "#021a0a",
  },
  {
    name: "Bikash Rai",
    role: "Backend & Systems",
    bio: "Keeps everything running behind the scenes. Travel enthusiast who has visited 14 of Nepal's districts.",
    avatar: "BR",
    color: "#93c5fd",
    bg: "#020d1a",
  },
];

const milestones = [
  { year: "2023", label: "Idea Born", desc: "Three friends frustrated by solo travel met at a Pokhara hostel." },
  { year: "2024", label: "MVP Launch", desc: "First version shipped with matching and basic trip planning." },
  { year: "2025", label: "Community Grows", desc: "12,000+ verified travelers. 340+ destinations covered." },
  { year: "Now", label: "You're Here", desc: "Join the movement. Find your adventure partner today." },
];

const values = [
  { icon: <Globe size={22} />, title: "Community First", desc: "Every feature is built around real traveler needs, not vanity metrics." },
  { icon: <Heart size={22} />, title: "Authentic Connections", desc: "We believe the best journeys start with genuine human bonds." },
  { icon: <Zap size={22} />, title: "Move Fast", desc: "We ship, iterate, and improve — driven by our community's feedback." },
  { icon: <Compass size={22} />, title: "Explore Boldly", desc: "We encourage stepping outside comfort zones, on the road and in life." },
];

function FadeIn({ children, delay = 0, style = {} }) {
  const [ref, inView] = useInView();
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default function About() {
  return (
    <div style={{ fontFamily: "'Georgia', serif", background: "#080c14", color: "#fff", overflowX: "hidden" }}>

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "8rem 1.5rem 5rem",
        overflow: "hidden",
      }}>
        {/* Animated background orbs */}
        <div style={{
          position: "absolute", top: "10%", left: "15%",
          width: "420px", height: "420px",
          background: "radial-gradient(circle, rgba(255,213,128,0.12) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float1 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%",
          width: "300px", height: "300px",
          background: "radial-gradient(circle, rgba(147,197,253,0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float2 10s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "20%",
          width: "200px", height: "200px",
          background: "radial-gradient(circle, rgba(134,239,172,0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          animation: "float1 12s ease-in-out infinite reverse",
        }} />

        {/* Grid texture overlay */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "780px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,213,128,0.1)",
            border: "1px solid rgba(255,213,128,0.25)",
            borderRadius: "100px",
            padding: "6px 18px",
            color: "#ffd580",
            fontSize: "0.75rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 700,
            marginBottom: "2rem",
          }}>
            <MapPin size={12} /> Kathmandu, Nepal
          </div>

          <h1 style={{
            fontSize: "clamp(2.8rem, 7vw, 5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: "1.5rem",
          }}>
            We believe travel<br />
            is <em style={{ color: "#ffd580", fontStyle: "italic" }}>better together</em>
          </h1>

          <p style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: "1.15rem",
            lineHeight: 1.8,
            fontFamily: "system-ui, sans-serif",
            fontWeight: 300,
            maxWidth: "580px",
            margin: "0 auto 3rem",
          }}>
            Travel Sathi was born from a simple frustration — finding like-minded travel companions shouldn't be hard. 
            We built the platform we wished existed.
          </p>

          {/* Stat pills */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1rem" }}>
            {[["12K+", "Travelers"], ["340+", "Destinations"], ["3", "Founders"], ["2023", "Founded"]].map(([num, label]) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "16px",
                padding: "14px 24px",
                textAlign: "center",
              }}>
                <div style={{ color: "#ffd580", fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>{num}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.72rem", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif", marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ padding: "6rem 1.5rem", maxWidth: "1100px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "4rem",
            alignItems: "center",
          }}>
            <div>
              <p style={{ color: "#ffd580", fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: "1rem" }}>Our Story</p>
              <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2, marginBottom: "1.5rem" }}>
                From a hostel conversation<br />to a thriving platform
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.9, fontFamily: "system-ui, sans-serif", fontWeight: 300, fontSize: "1rem", marginBottom: "1.2rem" }}>
                In 2023, three college friends — Aarav, Priya, and Bikash — sat on the rooftop of a Pokhara hostel 
                watching the Annapurna range at dusk. They'd all tried to find travel buddies through Facebook groups, 
                WhatsApp blasts, and word-of-mouth. All three had failed.
              </p>
              <p style={{ color: "rgba(255,255,255,0.55)", lineHeight: 1.9, fontFamily: "system-ui, sans-serif", fontWeight: 300, fontSize: "1rem" }}>
                That night, they decided to build something better. A platform that actually understands <em style={{ color: "rgba(255,255,255,0.8)" }}>how</em> you 
                travel — not just where you're going. Travel Sathi was born.
              </p>
            </div>

            {/* Quote card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(255,213,128,0.08), rgba(255,213,128,0.02))",
              border: "1px solid rgba(255,213,128,0.2)",
              borderRadius: "24px",
              padding: "2.5rem",
            }}>
              <div style={{ fontSize: "4rem", color: "#ffd580", lineHeight: 1, marginBottom: "1rem", fontFamily: "Georgia, serif" }}>"</div>
              <p style={{ color: "rgba(255,255,255,0.8)", fontSize: "1.15rem", lineHeight: 1.7, fontStyle: "italic", marginBottom: "1.5rem" }}>
                The best travel memories aren't about the places — they're about the people you shared them with.
                We wanted to make finding those people effortless.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px",
                  background: "rgba(255,213,128,0.2)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#ffd580", fontWeight: 700, fontSize: "0.85rem",
                  fontFamily: "system-ui, sans-serif",
                }}>AS</div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: "0.9rem", fontFamily: "system-ui, sans-serif" }}>Aarav Sharma</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", fontFamily: "system-ui, sans-serif" }}>Co-founder & CTO</div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ padding: "5rem 1.5rem", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: "#ffd580", fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.8rem", textAlign: "center" }}>Milestones</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em", marginBottom: "4rem" }}>How we got here</h2>
          </FadeIn>

          <div style={{ position: "relative" }}>
            {/* vertical line */}
            <div style={{
              position: "absolute",
              left: "50%",
              top: 0, bottom: 0,
              width: "1px",
              background: "rgba(255,213,128,0.2)",
              transform: "translateX(-50%)",
            }} />

            {milestones.map((m, i) => (
              <FadeIn key={m.year} delay={i * 0.15}>
                <div style={{
                  display: "flex",
                  justifyContent: i % 2 === 0 ? "flex-end" : "flex-start",
                  paddingRight: i % 2 === 0 ? "calc(50% + 2rem)" : 0,
                  paddingLeft: i % 2 === 0 ? 0 : "calc(50% + 2rem)",
                  marginBottom: "3rem",
                  position: "relative",
                }}>
                  {/* dot */}
                  <div style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "14px", height: "14px",
                    background: "#ffd580",
                    borderRadius: "50%",
                    boxShadow: "0 0 20px rgba(255,213,128,0.5)",
                    zIndex: 2,
                  }} />
                  <div style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "16px",
                    padding: "1.5rem 1.8rem",
                    maxWidth: "340px",
                    textAlign: i % 2 === 0 ? "right" : "left",
                  }}>
                    <div style={{ color: "#ffd580", fontWeight: 700, fontSize: "1.3rem", fontFamily: "system-ui, sans-serif", letterSpacing: "-0.02em" }}>{m.year}</div>
                    <div style={{ color: "#fff", fontWeight: 600, marginBottom: "0.4rem", fontSize: "1rem" }}>{m.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.88rem", lineHeight: 1.6, fontFamily: "system-ui, sans-serif", fontWeight: 300 }}>{m.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: "6rem 1.5rem" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: "#ffd580", fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.8rem", textAlign: "center" }}>The People Behind It</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em", marginBottom: "1rem" }}>Meet the team</h2>
            <p style={{ color: "rgba(255,255,255,0.4)", textAlign: "center", fontFamily: "system-ui, sans-serif", fontSize: "0.95rem", marginBottom: "3.5rem", fontWeight: 300 }}>
              Three builders. One mission. Infinite adventures ahead.
            </p>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
          }}>
            {team.map((member, i) => (
              <FadeIn key={member.name} delay={i * 0.15}>
                <div
                  style={{
                    background: member.bg,
                    border: `1px solid ${member.color}22`,
                    borderRadius: "24px",
                    padding: "2.5rem 2rem",
                    textAlign: "center",
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow = `0 24px 60px ${member.color}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: "80px", height: "80px",
                    background: `${member.color}22`,
                    border: `2px solid ${member.color}55`,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    color: member.color,
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    fontFamily: "system-ui, sans-serif",
                    letterSpacing: "0.05em",
                  }}>
                    {member.avatar}
                  </div>

                  <h3 style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "0.3rem" }}>{member.name}</h3>
                  <div style={{
                    display: "inline-block",
                    background: `${member.color}18`,
                    color: member.color,
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    padding: "4px 12px",
                    borderRadius: "100px",
                    marginBottom: "1.2rem",
                    fontFamily: "system-ui, sans-serif",
                  }}>{member.role}</div>
                  <p style={{
                    color: "rgba(255,255,255,0.45)",
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                    fontFamily: "system-ui, sans-serif",
                    fontWeight: 300,
                  }}>{member.bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: "5rem 1.5rem", background: "rgba(255,255,255,0.02)" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: "#ffd580", fontFamily: "system-ui, sans-serif", fontSize: "0.78rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, marginBottom: "0.8rem", textAlign: "center" }}>What Drives Us</p>
            <h2 style={{ fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em", marginBottom: "3.5rem" }}>Our values</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.2rem" }}>
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.1}>
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  borderRadius: "18px",
                  padding: "1.8rem 1.5rem",
                  transition: "border-color 0.3s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(255,213,128,0.3)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}
                >
                  <div style={{ color: "#ffd580", marginBottom: "1rem" }}>{v.icon}</div>
                  <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: "0.5rem", fontSize: "1rem" }}>{v.title}</h4>
                  <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", lineHeight: 1.6, fontFamily: "system-ui, sans-serif", fontWeight: 300 }}>{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <FadeIn>
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: "linear-gradient(135deg, rgba(255,213,128,0.08), rgba(249,115,22,0.06))",
            border: "1px solid rgba(255,213,128,0.2)",
            borderRadius: "28px",
            padding: "3.5rem 2rem",
          }}>
            <h2 style={{ fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "1rem" }}>
              Ready to find your Sathi?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontFamily: "system-ui, sans-serif", fontSize: "0.95rem", lineHeight: 1.7, fontWeight: 300, marginBottom: "2rem" }}>
              Join thousands of travelers who have already found their adventure companions.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{
                background: "linear-gradient(135deg, #f97316, #ea580c)",
                color: "#fff",
                border: "none",
                borderRadius: "100px",
                padding: "13px 32px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
                boxShadow: "0 8px 30px rgba(249,115,22,0.35)",
              }}>
                Join for Free →
              </button>
              <button style={{
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: "100px",
                padding: "13px 32px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "system-ui, sans-serif",
              }}>
                Explore the Map
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

      <style>{`
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}