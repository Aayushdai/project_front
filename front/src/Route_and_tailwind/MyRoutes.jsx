import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

// Import the root CSS file
import './index.css';
import Home from '../UI/Home';
import MyProfile from '../UI/MyProfile';
import Navbar from '../UI/Navbar';
import Footer from '../UI/Footer';
import Map from '../UI/Map';
import About from '../UI/About';
import Login from '../UI/Login';
import Register from '../UI/Register';

function MyRoutes() {
  function LayoutWithNavbar() {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login" || location.pathname === "/Register"; // Add more paths as needed
    return (
      <>
        {!hideNavbar && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explorer" element={<Map />} />
          <Route path="/profile" element={<MyProfile />} />
          <Route path="/about" element={<About />} />
        </Routes>
        <Footer />
      </>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/*" element={<LayoutWithNavbar />} />
      </Routes>
    </BrowserRouter>
  );
}

export default MyRoutes;