import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import {
  ArrowLeft, MapPin, Calendar, Users, User2, Trash2, Send,
  Loader2, DollarSign, Tag, MessageCircle, Share2, Star,
  ChevronDown, ChevronUp, Lock, Globe, Smile
} from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import TripInviteModal from "../components/TripInviteModal";

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg:         "#07080f",
  surface:    "#0d0f1c",
  card:       "#0f1220",
  border:     "#1a1d2e",
  borderHi:   "#252840",
  gold:       "#c8b882",
  goldDim:    "#8a7040",
  goldBg:     "rgba(200,184,130,0.08)",
  goldRing:   "rgba(200,184,130,0.25)",
  text:       "#f0ece0",
  textSub:    "#8a8890",
  textMuted:  "#4a4a60",
  red:        "#c05050",
  redBg:      "rgba(192,80,80,0.1)",
  green:      "#50a878",
  greenBg:    "rgba(80,168,120,0.1)",
  blue:       "#5588cc",
  blueBg:     "rgba(85,136,204,0.1)",
};

const CHART_COLORS = ["#c8b882","#5588cc","#50a878","#c05050","#9b88cc","#cc8855","#55a8cc","#cc5588"];

const TEXTS = {
  loadingTrip: "Loading trip…",
  tripNotFound: "Trip not found",
  backToDashboard: "Back to Dashboard",
  destinationTbd: "Destination TBD",
  participants: "participants",
  noDescription: "No description provided.",
  publicTrip: "Public",
  privateTrip: "Private",
  deleteTrip: "Delete",
  deleting: "Deleting…",
  deleteConfirm: "Delete this trip permanently?",
  deleteError: "Failed to delete trip",
  itinerary: "Itinerary",
  day: "Day",
  participantsTitle: "Participants",
  noParticipants: "No participants yet",
  chatTitle: "Group Chat",
  noMessages: "No messages yet. Say hello!",
  unknownUser: "Unknown",
  kycApprovalRequired: "KYC approval required to send messages",
  failedToSendMessage: "Failed to send message",
  errorSendingMessage: "Error sending message. Please try again.",
  failedToLoadTrip: "Failed to load trip details",
};

// ─── Small helpers ───────────────────────────────────────────────────────────
const fmt = (d) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const fmtTime = (d) => new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

