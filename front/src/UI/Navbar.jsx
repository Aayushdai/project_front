import { useState, useRef, useEffect } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import logo from "../assets/content.png";

function BasicExample() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // ✅ Read user from localStorage (no API call needed)
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user"); // ✅ clear user too
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Poppins:wght@300;400;500;600&display=swap');

        .nav-root { font-family: 'Poppins', sans-serif; }

        .brand-text {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 1.15rem;
          color: #ffffff;
          letter-spacing: -0.01em;
        }
        .brand-text .sathi { color: #1976D2; }

        .nav-link-custom {
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 0.88rem;
          color: rgba(255,255,255,0.82) !important;
          letter-spacing: 0.02em;
          transition: color 0.2s ease;
          padding: 0.4rem 0.2rem !important;
          position: relative;
        }
        .nav-link-custom::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, #1976D2, #f97316);
          border-radius: 2px;
          transition: width 0.25s ease;
        }
        .nav-link-custom:hover { color: #ffffff !important; }
        .nav-link-custom:hover::after { width: 100%; }

        .dropdown-menu-custom {
          background: rgba(15,18,30,0.97) !important;
          border: 1px solid rgba(255,255,255,0.1) !important;
          border-radius: 12px !important;
          backdrop-filter: blur(12px);
          padding: 6px !important;
          box-shadow: 0 12px 40px rgba(0,0,0,0.4) !important;
          font-family: 'Poppins', sans-serif;
        }
        .dropdown-item-custom {
          color: rgba(255,255,255,0.75) !important;
          font-size: 0.86rem !important;
          font-weight: 400 !important;
          border-radius: 8px !important;
          padding: 8px 14px !important;
          transition: background 0.2s, color 0.2s !important;
        }
        .dropdown-item-custom:hover {
          background: rgba(25,118,210,0.15) !important;
          color: #ffffff !important;
        }

        .nav-dropdown-custom > a {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 500 !important;
          font-size: 0.88rem !important;
          color: rgba(255,255,255,0.82) !important;
          letter-spacing: 0.02em !important;
        }
        .nav-dropdown-custom > a:hover { color: #ffffff !important; }

        .navbar-toggler { border-color: rgba(255,255,255,0.2) !important; }
        .navbar-toggler-icon { filter: invert(1); }

        .profile-wrapper { position: relative; }

        .avatar-btn {
          width: 38px; height: 38px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1565C0, #1976D2);
          border: 2px solid rgba(25,118,210,0.5);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Poppins', sans-serif;
          font-weight: 600;
          font-size: 14px;
          color: #fff;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.15s;
          overflow: hidden;
          padding: 0;
          outline: none;
        }
        .avatar-btn:hover {
          border-color: #1976D2;
          box-shadow: 0 0 0 3px rgba(25,118,210,0.25);
          transform: scale(1.05);
        }
        .avatar-btn img {
          width: 100%; height: 100%;
          object-fit: cover;
          border-radius: 50%;
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 12px);
          right: 0;
          width: 200px;
          background: rgba(13,16,28,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.5);
          backdrop-filter: blur(16px);
          padding: 6px;
          z-index: 9999;
          animation: dropIn 0.18s ease;
        }

        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .profile-header {
          padding: 10px 12px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 4px;
        }
        .profile-name {
          font-size: 13px;
          font-weight: 600;
          color: #fff;
          font-family: 'Poppins', sans-serif;
        }
        .profile-email {
          font-size: 11px;
          color: rgba(255,255,255,0.35);
          font-family: 'Poppins', sans-serif;
          margin-top: 1px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .profile-menu-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 13px;
          font-family: 'Poppins', sans-serif;
          font-weight: 400;
          color: rgba(255,255,255,0.72);
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
          text-decoration: none;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
        }
        .profile-menu-item:hover {
          background: rgba(25,118,210,0.15);
          color: #fff;
        }
        .profile-menu-item.logout {
          color: rgba(255,100,100,0.8);
          margin-top: 2px;
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 10px;
        }
        .profile-menu-item.logout:hover {
          background: rgba(255,80,80,0.1);
          color: #ff6b6b;
        }

        .menu-icon {
          font-size: 15px;
          width: 18px;
          text-align: center;
          opacity: 0.8;
        }
      `}</style>

      <Navbar
        expand="lg"
        sticky="top"
        className="shadow-sm nav-root"
        style={{
          minHeight: "40px",
          background: "rgba(10,12,22,0.72)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(25,118,210,0.15)",
          boxShadow: "0 2px 24px 0 rgba(0,0,0,0.18)",
        }}
      >
        <Container>
          {/* BRAND */}
          <Navbar.Brand href="/" className="d-flex align-items-center gap-2">
            <img src={logo} alt="Travel Sathi" style={{ height: "60px", width: "auto", objectFit: "contain" }} />
            <span className="brand-text">Travel <span className="sathi">Sathi</span></span>
          </Navbar.Brand>

          <Navbar.Toggle />

          <Navbar.Collapse>
            {/* CENTER LINKS */}
            <Nav className="mx-auto gap-lg-4">
              <Nav.Link className="nav-link-custom" href="/">Home</Nav.Link>
              <Nav.Link className="nav-link-custom" href="/explorer">Explore</Nav.Link>
              <Nav.Link className="nav-link-custom" href="#">Trips</Nav.Link>
              <NavDropdown title="More" className="nav-dropdown-custom" menuVariant="dark">
                <NavDropdown.Item className="dropdown-item-custom">Blog</NavDropdown.Item>
                <NavDropdown.Item className="dropdown-item-custom" href="/about">About</NavDropdown.Item>
                <NavDropdown.Item className="dropdown-item-custom">Support</NavDropdown.Item>
              </NavDropdown>
            </Nav>

            {/* PROFILE AVATAR */}
            <Nav className="align-items-center">
              <div className="profile-wrapper" ref={dropdownRef}>
                <button
                  className="avatar-btn"
                  onClick={() => setDropdownOpen((o) => !o)}
                  aria-label="Profile menu"
                >
                  {user?.profile_photo ? (
                    <img src={user.profile_photo} alt="Profile" />
                  ) : (
                    user?.first_name?.[0]?.toUpperCase() || "A"
                  )}
                </button>

                {dropdownOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-header">
                      <div className="profile-name">
                        {user ? `${user.first_name} ${user.last_name}` : "Guest"}
                      </div>
                      <div className="profile-email">{user?.email || ""}</div>
                    </div>

                    <a href="/profile" className="profile-menu-item">
                      <span className="menu-icon">👤</span> Profile
                    </a>
                    <a href="/history" className="profile-menu-item">
                      <span className="menu-icon">🕓</span> History
                    </a>
                    <button className="profile-menu-item logout" onClick={handleLogout}>
                      <span className="menu-icon">🚪</span> Logout
                    </button>
                  </div>
                )}
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default BasicExample;