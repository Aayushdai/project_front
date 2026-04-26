import React, { useEffect, useRef, useState } from "react";
import { MapPin, Globe, Heart, Zap, Compass } from "lucide-react";

// ============================================
// DATA
// ============================================
const TEAM_DATA = [
  {
    name: "Aayush Poudel",
    role: "Frontend Developer",
    bio: "Responsible for building the user interface, page layout, navigation flow, and interactive frontend components of the system.",
    avatar: "AP",
    colorClass: "gold",
  },
  {
    name: "Utsav Pandit",
    role: "Backend Developer",
    bio: "Responsible for backend logic, database connection, API development, authentication, and reliable data handling.",
    avatar: "UP",
    colorClass: "blue",
  },
  {
    name: "Sandesh Parajuli",
    role: "UI Designer",
    bio: "Responsible for designing the visual structure, user experience, page consistency, and clean presentation of the project.",
    avatar: "SP",
    colorClass: "green",
  },
];

const SYSTEM_FEATURES = [
  {
    icon: <Globe size={22} />,
    title: "Travel Destination Browsing",
    desc: "Users can explore available destinations, view destination information, and search places based on their travel interest.",
  },
  {
    icon: <Heart size={22} />,
    title: "Companion Matching Concept",
    desc: "The system helps users find suitable travel companions based on shared destinations, interests, and trip preferences.",
  },
  {
    icon: <Compass size={22} />,
    title: "Trip Planning Support",
    desc: "Users can create, view, and manage trip-related information in an organized way through the system.",
  },
  {
    icon: <Zap size={22} />,
    title: "Simple and User Friendly Interface",
    desc: "The interface is designed to be clear, easy to understand, and suitable for users who want quick access to travel features.",
  },
];

const OBJECTIVES = [
  {
    icon: <Globe size={22} />,
    title: "Solve a Real User Problem",
    desc: "The project was started to address the difficulty of finding reliable travel companions through random social media posts or informal groups.",
  },
  {
    icon: <Heart size={22} />,
    title: "Improve Travel Coordination",
    desc: "The system provides a structured way for users to connect, plan, and organize trips instead of depending on scattered communication.",
  },
  {
    icon: <Zap size={22} />,
    title: "Apply Web Development Skills",
    desc: "The project demonstrates frontend design, backend API handling, database use, authentication, and user-focused system development.",
  },
  {
    icon: <Compass size={22} />,
    title: "Create a Practical Academic Project",
    desc: "Travel Companion System was developed as a grade project to show how a real-life idea can be converted into a working software solution.",
  },
];

const STATS = [
  ["3", "Team Members"],
  ["CSIT", "Academic Project"],
  ["Nepal", "Project Context"],
];

// ============================================
// HELPER COMPONENTS
// ============================================
function useInView() {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15 }
    );

    if (ref.current) obs.observe(ref.current);

    return () => obs.disconnect();
  }, []);

  return [ref, inView];
}

