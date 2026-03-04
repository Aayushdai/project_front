import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Button from "react-bootstrap/Button";
import logo from "../assets/content.png";


function BasicExample() {
  return (
    <Navbar
      expand="lg"
      sticky="top"
      className="shadow-sm"
      style={{
        minHeight: "40px",
        background: "rgba(20, 20, 30, 0.45)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 2px 24px 0 rgba(0,0,0,0.10)",
      }}
    >
      <Container>
        {/* BRAND */}
        <Navbar.Brand
          href="/"
          className="d-flex align-items-center gap-3"
        >
          <img
            src={logo}
            alt="Travel Sathi"
            style={{
              height: "60px",
              width: "auto",
              objectFit: "contain",
            }}
          />
          <span className="fw-bold fs-5 text-white">
            Travel <span className="text-info">Sathi</span>
          </span>
        </Navbar.Brand>

        <Navbar.Toggle />

        <Navbar.Collapse>
          {/* CENTER LINKS */}
          <Nav className="mx-auto gap-lg-4">
            <Nav.Link className="fw-semibold" href="/">
              Home
            </Nav.Link>
            <Nav.Link className="fw-semibold" href="/explorer">
              Explore
            </Nav.Link>
            <Nav.Link className="fw-semibold" href="#">
              Trips
            </Nav.Link>
            <NavDropdown title="More">
              <NavDropdown.Item>Blog</NavDropdown.Item>
              <NavDropdown.Item href="/about">About</NavDropdown.Item>
              <NavDropdown.Item>Support</NavDropdown.Item>
            </NavDropdown>
          </Nav>

          {/* ACTIONS */}
          <Nav className="gap-2">
            <Button variant="outline-light" size="sm">
              Login
            </Button>
            <Button variant="info" size="sm">
              Sign Up
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default BasicExample;
