import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Edit3,
  MapPin,
  Users,
  Wallet,
  Gem,
  Sunrise,
  Mountain,
  Zap,
  Mail,
  Calendar,
  Home,
  Building2,
  Tent,
  Check,
  X,
  ChevronRight,
  Clock,
  Image,
} from "lucide-react";
import SuggestPeople from "../components/SuggestPeople";
import EditModal from "../components/EditModal";

// ─── helpers ────────────────────────────────────────────────────────────────
const API = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
const getApiUrl = () => {
  const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
  return backendUrl.replace('/api/', '');
};
const token = () => localStorage.getItem("access_token");
const avatar = (url) =>
  url ? (url.startsWith("http") ? url : `${getApiUrl()}${url}`) : null;

const TRAVEL_STYLES = ["Budget", "Luxury", "Adventure"];
const PACE_OPTIONS  = ["Relaxed", "Moderate", "Fast-paced"];
const ACCOMM        = ["Hostel", "Hotel", "Inn", "Camping"];

const FONTS = {
  display: "Playfair Display, Georgia, serif",
  body: "DM Sans, system-ui, sans-serif",
  mono: "DM Mono, monospace",
};

const COLORS = {
  gold: "#C9A84C",
  goldLight: "#e8c96d",
  goldDark: "#8b6914",
  emerald: "#4ade80",
  red: "#ff4444",
  amber: "#fbbf24",
};

const STAT_LABELS = {
  trips: "Trips",
  buddies: "Buddies",
  rating: "Rating",
};

const TAB_NAMES = ["overview", "preferences", "suggestions"];

const MODAL_BUTTONS = {
  cancel: "Cancel",
  save: "Save",
  saving: "Saving…",
};

const MODAL_TITLE = "Edit Profile";
const MODAL_LABELS = {
  firstName: "First Name",
  lastName: "Last Name",
  bio: "Bio",
  location: "Location",
  travelStyle: "Travel Style",
  pace: "Pace",
  accommodation: "Accommodation",
  preferenceTags: "Preferences",
  changePhoto: "Change photo",
};

const MODAL_PLACEHOLDERS = {
  firstName: "Jane",
  lastName: "Doe",
  bio: "Tell travellers about yourself…",
  location: "Kathmandu, Nepal",
};

const MODAL_MESSAGES = {
  noneSelected: "None selected",
  failedToSave: "Failed to save.",
  connectionError: "Could not connect to server.",
};

const FORM_LABELS = {
  style: "Style",
  pace: "Pace",
  stays: "Stays",
  travellerVibe: "Traveller Vibe",
  vibeScores: "Vibe Scores",
  budgetLabel: "Budget to Luxury",
  chillLabel: "Chill to Extreme",
  soloLabel: "Solo to Group",
  budgetLeft: "Budget",
  budgetRight: "Luxury",
  chillLeft: "Chill",
  chillRight: "Extreme",
  soloLeft: "Solo",
  soloRight: "Group",
  account: "Account",
  email: "Email",
  joined: "Joined",

  friends: "Friends",
};

const KYC_MESSAGES = {
  verified: "✓ Verified User",
  verifiedText: "Your identity is verified. You have full access to all features and can interact with trips, chat, and more.",
  rejected: "Verification Rejected",
  rejectedText: "Your KYC verification was rejected. Please submit again.",
  pending: "Verification Pending",
  pendingText: "Your KYC submission is under review by our admin team. You will be notified within 24-48 hours.",
  register: "Register for Full Access",
  registerText: "Verify your identity with KYC to unlock full access to all features.",
  resubmit: "Resubmit",
  viewStatus: "View Status",
  registerBtn: "Register",
};

const PREF_DEFAULTS = {
  notSet: "Not set",
};

const BUTTONS = {
  editProfile: "Edit profile",
  confirm: "Confirm",
  delete: "Delete",
};

const PROFILE_MESSAGES = {
  loadingError: "Could not load profile.",
  defaultName: "Traveller",
};

