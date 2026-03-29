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
import TripDetails from "./pages/TripDetails";
import TripPlanner from "./pages/TripPlanner";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

function AdminRoute({ children }) {
  const { user } = useAuth();
  return user && user.is_staff ? children : <Navigate to="/" />;
}

function Layout() {
  const location = useLocation();
  const hideNav = location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      {!hideNav && <NavbarComponent />}
      <ChatbotWidget />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />

        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/create-trip" element={<PrivateRoute><CreateTrip /></PrivateRoute>} />
        <Route path="/trip-planner" element={<PrivateRoute><TripPlanner /></PrivateRoute>} />
        <Route path="/trip/:id" element={<PrivateRoute><TripDetails /></PrivateRoute>} />
        <Route path="/itinerary/:tripId" element={<PrivateRoute><Itinerary /></PrivateRoute>} />
        <Route path="/explore" element={<PrivateRoute><ExploreDestination /></PrivateRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Routes>
      {!hideNav && <Footer />}
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