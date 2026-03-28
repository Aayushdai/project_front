import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import NavbarComponent from "./components/navbar";
import Footer from "./components/Footer";
import ChatbotWidget from "./components/ChatbotWidget";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import CreateTrip from "./pages/CreateTrip";
import ExploreDestination from "./pages/ExploreDestination";
import Itinerary from "./pages/Itinerary";
import Profile from "./pages/Profile";
import About from "./pages/About";
import TripDetails from "./pages/TripDetails";
import TripPlanner from "./pages/TripPlanner";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <NavbarComponent />}
      <ChatbotWidget />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/about" element={<PrivateRoute><About /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/create-trip" element={<PrivateRoute><CreateTrip /></PrivateRoute>} />
        <Route path="/trip-planner" element={<PrivateRoute><TripPlanner /></PrivateRoute>} />
        <Route path="/trip/:id" element={<PrivateRoute><TripDetails /></PrivateRoute>} />
        <Route path="/itinerary/:tripId" element={<PrivateRoute><Itinerary /></PrivateRoute>} />
        <Route path="/explore" element={<PrivateRoute><ExploreDestination /></PrivateRoute>} />
      </Routes>
      {!hideNavbar && <Footer />}
    </>
  );
}

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;