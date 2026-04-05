import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { ArrowLeft, MapPin, Calendar, Users, User2, Trash2, Send, Loader2 } from "lucide-react";

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [userProfileId, setUserProfileId] = useState(null);
  
  // Chat states
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef(null);

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
        const meRes = await fetch("http://127.0.0.1:8000/users/api/me/", {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` }
        });
        const userProfile = await meRes.json();
        setUserProfileId(userProfile?.id);

        // Fetch trip
        const res = await API.get(`trips/trips/${id}/`);
        console.log("Trip data:", res.data);
        setTrip(res.data);
        
        // Fetch messages
        fetchMessages();
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load trip details");
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
          alert("You need KYC approval to send messages");
        } else {
          alert(errData.error || "Failed to send message");
        }
      }
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Error sending message. Please try again.");
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this trip? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      await API.delete(`trips/trips/${id}/`);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error deleting trip:", err);
      setError(err.response?.data?.message || "Failed to delete trip");
      setDeleting(false);
    }
  };

  const isCreator = trip && userProfileId && trip.creator?.id === userProfileId;
  const hasOnlyCreator = trip && trip.participants?.length === 1;
  const canDelete = isCreator && hasOnlyCreator;

  if (loading) return <div className="p-6 text-center">Loading trip details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;
  if (!trip) return <div className="p-6 text-center">Trip not found</div>;

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
          Back to Dashboard
        </button>
      </div>

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
                  <span>{trip.destination?.name || "Destination TBD"}, {trip.destination?.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-orange-500" />
                  <span>{new Date(trip.start_date).toLocaleDateString()} → {new Date(trip.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={20} className="text-orange-500" />
                  <span>{trip.participants?.length || 0} participants</span>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-300 text-lg leading-relaxed">{trip.description || "No description provided"}</p>
            </div>

            {/* Constraint Tags */}
            {trip.constraint_tags && trip.constraint_tags.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-gray-400 mb-3">Trip Tags (Diet, Lifestyle, Values):</p>
                <div className="flex flex-wrap gap-2">
                  {trip.constraint_tags.map(tag => (
                    <span
                      key={tag.id}
                      className="px-3 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 flex-wrap items-center">
              {trip.is_public && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Public Trip</span>}
              {!trip.is_public && <span className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-sm">Private Trip</span>}
              
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-2 px-4 py-1.5 bg-red-500/20 text-red-400 rounded-full text-sm border border-red-500/30 hover:bg-red-500/30 transition disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  {deleting ? "Deleting..." : "Delete Trip"}
                </button>
              )}
            </div>
          </div>

          {/* Itinerary Section */}
          {trip.itinerary && trip.itinerary.length > 0 && (
            <div className="bg-[#1a1f2e] rounded-2xl p-8 border border-[rgba(255,255,255,0.08)]">
              <h2 className="text-2xl font-bold mb-6">Itinerary</h2>
              <div className="space-y-4">
                {trip.itinerary.map(item => (
                  <div key={item.id} className="bg-[#0f1419] p-4 rounded-lg border border-[rgba(255,255,255,0.05)]">
                    <div className="font-bold text-orange-500 mb-2">Day {item.day}</div>
                    <div className="text-gray-300">{item.activity}</div>
                    {item.notes && <div className="text-gray-500 text-sm mt-2">{item.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Participants Section */}
          <div className="bg-[#1a1f2e] rounded-2xl p-8 border border-[rgba(255,255,255,0.08)]">
            <h2 className="text-2xl font-bold mb-6">Participants ({trip.participants?.length || 0})</h2>
            
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
                No participants yet
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Group Chat */}
        <div className="w-96 sticky top-6 h-fit">
          <div className="bg-[#1a1f2e] rounded-2xl p-6 border border-[rgba(255,255,255,0.08)] flex flex-col" style={{ height: "600px" }}>
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>💬 Chat</span>
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
                  <p>No messages yet</p>
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
                          <span className="font-semibold text-white text-xs">{msg.sender_name || "Unknown"}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}