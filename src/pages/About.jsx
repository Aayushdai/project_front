import React, { useEffect, useRef, useState } from "react";
import { MapPin, Globe, Heart, Zap, Compass } from "lucide-react";

// ============================================
// CONSTANTS
// ============================================
const COLORS = {
  primary: "#ffd580",
  primaryBg: "#1a1400",
  text: "#fff",
  textDim: "rgba(255,255,255,0.55)",
  textMuted: "rgba(255,255,255,0.4)",
  textLight: "rgba(255,255,255,0.45)",
  border: "rgba(255,255,255,0.1)",
  borderLight: "rgba(255,255,255,0.08)",
  accent: "#93c5fd",
  accentBg: "#020d1a",
  greenAccent: "#86efac",
  greenAccentBg: "#021a0a",
  orangeAccent: "#f97316",
};

const FONTS = {
  display: "'Montserrat', sans-serif",
  body: "'Poppins', sans-serif",
};

const SPACING = {
  xs: "1rem",
  sm: "1.5rem",
  md: "2rem",
  lg: "3rem",
  xl: "4rem",
  xxl: "5rem",
  xxxl: "6rem",
};

const THEME = {
  bg: "#080c14",
  bgLight: "rgba(255,255,255,0.02)",
  bgDarker: "rgba(255,255,255,0.03)",
};

