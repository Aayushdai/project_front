import { useState, useEffect } from "react";

const destinations = [
  {
    image: "https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=1600&auto=format&fit=crop",
    city: "Santorini",
    country: "Greece",
    tagline: "Where the sea meets the sky",
  },
  {
    image: "https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=1600&auto=format&fit=crop",
    city: "Kyoto",
    country: "Japan",
    tagline: "A world untouched by time",
  },
  {
    image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&auto=format&fit=crop",
    city: "Patagonia",
    country: "Argentina",
    tagline: "At the edge of the world",
  },
  {
    image: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&auto=format&fit=crop",
    city: "Amalfi",
    country: "Italy",
    tagline: "Life is beautiful here",
  },
];

export default function Login() {
  const [current, setCurrent] = useState(0);
  const [next, setNext] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [focused, setFocused] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % destinations.length);
        setNext((prev) => (prev + 1) % destinations.length);
        setTransitioning(false);
      }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }
    alert("Login Successful (Demo)");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Poppins:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .login-root {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          display: flex;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* ── Left panel: cinematic slideshow ── */
        .left-panel {
          position: relative;
          flex: 1.2;
          overflow: hidden;
        }

        .slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          transition: opacity 1.2s ease, transform 8s ease;
          transform: scale(1.06);
        }
        .slide.active {
          opacity: 1;
          animation: kenBurns 8s ease forwards;
        }
        .slide.exit {
          opacity: 0;
        }

        @keyframes kenBurns {
          from { transform: scale(1.06); }
          to { transform: scale(1.0); }
        }

        .left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            rgba(0,0,0,0.15) 0%,
            rgba(0,0,0,0.35) 50%,
            rgba(0,0,0,0.7) 100%
          );
          z-index: 2;
        }

        .left-content {
          position: absolute;
          inset: 0;
          z-index: 3;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 44px 48px;
        }

        .brand-logo {
          font-family: 'Montserrat', sans-serif;
          font-weight: 300;
          font-size: 22px;
          letter-spacing: 5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.92);
        }
        .brand-logo span {
          font-style: italic;
          font-weight: 400;
          color: #f0c27a;
        }

        .destination-info {
          animation: fadeUpIn 1.2s ease;
        }

        @keyframes fadeUpIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .destination-tagline {
          font-family: 'Poppins', sans-serif;
          font-style: italic;
          font-size: 16px;
          font-weight: 300;
          color: rgba(255,255,255,0.65);
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .destination-city {
          font-family: 'Montserrat', sans-serif;
          font-size: clamp(56px, 7vw, 86px);
          font-weight: 300;
          color: #fff;
          line-height: 0.9;
          letter-spacing: -1px;
        }
        .destination-city span {
          display: block;
          font-size: clamp(20px, 2.5vw, 28px);
          font-weight: 400;
          font-style: italic;
          color: #f0c27a;
          letter-spacing: 4px;
          text-transform: uppercase;
          margin-top: 10px;
        }

        .dots {
          display: flex;
          gap: 8px;
          margin-top: 32px;
        }

        .dot {
          width: 28px;
          height: 2px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          transition: background 0.4s, width 0.4s;
          cursor: pointer;
        }
        .dot.active {
          background: #f0c27a;
          width: 48px;
        }

        /* ── Right panel: login ── */
        .right-panel {
          width: 460px;
          flex-shrink: 0;
          background: #0f0e0d;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 60px 48px;
          position: relative;
          overflow: hidden;
        }

        .right-panel::before {
          content: '';
          position: absolute;
          top: -120px;
          right: -120px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(240,194,122,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .right-panel::after {
          content: '';
          position: absolute;
          bottom: -80px;
          left: -80px;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(240,194,122,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .login-eyebrow {
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #f0c27a;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .login-heading {
          font-family: 'Montserrat', sans-serif;
          font-size: 46px;
          font-weight: 300;
          color: #f5f0e8;
          line-height: 1.05;
          margin-bottom: 8px;
        }
        .login-heading em {
          font-style: italic;
          color: #f0c27a;
        }

        .login-subheading {
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 40px;
        }

        .divider-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .divider-line {
          flex: 1;
          height: 1px;
          background: rgba(255,255,255,0.1);
        }
        .divider-text {
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
        }

        .social-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          color: rgba(255,255,255,0.75);
          font-size: 13px;
          font-family: 'Poppins', sans-serif;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          margin-bottom: 10px;
        }
        .social-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.2);
        }
        .social-btn img {
          width: 18px;
          height: 18px;
        }

        .or-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 20px 0;
        }
        .or-line { flex: 1; height: 1px; background: rgba(255,255,255,0.08); }
        .or-text { font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: rgba(255,255,255,0.2); }

        .field-group {
          margin-bottom: 16px;
        }

        .field-label {
          display: block;
          font-size: 11px;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
          margin-bottom: 8px;
          font-weight: 500;
          transition: color 0.2s;
        }
        .field-label.focused {
          color: #f0c27a;
        }

        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 13px 16px;
          color: #f5f0e8;
          font-size: 14px;
          font-family: 'Poppins', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.18); }
        .field-input:focus {
          border-color: rgba(240,194,122,0.5);
          background: rgba(255,255,255,0.07);
        }

        .remember-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
          margin-top: 4px;
        }
        .remember-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: rgba(255,255,255,0.35);
          cursor: pointer;
        }
        .remember-label input[type="checkbox"] {
          width: 14px; height: 14px;
          accent-color: #f0c27a;
        }
        .forgot-link {
          font-size: 12px;
          color: rgba(240,194,122,0.7);
          text-decoration: none;
          transition: color 0.2s;
        }
        .forgot-link:hover { color: #f0c27a; }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #c9973a 0%, #f0c27a 50%, #c9973a 100%);
          background-size: 200% 100%;
          background-position: right;
          border: none;
          border-radius: 10px;
          color: #0f0e0d;
          font-size: 13px;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          cursor: pointer;
          transition: background-position 0.4s ease, transform 0.15s;
        }
        .submit-btn:hover {
          background-position: left;
          transform: translateY(-1px);
        }
        .submit-btn:active {
          transform: translateY(0);
        }

        .signup-row {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }
        .signup-row a {
          color: #f0c27a;
          text-decoration: none;
          font-weight: 500;
          margin-left: 4px;
        }
        .signup-row a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
          .login-root { flex-direction: column; }
          .left-panel { height: 42vh; flex: none; }
          .right-panel { width: 100%; padding: 36px 28px; }
          .destination-city { font-size: 48px; }
          .login-heading { font-size: 36px; }
        }
      `}</style>

      <div className="login-root">
        {/* ─── Left: Cinematic Slideshow ─── */}
        <div className="left-panel">
          {destinations.map((d, i) => (
            <div
              key={i}
              className={`slide ${i === current ? "active" : "exit"}`}
              style={{ backgroundImage: `url('${d.image}')` }}
            />
          ))}
          <div className="left-overlay" />
          <div className="left-content">
            <div className="brand-logo">
              Travel<span>·</span>Companion
            </div>

            <div key={current} className="destination-info">
              <div className="destination-tagline">{destinations[current].tagline}</div>
              <div className="destination-city">
                {destinations[current].city}
                <span>{destinations[current].country}</span>
              </div>
              <div className="dots">
                {destinations.map((_, i) => (
                  <div
                    key={i}
                    className={`dot ${i === current ? "active" : ""}`}
                    onClick={() => setCurrent(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Right: Login Form ─── */}
        <div className="right-panel">
          <div className="login-eyebrow">Welcome back</div>
          <div className="login-heading">
            Your next<br /><em>adventure</em><br />awaits.
          </div>
          <div className="login-subheading">
            Sign in to continue exploring the world's most beautiful destinations.
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="field-group">
              <label className={`field-label ${focused === "email" ? "focused" : ""}`}>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                className="field-input"
                required
              />
            </div>

            <div className="field-group">
              <label className={`field-label ${focused === "password" ? "focused" : ""}`}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Enter your password"
                className="field-input"
                required
              />
            </div>

            <div className="remember-row">
              <label className="remember-label">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" className="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" className="submit-btn">Sign In</button>
          </form>

          <div className="signup-row">
            New here?
            <a href="/register">Create an account</a>
          </div>
        </div>
      </div>
    </>
  );
}