function FadeIn({ children, delay = 0, className = "" }) {
  const [ref, inView] = useInView();

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(32px)",
        transition: `opacity 0.7s ease ${delay}s, transform 0.7s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

export default function About() {
  return (
    <div className="about-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400&family=Poppins:wght@300;400;500;600;700&display=swap');

        .about-page {
          --bg: #080c14;
          --section-bg: rgba(255, 255, 255, 0.02);
          --card-bg: rgba(255, 255, 255, 0.035);
          --card-bg-soft: rgba(255, 255, 255, 0.05);
          --text: #ffffff;
          --text-soft: rgba(255, 255, 255, 0.72);
          --text-muted: rgba(255, 255, 255, 0.48);
          --text-dim: rgba(255, 255, 255, 0.34);
          --border: rgba(255, 255, 255, 0.1);
          --border-soft: rgba(255, 255, 255, 0.08);
          --primary: #ffd580;
          --primary-strong: #f97316;
          --primary-bg: rgba(255, 213, 128, 0.1);
          --blue: #93c5fd;
          --blue-bg: rgba(147, 197, 253, 0.1);
          --green: #86efac;
          --green-bg: rgba(134, 239, 172, 0.1);

          min-height: 100vh;
          overflow-x: hidden;
          background: var(--bg);
          color: var(--text);
          font-family: 'Poppins', sans-serif;
        }

        [data-theme="light"] .about-page {
          --bg: #f8fafc;
          --section-bg: #ffffff;
          --card-bg: #ffffff;
          --card-bg-soft: #f8fafc;
          --text: #0f172a;
          --text-soft: #334155;
          --text-muted: #64748b;
          --text-dim: #94a3b8;
          --border: #e2e8f0;
          --border-soft: #e5e7eb;
          --primary: #ea580c;
          --primary-strong: #f97316;
          --primary-bg: #ffedd5;
          --blue: #2563eb;
          --blue-bg: #dbeafe;
          --green: #15803d;
          --green-bg: #dcfce7;
        }

        * { box-sizing: border-box; }

        .about-hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          text-align: center;
          padding: 6rem 1rem 5rem;
          background:
            radial-gradient(circle at 18% 18%, rgba(255, 213, 128, 0.12), transparent 34%),
            radial-gradient(circle at 84% 75%, rgba(147, 197, 253, 0.1), transparent 34%),
            var(--bg);
        }

        [data-theme="light"] .about-hero {
          background:
            radial-gradient(circle at 18% 18%, rgba(249, 115, 22, 0.14), transparent 34%),
            radial-gradient(circle at 84% 75%, rgba(37, 99, 235, 0.1), transparent 34%),
            linear-gradient(160deg, #fff7ed 0%, #f8fafc 52%, #eef6ff 100%);
        }

        .about-grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
        }

        [data-theme="light"] .about-grid-bg {
          background-image:
            linear-gradient(rgba(15, 23, 42, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(15, 23, 42, 0.055) 1px, transparent 1px);
        }

        .about-hero-inner {
          position: relative;
          z-index: 2;
          max-width: 820px;
        }

        .about-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.7rem;
          margin-bottom: 3rem;
          padding: 0.8rem 1.5rem;
          border: 1px solid color-mix(in srgb, var(--primary) 35%, transparent);
          border-radius: 999px;
          background: var(--primary-bg);
          color: var(--primary);
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .about-title {
          margin: 0 0 1.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(2.6rem, 7vw, 5rem);
          font-weight: 800;
          line-height: 1.08;
          letter-spacing: -0.04em;
        }

        .about-title em,
        .about-kicker,
        .about-stat-number,
        .about-card-icon,
        .about-feature-icon,
        .about-member-role,
        .about-purpose-title span {
          color: var(--primary);
        }

        .about-title em { font-style: italic; }

        .about-lead {
          max-width: 640px;
          margin: 0 auto 3rem;
          color: var(--text-soft);
          font-size: 1.08rem;
          font-weight: 300;
          line-height: 1.8;
        }

        .about-stats {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .about-stat {
          min-width: 150px;
          padding: 1rem 1.5rem;
          border: 1px solid var(--border);
          border-radius: 16px;
          background: var(--card-bg-soft);
          text-align: center;
        }

        .about-stat-number {
          display: block;
          font-family: 'Montserrat', sans-serif;
          font-size: 1.45rem;
          font-weight: 800;
        }

        .about-stat-label {
          display: block;
          margin-top: 0.2rem;
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 700;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        .about-section {
          padding: 6rem 1rem;
        }

        .about-section.alt {
          background: var(--section-bg);
          border-top: 1px solid var(--border-soft);
          border-bottom: 1px solid var(--border-soft);
        }

        .about-container {
          width: min(1100px, 100%);
          margin: 0 auto;
        }

        .about-two-col {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 5rem;
          align-items: center;
        }

        .about-kicker {
          margin: 0 0 1rem;
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
        }

        .about-heading {
          margin: 0 0 1.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: -0.03em;
        }

        .about-text {
          margin: 0 0 1rem;
          color: var(--text-soft);
          font-size: 1rem;
          font-weight: 300;
          line-height: 1.9;
        }

        .about-purpose-card {
          border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent);
          border-radius: 24px;
          background:
            linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent), transparent),
            var(--card-bg);
          padding: 2.5rem;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.14);
        }

        [data-theme="light"] .about-purpose-card {
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.08);
        }

        .about-purpose-title {
          margin: 0 0 1rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
        }

        .about-purpose-list {
          display: grid;
          gap: 0.9rem;
          margin: 1.5rem 0 0;
          padding: 0;
          list-style: none;
        }

        .about-purpose-list li {
          display: flex;
          gap: 0.8rem;
          color: var(--text-soft);
          line-height: 1.65;
          font-size: 0.95rem;
        }

        .about-purpose-list li::before {
          content: "";
          width: 8px;
          height: 8px;
          margin-top: 0.55rem;
          border-radius: 50%;
          background: var(--primary);
          flex: 0 0 auto;
        }

        .about-center { text-align: center; }

        .about-section-desc {
          max-width: 640px;
          margin: 0 auto 4rem;
          color: var(--text-muted);
          font-size: 0.98rem;
          font-weight: 300;
          line-height: 1.8;
        }

        .about-feature-grid,
        .about-objective-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1.25rem;
        }

        .about-feature-card,
        .about-objective-card {
          height: 100%;
          padding: 2rem 1.4rem;
          border: 1px solid var(--border-soft);
          border-radius: 20px;
          background: var(--card-bg);
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .about-feature-card:hover,
        .about-objective-card:hover {
          transform: translateY(-6px);
          border-color: color-mix(in srgb, var(--primary) 35%, transparent);
          box-shadow: 0 18px 45px rgba(0, 0, 0, 0.18);
        }

        [data-theme="light"] .about-feature-card:hover,
        [data-theme="light"] .about-objective-card:hover {
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.1);
        }

        .about-feature-icon,
        .about-card-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          margin-bottom: 1.25rem;
          border: 1px solid color-mix(in srgb, var(--primary) 28%, transparent);
          border-radius: 14px;
          background: var(--primary-bg);
        }

        .about-card-title {
          margin: 0 0 0.75rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem;
          font-weight: 800;
          color: var(--text);
        }

        .about-card-desc {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.88rem;
          font-weight: 300;
          line-height: 1.7;
        }

        .about-team-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(270px, 1fr));
          gap: 1.25rem;
        }

        .about-member-card {
          height: 100%;
          padding: 2.5rem 1.6rem;
          border: 1px solid var(--border-soft);
          border-radius: 24px;
          background: var(--card-bg);
          text-align: center;
          transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;
        }

        .about-member-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 22px 55px rgba(0, 0, 0, 0.16);
        }

        [data-theme="light"] .about-member-card:hover {
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.1);
        }

        .about-avatar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          border-radius: 50%;
          font-family: 'Montserrat', sans-serif;
          font-size: 1.4rem;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .about-member-card.gold .about-avatar {
          background: var(--primary-bg);
          border: 2px solid color-mix(in srgb, var(--primary) 35%, transparent);
          color: var(--primary);
        }

        .about-member-card.blue .about-avatar {
          background: var(--blue-bg);
          border: 2px solid color-mix(in srgb, var(--blue) 35%, transparent);
          color: var(--blue);
        }

        .about-member-card.green .about-avatar {
          background: var(--green-bg);
          border: 2px solid color-mix(in srgb, var(--green) 35%, transparent);
          color: var(--green);
        }

        .about-member-name {
          margin: 0 0 0.5rem;
          font-family: 'Montserrat', sans-serif;
          font-size: 1.15rem;
          font-weight: 800;
        }

        .about-member-role {
          display: inline-block;
          margin-bottom: 1.25rem;
          padding: 0.3rem 0.8rem;
          border-radius: 999px;
          background: var(--primary-bg);
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .about-member-bio {
          margin: 0;
          color: var(--text-muted);
          font-size: 0.9rem;
          font-weight: 300;
          line-height: 1.75;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.82); }
        }

        @media (max-width: 720px) {
          .about-hero {
            min-height: auto;
            padding-top: 6rem;
          }

          .about-two-col { gap: 3rem; }
          .about-section { padding: 4.5rem 1rem; }
          .about-purpose-card { padding: 1.7rem; }
          .about-stat { width: 100%; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-grid-bg" />

        <div className="about-hero-inner">
          <div className="about-badge">
            <MapPin size={12} /> Kathmandu, Nepal
          </div>

          <h1 className="about-title">
            About the<br />
            <em>Travel Companion System</em>
          </h1>

          <p className="about-lead">
            Travel Companion System is an academic web project developed to help
            users discover destinations, plan trips, and connect with suitable
            travel companions in a simple and organized way.
          </p>

          <div className="about-stats">
            {STATS.map(([num, label]) => (
              <div key={label} className="about-stat">
                <span className="about-stat-number">{num}</span>
                <span className="about-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECT BACKGROUND ── */}
      <section className="about-section">
        <div className="about-container">
          <FadeIn>
            <div className="about-two-col">
              <div>
                <p className="about-kicker">Project Background</p>
                <h2 className="about-heading">
                  Why we started this project
                </h2>

                <p className="about-text">
                  Many travelers face difficulty finding people with similar
                  destinations, budgets, schedules, and travel interests. In most
                  cases, people depend on social media posts, random groups, or
                  personal contacts, which can be unorganized and unreliable.
                </p>

                <p className="about-text">
                  This project was started to solve that problem through a
                  dedicated travel companion platform. The system provides a
                  structured way to browse destinations, manage trips, and
                  support companion matching through a clean web interface.
                </p>
              </div>

              <div className="about-purpose-card">
                <h3 className="about-purpose-title">
                  Purpose of the <span>System</span>
                </h3>

                <p className="about-text">
                  The main purpose of this project is not to present a business
                  startup plan, but to demonstrate how a practical travel-related
                  problem can be solved using software development concepts.
                </p>

                <ul className="about-purpose-list">
                  <li>Provide a simple platform for travel planning.</li>
                  <li>Help users find compatible travel companions.</li>
                  <li>Organize trip and destination information clearly.</li>
                  <li>Demonstrate frontend, backend, and database integration.</li>
                </ul>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── FEATURES OF SYSTEM ── */}
      <section className="about-section alt">
        <div className="about-container">
          <FadeIn>
            <div className="about-center">
              <p className="about-kicker">System Features</p>
              <h2 className="about-heading">Features of the Travel Companion System</h2>
              <p className="about-section-desc">
                The system focuses on practical features that support trip
                discovery, user interaction, and organized travel planning.
              </p>
            </div>
          </FadeIn>

          <div className="about-feature-grid">
            {SYSTEM_FEATURES.map((feature, i) => (
              <FadeIn key={feature.title} delay={i * 0.1}>
                <div className="about-feature-card">
                  <div className="about-feature-icon">{feature.icon}</div>
                  <h3 className="about-card-title">{feature.title}</h3>
                  <p className="about-card-desc">{feature.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      <section className="about-section">
        <div className="about-container">
          <FadeIn>
            <div className="about-center">
              <p className="about-kicker">Project Team</p>
              <h2 className="about-heading">Team members</h2>
              <p className="about-section-desc">
                The project was completed by a three-member team with separate
                responsibilities for frontend, backend, and user interface design.
              </p>
            </div>
          </FadeIn>

          <div className="about-team-grid">
            {TEAM_DATA.map((member, i) => (
              <FadeIn key={member.name} delay={i * 0.15}>
                <div className={`about-member-card ${member.colorClass}`}>
                  <div className="about-avatar">{member.avatar}</div>

                  <h3 className="about-member-name">{member.name}</h3>

                  <div className="about-member-role">{member.role}</div>

                  <p className="about-member-bio">{member.bio}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYSTEM OBJECTIVES ── */}
      <section className="about-section alt">
        <div className="about-container">
          <FadeIn>
            <div className="about-center">
              <p className="about-kicker">Project Objectives</p>
              <h2 className="about-heading">What this project demonstrates</h2>
              <p className="about-section-desc">
                The project shows both the purpose of the system and the academic
                skills applied during its development.
              </p>
            </div>
          </FadeIn>

          <div className="about-objective-grid">
            {OBJECTIVES.map((item, i) => (
              <FadeIn key={item.title} delay={i * 0.1}>
                <div className="about-objective-card">
                  <div className="about-card-icon">{item.icon}</div>
                  <h4 className="about-card-title">{item.title}</h4>
                  <p className="about-card-desc">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
