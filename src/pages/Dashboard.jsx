import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../API/api";
import KYCBanner from "../components/KYCBanner";
import { TripsGridSkeleton, StatsCardSkeleton } from "../components/SkeletonLoaders";
import {
  PlusCircle,
  Compass,
  List,
  MapPin,
  Users,
  Calendar,
  Globe,
  Lock,
  ChevronRight,
  AlertCircle,
  Loader2,
  LogIn,
  Clock,
  Image,
  Check,
  Mail,
} from "lucide-react";

// ──── CONSTANTS ────
const TEXTS = {
  greeting: "Welcome back",
  subtext: "Manage your trips and find your next travel companion",
  tripsCreated: "Trips Created",
  groupsJoined: "Groups Joined",
  totalTrips: "Total Trips",
  myTrips: "My Trips",
  allAvailable: "All Available",
  create: "Create",
  search: "Search trips by name, description, or destination...",
  loadingTrips: "Loading your trips...",
  signedOut: "You have been signed out",
  loginMessage: "Please log in again to continue",
  welcome: "Welcome to Travel Sathi",
};

const TRIP_TAGS_CATEGORIES = {
  "Trip Type": ["Adventure", "Relaxation", "Cultural", "Nature", "Road Trip", "Backpacking", "Trekking / Hiking", "Camping", "City Tour", "Beach Trip", "Wildlife / Safari"],
  "Budget Level": ["Budget", "Mid-range", "Luxury"],
  "Activity Level": ["High Activity", "Moderate Activity", "Chill / Low Activity"],
  "Trip Style": ["Solo Friendly", "Group Trip", "Family Friendly", "Friends Trip", "Guided Tour", "DIY / Self-planned"],
  "Environment": ["Mountain", "Hills", "Forest", "Lake / Riverside", "Desert", "Urban", "Rural / Village"],
  "Duration": ["Weekend Trip", "Short Trip (2–3 days)", "Long Trip (4+ days)"],
  "Transport": ["Road Trip", "Flight Travel", "Mixed Transport"],
  "Purpose": ["Photography", "Food Exploration", "Sightseeing", "Spiritual / Religious", "Party / Nightlife", "Wellness / Retreat", "Festival Trip"],
  "Stay Type": ["Hotel Stay", "Homestay", "Camping Stay", "Resort Stay"]
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800&family=Poppins:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .db-root {
    min-height: 100vh;
    background: #080c14;
    color: #fff;
    font-family: 'Poppins', sans-serif;
    padding: 2.5rem 1.5rem 4rem;
  }

  .db-inner { max-width: 1100px; margin: 0 auto; }

  /* Header */
  .db-header { margin-bottom: 2.5rem; }
  .db-greeting {
    font-family: 'Montserrat', sans-serif;
    font-size: clamp(1.8rem, 4vw, 2.6rem);
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1.1;
    margin-bottom: 0.4rem;
  }
  .db-greeting span { color: #ffd580; }
  .db-subtext { color: rgba(255,255,255,0.4); font-size: 0.9rem; font-weight: 300; }

  /* Stats */
  .db-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2.5rem; }
  .db-stat {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 1.4rem 1.6rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: border-color 0.25s;
  }
  .db-stat:hover { border-color: rgba(255,213,128,0.25); }
  .db-stat-icon {
    width: 42px; height: 42px;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .db-stat-val {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.7rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    line-height: 1;
    color: #ffd580;
  }
  .db-stat-label {
    font-size: 0.72rem;
    color: rgba(255,255,255,0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-top: 2px;
  }

  /* Error */
  .db-error {
    display: flex; align-items: center; gap: 10px;
    background: rgba(239,68,68,0.08);
    border: 1px solid rgba(239,68,68,0.25);
    border-radius: 12px;
    padding: 12px 16px;
    color: #fca5a5;
    font-size: 0.88rem;
    margin-bottom: 1.5rem;
  }

  /* Tabs */
  .db-tabs {
    display: flex; gap: 4px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 5px;
    margin-bottom: 2rem;
  }
  .db-tab {
    flex: 1;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    padding: 10px 16px;
    border-radius: 10px;
    border: none;
    cursor: pointer;
    font-family: 'Poppins', sans-serif;
    font-size: 0.82rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    transition: background 0.2s, color 0.2s;
    background: transparent;
    color: rgba(255,255,255,0.4);
  }
  .db-tab.active {
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: #fff;
    box-shadow: 0 4px 20px rgba(249,115,22,0.3);
  }
  .db-tab:not(.active):hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.7); }

  /* Loading */
  .db-loading {
    display: flex; flex-direction: column; align-items: center;
    justify-content: center; padding: 5rem 0; gap: 1rem;
    color: rgba(255,255,255,0.35);
  }
  .db-spinner { animation: spin 1s linear infinite; color: #ffd580; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Trip grid */
  .db-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.2rem; }

  /* Trip card */
  .trip-card {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 1.6rem;
    transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
    cursor: default;
  }
  .trip-card:hover {
    transform: translateY(-4px);
    border-color: rgba(255,213,128,0.2);
    box-shadow: 0 16px 40px rgba(0,0,0,0.4);
  }
  .trip-card-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 0.8rem; }
  .trip-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    letter-spacing: -0.01em;
    color: #fff;
    margin-bottom: 0.25rem;
  }
  .trip-dest {
    display: flex; align-items: center; gap: 5px;
    font-size: 0.78rem; color: rgba(255,255,255,0.4);
  }
  .trip-badge {
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 100px;
    flex-shrink: 0;
  }
  .badge-creator { background: rgba(255,213,128,0.15); color: #ffd580; border: 1px solid rgba(255,213,128,0.3); }
  .badge-public  { background: rgba(134,239,172,0.1);  color: #86efac; border: 1px solid rgba(134,239,172,0.25); }

  .trip-desc {
    font-size: 0.82rem;
    color: rgba(255,255,255,0.35);
    line-height: 1.6;
    margin-bottom: 1.2rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .trip-meta { display: flex; gap: 0.8rem; margin-bottom: 1.2rem; }
  .trip-meta-item {
    flex: 1;
    background: rgba(255,255,255,0.04);
    border-radius: 10px;
    padding: 0.65rem 0.8rem;
    display: flex; align-items: center; gap: 6px;
  }
  .trip-meta-label { font-size: 0.7rem; color: rgba(255,255,255,0.3); display: block; }
  .trip-meta-val { font-size: 0.82rem; font-weight: 600; color: rgba(255,255,255,0.75); }

  .trip-by {
    font-size: 0.73rem; color: rgba(255,255,255,0.3);
    margin-bottom: 1rem;
    display: flex; align-items: center; gap: 5px;
  }

  .trip-actions { display: flex; gap: 8px; }
  .btn {
    flex: 1; padding: 9px 14px; border-radius: 10px; border: none;
    font-family: 'Poppins', sans-serif; font-size: 0.82rem; font-weight: 600;
    cursor: pointer; transition: opacity 0.2s, transform 0.15s;
    display: flex; align-items: center; justify-content: center; gap: 6px;
  }
  .btn:hover { opacity: 0.85; transform: translateY(-1px); }
  .btn:active { transform: translateY(0); }
  .btn-primary { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; }
  .btn-outline { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.6); border: 1px solid rgba(255,255,255,0.1); }
  .btn-gold { background: rgba(255,213,128,0.1); color: #ffd580; border: 1px solid rgba(255,213,128,0.2); }
  .btn-dim { background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.3); cursor: default; }
  .btn-dim:hover { opacity: 1; transform: none; }

  /* Empty state */
  .empty-state {
    text-align: center; padding: 5rem 2rem;
    background: rgba(255,255,255,0.02);
    border: 1px dashed rgba(255,255,255,0.08);
    border-radius: 20px;
  }
  .empty-icon {
    width: 64px; height: 64px;
    background: rgba(255,213,128,0.08);
    border: 1px solid rgba(255,213,128,0.15);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem;
    color: #ffd580;
  }
  .empty-title {
    font-family: 'Montserrat', sans-serif;
    font-weight: 700; font-size: 1.3rem;
    margin-bottom: 0.5rem; color: #fff;
  }
  .empty-sub { color: rgba(255,255,255,0.35); font-size: 0.88rem; margin-bottom: 1.8rem; }

  /* Discover tip */
  .discover-tip {
    font-size: 0.78rem; color: rgba(255,255,255,0.3);
    margin-bottom: 1.2rem;
    display: flex; align-items: center; gap: 6px;
  }

  /* Create form */
  .create-wrap {
    max-width: 680px; margin: 0 auto;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 2.5rem;
  }
  .create-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem; font-weight: 800;
    letter-spacing: -0.02em; margin-bottom: 2rem;
  }
  .form-group { margin-bottom: 1.4rem; }
  .form-label {
    display: block;
    font-size: 0.75rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.1em;
    color: rgba(255,255,255,0.5); margin-bottom: 0.55rem;
  }
  .form-input, .form-textarea, .form-select {
    width: 100%; padding: 12px 14px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: #fff; font-family: 'Poppins', sans-serif; font-size: 0.88rem;
    outline: none; transition: border-color 0.2s;
  }
  .form-input::placeholder, .form-textarea::placeholder { color: rgba(255,255,255,0.2); }
  .form-input:focus, .form-textarea:focus, .form-select:focus { border-color: rgba(255,213,128,0.4); }
  .form-textarea { resize: none; }
  .form-select option { background: #1a1f2e; color: #fff; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

  .toggle-row {
    display: flex; align-items: center; gap: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 14px;
    padding: 1rem 1.2rem;
  }
  .toggle-row input[type="checkbox"] {
    width: 18px; height: 18px; accent-color: #f97316; cursor: pointer;
  }
  .toggle-label { font-size: 0.85rem; color: rgba(255,255,255,0.6); cursor: pointer; }
  .toggle-label strong { color: #fff; display: block; margin-bottom: 2px; font-weight: 600; }
  .toggle-hint { font-size: 0.72rem; color: rgba(255,255,255,0.3); margin-top: 3px; }

  .form-actions { display: flex; gap: 10px; margin-top: 2rem; }
  .form-submit {
    flex: 1; padding: 13px;
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: #fff; border: none; border-radius: 12px;
    font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 700;
    cursor: pointer; transition: opacity 0.2s, box-shadow 0.2s;
    box-shadow: 0 6px 20px rgba(249,115,22,0.3);
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .form-submit:hover { opacity: 0.9; box-shadow: 0 8px 28px rgba(249,115,22,0.45); }
  .form-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  .form-cancel {
    padding: 13px 22px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: rgba(255,255,255,0.5);
    font-family: 'Poppins', sans-serif; font-size: 0.9rem; font-weight: 600;
    cursor: pointer; transition: background 0.2s;
  }
  .form-cancel:hover { background: rgba(255,255,255,0.08); }

  @media (max-width: 600px) {
    .form-grid { grid-template-columns: 1fr; }
    .db-tabs { flex-direction: column; }
    .form-actions { flex-direction: column; }
  }
`;

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myTrips, setMyTrips] = useState([]);
  const [availableTrips, setAvailableTrips] = useState([]);
  const [tripHistory, setTripHistory] = useState([]);
  const [stats, setStats] = useState({ created: 0, joined: 0, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("myTrips");
  const [userProfileId, setUserProfileId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPageMyTrips, setCurrentPageMyTrips] = useState(1);
  const [currentPageAvailable, setCurrentPageAvailable] = useState(1);
  const [currentPageHistory, setCurrentPageHistory] = useState(1);
  const [userProfile, setUserProfile] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [selectedFilterTags, setSelectedFilterTags] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [destinationRecommendations, setDestinationRecommendations] = useState([]);
  const [isSearchingDestination, setIsSearchingDestination] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    fetchDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    if (activeTab === "invitations") {
      fetchInvitations();
    }
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token present:", !!token);
      
      // Get user's UserProfile ID - use direct fetch since api.baseURL is /api/
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
      const meRes = await fetch(`${backendUrl}users/me/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const profile = await meRes.json();
      const userId = profile?.id;
      
      if (!meRes.ok || !userId) {
        const errorMsg = profile?.detail || `Failed to fetch user profile (${meRes.status})`;
        throw new Error(errorMsg);
      }
      
      setUserProfile(profile); // Store profile data for KYC status
      setUserProfileId(userId); // Store for use in rendering
      
      const tripsRes = await api.get("trips/");
      const allTrips = tripsRes.data || [];
      console.log("All trips:", allTrips);
      
      // DEBUG: Check trip_tags structure
      if (allTrips.length > 0) {
        console.log("First trip trip_tags:", allTrips[0].trip_tags, "Type:", typeof allTrips[0].trip_tags);
        console.log("First 3 trips data:");
        allTrips.slice(0, 3).forEach((trip, idx) => {
          console.log(`  Trip ${idx} (${trip.title}):`, {
            trip_tags: trip.trip_tags,
            type: typeof trip.trip_tags,
            isArray: Array.isArray(trip.trip_tags),
            keys: Object.keys(trip)
          });
        });
      }
      
      // Fetch recommended trips
      let recommendedTrips = [];
      try {
        const recommendedRes = await api.get("trips/recommended/?limit=20");
        recommendedTrips = recommendedRes.data?.results || recommendedRes.data || [];
        console.log("Recommended trips:", recommendedTrips);
      } catch (recErr) {
        console.error("Failed to fetch recommended trips:", recErr);
        // Fallback to basic filtering
      }
      
      // Fetch trip history
      try {
        const historyRes = await api.get("trips/history/");
        const history = historyRes.data || [];
        console.log("Trip history:", history);
        setTripHistory(history);
      } catch (historyErr) {
        console.error("Failed to fetch trip history:", historyErr);
        setTripHistory([]);
      }
      
      const userTripsCreated = allTrips.filter(t => {
        const isCreator = t.creator?.id === userId;
        console.log(`Trip ${t.id} (${t.title}): creator=${t.creator?.id}, userProfileId=${userId}, isCreator=${isCreator}`);
        return isCreator;
      });
      
      const userTripsJoined = allTrips.filter(t => {
        // Log the raw participants to see the actual structure
        console.log(`Trip ${t.id} raw participants:`, t.participants);
        
        let isParticipant = false;
        if (Array.isArray(t.participants)) {
          isParticipant = t.participants.some(p => {
            const pId = typeof p === 'object' ? p.id : p;
            console.log(`  Checking participant ${pId} against userId ${userId}`, pId === userId);
            return pId === userId;
          });
        }
        
        const isNotCreator = t.creator?.id !== userId;
        console.log(`Trip ${t.id} (${t.title}): isParticipant=${isParticipant}, isNotCreator=${isNotCreator}, isMember=${isParticipant && isNotCreator}`);
        return isParticipant && isNotCreator;
      });
      
      const combined = [...userTripsCreated, ...userTripsJoined];
      
      // Use recommended trips if available, otherwise fallback to basic filtering
      const publicTrips = recommendedTrips.length > 0 
        ? recommendedTrips 
        : allTrips.filter(t =>
            t.is_public && !combined.some(mt => mt.id === t.id)
          );
      
      console.log("User trips created:", userTripsCreated);
      console.log("User trips joined:", userTripsJoined);
      console.log("Combined:", combined);
      console.log("Recommended/Public trips:", publicTrips);
      
      setMyTrips(combined);
      setAvailableTrips(publicTrips);
      setStats({ created: userTripsCreated.length, joined: userTripsJoined.length, total: allTrips.length });
    } catch (err) {
      console.error("Dashboard error:", err);
      console.error("Response status:", err.response?.status);
      console.error("Response data:", err.response?.data);
      const msg = err.response?.data?.detail || err.message || "Failed to load trips";
      setError(msg);
    } finally { 
      setLoading(false);
      setKycLoading(false);
    }
  };

  const handleJoinTrip = async (tripId) => {
    try {
      console.log("Joining trip:", tripId);
      const res = await api.patch(`trips/${tripId}/`, { action: "join" });
      console.log("Join response:", res.data);
      console.log("Trip data from response:", res.data.trip);
      console.log("Participants from response:", res.data.trip?.participants);
      
      // Send system message to trip chat
      try {
        const token = localStorage.getItem("access_token");
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
        const userName = user?.user?.first_name || user?.user?.username || "A user";
        await fetch(`${backendUrl.replace('/api/', '')}/api/chat/messages/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: `${userName} joined the trip`,
            trip_id: tripId,
            is_system: true,
          }),
        });
      } catch (chatErr) {
        console.warn("Failed to send join notification:", chatErr);
        // Don't fail the join if chat message fails
      }
      
      // Wait a moment for backend to process, then refresh and switch to My Trips
      setTimeout(() => {
        console.log("Refreshing dashboard data...");
        fetchDashboardData(); 
        setActiveTab("myTrips"); // Switch to My Trips tab to see the joined trip
        setError("");
      }, 100);
    } catch (err) { 
      console.error("Join trip error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to join trip."); 
    }
  };

  const handleLeaveTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to leave this trip?")) return;
    try {
      console.log("Leaving trip:", tripId);
      const res = await api.patch(`trips/${tripId}/`, { action: "leave" });
      console.log("Leave response:", res.data);
      
      // Send system message to trip chat
      try {
        const token = localStorage.getItem("access_token");
        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
        const userName = user?.user?.first_name || user?.user?.username || "A user";
        await fetch(`${backendUrl.replace('/api/', '')}/api/chat/messages/`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            content: `${userName} left the trip`,
            trip_id: tripId,
            is_system: true,
          }),
        });
      } catch (chatErr) {
        console.warn("Failed to send leave notification:", chatErr);
        // Don't fail the leave if chat message fails
      }
      
      fetchDashboardData(); 
      setError("");
    } catch (err) { 
      console.error("Leave trip error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to leave trip."); 
    }
  };

  const handleDeleteTrip = async (tripId) => {
    if (!window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) return;
    try {
      console.log("Deleting trip:", tripId);
      await api.delete(`trips/${tripId}/`);
      console.log("Trip deleted successfully");
      fetchDashboardData(); 
      setError("");
    } catch (err) { 
      console.error("Delete trip error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to delete trip."); 
    }
  };

  const fetchInvitations = async () => {
    setInvLoading(true);
    try {
      const res = await api.get("trips/invitations/my/");
      setInvitations(res.data || []);
      console.log("Fetched invitations:", res.data);
    } catch (err) {
      console.error("Failed to fetch invitations:", err.message);
      setInvitations([]);
    } finally {
      setInvLoading(false);
    }
  };

  const handleRespondToInvitation = async (invitationId, action) => {
    try {
      const res = await api.patch(`trips/invitations/${invitationId}/respond/`, { action });
      console.log(`${action} invitation response:`, res.data);
      
      // Remove the invitation from the list
      setInvitations(inv => inv.filter(i => i.id !== invitationId));
      
      if (action === "accept") {
        setError("");
        // Refresh trips to show the newly joined trip
        setTimeout(() => fetchDashboardData(), 100);
      }
    } catch (err) {
      console.error(`Failed to ${action} invitation:`, err.message);
      setError(err.response?.data?.detail || `Failed to ${action} invitation`);
    }
  };

  // Search for destination-specific recommendations
  const searchDestinationRecommendations = async (destination) => {
    if (!destination.trim()) {
      setDestinationRecommendations([]);
      return;
    }
    
    try {
      setIsSearchingDestination(true);
      const res = await api.get(`trips/recommended/?destination=${encodeURIComponent(destination)}&limit=20`);
      const recommendations = res.data?.results || res.data || [];
      console.log("Destination recommendations:", recommendations);
      setDestinationRecommendations(recommendations);
    } catch (err) {
      console.error("Failed to search destination recommendations:", err);
      setDestinationRecommendations([]);
    } finally {
      setIsSearchingDestination(false);
    }
  };

  const tabs = [
    { id: "invitations", label: "Invitations",  icon: <Mail size={14} /> },
    { id: "myTrips",   label: "My Trips",      icon: <List size={14} /> },
    { id: "available", label: "Discover",       icon: <Compass size={14} /> },
    { id: "history",   label: "Trip History",   icon: <Clock size={14} /> },
    { id: "create",    label: "Create Trip",    icon: <PlusCircle size={14} /> },
  ];

  // Filter trips based on search query and tags
  const filterTrips = (trips) => {
    let result = trips;
    
    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destination?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by selected tags - only show trips that have AT LEAST ONE of the selected tags
    if (selectedFilterTags.length > 0) {
      console.log("🔍 Filtering by tags:", selectedFilterTags);
      result = result.filter(t => {
        // Parse trip_tags - it might be a JSON string or already an array
        let tripTags = t.trip_tags || [];
        console.log(`  Raw trip_tags for "${t.title}":`, tripTags, "Type:", typeof tripTags);
        
        if (typeof tripTags === 'string') {
          try {
            tripTags = JSON.parse(tripTags);
          } catch (e) {
            console.error(`    Failed to parse trip_tags: ${e.message}`);
            tripTags = [];
          }
        }
        
        // Make sure it's an array
        if (!Array.isArray(tripTags)) {
          tripTags = [];
        }
        
        // Case-insensitive comparison by converting both to lowercase
        const tripTagsLower = tripTags.map(tag => String(tag).toLowerCase());
        const hasMatchingTag = selectedFilterTags.some(selectedTag => 
          tripTagsLower.includes(selectedTag.toLowerCase())
        );
        console.log(`  Parsed trip_tags for "${t.title}":`, tripTags, "Lowercase:", tripTagsLower, "Match:", hasMatchingTag);
        return hasMatchingTag;
      });
      console.log(`  ✅ Found ${result.length} matching trips`);
    }
    
    return result;
  };

  // Handle search input change and fetch destination recommendations
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPageAvailable(1);
    
    // If user is typing a destination-like query, fetch recommendations
    if (query.trim().length > 0 && activeTab === "available") {
      // Debounced destination search
      searchDestinationRecommendations(query);
    } else {
      setDestinationRecommendations([]);
    }
  };

  // Get filtered and paginated trips for "My Trips"
  const filteredMyTrips = filterTrips(myTrips);
  const totalMyTripPages = Math.ceil(filteredMyTrips.length / itemsPerPage);
  const paginatedMyTrips = filteredMyTrips.slice(
    (currentPageMyTrips - 1) * itemsPerPage,
    currentPageMyTrips * itemsPerPage
  );

  // Get filtered and paginated trips for "Available"
  // Use destination recommendations if available, otherwise use filtered available trips
  const tripsToShow = destinationRecommendations.length > 0 && searchQuery.trim() && activeTab === "available" 
    ? destinationRecommendations 
    : filterTrips(availableTrips);
  
  const filteredAvailableTrips = tripsToShow;
  const totalAvailablePages = Math.ceil(filteredAvailableTrips.length / itemsPerPage);
  const paginatedAvailableTrips = filteredAvailableTrips.slice(
    (currentPageAvailable - 1) * itemsPerPage,
    currentPageAvailable * itemsPerPage
  );

  // Get filtered and paginated trips for "History"
  const filteredHistoryTrips = filterTrips(tripHistory);
  const totalHistoryPages = Math.ceil(filteredHistoryTrips.length / itemsPerPage);
  const paginatedHistoryTrips = filteredHistoryTrips.slice(
    (currentPageHistory - 1) * itemsPerPage,
    currentPageHistory * itemsPerPage
  );

  return (
    <>
      <style>{styles}</style>
      
      {/* KYC Blocking Screen */}
      {kycLoading ? (
        <div className="db-root" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          <div className="db-inner">
            <div style={{ marginBottom: '1.5rem' }}>
              <StatsCardSkeleton />
            </div>
            <TripsGridSkeleton count={6} />
          </div>
        </div>
      ) : userProfile && userProfile.status && userProfile.status !== "approved" ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", width: "100vw", background: "linear-gradient(135deg, #07080f 0%, #0d0e1a 100%)", fontFamily: "'Syne',sans-serif" }}>
          <div style={{ textAlign: "center", maxWidth: 420, padding: "40px 30px", background: "rgba(255,255,255,.03)", border: ".5px solid rgba(240,194,122,.15)", borderRadius: 20, animation: "fadeIn 0.4s ease", boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}>
            <div style={{ fontSize: 64, marginBottom: 20 }}>🔐</div>
            <div style={{ fontSize: 22, color: "#f5f0e8", marginBottom: 12, fontWeight: 700, letterSpacing: "-.5px" }}>
              {userProfile.status === "pending"
                ? "KYC Verification Pending"
                : userProfile.status === "under_review"
                ? "KYC Under Review"
                : "KYC Verification Required"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(245,240,232,.5)", lineHeight: 1.8, marginBottom: 24 }}>
              {userProfile.status === "pending"
                ? "Your KYC verification is pending. Please submit your documents to unlock Trip Dashboard features."
                : userProfile.status === "under_review"
                ? "Your KYC verification is currently under review. We'll notify you once it's approved."
                : "You need to complete KYC verification to access your trips."}
            </div>
            <a
              href="/kyc"
              style={{
                display: "inline-block",
                padding: "11px 28px",
                borderRadius: 10,
                background: "linear-gradient(135deg,#c9973a,#f0c27a)",
                color: "#0f0e0d",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: ".5px",
                boxShadow: "0 4px 16px rgba(240,194,122,.3)",
                transition: "all .2s",
                cursor: "pointer",
                border: "none"
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(240,194,122,.4)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 16px rgba(240,194,122,.3)"; }}
            >
              {userProfile.status === "under_review" ? "View Status" : "Complete KYC"}
            </a>
            <div style={{ fontSize: 12, color: "rgba(245,240,232,.3)", marginTop: 16 }}>
              KYC is required for safety & security
            </div>
          </div>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      ) : (
      <div className="db-root">
        <div className="db-inner">

          {/* Header */}
          <div className="db-header">
            <h1 className="db-greeting">
              {TEXTS.greeting}, <span>{user?.first_name || user?.username}</span>
            </h1>
            <p className="db-subtext">{TEXTS.subtext}</p>
          </div>

          {/* Stats */}
          <div className="db-stats">
            <StatCard icon={<PlusCircle size={18} />} label={TEXTS.tripsCreated} value={stats.created} iconBg="rgba(255,213,128,0.12)" iconColor="#ffd580" />
            <StatCard icon={<Users size={18} />}      label={TEXTS.groupsJoined}  value={stats.joined}  iconBg="rgba(147,197,253,0.12)" iconColor="#93c5fd" />
            <StatCard icon={<Globe size={18} />}      label={TEXTS.totalTrips}    value={stats.total}   iconBg="rgba(134,239,172,0.12)" iconColor="#86efac" />
          </div>

          {/* KYC Banner */}
          {userProfile && !loading && <KYCBanner status={userProfile.status} rejectionReason={userProfile.rejection_reason} />}

          {/* Error */}
          {error && !loading && (
            <div className="db-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Tabs */}
          {!loading && (
          <div className="db-tabs">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`db-tab${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
          )}

          {/* Content */}
          {loading ? (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <StatsCardSkeleton />
              </div>
              <TripsGridSkeleton count={6} />
            </>
          ) : (
            <>
              {/* Search Bar (visible on myTrips, available, and history tabs) */}
              {(activeTab === "myTrips" || activeTab === "available" || activeTab === "history") && (
                <div style={{ marginBottom: "1.5rem" }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    padding: '10px 14px',
                    gap: '8px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <input
                      type="text"
                      placeholder={TEXTS.search}
                      value={searchQuery}
                      onChange={(e) => {
                        handleSearchChange(e.target.value);
                        setCurrentPageMyTrips(1);
                        setCurrentPageHistory(1);
                      }}
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'Poppins',
                        fontSize: '0.88rem',
                        outline: 'none',
                        padding: '0'
                      }}
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setCurrentPageMyTrips(1);
                          setCurrentPageAvailable(1);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'rgba(255,255,255,0.4)',
                          cursor: 'pointer',
                          padding: '0',
                          fontSize: '1.2rem'
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Trip Tags Filter - Click to Toggle */}
              {(activeTab === "myTrips" || activeTab === "available" || activeTab === "history") && (
                <div 
                  style={{ marginBottom: "1.5rem", position: 'relative' }}
                >
                  <button
                    onClick={() => setShowTagFilter(!showTagFilter)}
                    style={{
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      border: '1px solid rgba(201,168,76,0.3)',
                      background: showTagFilter ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.05)',
                      color: showTagFilter ? '#ffd580' : 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      fontFamily: 'Poppins'
                    }}
                  >
                     Filter by Requirements {selectedFilterTags.length > 0 && `(${selectedFilterTags.length})`}
                  </button>

                  {showTagFilter && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '0.8rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid rgba(201,168,76,0.3)',
                      background: 'rgba(10,12,22,0.95)',
                      backdropFilter: 'blur(10px)',
                      zIndex: 100,
                      minWidth: '400px',
                      maxHeight: '400px',
                      overflowY: 'auto',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {Object.entries(TRIP_TAGS_CATEGORIES).map(([category, tags]) => (
                          <div key={category}>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600, color: '#ffd580', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                              {category}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                              {tags.map(tag => (
                                <button
                                  key={tag}
                                  onClick={() => {
                                    setSelectedFilterTags(prev => {
                                      if (prev.includes(tag)) {
                                        return prev.filter(t => t !== tag);
                                      } else {
                                        return [...prev, tag];
                                      }
                                    });
                                    setCurrentPageMyTrips(1);
                                    setCurrentPageAvailable(1);
                                    setCurrentPageHistory(1);
                                  }}
                                  style={{
                                    padding: '0.4rem 0.7rem',
                                    borderRadius: '6px',
                                    border: `1px solid ${selectedFilterTags.includes(tag) ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.2)'}`,
                                    background: selectedFilterTags.includes(tag) ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                                    color: selectedFilterTags.includes(tag) ? '#ffd580' : 'rgba(255,255,255,0.6)',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    transition: 'all 0.2s',
                                    fontFamily: 'Poppins',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {selectedFilterTags.includes(tag) && '✓ '}{tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      {selectedFilterTags.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedFilterTags([]);
                            setCurrentPageMyTrips(1);
                            setCurrentPageAvailable(1);
                            setCurrentPageHistory(1);
                          }}
                          style={{
                            marginTop: '0.8rem',
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(255,100,100,0.3)',
                            background: 'rgba(255,100,100,0.1)',
                            color: '#ff6464',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            width: '100%',
                            fontFamily: 'Poppins'
                          }}
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "invitations" && (
                <>
                  {invLoading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
                      <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                  ) : invitations.length === 0 ? (
                    <EmptyState 
                      icon={<Mail size={28} />} 
                      title="No invitations yet" 
                      subtitle="When someone invites you to a trip, it will show here." 
                      action={() => setActiveTab("available")} 
                      buttonText="Discover Trips"
                    />
                  ) : (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
                      {invitations.map(inv => (
                        <div
                          key={inv.id}
                          style={{
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid rgba(201,168,76,0.3)',
                            background: 'rgba(15,17,32,0.7)',
                            backdropFilter: 'blur(10px)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '1rem'
                          }}
                        >
                          <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#ffd580', fontSize: '1.1rem', fontWeight: 600 }}>
                              {inv.trip?.title || 'Trip'}
                            </h3>
                            <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                              📍 {inv.trip?.destination?.name || 'Destination unknown'}
                            </p>
                            <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                              Invited by <strong>{inv.invited_by?.user?.first_name || 'Someone'}</strong>
                            </p>
                            {inv.sentAt && (
                              <p style={{ margin: '0.25rem 0', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                                {inv.sentAt}
                              </p>
                            )}
                          </div>

                          <div style={{ borderTop: '1px solid rgba(201,168,76,0.2)', paddingTop: '1rem' }}>
                            <p style={{ margin: '0 0 0.75rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 500 }}>
                              Dates: {inv.trip?.start_date ? new Date(inv.trip.start_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'TBD'} - {inv.trip?.end_date ? new Date(inv.trip.end_date).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : 'TBD'}
                            </p>
                            <p style={{ margin: '0 0 1rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                              {inv.trip?.description && inv.trip.description.length > 100 ? inv.trip.description.substring(0, 100) + '...' : inv.trip?.description}
                            </p>
                          </div>

                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                              onClick={() => handleRespondToInvitation(inv.id, "accept")}
                              style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                                color: 'white',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                fontFamily: 'Poppins',
                                transition: 'all 0.3s'
                              }}
                              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                              ✓ Accept
                            </button>
                            <button
                              onClick={() => handleRespondToInvitation(inv.id, "reject")}
                              style={{
                                flex: 1,
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255,100,100,0.3)',
                                background: 'rgba(255,100,100,0.1)',
                                color: '#ff6464',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.9rem',
                                fontFamily: 'Poppins',
                                transition: 'all 0.3s'
                              }}
                              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {activeTab === "myTrips" && (
                <>
                  {filteredMyTrips.length === 0
                    ? <EmptyState icon={<List size={28} />} title={searchQuery ? "No trips found" : "No trips yet"} subtitle={searchQuery ? "Try a different search" : "Create a new trip or discover public ones to join."} action={() => searchQuery ? setSearchQuery("") : setActiveTab("available")} buttonText={searchQuery ? "Clear Search" : "Discover Trips"} />
                    : <>
                        <div style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
                          Showing {((currentPageMyTrips - 1) * itemsPerPage) + 1}–{Math.min(currentPageMyTrips * itemsPerPage, filteredMyTrips.length)} of {filteredMyTrips.length} trips
                        </div>
                        <div className="db-grid">
                          {paginatedMyTrips.map(trip => (
                            <TripCard
                              key={trip.id} trip={trip}
                              isCreator={trip.creator?.id === userProfileId}
                              onJoin={() => handleJoinTrip(trip.id)}
                              onLeave={() => handleLeaveTrip(trip.id)}
                              onDelete={trip.participants?.length === 1 ? () => handleDeleteTrip(trip.id) : null}
                              onView={() => navigate(`/trip/${trip.id}`)}
                              kycApproved={userProfile?.status === 'approved'}
                            />
                          ))}
                        </div>
                        {totalMyTripPages > 1 && <PaginationControls currentPage={currentPageMyTrips} totalPages={totalMyTripPages} onPageChange={setCurrentPageMyTrips} />}
                      </>
                  }
                </>
              )}

              {activeTab === "available" && (
                <>
                  {isSearchingDestination ? (
                    <EmptyState icon={<Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />} title="Searching for recommendations..." subtitle="Finding trips that match your interests in this destination..." />
                  ) : filteredAvailableTrips.length === 0
                    ? <EmptyState icon={<Compass size={28} />} title={searchQuery ? "No trips found" : "No public trips available"} subtitle={searchQuery ? "Try a different search" : "Be the first to create a trip."} action={() => searchQuery ? setSearchQuery("") : setActiveTab("create")} buttonText={searchQuery ? "Clear Search" : "Create Trip"} />
                    : <>
                        <p className="discover-tip"><Globe size={13} /> {destinationRecommendations.length > 0 ? "Recommended trips based on your interests" : "Public trips others have opened up — join one to start traveling together"}</p>
                        <div style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.88rem' }}>
                          Showing {((currentPageAvailable - 1) * itemsPerPage) + 1}–{Math.min(currentPageAvailable * itemsPerPage, filteredAvailableTrips.length)} of {filteredAvailableTrips.length} trips
                        </div>
                        <div className="db-grid">
                          {paginatedAvailableTrips.map(trip => {
                            const isParticipant = trip.participants?.some(p =>
                              typeof p === 'object' ? p.id === userProfileId : p === userProfileId
                            );
                            return (
                              <TripCard
                                key={trip.id} trip={trip}
                                isCreator={false}
                                onJoin={() => handleJoinTrip(trip.id)}
                                onLeave={isParticipant ? () => handleLeaveTrip(trip.id) : null}
                                onView={() => navigate(`/trip/${trip.id}`)}
                                kycApproved={userProfile?.status === 'approved'}
                              />
                            );
                          })}
                        </div>
                        {totalAvailablePages > 1 && <PaginationControls currentPage={currentPageAvailable} totalPages={totalAvailablePages} onPageChange={setCurrentPageAvailable} />}
                      </>
                  }
                </>
              )}

              {activeTab === "history" && (
                <>
                  {paginatedHistoryTrips.length === 0 ? (
                    <EmptyState icon={<Clock size={28} />} title={searchQuery ? "No past trips found" : "No trip history yet"} subtitle={searchQuery ? "Try a different search" : "Your completed trips will appear here."} action={() => searchQuery ? setSearchQuery("") : setActiveTab("discover")} buttonText={searchQuery ? "Clear Search" : "Discover Trips"} />
                  ) : (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.2rem', marginBottom: '2rem' }}>
                        {paginatedHistoryTrips.map(trip => (
                          <TripCard
                            key={trip.id}
                            trip={trip}
                            isCreator={trip.creator?.id === userProfileId}
                            onView={() => navigate(`/trip/${trip.id}`)}
                            kycApproved={userProfile?.status === "approved"}
                          />
                        ))}
                      </div>
                      {totalHistoryPages > 1 && (
                        <PaginationControls
                          currentPage={currentPageHistory}
                          totalPages={totalHistoryPages}
                          onPageChange={(page) => {
                            setCurrentPageHistory(page);
                            window.scrollTo(0, 0);
                          }}
                        />
                      )}
                    </>
                  )}
                </>
              )}

              {activeTab === "create" && (
                <CreateTripSection onTripCreated={() => { fetchDashboardData(); setActiveTab("myTrips"); }} setActiveTab={setActiveTab} />
              )}
            </>
          )}
        </div>
      </div>
      )}
    </>
  );
}

function PaginationControls({ currentPage, totalPages, onPageChange }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      marginTop: '2rem',
      flexWrap: 'wrap'
    }}>
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        style={{
          padding: '8px 14px',
          background: currentPage === 1 ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.6)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: '0.82rem',
          fontWeight: '600',
          transition: 'all 0.2s',
          opacity: currentPage === 1 ? 0.5 : 1
        }}
      >
        ← Previous
      </button>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: '6px 12px',
              background: currentPage === page
                ? 'linear-gradient(135deg, #f97316, #ea580c)'
                : 'rgba(255,255,255,0.06)',
              border: currentPage === page
                ? 'none'
                : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: currentPage === page ? '#fff' : 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
        disabled={currentPage === totalPages}
        style={{
          padding: '8px 14px',
          background: currentPage === totalPages ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.6)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: '0.82rem',
          fontWeight: '600',
          transition: 'all 0.2s',
          opacity: currentPage === totalPages ? 0.5 : 1
        }}
      >
        Next →
      </button>
    </div>
  );
}

function StatCard({ icon, label, value, iconBg, iconColor }) {
  return (
    <div className="db-stat">
      <div className="db-stat-icon" style={{ background: iconBg, color: iconColor }}>{icon}</div>
      <div>
        <div className="db-stat-val">{value}</div>
        <div className="db-stat-label">{label}</div>
      </div>
    </div>
  );
}

function TripCard({ trip, isCreator, onJoin, onLeave, onDelete, onView, kycApproved }) {
  return (
    <div className="trip-card">
      <div className="trip-card-top">
        <div>
          <div className="trip-title">{trip.title}</div>
          <div className="trip-dest"><MapPin size={11} />{trip.destination?.name || "Destination TBD"}</div>
        </div>
        {isCreator
          ? <span className="trip-badge badge-creator">Creator</span>
          : trip.is_public && <span className="trip-badge badge-public">Public</span>
        }
      </div>

      {!isCreator && trip.creator && (
        <div className="trip-by"><LogIn size={11} />by {trip.creator?.first_name || trip.creator?.username}</div>
      )}

      <p className="trip-desc">{trip.description || "No description provided."}</p>

      {/* Constraint Tags */}
      {trip.constraint_tags && trip.constraint_tags.length > 0 && (
        <div style={{ marginBottom: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {trip.constraint_tags.map(tag => (
            <span
              key={tag.id}
              style={{
                fontSize: '0.7rem',
                padding: '4px 8px',
                borderRadius: '12px',
                backgroundColor: 'rgba(25, 118, 210, 0.15)',
                color: '#64b5f6',
                border: '1px solid rgba(25, 118, 210, 0.3)',
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Trip Tags - These are the tags used for filtering */}
      {trip.trip_tags && trip.trip_tags.length > 0 && (
        <div style={{ marginBottom: '0.8rem', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Array.isArray(trip.trip_tags) ? (
            trip.trip_tags.map((tag, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.7rem',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(240, 194, 122, 0.2)',
                  color: '#ffd580',
                  border: '1px solid rgba(240, 194, 122, 0.5)',
                }}
              >
                {tag}
              </span>
            ))
          ) : typeof trip.trip_tags === 'string' ? (
            <span style={{ fontSize: '0.7rem', color: '#ff6b6b' }}>Invalid trip_tags format: {trip.trip_tags}</span>
          ) : null}
        </div>
      )}

      <div className="trip-meta">
        <div className="trip-meta-item">
          <Calendar size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <div>
            <span className="trip-meta-label">Start date</span>
            <span className="trip-meta-val">{new Date(trip.start_date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="trip-meta-item">
          <Users size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
          <div>
            <span className="trip-meta-label">Participants</span>
            <span className="trip-meta-val">{trip.participants?.length || 0} joined</span>
          </div>
        </div>
        {trip.match_count !== undefined && trip.match_count > 0 && (
          <div className="trip-meta-item" style={{ backgroundColor: 'rgba(76, 175, 80, 0.15)' }}>
            <div style={{ color: '#81c784', fontSize: '0.75rem', fontWeight: '600' }}>
              <span className="trip-meta-label" style={{ color: 'rgba(129, 199, 132, 0.7)' }}>Match Score</span>
              <span className="trip-meta-val" style={{ color: '#81c784' }}>{trip.match_count} people • {trip.avg_similarity}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="trip-actions">
        <button className="btn btn-outline" onClick={onView} disabled={!kycApproved} style={!kycApproved ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>
          View <ChevronRight size={13} />
        </button>
        {isCreator
          ? onDelete
            ? <button className="btn btn-danger" onClick={onDelete} disabled={!kycApproved} style={{ backgroundColor: !kycApproved ? 'rgba(100,100,100,0.2)' : 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.5)', color: '#ef4444', opacity: !kycApproved ? 0.5 : 1, cursor: !kycApproved ? 'not-allowed' : 'pointer' }}>Delete</button>
            : <button className="btn btn-dim">Your Trip</button>
          : onLeave
            ? <button className="btn btn-gold" onClick={onLeave} disabled={!kycApproved} style={!kycApproved ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>Leave</button>
            : <button className="btn btn-primary" onClick={onJoin} disabled={!kycApproved} style={!kycApproved ? { opacity: 0.5, cursor: 'not-allowed' } : {}}>Join Trip</button>
        }
      </div>
    </div>
  );
}

function EmptyState({ icon, title, subtitle, action, buttonText }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h2 className="empty-title">{title}</h2>
      <p className="empty-sub">{subtitle}</p>
      <button className="btn btn-primary" style={{ display: "inline-flex", width: "auto", padding: "11px 28px" }} onClick={action}>
        {buttonText}
      </button>
    </div>
  );
}

function CreateTripSection({ onTripCreated, setActiveTab }) {
  // New structured trip tags
  const [formData, setFormData] = useState({
    title: "", description: "", destination: "",
    start_date: "", end_date: "", is_public: true
  });
  const [selectedTags, setSelectedTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({ category: "", amount: "" });

  const getApiUrl = () => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
    return backendUrl.replace('/api/', '');
  };
  
  const token = () => localStorage.getItem("access_token");

  useEffect(() => {
    api.get("trips/cities/").then(r => setCities(r.data || [])).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExpense = () => {
    if (newExpense.category.trim() && newExpense.amount.trim()) {
      const amount = parseFloat(newExpense.amount);
      if (!isNaN(amount) && amount > 0) {
        setExpenses([...expenses, { id: Date.now(), category: newExpense.category, amount }]);
        setNewExpense({ category: "", amount: "" });
      }
    }
  };

  const handleRemoveExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const calculateTotalExpense = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true); 
    setError("");
    
    // Validate date range
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        setError("End date cannot be before start date. No time travel allowed! 🚫");
        setLoading(false);
        return;
      }
    }
    
    // DEBUG: Log expenses array
    console.log(" FORM SUBMISSION DEBUG");
    console.log("Expenses array:", expenses);
    console.log("Expenses count:", expenses.length);
    expenses.forEach((exp, idx) => {
      console.log(`  [${idx}] ${exp.category}: Rs ${exp.amount}`);
    });
    
    try {
      // Step 1: Create trip with cover image
      const tripFormData = new FormData();
      tripFormData.append("title", formData.title);
      tripFormData.append("destination_id", parseInt(formData.destination));
      tripFormData.append("start_date", formData.start_date);
      tripFormData.append("end_date", formData.end_date);
      tripFormData.append("description", formData.description);
      tripFormData.append("is_public", formData.is_public);
      if (coverImage) {
        tripFormData.append("cover_image", coverImage);
      }
      // Store selected tags as JSON string in description or as a new field
      if (selectedTags.length > 0) {
        tripFormData.append("trip_tags", JSON.stringify(selectedTags));
      }

      const tripRes = await fetch(`${getApiUrl()}/api/trips/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token()}` },
        body: tripFormData
      });

      if (!tripRes.ok) {
        const errData = await tripRes.json();
        throw new Error(errData.detail || "Failed to create trip");
      }

      const tripData = await tripRes.json();
      const tripId = tripData.id;
      console.log(`✅ Trip created successfully with ID: ${tripId}`);

      // Step 2: Add expenses if any
      if (expenses.length > 0) {
        console.log(`Adding ${expenses.length} expenses...`);
        for (const expense of expenses) {
          try {
            const expenseUrl = `${getApiUrl()}/api/trips/${tripId}/expenses/`;
            const expensePayload = {
              category: expense.category,
              amount: expense.amount
            };
            
            console.log(`📤 Posting to: ${expenseUrl}`);
            console.log(`📦 Payload:`, expensePayload);
            
            const expRes = await fetch(expenseUrl, {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${token()}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify(expensePayload)
            });
            
            console.log(`📥 Response status: ${expRes.status}`);
            
            if (!expRes.ok) {
              const errData = await expRes.json();
              console.error(`❌ Failed to add expense "${expense.category}":`, {
                status: expRes.status,
                error: errData
              });
              setError(`Failed to add expense: ${expense.category}`);
            } else {
              const savedExpense = await expRes.json();
              console.log(`✅ Added expense "${expense.category}" for Rs ${expense.amount}`, savedExpense);
            }
          } catch (expErr) {
            console.error(`❌ Error adding expense "${expense.category}":`, expErr);
            setError(`Error adding expense: ${expense.category}`);
          }
        }
      } else {
        console.log("No expenses to add");
      }

      onTripCreated();
    } catch (err) {
      console.error("Trip creation error:", err);
      setError(err.message || "Failed to create trip.");
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="create-wrap">
      <h2 className="create-title">Create a New Trip</h2>

      {error && <div className="db-error" style={{ marginBottom: "1.5rem" }}><AlertCircle size={15} />{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Trip Title *</label>
          <input className="form-input" type="text" name="title" value={formData.title} onChange={handleChange} placeholder="e.g., Pokhara Weekend Trek" required />
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea className="form-textarea" name="description" value={formData.description} onChange={handleChange} placeholder="Tell others what this trip is about..." rows="4" />
        </div>

        {/* Cover Image Upload */}
        <div className="form-group">
          <label className="form-label">Trip Cover Photo</label>
          <div style={{
            position: 'relative',
            border: '2px dashed rgba(255,213,128,0.3)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            cursor: 'pointer',
            transition: 'all 0.2s',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,213,128,0.6)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,213,128,0.3)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
          }}>
            {coverImagePreview ? (
              <>
                <img src={coverImagePreview} alt="Cover preview" style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', marginBottom: '0.8rem' }} />
                <button
                  type="button"
                  onClick={() => {
                    setCoverImage(null);
                    setCoverImagePreview(null);
                  }}
                  style={{
                    padding: '6px 14px',
                    background: 'rgba(239,68,68,0.2)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#fca5a5',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                >
                  Remove Image
                </button>
              </>
            ) : (
              <label style={{ cursor: 'pointer' }}>
                <div style={{ marginBottom: '0.5rem' }}><Image size={40} style={{ margin: '0 auto', color: 'rgba(255,255,255,0.5)' }} /></div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.3rem' }}>Click to upload cover image</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>PNG, JPG up to 10MB</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  style={{ display: 'none' }}
                />
              </label>
            )}
          </div>
        </div>

        {/* Trip Tags Section */}
        <div className="form-group" style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: '12px', padding: '1.2rem' }}>
          <label className="form-label">Trip Characteristics (Select Tags)</label>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Choose tags that describe your trip - select multiple from any category</p>
          
          {Object.entries(TRIP_TAGS_CATEGORIES).map(([category, tags]) => (
            <div key={category} style={{ marginBottom: '1.2rem' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffd580', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {category}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        padding: '0.6rem 1rem',
                        borderRadius: '20px',
                        border: `1px solid ${isSelected ? 'rgba(249,115,22,0.6)' : 'rgba(255,255,255,0.2)'}`,
                        background: isSelected ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.05)',
                        color: isSelected ? '#ff9f43' : 'rgba(255,255,255,0.6)',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 600 : 500,
                        transition: 'all 0.2s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                        }
                      }}
                    >
                      {isSelected ? '✓ ' : ''}{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          
          {/* Selected Tags Summary */}
          {selectedTags.length > 0 && (
            <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid rgba(249,115,22,0.3)' }}>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.6rem' }}>Selected tags ({selectedTags.length}):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {selectedTags.map(tag => (
                  <div key={tag} style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '16px',
                    background: 'rgba(249,115,22,0.3)',
                    border: '1px solid rgba(249,115,22,0.4)',
                    color: '#ff9f43',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem'
                  }}>
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagToggle(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#ff9f43',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        padding: '0',
                        marginLeft: '0.2rem'
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Expenses Section */}
        <div className="form-group" style={{ background: 'rgba(147,197,253,0.08)', border: '1px solid rgba(147,197,253,0.2)', borderRadius: '12px', padding: '1.2rem' }}>
          <label className="form-label">Trip Budget & Expenses (Optional)</label>
          
          {/* Add Expense Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 50px', gap: '0.8rem', marginBottom: '0.8rem' }}>
            <input
              type="text"
              placeholder="e.g., Bus, Hotel, Food"
              value={newExpense.category}
              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
              className="form-input"
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
              className="form-input"
              step="0.01"
              min="0"
            />
            <button
              type="button"
              onClick={handleAddExpense}
              style={{
                padding: '0',
                background: 'linear-gradient(135deg, #f97316, #ea580c)',
                border: 'none',
                color: '#fff',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.2rem',
                fontWeight: 700,
                transition: 'opacity 0.2s'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
            >
              +
            </button>
          </div>

          {/* Expenses List */}
          {expenses.length > 0 ? (
            <div style={{ marginBottom: '0.8rem' }}>
              {expenses.map((expense) => (
                <div key={expense.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.8rem', borderRadius: '8px', marginBottom: '0.6rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div>
                    <div style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 600 }}>{expense.category}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Rs {expense.amount.toFixed(2)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExpense(expense.id)}
                    style={{
                      padding: '4px 10px',
                      background: 'rgba(239,68,68,0.2)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      color: '#fca5a5',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.3)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {/* Total Expense */}
              <div style={{ paddingTop: '0.8rem', borderTop: '1px solid rgba(255,213,128,0.2)', marginTop: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Total Expense:</span>
                <span style={{ fontSize: '1.3rem', fontWeight: 700, color: '#ffd580' }}>Rs {calculateTotalExpense().toFixed(2)}</span>
              </div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem', padding: '0.8rem 0' }}>No expenses added yet</div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Destination *</label>
          <select className="form-select" name="destination" value={formData.destination} onChange={handleChange} required>
            <option value="">Select a destination...</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}
          </select>
        </div>

        <div className="form-group form-grid">
          <div>
            <label className="form-label">Start Date *</label>
            <input className="form-input" type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">End Date *</label>
            <input className="form-input" type="date" name="end_date" value={formData.end_date} onChange={handleChange} min={formData.start_date} required />
            {formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date) && (
              <div style={{ color: '#ff6b6b', fontSize: '0.75rem', marginTop: '4px' }}>
                ⚠️ End date must be on or after start date
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <div className="toggle-row">
            <input type="checkbox" name="is_public" id="is_public" checked={formData.is_public} onChange={handleChange} />
            <label htmlFor="is_public" className="toggle-label">
              <strong><Globe size={13} style={{ display: "inline", marginRight: 5 }} />Make this trip public</strong>
              <span className="toggle-hint">Others can discover and join your trip. Uncheck to keep it invite-only.</span>
            </label>
            {formData.is_public ? <Globe size={16} style={{ color: "#86efac", flexShrink: 0 }} /> : <Lock size={16} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />}
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="form-submit" 
            disabled={loading || (formData.start_date && formData.end_date && new Date(formData.end_date) < new Date(formData.start_date))}
          >
            {loading ? <><Loader2 size={15} className="db-spinner" /> Creating...</> : "Create Trip"}
          </button>
          <button type="button" className="form-cancel" onClick={() => setActiveTab("myTrips")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}