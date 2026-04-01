import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import NavbarComponent from "./components/navbar";
import Footer from "./components/Footer";
import ChatbotWidget from "./components/ChatbotWidget";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import CreateTrip from "./pages/CreateTrip";
import ExploreDestination from "./pages/ExploreDestination";
import DestinationDetail from "./pages/DestinationDetail";
import Itinerary from "./pages/Itinerary";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import SearchResults from "./pages/SearchResults";
import TripDetails from "./pages/TripDetails";
import TripPlanner from "./pages/TripPlanner";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import KYCForm from "./pages/KYCForm";
import KYCAdminDashboard from "./pages/KYCAdminDashboard";

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
  const hideNav = location.pathname === "/" || location.pathname === "/register" || location.pathname === "/forgot-password";
  const hideChatbot = location.pathname.startsWith("/user/") || location.pathname === "/" || location.pathname === "/register" || location.pathname === "/forgot-password";

  return (
    <>
      {!hideNav && <NavbarComponent />}
      {!hideChatbot && <ChatbotWidget />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<About />} />

        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/kyc" element={<PrivateRoute><KYCForm /></PrivateRoute>} />
        <Route path="/user/:username" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
        <Route path="/search" element={<PrivateRoute><SearchResults /></PrivateRoute>} />
        <Route path="/create-trip" element={<PrivateRoute><CreateTrip /></PrivateRoute>} />
        <Route path="/trip-planner" element={<PrivateRoute><TripPlanner /></PrivateRoute>} />
        <Route path="/trip/:id" element={<PrivateRoute><TripDetails /></PrivateRoute>} />
        <Route path="/destination/:id" element={<PrivateRoute><DestinationDetail /></PrivateRoute>} />
        <Route path="/itinerary/:tripId" element={<PrivateRoute><Itinerary /></PrivateRoute>} />
        <Route path="/explore" element={<PrivateRoute><ExploreDestination /></PrivateRoute>} />

        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/kyc" element={<AdminRoute><KYCAdminDashboard /></AdminRoute>} />
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