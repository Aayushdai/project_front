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
  const [stats, setStats] = useState({ created: 0, joined: 0, total: 0 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("myTrips");
  const [userProfileId, setUserProfileId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPageMyTrips, setCurrentPageMyTrips] = useState(1);
  const [currentPageAvailable, setCurrentPageAvailable] = useState(1);
  const [userProfile, setUserProfile] = useState(null);
  const [kycLoading, setKycLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);
  const [constraintTags, setConstraintTags] = useState([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  const itemsPerPage = 6;

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    fetchDashboardData();
  }, [user, navigate]);

  useEffect(() => {
    api.get("users/constraint-tags/")
      .then(r => setConstraintTags(r.data || []))
      .catch(console.error);
  }, []);

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
      
      // Fetch trip history
      const historyRes = await api.get("trips/history/");
      const history = historyRes.data || [];
      console.log("Trip history:", history);
      
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
      const publicTrips = allTrips.filter(t =>
        t.is_public && !combined.some(mt => mt.id === t.id)
      );
      
      console.log("User trips created:", userTripsCreated);
      console.log("User trips joined:", userTripsJoined);
      console.log("Combined:", combined);
      console.log("Public trips:", publicTrips);
      
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

  const tabs = [
    { id: "myTrips",   label: "My Trips",      icon: <List size={14} /> },
    { id: "available", label: "Discover",       icon: <Compass size={14} /> },
    { id: "history",   label: "Trip History",   icon: <Clock size={14} /> },
    { id: "create",    label: "Create Trip",    icon: <PlusCircle size={14} /> },
  ];

  // Filter trips based on search query
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
    if (selectedTags.length > 0) {
      result = result.filter(t => {
        const tripTagIds = (t.constraint_tags || []).map(tag => tag.id);
        return selectedTags.some(tagId => tripTagIds.includes(tagId));
      });
    }
    
    return result;
  };

  // Get filtered and paginated trips for "My Trips"
  const filteredMyTrips = filterTrips(myTrips);
  const totalMyTripPages = Math.ceil(filteredMyTrips.length / itemsPerPage);
  const paginatedMyTrips = filteredMyTrips.slice(
    (currentPageMyTrips - 1) * itemsPerPage,
    currentPageMyTrips * itemsPerPage
  );

  // Get filtered and paginated trips for "Available"
  const filteredAvailableTrips = filterTrips(availableTrips);
  const totalAvailablePages = Math.ceil(filteredAvailableTrips.length / itemsPerPage);
  const paginatedAvailableTrips = filteredAvailableTrips.slice(
    (currentPageAvailable - 1) * itemsPerPage,
    currentPageAvailable * itemsPerPage
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
              {/* Search Bar (visible on myTrips and available tabs) */}
              {(activeTab === "myTrips" || activeTab === "available") && (
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
                        setSearchQuery(e.target.value);
                        setCurrentPageMyTrips(1);
                        setCurrentPageAvailable(1);
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

              {/* Constraint Tags Filter - Click Only */}
              {(activeTab === "myTrips" || activeTab === "available") && constraintTags.length > 0 && (
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
                    🏷️ Filter by Requirements {selectedTags.length > 0 && `(${selectedTags.length})`}
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
                      minWidth: '300px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
                    }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                        {constraintTags.map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => {
                              setSelectedTags(prev => {
                                if (prev.includes(tag.id)) {
                                  return prev.filter(id => id !== tag.id);
                                }
                                // Remove any conflicting tags
                                const filteredTags = prev.filter(id => {
                                  const otherTag = constraintTags.find(t => t.id === id);
                                  if (!otherTag) return true;
                                  
                                  const n1 = tag.name.toLowerCase();
                                  const n2 = otherTag.name.toLowerCase();
                                  const c1 = tag.category;
                                  const c2 = otherTag.category;
                                  
                                  // Age ranges conflict
                                  if (c1 === 'age_range' && c2 === 'age_range') return false;
                                  
                                  // Diet conflicts
                                  if (c1 === 'diet' && c2 === 'diet') {
                                    const dietConflicts = [
                                      ['vegetarian', 'non-vegetarian'],
                                      ['vegan', 'non-vegan'],
                                      ['halal', 'non-halal'],
                                      ['kosher', 'non-kosher'],
                                      ['gluten-free', 'gluten']
                                    ];
                                    for (let [a, b] of dietConflicts) {
                                      if ((n1.includes(a) && n2.includes(b)) || (n1.includes(b) && n2.includes(a))) {
                                        return false;
                                      }
                                    }
                                  }
                                  
                                  // Lifestyle conflicts
                                  if (c1 === 'lifestyle' && c2 === 'lifestyle') {
                                    const lifestyleConflicts = [
                                      ['smoker', 'non-smoker'],
                                      ['drinker', 'non-drinker'],
                                      ['drinks alcohol', 'non-drinker'],
                                      ['early riser', 'night owl'],
                                      ['party person', 'quiet & homebody'],
                                      ['party person', 'quiet']
                                    ];
                                    for (let [a, b] of lifestyleConflicts) {
                                      if ((n1.includes(a) && n2.includes(b)) || (n1.includes(b) && n2.includes(a))) {
                                        return false;
                                      }
                                    }
                                  }
                                  
                                  // Values conflicts
                                  if (c1 === 'values' && c2 === 'values') {
                                    const valuesConflicts = [
                                      ['introvert', 'extrovert'],
                                      ['social butterfly', 'quiet traveler'],
                                      ['budget conscious', 'luxury lover'],
                                      ['eco-conscious', 'luxury lover'],
                                      ['minimalist', 'luxury lover']
                                    ];
                                    for (let [a, b] of valuesConflicts) {
                                      if ((n1.includes(a) && n2.includes(b)) || (n1.includes(b) && n2.includes(a))) {
                                        return false;
                                      }
                                    }
                                  }
                                  
                                  return true;
                                });
                                return [...filteredTags, tag.id];
                              });
                              setCurrentPageMyTrips(1);
                              setCurrentPageAvailable(1);
                            }}
                            style={{
                              padding: '0.5rem 0.8rem',
                              borderRadius: '6px',
                              border: `1px solid ${selectedTags.includes(tag.id) ? 'rgba(201,168,76,0.6)' : 'rgba(255,255,255,0.2)'}`,
                              background: selectedTags.includes(tag.id) ? 'rgba(201,168,76,0.2)' : 'rgba(255,255,255,0.05)',
                              color: selectedTags.includes(tag.id) ? '#ffd580' : 'rgba(255,255,255,0.6)',
                              cursor: 'pointer',
                              fontSize: '0.8rem',
                              fontWeight: 500,
                              transition: 'all 0.2s',
                              fontFamily: 'Poppins'
                            }}
                          >
                            {tag.name}
                          </button>
                        ))}
                      </div>
                      {selectedTags.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedTags([]);
                            setCurrentPageMyTrips(1);
                            setCurrentPageAvailable(1);
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
                  {filteredAvailableTrips.length === 0
                    ? <EmptyState icon={<Compass size={28} />} title={searchQuery ? "No trips found" : "No public trips available"} subtitle={searchQuery ? "Try a different search" : "Be the first to create a trip."} action={() => searchQuery ? setSearchQuery("") : setActiveTab("create")} buttonText={searchQuery ? "Clear Search" : "Create Trip"} />
                    : <>
                        <p className="discover-tip"><Globe size={13} /> Public trips others have opened up — join one to start traveling together</p>
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

              {activeTab === "create" && (
                <CreateTripSection onTripCreated={() => { fetchDashboardData(); setActiveTab("myTrips"); }} />
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

function CreateTripSection({ onTripCreated }) {
  const [formData, setFormData] = useState({
    title: "", description: "", destination: "",
    start_date: "", end_date: "", is_public: true, constraint_tags: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const [constraintTags, setConstraintTags] = useState({
    diet: [], lifestyle: [], values: [], age_range: []
  });
  const navigate = useNavigate();

  useEffect(() => {
    api.get("trips/cities/").then(r => setCities(r.data || [])).catch(console.error);
    api.get("users/constraint-tags/").then(r => {
      const grouped = { diet: [], lifestyle: [], values: [], age_range: [] };
      (r.data || []).forEach(tag => {
        if (grouped[tag.category]) grouped[tag.category].push(tag);
      });
      setConstraintTags(grouped);
    }).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Helper: Check if two tags conflict (mutually exclusive pairs)
  const tagsConflict = (tagId1, tagId2) => {
    let tag1, tag2;
    Object.keys(constraintTags).forEach(cat => {
      if (constraintTags[cat].find(t => t.id === tagId1)) tag1 = constraintTags[cat].find(t => t.id === tagId1);
      if (constraintTags[cat].find(t => t.id === tagId2)) tag2 = constraintTags[cat].find(t => t.id === tagId2);
    });
    if (!tag1 || !tag2) return false;
    
    const n1 = tag1.name.toLowerCase();
    const n2 = tag2.name.toLowerCase();
    const c1 = tag1.category;
    const c2 = tag2.category;
    
    // Age ranges conflict with each other
    if (c1 === 'age_range' && c2 === 'age_range') return true;
    
    // Same category diet conflicts
    if (c1 === 'diet' && c2 === 'diet') {
      const dietConflicts = [
        ['vegetarian', 'non-vegetarian'],
        ['vegan', 'non-vegan'],
        ['halal', 'non-halal'],
        ['kosher', 'non-kosher'],
        ['gluten-free', 'gluten']
      ];
      for (let [a, b] of dietConflicts) {
        if ((n1.includes(a) && n2.includes(b)) || (n1.includes(b) && n2.includes(a))) {
          return true;
        }
      }
    }
    
    // Lifestyle - smoking/drinking/time/social conflicts
    if (c1 === 'lifestyle' && c2 === 'lifestyle') {
      const lifestyleConflicts = [
        ['smoker', 'non-smoker'],
        ['drinker', 'non-drinker'],
        ['drinks alcohol', 'non-drinker'],
        ['early riser', 'night owl'],
        ['party person', 'quiet & homebody'],
        ['party person', 'quiet']
      ];
      for (let [a, b] of lifestyleConflicts) {
        if ((n1.includes(a) && n2.includes(b)) || (n1.includes(b) && n2.includes(a))) {
          return true;
        }
      }
    }
    
    // Values - personality/social/budget conflicts
    if (c1 === 'values' && c2 === 'values') {
      const valuesConflicts = [
        ['introvert', 'extrovert'],
        ['social butterfly', 'quiet traveler'],
        ['budget conscious', 'luxury lover'],
        ['eco-conscious', 'luxury lover'],
        ['minimalist', 'luxury lover']
      ];
      for (let [a, b] of valuesConflicts) {
        if ((n1.includes(a) && n2.includes(b)) || (n1.includes(b) && n2.includes(a))) {
          return true;
        }
      }
    }
    
    return false;
  };

  const handleTagToggle = (tagId) => {
    setFormData(prev => {
      if (prev.constraint_tags.includes(tagId)) {
        return { ...prev, constraint_tags: prev.constraint_tags.filter(id => id !== tagId) };
      }
      
      // Remove any conflicting tags
      const filteredTags = prev.constraint_tags.filter(id => !tagsConflict(id, tagId));
      return { ...prev, constraint_tags: [...filteredTags, tagId] };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        destination_id: parseInt(formData.destination),
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_public: formData.is_public,
        constraint_tag_ids: formData.constraint_tags,
      };
      console.log('Submitting trip with tags:', formData.constraint_tags);
      const res = await api.post("trips/", submitData);
      if (res.status === 201) onTripCreated();
    } catch (err) {
      console.error("Trip creation error:", err);
      setError(err.response?.data?.detail || "Failed to create trip.");
    } finally { setLoading(false); }
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

        <div className="form-group">
          <label className="form-label">Destination *</label>
          <select className="form-select" name="destination" value={formData.destination} onChange={handleChange} required>
            <option value="">Select a destination...</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}, {c.country}</option>)}
          </select>
        </div>

        {/* Constraint Tags Section */}
        <div className="form-group">
          <label className="form-label">Trip Requirements (Absolute Tags)</label>
          <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Select tags that describe mandatory requirements for this trip</p>
          
          {['diet', 'lifestyle', 'values'].map(category => (
            constraintTags[category].length > 0 && (
              <div key={category} style={{ marginBottom: '1.2rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.6rem', textTransform: 'capitalize' }}>
                  {category}:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                  {constraintTags[category].map(tag => (
                    <label key={tag.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.6rem 1rem', borderRadius: '8px',
                      background: formData.constraint_tags.includes(tag.id) 
                        ? 'rgba(201,168,76,0.2)' 
                        : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${formData.constraint_tags.includes(tag.id) 
                        ? 'rgba(201,168,76,0.4)' 
                        : 'rgba(255,255,255,0.1)'}`,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.constraint_tags.includes(tag.id)}
                        onChange={() => handleTagToggle(tag.id)}
                        style={{ cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '0.9rem', color: formData.constraint_tags.includes(tag.id) ? '#ffd580' : 'rgba(255,255,255,0.7)' }}>
                        {tag.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )
          ))}
        </div>

        <div className="form-group form-grid">
          <div>
            <label className="form-label">Start Date *</label>
            <input className="form-input" type="date" name="start_date" value={formData.start_date} onChange={handleChange} required />
          </div>
          <div>
            <label className="form-label">End Date *</label>
            <input className="form-input" type="date" name="end_date" value={formData.end_date} onChange={handleChange} required />
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
          <button type="submit" className="form-submit" disabled={loading}>
            {loading ? <><Loader2 size={15} className="db-spinner" /> Creating...</> : "Create Trip"}
          </button>
          <button type="button" className="form-cancel" onClick={() => navigate("/dashboard")}>Cancel</button>
        </div>
      </form>
    </div>
  );
}