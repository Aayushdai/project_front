import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import logo from "../assets/content.png";

function NavbarComponent() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get user from localStorage
  const [user] = useState(() => {
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
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <style>{`
        .nav-root { font-family: 'Poppins', sans-serif; }

        .brand-text {
          font-weight: 700;
          font-size: 1.1rem;
          color: #fff;
        }
        .brand-text span { color: #1976D2; }

        .nav-link-custom {
          color: rgba(255,255,255,0.8) !important;
          font-size: 0.9rem;
          transition: 0.2s;
        }
        .nav-link-custom:hover {
          color: #fff !important;
        }

        .avatar-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #1976D2;
          border: none;
          color: white;
          font-weight: bold;
          cursor: pointer;
        }

        .profile-dropdown {
          position: absolute;
          right: 0;
          top: 50px;
          background: #111;
          border-radius: 10px;
          padding: 10px;
          width: 200px;
          color: white;
        }

        .profile-menu-item {
          display: block;
          padding: 8px;
          cursor: pointer;
          color: white;
          text-decoration: none;
        }
        .profile-menu-item:hover {
          background: #222;
        }
      `}</style>

      <Navbar
        expand="lg"
        sticky="top"
        className="nav-root"
        style={{
          background: "rgba(10,12,22,0.8)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Container>
          {/* Logo */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <img src={logo} alt="logo" style={{ height: "40px" }} />
            <span className="brand-text">Travel <span>Sathi</span></span>
          </Navbar.Brand>

          <Navbar.Toggle />
          <Navbar.Collapse>

            {/* Center Links */}
            <Nav className="mx-auto gap-3">
              <Nav.Link as={Link} to="/home" className="nav-link-custom">Home</Nav.Link>
              <Nav.Link as={Link} to="/explore" className="nav-link-custom">Explore</Nav.Link>
              <Nav.Link as={Link} to="/dashboard" className="nav-link-custom">Dashboard</Nav.Link>

              <NavDropdown title="More" menuVariant="dark">
                <NavDropdown.Item>Blog</NavDropdown.Item>
                <NavDropdown.Item>About</NavDropdown.Item>
              </NavDropdown>
            </Nav>

            {/* Profile */}
            <Nav>
              <div ref={dropdownRef} style={{ position: "relative" }}>
                <button
                  className="avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {user?.first_name?.[0] || "U"}
                </button>

                {dropdownOpen && (
                  <div className="profile-dropdown">
                    <div style={{ padding: "5px" }}>
                      <strong>{user?.first_name || "Guest"}</strong>
                      <div style={{ fontSize: "12px" }}>{user?.email}</div>
                    </div>

                    <Link to="/profile" className="profile-menu-item">
                      Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="profile-menu-item"
                      style={{ border: "none", background: "none" }}
                    >
                      Logout
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

export default NavbarComponent;