import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../API/api";
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
} from "lucide-react";

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

  useEffect(() => {
    if (!user) { navigate("/"); return; }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    setLoading(true); setError("");
    try {
      const token = localStorage.getItem("access_token");
      console.log("Token present:", !!token);
      
      // Get user's UserProfile ID - use direct fetch since api.baseURL is /api/
      const meRes = await fetch("http://127.0.0.1:8000/users/api/me/", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userProfile = await meRes.json();
      const userId = userProfile?.id;
      setUserProfileId(userId); // Store for use in rendering
      
      const tripsRes = await api.get("trips/trips/");
      const allTrips = tripsRes.data || [];
      console.log("All trips:", allTrips);
      
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
    } finally { setLoading(false); }
  };

  const handleJoinTrip = async (tripId) => {
    try {
      console.log("Joining trip:", tripId);
      const res = await api.patch(`trips/trips/${tripId}/`, { action: "join" });
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
      const res = await api.patch(`trips/trips/${tripId}/`, { action: "leave" });
      console.log("Leave response:", res.data);
      fetchDashboardData(); 
      setError("");
    } catch (err) { 
      console.error("Leave trip error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to leave trip."); 
    }
  };

  const tabs = [
    { id: "myTrips",   label: "My Trips",      icon: <List size={14} /> },
    { id: "available", label: "Discover",       icon: <Compass size={14} /> },
    { id: "create",    label: "Create Trip",    icon: <PlusCircle size={14} /> },
  ];

  return (
    <>
      <style>{styles}</style>
      <div className="db-root">
        <div className="db-inner">

          {/* Header */}
          <div className="db-header">
            <h1 className="db-greeting">
              Welcome back, <span>{user?.first_name || user?.username}</span>
            </h1>
            <p className="db-subtext">Manage your trips and find your next travel companion</p>
          </div>

          {/* Stats */}
          <div className="db-stats">
            <StatCard icon={<PlusCircle size={18} />} label="Trips Created" value={stats.created} iconBg="rgba(255,213,128,0.12)" iconColor="#ffd580" />
            <StatCard icon={<Users size={18} />}      label="Groups Joined"  value={stats.joined}  iconBg="rgba(147,197,253,0.12)" iconColor="#93c5fd" />
            <StatCard icon={<Globe size={18} />}      label="Total Trips"    value={stats.total}   iconBg="rgba(134,239,172,0.12)" iconColor="#86efac" />
          </div>

          {/* Error */}
          {error && (
            <div className="db-error">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* Tabs */}
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

          {/* Content */}
          {loading ? (
            <div className="db-loading">
              <Loader2 size={32} className="db-spinner" />
              <span>Loading your dashboard...</span>
            </div>
          ) : (
            <>
              {activeTab === "myTrips" && (
                myTrips.length === 0
                  ? <EmptyState icon={<List size={28} />} title="No trips yet" subtitle="Create a new trip or discover public ones to join." action={() => setActiveTab("available")} buttonText="Discover Trips" />
                  : <div className="db-grid">
                      {myTrips.map(trip => (
                        <TripCard
                          key={trip.id} trip={trip}
                          isCreator={trip.creator?.id === userProfileId}
                          onJoin={() => handleJoinTrip(trip.id)}
                          onLeave={() => handleLeaveTrip(trip.id)}
                          onView={() => navigate(`/trip/${trip.id}`)}
                        />
                      ))}
                    </div>
              )}

              {activeTab === "available" && (
                availableTrips.length === 0
                  ? <EmptyState icon={<Compass size={28} />} title="No public trips available" subtitle="Be the first to create a trip." action={() => setActiveTab("create")} buttonText="Create Trip" />
                  : <>
                      <p className="discover-tip"><Globe size={13} /> Public trips others have opened up — join one to start traveling together</p>
                      <div className="db-grid">
                        {availableTrips.map(trip => {
                          // Check if user is already a participant in this trip
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
                            />
                          );
                        })}
                      </div>
                    </>
              )}

              {activeTab === "create" && (
                <CreateTripSection onTripCreated={() => { fetchDashboardData(); setActiveTab("myTrips"); }} />
              )}
            </>
          )}
        </div>
      </div>
    </>
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

function TripCard({ trip, isCreator, onJoin, onLeave, onView }) {
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
        <button className="btn btn-outline" onClick={onView}>
          View <ChevronRight size={13} />
        </button>
        {isCreator
          ? <button className="btn btn-dim">Your Trip</button>
          : onLeave
            ? <button className="btn btn-gold" onClick={onLeave}>Leave</button>
            : <button className="btn btn-primary" onClick={onJoin}>Join Trip</button>
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
    start_date: "", end_date: "", is_public: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cities, setCities] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("trips/cities/").then(r => setCities(r.data || [])).catch(console.error);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const submitData = {
        title: formData.title,
        description: formData.description,
        destination_id: parseInt(formData.destination), // ✅ Send as destination_id
        start_date: formData.start_date,
        end_date: formData.end_date,
        is_public: formData.is_public,
      };
      const res = await api.post("trips/trips/", submitData);
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