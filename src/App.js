import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import NavbarComponent from "./components/navbar";

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

function Layout() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <NavbarComponent />}

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/home" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/create-trip" element={<CreateTrip />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/trip/:id" element={<TripDetails />} />
        <Route path="/itinerary/:tripId" element={<Itinerary />} />

        <Route path="/explore" element={<ExploreDestination />} />
      </Routes>
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