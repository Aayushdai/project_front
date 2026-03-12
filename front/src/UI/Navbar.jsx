import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import logo from "../assets/content.png";

function BasicExample() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Poppins:wght@300;400;500;600&display=swap');

        .nav-root {
          font-family: 'Poppins', sans-serif;
        }

        .brand-text {
          font-family: 'Montserrat', sans-serif;
          font-weight: 700;
          font-size: 1.15rem;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .brand-text .sathi {
          color: #1976D2;
        }

        .nav-link-custom {
          font-family: 'Poppins', sans-serif;
          font-weight: 500;
          font-size: 0.88rem;
          color: rgba(255, 255, 255, 0.82) !important;
          letter-spacing: 0.02em;
          transition: color 0.2s ease;
          padding: 0.4rem 0.2rem !important;
          position: relative;
        }

        .nav-link-custom::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #1976D2, #f97316);
          border-radius: 2px;
          transition: width 0.25s ease;
        }

        .nav-link-custom:hover {
          color: #ffffff !important;
        }

        .nav-link-custom:hover::after {
          width: 100%;
        }

        .dropdown-menu-custom {
          background: rgba(15, 18, 30, 0.97) !important;
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
          background: rgba(25, 118, 210, 0.15) !important;
          color: #ffffff !important;
        }

        /* Override Bootstrap dropdown toggle color */
        .nav-dropdown-custom > a {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 500 !important;
          font-size: 0.88rem !important;
          color: rgba(255,255,255,0.82) !important;
          letter-spacing: 0.02em !important;
        }

        .nav-dropdown-custom > a:hover {
          color: #ffffff !important;
        }

        .btn-login {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.82rem !important;
          letter-spacing: 0.04em !important;
          border: 1.5px solid rgba(25, 118, 210, 0.6) !important;
          color: #64b5f6 !important;
          background: transparent !important;
          border-radius: 8px !important;
          padding: 6px 18px !important;
          transition: all 0.2s ease !important;
        }

        .btn-login:hover {
          background: rgba(25, 118, 210, 0.15) !important;
          border-color: #1976D2 !important;
          color: #ffffff !important;
        }

        .btn-signup {
          font-family: 'Poppins', sans-serif !important;
          font-weight: 600 !important;
          font-size: 0.82rem !important;
          letter-spacing: 0.04em !important;
          background: linear-gradient(135deg, #1565C0, #1976D2) !important;
          border: none !important;
          border-radius: 8px !important;
          color: #ffffff !important;
          padding: 6px 18px !important;
          box-shadow: 0 4px 14px rgba(25, 118, 210, 0.35) !important;
          transition: all 0.2s ease !important;
        }

        .btn-signup:hover {
          background: linear-gradient(135deg, #1976D2, #42a5f5) !important;
          box-shadow: 0 6px 20px rgba(25, 118, 210, 0.5) !important;
          transform: translateY(-1px);
        }

        /* Toggler */
        .navbar-toggler {
          border-color: rgba(255,255,255,0.2) !important;
        }
        .navbar-toggler-icon {
          filter: invert(1);
        }
      `}</style>

      <Navbar
        expand="lg"
        sticky="top"
        className="shadow-sm nav-root"
        style={{
          minHeight: "40px",
          background: "rgba(10, 12, 22, 0.72)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(25, 118, 210, 0.15)",
          boxShadow: "0 2px 24px 0 rgba(0,0,0,0.18)",
        }}
      >
        <Container>
          {/* BRAND */}
          <Navbar.Brand href="/" className="d-flex align-items-center gap-2">
            <img
              src={logo}
              alt="Travel Sathi"
              style={{
                height: "60px",
                width: "auto",
                objectFit: "contain",
              }}
            />
            <span className="brand-text">
              Travel <span className="sathi">Sathi</span>
            </span>
          </Navbar.Brand>

          <Navbar.Toggle />

          <Navbar.Collapse>
            {/* CENTER LINKS */}
            <Nav className="mx-auto gap-lg-4">
              <Nav.Link className="nav-link-custom" href="/">Home</Nav.Link>
              <Nav.Link className="nav-link-custom" href="/explorer">Explore</Nav.Link>
              <Nav.Link className="nav-link-custom" href="#">Trips</Nav.Link>
              <NavDropdown
                title="More"
                className="nav-dropdown-custom"
                menuVariant="dark"
              >
                <NavDropdown.Item className="dropdown-item-custom">Blog</NavDropdown.Item>
                <NavDropdown.Item className="dropdown-item-custom" href="/about">About</NavDropdown.Item>
                <NavDropdown.Item className="dropdown-item-custom">Support</NavDropdown.Item>
              </NavDropdown>
            </Nav>

            {/* ACTIONS */}
            <Nav className="gap-2 align-items-center">
              <Button className="btn-login" href="/login">Login</Button>
              <Button className="btn-signup" href="/register">Sign Up</Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default BasicExample;