function Avatar({ name = "?", size = 36, style = {} }) {
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      background: `linear-gradient(135deg, ${C.gold}, ${C.goldDim})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.36, fontWeight: 600, color: "#0d0f1c",
      letterSpacing: "-0.5px", ...style
    }}>{initials}</div>
  );
}

function Badge({ children, color = C.gold, bg }) {
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500,
      color, border: `1px solid ${color}40`,
      background: bg || `${color}14`, letterSpacing: "0.2px",
    }}>{children}</span>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
      <span style={{ width: 3, height: 18, borderRadius: 2, background: C.gold, flexShrink: 0 }} />
      <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text, letterSpacing: "-0.2px" }}>{children}</h2>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [userProfileId, setUserProfileId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [itineraryOpen, setItineraryOpen] = useState(true);

  // Chat
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const isTripCompleted = trip && new Date(trip.end_date) < new Date();
  const isCreator = trip && userProfileId && trip.creator?.id === userProfileId;
  const hasOnlyCreator = trip && trip.participants?.length === 1;
  const canDelete = isCreator && hasOnlyCreator;
  const isParticipant = trip && userProfileId && (
    trip.participants?.some(p => p.id === userProfileId) || trip.creator?.id === userProfileId
  );

  const fetchMessages = useCallback(async () => {
    try {
      setChatLoading(true);
      const res = await fetch(`http://127.0.0.1:8000/api/chat/messages/group_messages/?trip_id=${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.results || data);
        setMessages(list);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    } finally {
      setChatLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch("http://127.0.0.1:8000/api/users/me/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        const userProfile = await meRes.json();
        setUserProfileId(userProfile?.id);

        const res = await API.get(`trips/${id}/`);
        setTrip(res.data);

        try {
          const reviewsRes = await API.get(`trips/${id}/reviews/`);
          setReviews(reviewsRes.data);
        } catch { setReviews([]); }

        fetchMessages();
      } catch (err) {
        console.error(err);
        setError(TEXTS.failedToLoadTrip);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, fetchMessages]);

  useEffect(() => {
    if (!id) return;
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [id, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sendingMessage) return;
    setSendingMessage(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat/messages/", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ content: messageInput.trim(), trip_id: parseInt(id) })
      });
      if (res.ok) {
        await fetchMessages();
        setMessageInput("");
      } else {
        const errData = await res.json();
        if (errData.error?.includes("KYC")) alert(TEXTS.kycApprovalRequired);
        else alert(errData.error || TEXTS.failedToSendMessage);
      }
    } catch { alert(TEXTS.errorSendingMessage); }
    finally { setSendingMessage(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(TEXTS.deleteConfirm)) return;
    setDeleting(true);
    try {
      await API.delete(`trips/trips/${id}/`);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || TEXTS.deleteError);
      setDeleting(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!isTripCompleted || !isParticipant || !reviewText.trim()) return;
    setSubmittingReview(true);
    try {
      const response = await API.post(`http://127.0.0.1:8000/api/trips/${id}/reviews/`, {
        rating: reviewRating, text: reviewText.trim()
      });
      if (response.status === 201) {
        setReviews([...reviews, response.data]);
        setReviewText(""); setReviewRating(5);
      }
    } catch (err) { alert("Failed to submit review: " + (err.response?.data?.detail || err.message)); }
    finally { setSubmittingReview(false); }
  };

  // ─── Group messages by sender + time proximity ───────────────────────────
  const groupedMessages = messages.reduce((acc, msg, idx) => {
    const prev = messages[idx - 1];
    const sameUser = prev && prev.sender_name === msg.sender_name;
    const closeTime = prev && (new Date(msg.timestamp) - new Date(prev.timestamp)) < 60000;
    acc.push({ ...msg, grouped: sameUser && closeTime });
    return acc;
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg }}>
      <Loader2 size={24} color={C.gold} className="animate-spin" />
    </div>
  );
  if (error) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, color: C.red }}>{error}</div>
  );
  if (!trip) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: C.bg, color: C.textSub }}>{TEXTS.tripNotFound}</div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        * { box-sizing: border-box; }
        .td-input { background: none; border: none; outline: none; color: ${C.text}; font-family: inherit; font-size: 13px; width: 100%; }
        .td-input::placeholder { color: ${C.textMuted}; }
        .td-btn-send { background: ${C.gold}; border: none; border-radius: 10px; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; transition: opacity 0.15s; }
        .td-btn-send:hover { opacity: 0.85; }
        .td-btn-send:disabled { opacity: 0.35; cursor: not-allowed; }
        .td-scrollbar::-webkit-scrollbar { width: 4px; }
        .td-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .td-scrollbar::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
        .td-scrollbar::-webkit-scrollbar-thumb:hover { background: ${C.borderHi}; }
        .td-participant:hover { border-color: ${C.goldRing} !important; background: ${C.goldBg} !important; }
        .td-day-item:hover { border-color: ${C.goldRing} !important; }
        .td-msg-bubble { transition: background 0.1s; }
        .td-msg-bubble:hover { background: rgba(255,255,255,0.03); border-radius: 8px; }
        .td-back-btn:hover { color: ${C.gold} !important; }
        .td-tag { transition: border-color 0.15s; }
        .td-tag:hover { border-color: ${C.gold} !important; }
        .td-star-btn:hover { color: ${C.gold} !important; }
        textarea { resize: none; }
      `}</style>

      {/* ── TOP NAV BAR ── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: C.surface, position: "sticky", top: 0, zIndex: 50 }}>
        <button
          className="td-back-btn"
          onClick={() => navigate("/dashboard")}
          style={{ display: "flex", alignItems: "center", gap: 8, color: C.textSub, background: "none", border: "none", cursor: "pointer", fontSize: 13, fontFamily: "inherit", transition: "color 0.15s" }}
        >
          <ArrowLeft size={16} /> {TEXTS.backToDashboard}
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isCreator && (
            <button
              onClick={() => setShowInviteModal(true)}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.goldBg, border: `1px solid ${C.goldRing}`, borderRadius: 9, color: C.gold, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}
            >
              <Share2 size={13} /> Invite
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", background: C.redBg, border: `1px solid ${C.red}40`, borderRadius: 9, color: C.red, fontSize: 12, fontWeight: 500, cursor: "pointer", opacity: deleting ? 0.5 : 1, fontFamily: "inherit" }}
            >
              <Trash2 size={13} /> {deleting ? TEXTS.deleting : TEXTS.deleteTrip}
            </button>
          )}
        </div>
      </div>

      {/* ── COVER IMAGE ── */}
      {trip?.cover_image && (
        <div style={{ height: 280, overflow: "hidden", position: "relative" }}>
          <img src={trip.cover_image} alt={trip.title} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.7 }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, #07080f 100%)" }} />
        </div>
      )}

      {/* ── MAIN LAYOUT ── */}
      <div style={{ display: "flex", gap: 0, maxWidth: 1280, margin: "0 auto", padding: "0 24px 60px", alignItems: "flex-start" }}>

        {/* ════ LEFT COLUMN ════ */}
        <div style={{ flex: 1, minWidth: 0, paddingRight: 24, paddingTop: trip?.cover_image ? 0 : 32 }}>

          {/* ── HERO HEADER ── */}
          <div style={{ marginBottom: 28, paddingTop: trip?.cover_image ? 0 : 8 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: 12 }}>
              <div>
                <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 36, fontWeight: 400, color: C.text, letterSpacing: "-0.5px", marginBottom: 10, lineHeight: 1.1 }}>
                  {trip.title}
                </h1>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
                  {[
                    { icon: <MapPin size={14} color={C.gold} />, text: `${trip.destination?.name || TEXTS.destinationTbd}${trip.destination?.country ? `, ${trip.destination.country}` : ""}` },
                    { icon: <Calendar size={14} color={C.gold} />, text: `${fmt(trip.start_date)} → ${fmt(trip.end_date)}` },
                    { icon: <Users size={14} color={C.gold} />, text: `${trip.participants?.length || 0} ${TEXTS.participants}` },
                  ].map((item, i) => (
                    <span key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: C.textSub }}>
                      {item.icon} {item.text}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", paddingTop: 4 }}>
                <Badge color={trip.is_public ? C.green : C.textSub} bg={trip.is_public ? C.greenBg : undefined}>
                  {trip.is_public ? <><Globe size={10} style={{ display: "inline", marginRight: 4 }} />{TEXTS.publicTrip}</> : <><Lock size={10} style={{ display: "inline", marginRight: 4 }} />{TEXTS.privateTrip}</>}
                </Badge>
              </div>
            </div>

            {/* Description */}
            <p style={{ fontSize: 14, color: C.textSub, lineHeight: 1.75, maxWidth: 620 }}>
              {trip.description || TEXTS.noDescription}
            </p>

            {/* Tags */}
            {trip.trip_tags?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 14 }}>
                {trip.trip_tags.map((tag, i) => (
                  <span key={i} className="td-tag" style={{ padding: "4px 12px", borderRadius: 20, fontSize: 12, color: C.gold, border: `1px solid ${C.border}`, background: C.goldBg, cursor: "default" }}>{tag}</span>
                ))}
              </div>
            )}
          </div>

          {/* ── BUDGET & EXPENSES ── */}
          {trip.expense_budgets?.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <SectionTitle>Budget & Expenses</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
                {trip.expense_budgets.map((exp, i) => (
                  <div key={exp.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, color: C.textSub }}>{exp.category}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: CHART_COLORS[i % CHART_COLORS.length] }}>Rs {parseFloat(exp.amount).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              {trip.total_expense && (
                <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px", background: C.goldBg, borderRadius: 10, border: `1px solid ${C.goldRing}` }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Total Expense</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: C.gold }}>Rs {parseFloat(trip.total_expense).toFixed(2)}</span>
                </div>
              )}
              {isTripCompleted && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontSize: 12, color: C.textMuted, textAlign: "center", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.8px" }}>Breakdown</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={trip.expense_budgets.map(e => ({ name: e.category, value: parseFloat(e.amount) }))} cx="50%" cy="50%" outerRadius={75} innerRadius={40} dataKey="value" paddingAngle={3}>
                        {trip.expense_budgets.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => `Rs ${v.toFixed(2)}`} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8, color: C.text, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* ── ITINERARY ── */}
          {trip.itinerary?.length > 0 && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: itineraryOpen ? 18 : 0, cursor: "pointer" }} onClick={() => setItineraryOpen(!itineraryOpen)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 3, height: 18, borderRadius: 2, background: C.gold, display: "block" }} />
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: C.text }}>{TEXTS.itinerary}</h2>
                  <span style={{ fontSize: 12, color: C.textMuted, marginLeft: 4 }}>{trip.itinerary.length} days</span>
                </div>
                {itineraryOpen ? <ChevronUp size={16} color={C.textMuted} /> : <ChevronDown size={16} color={C.textMuted} />}
              </div>
              {itineraryOpen && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {trip.itinerary.map(item => (
                    <div key={item.id} className="td-day-item" style={{ display: "flex", gap: 14, padding: "12px 14px", background: C.surface, borderRadius: 10, border: `1px solid ${C.border}`, transition: "border-color 0.15s" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: C.goldBg, border: `1px solid ${C.goldRing}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <span style={{ fontSize: 9, color: C.goldDim, textTransform: "uppercase", letterSpacing: "0.5px" }}>Day</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{item.day}</span>
                      </div>
                      <div>
                        <p style={{ fontSize: 14, color: C.text, fontWeight: 500, marginBottom: item.notes ? 4 : 0 }}>{item.activity}</p>
                        {item.notes && <p style={{ fontSize: 12, color: C.textMuted }}>{item.notes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PARTICIPANTS ── */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
            <SectionTitle>{TEXTS.participantsTitle} · {trip.participants?.length || 0}</SectionTitle>
            {trip.participants?.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 10 }}>
                {trip.participants.map(p => (
                  <div key={p.id} className="td-participant" style={{ display: "flex", gap: 12, padding: "12px 14px", background: C.surface, borderRadius: 12, border: `1px solid ${C.border}`, transition: "border-color 0.15s, background 0.15s", cursor: "default" }}>
                    <Avatar name={`${p.first_name} ${p.last_name}`} size={38} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.first_name} {p.last_name}
                        {trip.creator?.id === p.id && <span style={{ marginLeft: 6, fontSize: 10, color: C.gold, background: C.goldBg, padding: "1px 7px", borderRadius: 10, border: `1px solid ${C.goldRing}` }}>Host</span>}
                      </p>
                      <p style={{ fontSize: 12, color: C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>@{p.username}</p>
                      {p.bio && <p style={{ fontSize: 12, color: C.textSub, marginTop: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.bio}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "24px 0" }}>{TEXTS.noParticipants}</p>
            )}
          </div>

          {/* ── REVIEWS ── */}
          {isTripCompleted && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
              <SectionTitle>Reviews</SectionTitle>
              {isParticipant && (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: C.text, marginBottom: 12 }}>Share your experience</p>
                  <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
                    {[1, 2, 3, 4, 5].map(r => (
                      <button key={r} className="td-star-btn" onClick={() => setReviewRating(r)}
                        style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: r <= reviewRating ? C.gold : C.border, transition: "color 0.1s", padding: 0 }}>★</button>
                    ))}
                  </div>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder="What made this trip memorable?"
                    maxLength={500}
                    rows={3}
                    style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", color: C.text, fontSize: 13, fontFamily: "inherit", outline: "none", marginBottom: 8 }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: C.textMuted }}>{reviewText.length}/500</span>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submittingReview || !reviewText.trim()}
                      style={{ padding: "8px 18px", background: C.gold, border: "none", borderRadius: 9, color: "#0d0f1c", fontSize: 13, fontWeight: 600, cursor: submittingReview || !reviewText.trim() ? "not-allowed" : "pointer", opacity: submittingReview || !reviewText.trim() ? 0.4 : 1, fontFamily: "inherit" }}
                    >{submittingReview ? "Submitting…" : "Submit"}</button>
                  </div>
                </div>
              )}
              {reviews.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {reviews.map((rv, i) => (
                    <div key={i} style={{ padding: "14px 16px", background: C.surface, borderRadius: 12, border: `1px solid ${C.border}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <Avatar name={rv.reviewer_name || "A"} size={30} />
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{rv.reviewer_name || "Anonymous"}</p>
                            <div style={{ display: "flex", gap: 2, marginTop: 1 }}>
                              {[...Array(5)].map((_, j) => <span key={j} style={{ fontSize: 13, color: j < rv.rating ? C.gold : C.border }}>★</span>)}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: C.textMuted }}>{fmt(rv.created_at)}</span>
                      </div>
                      <p style={{ fontSize: 13, color: C.textSub, lineHeight: 1.6 }}>{rv.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center", padding: "16px 0" }}>No reviews yet. Be the first!</p>
              )}
            </div>
          )}
        </div>

        {/* ════ RIGHT COLUMN — CHAT ════ */}
        <div style={{ width: 360, flexShrink: 0, position: "sticky", top: 72, maxHeight: "calc(100vh - 100px)", display: "flex", flexDirection: "column", paddingTop: 32 }}>
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 18, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

            {/* Chat header */}
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: C.goldBg, border: `1px solid ${C.goldRing}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageCircle size={15} color={C.gold} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{TEXTS.chatTitle}</p>
                <p style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{trip.title}</p>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: C.textMuted }}>{trip.participants?.length || 0} online</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="td-scrollbar" style={{ flex: 1, overflowY: "auto", padding: "16px 16px 8px" }}>
              {chatLoading && messages.length === 0 ? (
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 40 }}>
                  <Loader2 size={18} color={C.textMuted} className="animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8, paddingTop: 40 }}>
                  <MessageCircle size={28} color={C.border} />
                  <p style={{ fontSize: 13, color: C.textMuted, textAlign: "center" }}>{TEXTS.noMessages}</p>
                </div>
              ) : (
                groupedMessages.map((msg, idx) => {
                  // Check if this is a system event message
                  // Handle multiple possible data structures from backend
                  const isSystemEvent = msg.is_system || msg.type === "system_event" || msg.content?.includes("joined");
                  
                  if (isSystemEvent) {
                    // Get the actual username from sender_name
                    const username = msg.sender_name || "A user";
                    const displayText = `${username} joined`;
                    
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0", opacity: 0.8 }}>
                        <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${C.border} 0%, ${C.border} 100%)` }} />
                        <div style={{ display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", padding: "0 12px" }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.green, flexShrink: 0 }} />
                          <span style={{ fontSize: 12, color: C.textSub, fontWeight: 500 }}>
                            {displayText}
                          </span>
                        </div>
                        <div style={{ flex: 1, height: "1px", background: `linear-gradient(90deg, ${C.border} 0%, ${C.border} 100%)` }} />
                      </div>
                    );
                  }

                  // Regular user message
                  const isMine = msg.sender_id === userProfileId;
                  return (
                    <div key={idx} className="td-msg-bubble" style={{ display: "flex", gap: 8, marginBottom: msg.grouped ? 2 : 12, flexDirection: isMine ? "row-reverse" : "row", padding: "2px 4px" }}>
                      {!msg.grouped ? (
                        <Avatar name={msg.sender_name || "?"} size={28} />
                      ) : (
                        <div style={{ width: 28, flexShrink: 0 }} />
                      )}
                      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                        {!msg.grouped && (
                          <div style={{ display: "flex", gap: 6, alignItems: "baseline", marginBottom: 3, flexDirection: isMine ? "row-reverse" : "row" }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: isMine ? C.gold : C.text }}>{isMine ? "You" : msg.sender_name || TEXTS.unknownUser}</span>
                            <span style={{ fontSize: 10, color: C.textMuted }}>{fmtTime(msg.timestamp)}</span>
                          </div>
                        )}
                        <div style={{
                          padding: "8px 12px", borderRadius: isMine ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
                          background: isMine ? C.goldBg : C.surface,
                          border: `1px solid ${isMine ? C.goldRing : C.border}`,
                          fontSize: 13, color: C.text, lineHeight: 1.5, wordBreak: "break-word"
                        }}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div style={{ padding: "12px 14px", borderTop: `1px solid ${C.border}` }}>
              {isTripCompleted ? (
                <p style={{ textAlign: "center", fontSize: 12, color: C.textMuted, padding: "6px 0" }}>This trip has ended. Chat is read-only.</p>
              ) : (
                <form onSubmit={handleSendMessage} style={{ display: "flex", alignItems: "center", gap: 8, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "6px 6px 6px 14px" }}>
                  <input
                    className="td-input"
                    type="text"
                    value={messageInput}
                    onChange={e => setMessageInput(e.target.value)}
                    placeholder="Type a message…"
                    disabled={sendingMessage}
                  />
                  <button type="submit" className="td-btn-send" disabled={sendingMessage || !messageInput.trim()}>
                    {sendingMessage
                      ? <Loader2 size={15} color="#0d0f1c" className="animate-spin" />
                      : <Send size={15} color="#0d0f1c" />
                    }
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <TripInviteModal
        tripId={id}
        tripTitle={trip?.title || ""}
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        currentUserId={userProfileId}
        isAdmin={isCreator}
      />
    </div>
  );
}