const EMPTY_STATES = {
  noFriends: "No friends yet",
  findBuddies: "Find travel buddies to connect",
};

const ERROR_BOUNDARY = {
  title: "Something went wrong",
  message: "Please try refreshing the page",
  refresh: "Refresh Page",
};

// ─── icon helpers ────────────────────────────────────────────────────────────
const StyleIcon = ({ style }) => {
  const map = { budget: [Wallet, "#C9A84C"], luxury: [Gem, "#ffffff"], adventure: [Mountain, "#C9A84C"] };
  const [Icon, color] = map[style] || [Wallet, "#444"];
  return <Icon style={{ color }} className="w-5 h-5" />;
};
const PaceIcon = ({ pace }) => {
  const map = { relaxed: [Sunrise, "#C9A84C"], moderate: [Zap, "#ffffff"], fast_paced: [Zap, "#C9A84C"] };
  const [Icon, color] = map[pace] || [Zap, "#444"];
  return <Icon style={{ color }} className="w-5 h-5" />;
};
const AccommIcon = ({ accomm }) => {
  const map = { hostel: [Building2, "#C9A84C"], hotel: [Building2, "#ffffff"], inn: [Home, "#C9A84C"], camping: [Tent, "#ffffff"] };
  const [Icon, color] = map[accomm] || [Home, "#444"];
  return <Icon style={{ color }} className="w-5 h-5" />;
};

