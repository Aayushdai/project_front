import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const destinations = [
  {
    image: "/mountain.png",
    city: "Mustang",
    country: "Nepal",
    tagline: "Where the sky meets the peaks",
  },
  {
    image: "pokhara.png",
    city: "Pokhara",
    country: "Nepal",
    tagline: "A Place untouched by time",
  },
  {
    image: "Taplejung.png",
    city: "Taplejung",
    country: "Nepal",
    tagline: "Where the Beauty falls from the sky",
  },
  {
    image: "walkingman.png",
    city: "Kathmandu",
    country: "Nepal",
    tagline: "Life is beautiful here",
  },
];

export default function Register() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % destinations.length);
        setTransitioning(false);
      }, 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/users/api/register",
        form,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res.data.success) {
        setMessage("Registered successfully");
        setTimeout(() => navigate("/"), 1000);
      } else {
        setError(res.data.message || "Registration failed.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to connect. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Poppins:wght@300;400;500;600&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .reg-root {
          font-family: 'Poppins', sans-serif;
          min-height: 100vh;
          display: flex;
          overflow: hidden;
          background: #0a0a0a;
        }

        /* ── Left Slideshow (identical to Login) ── */
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
          opacity: 0;
        }
        .slide.active {
          opacity: 1;
          animation: kenBurns 8s ease forwards;
        }
        @keyframes kenBurns {
          from { transform: scale(1.06); }
          to   { transform: scale(1.0); }
        }

        .left-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.35) 50%, rgba(0,0,0,0.7) 100%);
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
        .brand-logo span { font-style: italic; font-weight: 400; color: #f0c27a; }

        .destination-info { animation: fadeUpIn 1.2s ease; }
        @keyframes fadeUpIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
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

        .dots { display: flex; gap: 8px; margin-top: 32px; }
        .dot {
          width: 28px; height: 2px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          transition: background 0.4s, width 0.4s;
          cursor: pointer;
        }
        .dot.active { background: #f0c27a; width: 48px; }

        /* ── Right Panel ── */
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
          top: -120px; right: -120px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(240,194,122,0.07) 0%, transparent 70%);
          pointer-events: none;
        }
        .right-panel::after {
          content: '';
          position: absolute;
          bottom: -80px; left: -80px;
          width: 280px; height: 280px;
          background: radial-gradient(circle, rgba(240,194,122,0.05) 0%, transparent 70%);
          pointer-events: none;
        }

        .reg-eyebrow {
          font-size: 11px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #f0c27a;
          font-weight: 500;
          margin-bottom: 16px;
        }

        .reg-heading {
          font-family: 'Montserrat', sans-serif;
          font-size: 42px;
          font-weight: 300;
          color: #f5f0e8;
          line-height: 1.05;
          margin-bottom: 8px;
        }
        .reg-heading em { font-style: italic; color: #f0c27a; }

        .reg-subheading {
          font-size: 13px;
          color: rgba(255,255,255,0.38);
          font-weight: 300;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        /* ── Fields ── */
        .field-group { margin-bottom: 14px; }

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
        .field-label.focused { color: #f0c27a; }

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
        .field-input.error-field { border-color: rgba(255,90,90,0.5); }

        /* ── Error Banner ── */
        .error-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255,80,80,0.08);
          border: 1px solid rgba(255,80,80,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
          animation: shakeIn 0.35s ease;
        }
        @keyframes shakeIn {
          0%   { transform: translateX(-6px); opacity: 0; }
          40%  { transform: translateX(4px); }
          70%  { transform: translateX(-2px); }
          100% { transform: translateX(0); opacity: 1; }
        }
        .error-icon {
          flex-shrink: 0;
          width: 18px; height: 18px;
          background: rgba(255,80,80,0.7);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: #fff; font-weight: 700;
        }
        .error-text {
          font-size: 12.5px;
          color: rgba(255,140,140,0.9);
          font-weight: 400;
          line-height: 1.4;
        }

        /* ── Success Banner ── */
        .success-banner {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(80,200,120,0.08);
          border: 1px solid rgba(80,200,120,0.25);
          border-radius: 10px;
          padding: 12px 14px;
          margin-bottom: 18px;
          animation: shakeIn 0.35s ease;
        }
        .success-icon {
          flex-shrink: 0;
          width: 18px; height: 18px;
          background: rgba(80,200,120,0.7);
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 11px; color: #fff; font-weight: 700;
        }
        .success-text {
          font-size: 12.5px;
          color: rgba(140,255,180,0.9);
          font-weight: 400;
          line-height: 1.4;
        }

        /* ── Submit Button ── */
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
          transition: background-position 0.4s ease, transform 0.15s, opacity 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-top: 8px;
        }
        .submit-btn:hover:not(:disabled) { background-position: left; transform: translateY(-1px); }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }

        .spinner {
          width: 14px; height: 14px;
          border: 2px solid rgba(15,14,13,0.3);
          border-top-color: #0f0e0d;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Footer ── */
        .login-row {
          text-align: center;
          margin-top: 24px;
          font-size: 13px;
          color: rgba(255,255,255,0.3);
        }
        .login-row a {
          color: #f0c27a;
          text-decoration: none;
          font-weight: 500;
          margin-left: 4px;
        }
        .login-row a:hover { text-decoration: underline; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
          .reg-root { flex-direction: column; }
          .left-panel { height: 42vh; flex: none; }
          .right-panel { width: 100%; padding: 36px 28px; }
          .destination-city { font-size: 48px; }
          .reg-heading { font-size: 34px; }
        }
      `}</style>

      <div className="reg-root">
        {/* ─── Left: Cinematic Slideshow ─── */}
        <div className="left-panel">
          {destinations.map((d, i) => (
            <div
              key={i}
              className={`slide ${i === current ? "active" : ""}`}
              style={{ backgroundImage: `url('${d.image}')` }}
            />
          ))}
          <div className="left-overlay" />
          <div className="left-content">
            <div className="brand-logo">Travel<span>·</span>Companion</div>
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

        {/* ─── Right: Register Form ─── */}
        <div className="right-panel">
          <div className="reg-eyebrow">Start your journey</div>
          <div className="reg-heading">Create your<br /><em>account</em><br />today.</div>
          <div className="reg-subheading">
            Join thousands of travellers discovering the world's most breathtaking destinations.
          </div>

          <form onSubmit={handleSubmit}>
            {error && (
              <div className="error-banner">
                <div className="error-icon">!</div>
                <div className="error-text">{error}</div>
              </div>
            )}
            {message && (
              <div className="success-banner">
                <div className="success-icon">✓</div>
                <div className="success-text">{message}</div>
              </div>
            )}

            <div className="field-group">
              <label className={`field-label ${focused === "username" ? "focused" : ""}`}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                onFocus={() => setFocused("username")}
                onBlur={() => setFocused(null)}
                placeholder="your_username"
                className={`field-input ${error ? "error-field" : ""}`}
                required
              />
            </div>

            <div className="field-group">
              <label className={`field-label ${focused === "email" ? "focused" : ""}`}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onFocus={() => setFocused("email")}
                onBlur={() => setFocused(null)}
                placeholder="you@example.com"
                className={`field-input ${error ? "error-field" : ""}`}
                required
              />
            </div>

            <div className="field-group">
              <label className={`field-label ${focused === "password" ? "focused" : ""}`}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")}
                onBlur={() => setFocused(null)}
                placeholder="Create a strong password"
                className={`field-input ${error ? "error-field" : ""}`}
                required
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="login-row">
            Already have an account?<a href="/">Sign in</a>
          </div>
        </div>
      </div>
    </>
  );
}