import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { ArrowLeft, MapPin, Calendar, Users, User2, Trash2, Send, Loader2, DollarSign, Tag, MessageCircle, Share2 } from "lucide-react";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";
import TripInviteModal from "../components/TripInviteModal";

// ──── CONSTANTS ────
const COLORS = {
  darkBg: "#0f1419",
  cardBg: "#1a1f2e",
  orange500: "#ff8c00",
  text: "#ffffff",
  textSecondary: "#a3a3a3",
  textMuted: "#666666",
  border: "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.05)",
  green500_20: "rgba(34, 197, 94, 0.2)",
  green400: "#86efac",
  gray500_20: "rgba(107, 114, 128, 0.2)",
  gray400: "#9ca3af",
  red500_20: "rgba(239, 68, 68, 0.2)",
  red400: "#f87171",
  blue500_20: "rgba(59, 130, 246, 0.2)",
  blue300: "#93c5fd",
};

const TEXTS = {
  loadingTrip: "Loading trip details...",
  tripNotFound: "Trip not found",
  backToDashboard: "Back to Dashboard",
  destinationTbd: "Destination TBD",
  participants: "participants",
  noDescription: "No description provided",
  tripTags: "Trip Tags (Diet, Lifestyle, Values):",
  publicTrip: "Public Trip",
  privateTrip: "Private Trip",
  deleteTrip: "Delete Trip",
  deleting: "Deleting...",
  deleteConfirm: "Are you sure you want to delete this trip? This action cannot be undone.",
  deleteError: "Failed to delete trip",
  itinerary: "Itinerary",
  day: "Day",
  participantsTitle: "Participants",
  noParticipants: "No participants yet",
  chatTitle: "Chat",
  noMessages: "No messages yet",
  unknownUser: "Unknown",
  kycApprovalRequired: "You need KYC approval to send messages",
  failedToSendMessage: "Failed to send message",
  errorSendingMessage: "Error sending message. Please try again.",
  failedToLoadTrip: "Failed to load trip details",
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [userProfileId, setUserProfileId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  
  // Helper: Check if trip is completed
  const isTripCompleted = trip && new Date(trip.end_date) < new Date();

  const fetchMessages = useCallback(async () => {
    try {
      setChatLoading(true);
      const url = `http://127.0.0.1:8000/api/chat/messages/group_messages/?trip_id=${id}`;
      console.log(`Fetching messages from: ${url}`);
      
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
      });
      
      console.log(`Fetch response status: ${res.status}`);
      
      if (res.ok) {
        const data = await res.json();
        console.log(`Received messages:`, data);
        
        // Handle both array and object with results property
        const messageList = Array.isArray(data) ? data : (data.results || data);
        console.log(`Setting messages:`, messageList);
        setMessages(messageList);
      } else {
        const errData = await res.json();
        console.error("Error fetching messages:", errData);
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
        // Get user's profile ID
        const meRes = await fetch("http://127.0.0.1:8000/api/users/me/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        const userProfile = await meRes.json();
        setUserProfileId(userProfile?.id);

        // Fetch trip
        const res = await API.get(`trips/${id}/`);
        console.log("Trip data:", res.data);
        console.log("Expense budgets:", res.data?.expense_budgets);
        console.log("Total expense:", res.data?.total_expense);
        setTrip(res.data);
        
        // Fetch reviews for this trip
        try {
          const reviewsRes = await API.get(`trips/${id}/reviews/`);
          console.log("Reviews fetched:", reviewsRes.data);
          setReviews(reviewsRes.data);
        } catch (reviewErr) {
          console.log("No reviews yet or error fetching reviews:", reviewErr);
          setReviews([]);
        }
        
        // Fetch messages
        fetchMessages();
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(TEXTS.failedToLoadTrip);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, fetchMessages]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (!id) return;
    
    const interval = setInterval(() => {
      fetchMessages();
    }, 3000);

    return () => clearInterval(interval);
  }, [id, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || sendingMessage) return;

    setSendingMessage(true);
    try {
      const payload = {
        content: messageInput.trim(),
        trip_id: parseInt(id)
      };
      console.log("Sending message payload:", payload);
      
      const res = await fetch("http://127.0.0.1:8000/api/chat/messages/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      console.log(`Message POST response status: ${res.status}`);
      
      if (res.ok) {
        const newMessage = await res.json();
        console.log("Message created successfully:", newMessage);
        
        // Immediately fetch fresh messages to ensure sync
        await fetchMessages();
        
        setMessageInput("");
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        const errData = await res.json();
        console.error("Message send error:", errData);
        if (errData.error?.includes("KYC")) {
          alert(TEXTS.kycApprovalRequired);
        } else {
          alert(errData.error || TEXTS.failedToSendMessage);
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert(TEXTS.errorSendingMessage);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(TEXTS.deleteConfirm)) {
      return;
    }

    setDeleting(true);
    try {
      await API.delete(`trips/trips/${id}/`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting trip:", err);
      setError(err.response?.data?.message || TEXTS.deleteError);
      setDeleting(false);
    }
  };

  const isCreator = trip && userProfileId && trip.creator?.id === userProfileId;
  const hasOnlyCreator = trip && trip.participants?.length === 1;
  const canDelete = isCreator && hasOnlyCreator;
  const isParticipant = trip && userProfileId && (trip.participants?.some(p => p.id === userProfileId) || trip.creator?.id === userProfileId);

  const handleSubmitReview = async () => {
    if (!isTripCompleted || !isParticipant || !reviewText.trim()) {
      alert("You can only review completed trips you were part of.");
      return;
    }

    setSubmittingReview(true);
    try {
      const response = await API.post(`http://127.0.0.1:8000/api/trips/${id}/reviews/`, {
        rating: reviewRating,
        text: reviewText.trim(),
      });

      if (response.status === 201) {
        console.log("Review submitted successfully");
        setReviews([...reviews, response.data]);
        setReviewText("");
        setReviewRating(5);
      }
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("Failed to submit review: " + (err.response?.data?.detail || err.message));
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="p-6 text-center">{TEXTS.loadingTrip}</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!trip) return <div className="p-6 text-center">{TEXTS.tripNotFound}</div>;

  return (
    <div className="min-h-screen bg-[#0f1419] text-white p-6">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,140,0,0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,140,0,0.6);
        }
      `}</style>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-orange-500 hover:text-orange-400 mb-4"
        >
          <ArrowLeft size={20} />
          {TEXTS.backToDashboard}
        </button>
      </div>

      {/* Cover Image Display */}
      {trip?.cover_image && (
        <div className="mb-6 rounded-2xl overflow-hidden border border-[rgba(255,255,255,0.08)] h-64 sm:h-80">
          <img
            src={trip.cover_image}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Main Content - Two Columns */}
      <div className="flex gap-6">
        {/* Left Column - Trip Info, Itinerary, Participants */}
        <div className="flex-1 space-y-6">
          {/* Trip Details Card */}
          <div className="bg-[#1a1f2e] rounded-2xl p-8 border border-[rgba(255,255,255,0.08)]">
            <div className="mb-6">
              <h1 className="text-4xl font-bold mb-4">{trip.title}</h1>
              <div className="flex flex-wrap gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-orange-500" />
                  <span>{trip.destination?.name || TEXTS.destinationTbd}, {trip.destination?.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-orange-500" />
                  <span>{new Date(trip.start_date).toLocaleDateString()} → {new Date(trip.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-orange-500" />
                  <span>{trip.participants?.length || 0} {TEXTS.participants}</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 text-lg leading-relaxed">{trip.description || TEXTS.noDescription}</p>
            </div>

            {/* Trip Tags */}
            {trip.trip_tags && trip.trip_tags.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Tag size={18} className="text-orange-500" />
                  <p className="text-sm text-gray-400 font-semibold">Trip Characteristics</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trip.trip_tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses Section */}
            <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign size={20} className="text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Trip Budget & Expenses</h3>
              </div>
              {trip.expense_budgets && trip.expense_budgets.length > 0 ? (
                <>
                  <div className="space-y-2 mb-4">
                    {trip.expense_budgets.map(expense => (
                      <div key={expense.id} className="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
                        <span className="text-gray-300">{expense.category}</span>
                        <span className="font-semibold text-blue-300">Rs {parseFloat(expense.amount).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  {trip.total_expense && (
                    <div className="pt-3 border-t border-blue-500/30 flex justify-between items-center font-bold">
                      <span className="text-white">Total Expense:</span>
                      <span className="text-orange-500 text-lg">Rs {parseFloat(trip.total_expense).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {/* Expense Chart for Completed Trips */}
                  {isTripCompleted && trip.expense_budgets.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-blue-500/30">
                      <h4 className="text-white font-semibold mb-4 text-center">Expense Breakdown</h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={trip.expense_budgets.map(exp => ({
                              name: exp.category,
                              value: parseFloat(exp.amount)
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {trip.expense_budgets.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'][index % 8]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => `Rs ${value.toFixed(2)}`}
                            contentStyle={{ backgroundColor: '#1a1f2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                          />
                          <Legend 
                            wrapperStyle={{ paddingTop: '20px' }}
                            formatter={(value) => <span style={{ color: '#fff', fontSize: '12px' }}>{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-gray-400 text-sm">No expenses added for this trip yet.</p>
              )}
            </div>

            <div className="flex gap-3 flex-wrap items-center">
              {trip.is_public && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">{TEXTS.publicTrip}</span>}
              {!trip.is_public && <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">{TEXTS.privateTrip}</span>}
              
              {isCreator && (
                <button
                  onClick={() => setShowInviteModal(true)}
                  className="flex items-center gap-2 px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-full text-sm border border-orange-500/30 hover:bg-orange-500/30 transition"
                >
                  <Share2 size={16} />
                  Invite People
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30 hover:bg-red-500/30 transition disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {deleting ? TEXTS.deleting : TEXTS.deleteTrip}
                </button>
              )}
            </div>
          </div>

          {/* Itinerary Section */}
          {trip.itinerary && trip.itinerary.length > 0 && (
            <div className="bg-[#1a1f2e] rounded-2xl p-8 border border-[rgba(255,255,255,0.08)]">
              <h2 className="text-2xl font-bold mb-6">{TEXTS.itinerary}</h2>
              <div className="space-y-4">
                {trip.itinerary.map(item => (
                  <div key={item.id} className="bg-[#0f1419] p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
                    <div className="font-bold text-orange-500 mb-2">{TEXTS.day} {item.day}</div>
                    <div className="text-gray-300">{item.activity}</div>
                    {item.notes && <div className="text-gray-500 text-sm mt-2">{item.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants Section */}
          <div className="bg-[#1a1f2e] rounded-2xl p-8 border border-[rgba(255,255,255,0.08)]">
            <h2 className="text-2xl font-bold mb-6">{TEXTS.participantsTitle} ({trip.participants?.length || 0})</h2>
            
            {trip.participants && trip.participants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {trip.participants.map(participant => (
                  <div key={participant.id} className="bg-[#0f1419] p-4 rounded-lg border border-[rgba(255,255,255,0.05)] hover:border-orange-500/50 transition">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User2 size={24} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-white truncate">
                          {participant.first_name} {participant.last_name}
                        </div>
                        <div className="text-gray-500 text-sm truncate">@{participant.username}</div>
                        {participant.bio && (
                          <div className="text-gray-400 text-sm mt-2 line-clamp-2">{participant.bio}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                {TEXTS.noParticipants}
              </div>
            )}
          </div>

          {/* Reviews Section - Only show for completed trips */}
          {isTripCompleted && (
            <div className="bg-[#1a1f2e] rounded-2xl p-8 border border-[rgba(255,255,255,0.08)]">
              <h2 className="text-2xl font-bold mb-6">Trip Reviews</h2>
              
              {/* Review Form - Only for participants */}
              {isParticipant && (
                <div className="mb-8 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <h3 className="font-semibold text-white mb-4">Share Your Experience</h3>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-2">Rating</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(rating => (
                        <button
                          key={rating}
                          onClick={() => setReviewRating(rating)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                            reviewRating >= rating
                              ? "bg-orange-500 text-white"
                              : "bg-white/10 text-gray-400 hover:bg-white/20"
                          }`}
                        >
                          ★ {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 text-sm mb-2">Your Review</label>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your thoughts about this trip..."
                      maxLength={500}
                      className="w-full bg-[#0f1419] text-white border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-2 text-sm placeholder-gray-500 focus:outline-none focus:border-orange-500 resize-none"
                      rows={4}
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">{reviewText.length}/500</div>
                  </div>
                  
                  <button
                    onClick={handleSubmitReview}
                    disabled={submittingReview || !reviewText.trim()}
                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              )}
              
              {/* Existing Reviews */}
              <div className="space-y-4">
                <h3 className="font-semibold text-white">Reviews from Participants</h3>
                {reviews && reviews.length > 0 ? (
                  reviews.map((review, idx) => (
                    <div key={idx} className="p-4 bg-[#0f1419] rounded-lg border border-[rgba(255,255,255,0.05)]">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-white">{review.reviewer_name || "Anonymous"}</p>
                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={i < review.rating ? "text-orange-500" : "text-gray-600"}>★</span>
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{review.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">No reviews yet. Be the first to share your experience!</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Group Chat */}
        <div className="w-96 sticky top-6 h-fit">
          <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] flex flex-col" style={{ height: "600px" }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageCircle size={20} className="text-blue-400" />
              <span>Chat</span>
              <span className="text-xs text-gray-400 font-normal truncate">({trip.title})</span>
            </h2>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto mb-3 space-y-3 pr-2 custom-scrollbar">
              {chatLoading && messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm text-center">
                  <p>{TEXTS.noMessages}</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className="mb-2">
                    <div className="flex gap-2">
                      <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white">
                        {(msg.sender_name || "U")[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span className="font-semibold text-white text-xs">{msg.sender_name || TEXTS.unknownUser}</span>
                          <span className="text-gray-500 text-xs">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-gray-300 text-xs break-words">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {isTripCompleted ? (
              <div className="pt-2 border-t border-[rgba(255,255,255,0.08)]">
                <p className="text-center text-gray-400 text-xs py-3">
                  This trip has ended. Chat is no longer available.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type..."
                  disabled={sendingMessage}
                  className="flex-1 bg-[#0f1419] text-white border border-[rgba(255,255,255,0.1)] rounded-lg px-3 py-1.5 text-xs placeholder-gray-500 focus:outline-none focus:border-orange-500 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={sendingMessage || !messageInput.trim()}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-3 py-1.5 flex items-center gap-1 transition"
                >
                  {sendingMessage ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                </button>
              </form>
            )}
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