const TYPOGRAPHY = {
  label: { fontSize: "0.78rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700 },
  section: { fontSize: "clamp(1.8rem, 4vw, 2.5rem)", fontWeight: 700, letterSpacing: "-0.02em" },
  largeSection: { fontSize: "clamp(1.8rem, 4vw, 2.6rem)", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 },
};

const TEAM_DATA = [
  {
    name: "Aayush Poudel",
    role: "Frontend Developer",
    bio: "Brings designs to life with clean, performant code. Passionate about crafting smooth user experiences that feel native and effortless.",
    avatar: "AP",
    color: "#ffd580",
    bg: "#1a1400",
  },
  {
    name: "Utsav Pandit",
    role: "Backend Developer",
    bio: "Architects the systems that power everything under the hood. Focused on reliability, speed, and building APIs that just work.",
    avatar: "UP",
    color: "#93c5fd",
    bg: "#020d1a",
  },
  {
    name: "Sandesh Parajuli",
    role: "UI Designer",
    bio: "Shapes the look and feel of Travel Sathi. Believes that great design should feel invisible — intuitive, beautiful, and purposeful.",
    avatar: "SP",
    color: "#86efac",
    bg: "#021a0a",
  },
];

const MILESTONES = [
  { year: "2023", label: "Idea Born", desc: "Three friends frustrated by solo travel met and decided to build something better." },
  { year: "2024", label: "MVP Launch", desc: "First version shipped with traveler matching and basic trip planning features." },
  { year: "2025", label: "Building Together", desc: "Growing the platform based on real traveler feedback and community needs." },
  { year: "Now", label: "You're Here", desc: "Join the movement. Find your adventure partner today." },
];

const VALUES = [
  { icon: <Globe size={22} />, title: "Community First", desc: "Every feature is built around real traveler needs, not vanity metrics." },
  { icon: <Heart size={22} />, title: "Authentic Connections", desc: "We believe the best journeys start with genuine human bonds." },
  { icon: <Zap size={22} />, title: "Move Fast", desc: "We ship, iterate, and improve — driven by our community's feedback." },
  { icon: <Compass size={22} />, title: "Explore Boldly", desc: "We encourage stepping outside comfort zones, on the road and in life." },
];

const STATS = [
  ["3", "Founders"],
  ["2023", "Founded"],
  ["Nepal", "Based In"],
];

// ============================================
// HELPER FUNCTIONS
// ============================================
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
    <div style={{ fontFamily: FONTS.body, background: THEME.bg, color: COLORS.text, overflowX: "hidden" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&family=Poppins:wght@300;400;500;600;700&display=swap');
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(20px) scale(0.95); }
        }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        position: "relative",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: `${SPACING.xxxl} ${SPACING.xs} ${SPACING.xxl}`,
        overflow: "hidden",
      }}>
        {/* Background orbs */}
        <div style={{
          position: "absolute", top: "10%", left: "15%",
          width: "420px", height: "420px",
          background: `radial-gradient(circle, ${COLORS.primary}1f 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: "float1 8s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "15%", right: "10%",
          width: "300px", height: "300px",
          background: `radial-gradient(circle, ${COLORS.accent}1a 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: "float2 10s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", top: "40%", right: "20%",
          width: "200px", height: "200px",
          background: `radial-gradient(circle, ${COLORS.greenAccent}14 0%, transparent 70%)`,
          borderRadius: "50%",
          animation: "float1 12s ease-in-out infinite reverse",
        }} />

        {/* Grid background */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />

        <div style={{ position: "relative", zIndex: 2, maxWidth: "780px" }}>
          {/* Location badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: SPACING.xs,
            background: `${COLORS.primary}1a`,
            border: `1px solid ${COLORS.primary}40`,
            borderRadius: "100px",
            padding: `${SPACING.xs} ${SPACING.md}`,
            color: COLORS.primary,
            ...TYPOGRAPHY.label,
            fontFamily: FONTS.body,
            marginBottom: SPACING.lg,
          }}>
            <MapPin size={12} /> Kathmandu, Nepal
          </div>

          <h1 style={{
            fontFamily: FONTS.display,
            fontSize: "clamp(2.8rem, 7vw, 5rem)",
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            marginBottom: SPACING.sm,
          }}>
            We believe travel<br />
            is <em style={{ color: COLORS.primary, fontStyle: "italic" }}>better together</em>
          </h1>

          <p style={{
            color: COLORS.textDim,
            fontSize: "1.15rem",
            lineHeight: 1.8,
            fontFamily: FONTS.body,
            fontWeight: 300,
            maxWidth: "580px",
            margin: `0 auto ${SPACING.lg}`,
          }}>
            Travel Sathi was born from a simple frustration — finding like-minded travel companions shouldn't be hard.
            We built the platform we wished existed.
          </p>

          {/* Stat pills */}
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: SPACING.xs }}>
            {STATS.map(([num, label]) => (
              <div key={label} style={{
                background: "rgba(255,255,255,0.05)",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "16px",
                padding: `${SPACING.xs} ${SPACING.md}`,
                textAlign: "center",
              }}>
                <div style={{ fontFamily: FONTS.display, color: COLORS.primary, fontWeight: 700, fontSize: "1.4rem", letterSpacing: "-0.02em" }}>{num}</div>
                <div style={{ color: COLORS.textMuted, ...TYPOGRAPHY.label, fontFamily: FONTS.body, marginTop: "2px" }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STORY ── */}
      <section style={{ padding: `${SPACING.xxxl} ${SPACING.xs}`, maxWidth: "1100px", margin: "0 auto" }}>
        <FadeIn>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: SPACING.xxl,
            alignItems: "center",
          }}>
            <div>
              <p style={{ color: COLORS.primary, fontFamily: FONTS.body, ...TYPOGRAPHY.label, marginBottom: SPACING.sm }}>Our Story</p>
              <h2 style={{ fontFamily: FONTS.display, ...TYPOGRAPHY.largeSection, marginBottom: SPACING.sm }}>
                From a simple idea<br />to a real platform
              </h2>
              <p style={{ color: COLORS.textDim, lineHeight: 1.9, fontFamily: FONTS.body, fontWeight: 300, fontSize: "1rem", marginBottom: SPACING.xs }}>
                In 2023, three friends — Aayush, Utsav, and Sandesh — shared the same frustration. Finding a genuine
                travel companion through Facebook groups, WhatsApp blasts, and word-of-mouth never really worked.
              </p>
              <p style={{ color: COLORS.textDim, lineHeight: 1.9, fontFamily: FONTS.body, fontWeight: 300, fontSize: "1rem" }}>
                So they decided to build something better. A platform that actually understands <em style={{ color: "rgba(255,255,255,0.8)" }}>how</em> you
                travel — not just where you're going. Travel Sathi was born.
              </p>
            </div>

            {/* Quote card */}
            <div style={{
              background: `linear-gradient(135deg, ${COLORS.primary}14, ${COLORS.primary}05)`,
              border: `1px solid ${COLORS.primary}33`,
              borderRadius: "24px",
              padding: SPACING.lg,
            }}>
              <div style={{ fontSize: "4rem", color: COLORS.primary, lineHeight: 1, marginBottom: SPACING.sm, fontFamily: FONTS.display }}>"</div>
              <p style={{ fontFamily: FONTS.display, color: "rgba(255,255,255,0.8)", fontSize: "1.15rem", lineHeight: 1.7, fontStyle: "italic", marginBottom: SPACING.sm }}>
                The best travel memories aren't about the places — they're about the people you shared them with.
                We wanted to make finding those people effortless.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{
                  width: "40px", height: "40px",
                  background: `${COLORS.primary}33`,
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: COLORS.primary, fontWeight: 700, fontSize: "0.85rem",
                  fontFamily: FONTS.body,
                }}>AP</div>
                <div>
                  <div style={{ fontFamily: FONTS.display, color: COLORS.text, fontWeight: 600, fontSize: "0.9rem" }}>Aayush Poudel</div>
                  <div style={{ color: COLORS.textMuted, fontSize: "0.75rem", fontFamily: FONTS.body }}>Co-founder & Frontend</div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ── TIMELINE ── */}
      <section style={{ padding: `${SPACING.xxl} ${SPACING.xs}`, background: THEME.bgLight }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: COLORS.primary, fontFamily: FONTS.body, ...TYPOGRAPHY.label, marginBottom: SPACING.xs, textAlign: "center" }}>Milestones</p>
            <h2 style={{ fontFamily: FONTS.display, ...TYPOGRAPHY.section, textAlign: "center", marginBottom: SPACING.xxl }}>How we got here</h2>
          </FadeIn>

          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute",
              left: "50%",
              top: 0, bottom: 0,
              width: "1px",
              background: `${COLORS.primary}33`,
              transform: "translateX(-50%)",
            }} />

            {MILESTONES.map((m, i) => (
              <FadeIn key={m.year} delay={i * 0.15}>
                <div style={{
                  display: "flex",
                  justifyContent: i % 2 === 0 ? "flex-end" : "flex-start",
                  paddingRight: i % 2 === 0 ? "calc(50% + 2rem)" : 0,
                  paddingLeft: i % 2 === 0 ? 0 : "calc(50% + 2rem)",
                  marginBottom: SPACING.lg,
                  position: "relative",
                }}>
                  <div style={{
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "14px", height: "14px",
                    background: COLORS.primary,
                    borderRadius: "50%",
                    boxShadow: `0 0 20px ${COLORS.primary}80`,
                    zIndex: 2,
                  }} />
                  <div style={{
                    background: THEME.bgDarker,
                    border: `1px solid ${COLORS.borderLight}`,
                    borderRadius: "16px",
                    padding: `${SPACING.xs} ${SPACING.md}`,
                    maxWidth: "340px",
                    textAlign: i % 2 === 0 ? "right" : "left",
                  }}>
                    <div style={{ fontFamily: FONTS.display, color: COLORS.primary, fontWeight: 700, fontSize: "1.3rem", letterSpacing: "-0.02em" }}>{m.year}</div>
                    <div style={{ fontFamily: FONTS.display, color: COLORS.text, fontWeight: 600, marginBottom: "0.4rem", fontSize: "1rem" }}>{m.label}</div>
                    <div style={{ color: COLORS.textLight, fontSize: "0.88rem", lineHeight: 1.6, fontFamily: FONTS.body, fontWeight: 300 }}>{m.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section style={{ padding: `${SPACING.xxxl} ${SPACING.xs}` }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: COLORS.primary, fontFamily: FONTS.body, ...TYPOGRAPHY.label, marginBottom: SPACING.xs, textAlign: "center" }}>The People Behind It</p>
            <h2 style={{ fontFamily: FONTS.display, ...TYPOGRAPHY.section, textAlign: "center", marginBottom: SPACING.sm }}>Meet the team</h2>
            <p style={{ color: COLORS.textMuted, textAlign: "center", fontFamily: FONTS.body, fontSize: "0.95rem", marginBottom: SPACING.xl, fontWeight: 300 }}>
              Three builders. One mission. Infinite adventures ahead.
            </p>
          </FadeIn>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: SPACING.xs,
          }}>
            {TEAM_DATA.map((member, i) => (
              <FadeIn key={member.name} delay={i * 0.15}>
                <div
                  style={{
                    background: member.bg,
                    border: `1px solid ${member.color}22`,
                    borderRadius: "24px",
                    padding: `${SPACING.lg} ${SPACING.md}`,
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
                  <div style={{
                    width: "80px", height: "80px",
                    background: `${member.color}22`,
                    border: `2px solid ${member.color}55`,
                    borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: `0 auto ${SPACING.sm}`,
                    color: member.color,
                    fontWeight: 700,
                    fontSize: "1.4rem",
                    fontFamily: FONTS.display,
                    letterSpacing: "0.05em",
                  }}>
                    {member.avatar}
                  </div>

                  <h3 style={{ fontFamily: FONTS.display, color: COLORS.text, fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "0.3rem" }}>{member.name}</h3>
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
                    marginBottom: SPACING.xs,
                    fontFamily: FONTS.body,
                  }}>{member.role}</div>
                  <p style={{
                    color: COLORS.textLight,
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                    fontFamily: FONTS.body,
                    fontWeight: 300,
                  }}>{member.bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section style={{ padding: `${SPACING.xxl} ${SPACING.xs}`, background: THEME.bgLight }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: COLORS.primary, fontFamily: FONTS.body, ...TYPOGRAPHY.label, marginBottom: SPACING.xs, textAlign: "center" }}>What Drives Us</p>
            <h2 style={{ fontFamily: FONTS.display, ...TYPOGRAPHY.section, textAlign: "center", marginBottom: SPACING.xl }}>Our values</h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: SPACING.xs }}>
            {VALUES.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.1}>
                <div style={{
                  background: THEME.bgDarker,
                  border: `1px solid ${COLORS.borderLight}`,
                  borderRadius: "18px",
                  padding: `${SPACING.md} ${SPACING.xs}`,
                  transition: "border-color 0.3s",
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = `${COLORS.primary}4d`}
                  onMouseLeave={e => e.currentTarget.style.borderColor = COLORS.borderLight}
                >
                  <div style={{ color: COLORS.primary, marginBottom: SPACING.sm }}>{v.icon}</div>
                  <h4 style={{ fontFamily: FONTS.display, color: COLORS.text, fontWeight: 600, marginBottom: SPACING.xs, fontSize: "1rem" }}>{v.title}</h4>
                  <p style={{ color: COLORS.textMuted, fontSize: "0.85rem", lineHeight: 1.6, fontFamily: FONTS.body, fontWeight: 300 }}>{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: `${SPACING.xxxl} ${SPACING.xs}`, textAlign: "center" }}>
        <FadeIn>
          <div style={{
            maxWidth: "600px",
            margin: "0 auto",
            background: `linear-gradient(135deg, ${COLORS.primary}14, ${COLORS.orangeAccent}0f)`,
            border: `1px solid ${COLORS.primary}33`,
            borderRadius: "28px",
            padding: `${SPACING.xl} ${SPACING.md}`,
          }}>
            <h2 style={{ fontFamily: FONTS.display, fontSize: "clamp(1.6rem, 4vw, 2.2rem)", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: SPACING.sm }}>
              Ready to find your Sathi?
            </h2>
            <p style={{ color: COLORS.textDim, fontFamily: FONTS.body, fontSize: "0.95rem", lineHeight: 1.7, fontWeight: 300, marginBottom: SPACING.lg }}>
              Join travelers who are finding their adventure companions through Travel Sathi.
            </p>
            <div style={{ display: "flex", gap: SPACING.xs, justifyContent: "center", flexWrap: "wrap" }}>
              <button style={{
                background: `linear-gradient(135deg, ${COLORS.orangeAccent}, #ea580c)`,
                color: COLORS.text,
                border: "none",
                borderRadius: "100px",
                padding: "13px 32px",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: FONTS.body,
                boxShadow: `0 8px 30px ${COLORS.orangeAccent}59`,
              }}>
                Join for Free →
              </button>
              <button style={{
                background: "transparent",
                color: "rgba(255,255,255,0.7)",
                border: `1px solid ${COLORS.border}`,
                borderRadius: "100px",
                padding: "13px 32px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: FONTS.body,
              }}>
                Explore the Map
              </button>
            </div>
          </div>
        </FadeIn>
      </section>

    </div>
  );
}