// ─── vibe bar ────────────────────────────────────────────────────────────────
function VibeBar({ label, value, left, right }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex justify-between items-center">
        <span style={{ fontFamily: FONTS.body }} className="text-xs font-medium text-white/45">{label}</span>
        <span style={{ fontFamily: FONTS.mono }} className="text-xs text-[#C9A84C]">{value}/10</span>
      </div>
      <div className="h-[3px] w-full rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-[#8b6914] via-[#C9A84C] to-[#e8c96d] transition-all" style={{ width: `${value * 10}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-white/20" style={{ fontFamily: FONTS.body }}>
        <span>{left}</span><span>{right}</span>
      </div>
    </div>
  );
}

// ─── pref row ────────────────────────────────────────────────────────────────
function PrefRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/6 last:border-0">
      <span style={{ fontFamily: FONTS.body }} className="text-sm text-white/40">{label}</span>
      <span style={{ fontFamily: FONTS.body }} className="text-sm font-semibold text-white capitalize">
        {value || <span className="text-white/20 font-normal">Not set</span>}
      </span>
    </div>
  );
}

// ─── main profile page ───────────────────────────────────
function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [friends, setFriends] = useState([]);
  const [joinedTrips, setJoinedTrips] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [userPhotos, setUserPhotos] = useState([]);
  const [photosLoading, setPhotosLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}users/me/`, { headers: { Authorization: `Bearer ${token()}` } })
      .then(r => r.json()).then(d => { setProfile(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const fetchFriends = () => {
      fetch(`${API}users/friends/`, { headers: { Authorization: `Bearer ${token()}` } })
        .then(r => r.json()).then(d => setFriends(d.friends || []))
        .catch(() => setFriends([]));
    };
    fetchFriends();
    const i2 = setInterval(fetchFriends, 5000);
    return () => clearInterval(i2);
  }, []);

  useEffect(() => {
    const fetchJoinedTrips = () => {
      fetch(`${API}trips/`, { headers: { Authorization: `Bearer ${token()}` } })
        .then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json();
        })
        .then(d => {
          // Filter for completed trips where current user is a member (joined) or creator
          const myTrips = (d.results || d || []).filter(trip => {
            const isParticipant = trip.participants?.some(p => p.id === profile?.id) || trip.creator?.id === profile?.id;
            return isParticipant && trip.is_completed;
          });
          setJoinedTrips(myTrips);
        })
        .catch(err => {
          console.log("Could not fetch trips:", err.message);
          setJoinedTrips([]);
        });
    };
    if (profile?.id) {
      fetchJoinedTrips();
      // Refresh completed trips every 30 seconds to catch newly completed trips
      const interval = setInterval(fetchJoinedTrips, 30000);
      return () => clearInterval(interval);
    }
  }, [profile?.id]);

  useEffect(() => {
    const fetchUserPhotos = async () => {
      setPhotosLoading(true);
      try {
        const res = await fetch(`${API}trips/`, { headers: { Authorization: `Bearer ${token()}` } });
        const trips = await res.json();
        const tripsList = Array.isArray(trips) ? trips : trips.results || [];
        
        const photos = [];
        for (const trip of tripsList) {
          if (new Date(trip.end_date) < new Date()) {
            try {
              const photoRes = await fetch(`${API}trips/${trip.id}/photos/`, {
                headers: { Authorization: `Bearer ${token()}` }
              });
              if (photoRes.ok) {
                const photoData = await photoRes.json();
                const tripPhotos = Array.isArray(photoData) ? photoData : photoData.results || [];
                tripPhotos.forEach(photo => {
                  photos.push({ ...photo, trip });
                });
              }
            } catch (e) {
              console.error(`Failed to fetch photos for trip ${trip.id}:`, e);
            }
          }
        }
        setUserPhotos(photos.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      } catch (err) {
        console.error("Failed to fetch user photos:", err);
      } finally {
        setPhotosLoading(false);
      }
    };
    if (profile) fetchUserPhotos();
  }, [profile]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808]">
      <div className="h-8 w-8 animate-spin rounded-full border-[1.5px] border-white/10 border-t-[#C9A84C]" />
    </div>
  );
  if (!profile) return (
    <div className="flex min-h-screen items-center justify-center bg-[#080808] text-white/30" style={{ fontFamily: FONTS.body }}>
      {PROFILE_MESSAGES.loadingError}
    </div>
  );

  const pic = avatar(profile.profile_picture);
  const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(" ") || profile.username || PROFILE_MESSAGES.defaultName;
  const initial  = fullName[0]?.toUpperCase() || "T";
  const handle   = profile.username || profile.email?.split("@")[0];

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-[#080808] text-white">

        {/* ── Cover banner ── */}
        <div className="relative h-52 w-full bg-[#0c0c0c] overflow-hidden">
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse 70% 100% at 15% 50%, rgba(201,168,76,0.07) 0%, transparent 65%), radial-gradient(ellipse 50% 80% at 85% 60%, rgba(201,168,76,0.04) 0%, transparent 60%)" }} />
          {/* subtle cross-hatch */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="ch" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#C9A84C" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#ch)" />
          </svg>
          {/* bottom fade into page bg */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080808] to-transparent" />
        </div>

        {/* ── Content (two-column layout) ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
            {/* Main content (left: 2 cols) */}
            <div className="lg:col-span-2">
              
              {/* Avatar + actions row */}
          <div className="flex items-end justify-between -mt-[52px] mb-4">
            {/* Avatar with gold ring */}
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-[2.5px] rounded-full"
                style={{ background: "linear-gradient(135deg, #C9A84C 0%, #e8c96d 40%, #8b6914 100%)" }} />
              <div className="relative h-[100px] w-[100px] rounded-full overflow-hidden bg-[#111] border-[3px] border-[#080808]">
                {pic
                  ? <img src={pic} alt={fullName} className="h-full w-full object-cover" onError={e => e.target.style.display = "none"} />
                  : <span className="flex h-full items-center justify-center text-4xl font-bold text-[#C9A84C]"
                      style={{ fontFamily: FONTS.display }}>{initial}</span>
                }
              </div>
              <span className="absolute bottom-2 right-2 h-3.5 w-3.5 rounded-full bg-emerald-400 border-2 border-[#080808]" />
            </div>

            {/* Edit button */}
            <button 
              onClick={() => {
                setEditing(true);
              }}
              style={{ fontFamily: FONTS.body }}
              className="mb-1 rounded-xl border border-white/12 bg-white/5 px-5 py-2 text-[13px] font-semibold text-white hover:bg-white/10 hover:border-white/20 transition flex items-center gap-2">
              <Edit3 className="w-3.5 h-3.5" /> {BUTTONS.editProfile}
            </button>
          </div>

          {/* Name / handle / bio */}
          <div className="mb-5">
            <h1 className="text-[22px] font-bold text-white leading-tight" style={{ fontFamily: FONTS.display }}>{fullName}</h1>
            <p className="text-sm text-[#C9A84C]/60 mt-0.5" style={{ fontFamily: FONTS.mono }}>@{handle}</p>
            {profile.location && (
              <p className="flex items-center gap-1.5 text-sm text-white/35 mt-1.5" style={{ fontFamily: FONTS.body }}>
                <MapPin className="w-3.5 h-3.5 text-[#C9A84C]/50" />{profile.location}
              </p>
            )}
            {profile.bio && (
              <p className="mt-3 text-sm text-white/55 leading-relaxed" style={{ fontFamily: FONTS.body }}>{profile.bio}</p>
            )}
          </div>

          {/* ── Stats (Instagram-style 3-col) ── */}
          <div className="flex border-y border-white/8 mb-6">
            {[
              { value: joinedTrips.length,                                  label: STAT_LABELS.trips   },
              { value: friends.length,                                      label: STAT_LABELS.buddies },
              { value: profile.rating ? profile.rating.toFixed(1) : "—",   label: STAT_LABELS.rating  },
            ].map(({ value, label }, i) => (
              <div key={label} className={`flex-1 flex flex-col items-center py-4 gap-0.5 ${i < 2 ? "border-r border-white/8" : ""}`}>
                <span className="text-[22px] font-bold text-white" style={{ fontFamily: FONTS.display }}>{value}</span>
                <span className="text-[10px] uppercase tracking-[0.15em] text-white/30" style={{ fontFamily: FONTS.body }}>{label}</span>
              </div>
            ))}
          </div>

          {/* ── Tabs ── */}
          <div className="flex border-b border-white/8 mb-6 -mx-1">
            {TAB_NAMES.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ fontFamily: FONTS.body }}
                className={`flex-1 py-3 text-[11px] font-semibold uppercase tracking-[0.15em] transition-all ${
                  activeTab === tab
                    ? "text-[#C9A84C] border-b-2 border-[#C9A84C] -mb-px"
                    : "text-white/28 hover:text-white/50"
                }`}>
                {tab}
              </button>
            ))}
          </div>

          {/* ── Overview tab ── */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4 pb-20">
              {/* Trip Photos Gallery */}
              {userPhotos.length > 0 && (
                <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
                  <p style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 px-5 pt-4 pb-3 flex items-center gap-2">
                    <Image className="w-4 h-4" />
                    Trip Photos
                  </p>
                  <div className="px-5 pb-5 space-y-4">
                    {userPhotos.map((photo) => (
                      <div key={photo.id} className="rounded-lg overflow-hidden border border-white/8 bg-white/2 hover:border-[#C9A84C]/30 transition cursor-pointer group">
                        {/* Photo */}
                        <div className="relative aspect-video overflow-hidden bg-black/20">
                          <img
                            src={photo.image}
                            alt={photo.caption || "trip photo"}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        {/* Trip Info */}
                        <div className="p-3 space-y-2">
                          {photo.caption && (
                            <p style={{ fontFamily: FONTS.body }} className="text-sm text-white/80">
                              {photo.caption}
                            </p>
                          )}
                          {photo.trip && (
                            <Link
                              to={`/trip/${photo.trip.id}`}
                              style={{ fontFamily: FONTS.body }}
                              className="text-xs font-semibold text-[#C9A84C] hover:text-[#e8c96d] transition flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" />
                              {photo.trip.destination?.name || "Trip"} • {new Date(photo.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {/* Account */}
              <div className="rounded-2xl bg-white/3 border border-white/8 overflow-hidden">
                <p style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 px-5 pt-4 pb-2">{FORM_LABELS.account}</p>
                <div className="px-5 pb-2">
                  {[
                    { icon: <Mail className="w-4 h-4 text-[#C9A84C]/50" />, label: FORM_LABELS.email, value: profile.email },
                    { icon: <Calendar className="w-4 h-4 text-[#C9A84C]/50" />, label: FORM_LABELS.joined, value: profile.date_joined ? new Date(profile.date_joined).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "—" },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 py-3 border-b border-white/6 last:border-0">
                      {icon}
                      <div className="flex-1 min-w-0">
                        <p style={{ fontFamily: FONTS.body }} className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/25 mb-0.5">{label}</p>
                        <p style={{ fontFamily: FONTS.body }} className="text-sm text-white/60 truncate">{value || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Register for Full Access - KYC */}
              <div className={`rounded-2xl border-2 p-5 overflow-hidden transition-all ${
                profile.status === 'approved'
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : profile.status === 'rejected'
                  ? 'bg-red-500/10 border-red-500/30'
                  : profile.status === 'pending'
                  ? 'bg-amber-500/10 border-amber-500/30'
                  : 'bg-[#C9A84C]/8 border-[#C9A84C]/30 hover:border-[#C9A84C]/50'
              }`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {profile.status === 'approved' ? (
                        <>
                          <Check className="w-5 h-5 text-emerald-400" />
                          <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold text-emerald-300">{KYC_MESSAGES.verified}</p>
                        </>
                      ) : profile.status === 'rejected' ? (
                        <>
                          <X className="w-5 h-5 text-red-400" />
                          <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold text-red-300">{KYC_MESSAGES.rejected}</p>
                        </>
                      ) : profile.status === 'pending' ? (
                        <>
                          <Clock className="w-5 h-5 text-amber-400" />
                          <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold text-amber-300">{KYC_MESSAGES.pending}</p>
                        </>
                      ) : (
                        <>
                          <Gem className="w-5 h-5 text-[#C9A84C]" />
                          <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold text-[#C9A84C]">{KYC_MESSAGES.register}</p>
                        </>
                      )}
                    </div>
                    <p style={{ fontFamily: FONTS.body }} className={`text-[12px] ${
                      profile.status === 'approved'
                        ? 'text-emerald-200/70'
                        : profile.status === 'rejected'
                        ? 'text-red-200/70'
                        : profile.status === 'pending'
                        ? 'text-amber-200/70'
                        : 'text-white/50'
                    }`}>
                      {profile.status === 'approved'
                        ? KYC_MESSAGES.verifiedText
                        : profile.status === 'rejected'
                        ? profile.rejection_reason ? `Rejected: ${profile.rejection_reason}. ${KYC_MESSAGES.rejectedText.split('. ')[1]}` : KYC_MESSAGES.rejectedText
                        : profile.status === 'pending'
                        ? KYC_MESSAGES.pendingText
                        : KYC_MESSAGES.registerText}
                    </p>
                  </div>
                  {profile.status !== 'approved' && (
                    <Link to="/kyc" style={{ fontFamily: FONTS.body }}
                      className="px-4 py-2 rounded-xl bg-[#C9A84C] text-black font-semibold text-xs hover:bg-[#e8c96d] transition flex-shrink-0 flex items-center gap-1">
                      {profile.status === 'rejected' ? KYC_MESSAGES.resubmit : profile.status === 'pending' ? KYC_MESSAGES.viewStatus : KYC_MESSAGES.registerBtn} <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "suggestions" && (
            <div className="pb-20">
              <SuggestPeople currentUserId={profile.id} />
            </div>
          )}
          {activeTab === "preferences" && (
            <div className="flex flex-col gap-4 pb-20">
              <div className="rounded-2xl bg-white/3 border border-white/8 px-5">
                <PrefRow label={FORM_LABELS.style}  value={profile.travel_style} />
                <PrefRow label={FORM_LABELS.pace}          value={profile.pace?.replace("_", "-")} />
                <PrefRow label={FORM_LABELS.accommodation} value={profile.accommodation_preference} />
              </div>

              <div className="rounded-2xl bg-white/3 border border-white/8 p-5">
                <p style={{ fontFamily: FONTS.body }} className="text-[11px] font-semibold uppercase tracking-[0.15em] text-white/30 mb-5">{FORM_LABELS.vibeScores}</p>
                <div className="flex flex-col gap-5">
                  <VibeBar label={FORM_LABELS.budgetLabel}  value={profile.budget_level    ?? 5} left={FORM_LABELS.budgetLeft} right={FORM_LABELS.budgetRight}  />
                  <VibeBar label={FORM_LABELS.chillLabel}  value={profile.adventure_level ?? 5} left={FORM_LABELS.chillLeft}  right={FORM_LABELS.chillRight} />
                  <VibeBar label={FORM_LABELS.soloLabel}     value={profile.social_level    ?? 5} left={FORM_LABELS.soloLeft}   right={FORM_LABELS.soloRight}   />
                </div>
              </div>
            </div>
          )}
            </div>

            {/* Friends sidebar (right: 1 col) */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 rounded-2xl bg-white/3 border border-white/8 p-5">
                <div className="flex items-center justify-between mb-4">
                  <p style={{ fontFamily: FONTS.body }} className="text-[13px] font-semibold uppercase tracking-[0.15em] text-white/30">
                    {FORM_LABELS.friends} {friends.length > 0 && <span className="text-[#C9A84C]">({friends.length})</span>}
                  </p>
                </div>

                {friends.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {friends.map(friend => {
                      const name = friend.first_name && friend.last_name
                        ? `${friend.first_name} ${friend.last_name}` : friend.username;
                      const friendAvatar = avatar(friend.profile_picture);
                      return (
                        <Link key={friend.id} to={`/user/${friend.username}`}
                          className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition no-underline group">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-[#1a1a1a] border border-white/8 flex items-center justify-center">
                            {friendAvatar
                              ? <img src={friendAvatar} alt={friend.username} className="h-full w-full object-cover" onError={e => e.target.style.display = "none"} />
                              : <span className="text-sm font-bold text-[#C9A84C]" style={{ fontFamily: FONTS.display }}>{friend.username[0].toUpperCase()}</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p style={{ fontFamily: FONTS.body }} className="text-xs font-semibold text-white truncate group-hover:text-[#C9A84C] transition">{name}</p>
                            <p style={{ fontFamily: FONTS.mono }} className="text-[10px] text-white/25 truncate">@{friend.username}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <div className="h-12 w-12 rounded-full bg-white/4 flex items-center justify-center">
                      <Users className="w-5 h-5 text-white/15" />
                    </div>
                    <p style={{ fontFamily: FONTS.body }} className="text-xs text-white/25 text-center">{EMPTY_STATES.noFriends}</p>
                    <p style={{ fontFamily: FONTS.body }} className="text-[10px] text-white/15 text-center">{EMPTY_STATES.findBuddies}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {editing && (
          <EditModal 
            profile={profile} 
            onClose={() => {
              setEditing(false);
            }}
            onSaved={updated => {
              setProfile(p => ({ ...p, ...updated }));
            }} 
          />
        )}
      </div>
    </>
  );
}

// Error boundary wrapper
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Profile error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[#080808] text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">{ERROR_BOUNDARY.title}</h1>
            <p className="text-white/60 mb-6">{ERROR_BOUNDARY.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 rounded-lg bg-[#C9A84C] text-black font-semibold hover:bg-[#e8c96d] transition"
            >
              {ERROR_BOUNDARY.refresh}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export with error boundary
export default function ProfilePageWithErrorBoundary() {
  return (
    <ErrorBoundary>
      <ProfilePage />
    </ErrorBoundary>
  );
}