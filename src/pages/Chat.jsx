import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

export default function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch conversations (friends + groups from trips)
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          navigate("/login");
          return;
        }

        setChatLoading(true);
        setChatError(null);

        // Fetch friends and trips
        const [friendsRes, tripsRes] = await Promise.all([
          fetch(`${API_URL}/users/api/friends/`, {
            headers: { "Authorization": `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/trips/trips/`, {
            headers: { "Authorization": `Bearer ${token}` },
          }).catch(() => ({ ok: false })),  // Gracefully handle trips fetch failure
        ]);

        let convos = [];
        let friendsData = null;
        let tripsData = null;

        // Add direct message conversations with friends
        if (friendsRes.ok) {
          friendsData = await friendsRes.json();
          const friends = Array.isArray(friendsData) ? friendsData : friendsData.friends || friendsData.results || [];
          convos = friends.map(friend => ({
            id: `friend-${friend.id}`,
            type: "direct",
            name: friend.first_name || friend.username || "Friend",
            avatar: friend.profile_pic || null,
            userId: friend.id,
            unread: 0,
            lastMessage: "",
            lastMessageTime: null,
          }));
        }

        // Add group conversations from joined trips
        if (tripsRes?.ok) {
          try {
            tripsData = await tripsRes.json();
            const trips = Array.isArray(tripsData) ? tripsData : tripsData.results || tripsData.trips || [];
            const groupConvos = trips.map(trip => ({
              id: `group-${trip.id}`,
              type: "group",
              name: trip.title || "Trip Group",
              avatar: trip.cover_image || null,
              tripId: trip.id,
              memberCount: trip.participants?.length || 0,
              unread: 0,
              lastMessage: "",
              lastMessageTime: null,
            }));
            convos = [...convos, ...groupConvos];
          } catch (error) {
            console.warn("Failed to parse trips data:", error);
            // Continue without trips - not critical for messaging
          }
        } else {
          console.warn("Trips API unavailable - group chat features disabled");
        }

        console.log("Friends API response:", friendsRes.status, friendsData);
        console.log("Trips API response:", tripsRes.status, tripsData);
        console.log("Total conversations created:", convos.length);
        
        setConversations(convos);
        setChatLoading(false);

        // Auto-select friend conversation if coming from friend profile
        const selectedFriendId = sessionStorage.getItem('selectedFriendId');
        if (selectedFriendId) {
          const friendConvo = convos.find(c => c.userId?.toString() === selectedFriendId);
          if (friendConvo) {
            setSelectedConversation(friendConvo);
          }
          // Clear the stored friend ID
          sessionStorage.removeItem('selectedFriendId');
          sessionStorage.removeItem('selectedFriendName');
        }
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
        console.error("Error details:", error.message);
        setChatError("Could not load conversations: " + error.message);
        setChatLoading(false);
      }
    };

    fetchConversations();
  }, [navigate]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        setChatLoading(true);
        const recipientId = selectedConversation.userId || selectedConversation.tripId;
        const type = selectedConversation.type;

        const actionName = type === "direct" ? "direct_messages" : "group_messages";
        const paramName = type === "direct" ? "recipient_id" : "trip_id";
        const messageRes = await fetch(
          `${API_URL}/api/chat/messages/${actionName}/?${paramName}=${recipientId}`,
          {
            headers: { "Authorization": `Bearer ${token}` },
          }
        );

        if (messageRes.ok) {
          const data = await messageRes.json();
          setMessages(Array.isArray(data) ? data : data.results || []);
        }
        setChatLoading(false);
      } catch (error) {
        console.error("Failed to fetch messages:", error);
        setChatLoading(false);
      }
    };

    fetchMessages();
    // Poll for new messages every 3 seconds
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Send message function
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const recipientId = selectedConversation.userId || selectedConversation.tripId;
      const type = selectedConversation.type;

      const res = await fetch(`${API_URL}/api/chat/messages/`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageInput,
          ...(type === "direct" ? { receiver_id: recipientId } : { trip_id: recipientId }),
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages([...messages, newMessage]);
        setMessageInput("");
      } else {
        const error = await res.json();
        console.error("Error response:", error);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatError("Could not send message");
    }
    setSendingMessage(false);
  };

  return (
    <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:"#07080f" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        @keyframes tm-spin   { to{transform:rotate(360deg)} }
        @keyframes tm-fade   { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes tm-slide  { from{transform:translateX(-8px);opacity:0} to{transform:translateX(0);opacity:1} }
        *,*::before,*::after { box-sizing:border-box;margin:0;padding:0; }
        body { font-family:'DM Sans',sans-serif; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(240,194,122,.25);border-radius:3px; }
        input::placeholder { color:rgba(245,240,232,.2)!important; }
      `}</style>

      {/* Left: Conversations List */}
      <div style={{ width:320, borderRight:".5px solid rgba(201,168,76,.1)", display:"flex", flexDirection:"column", background:"rgba(10,11,20,.6)" }}>
        <div style={{ padding:"20px 18px", borderBottom:".5px solid rgba(240,194,122,.1)", flexShrink:0 }}>
          <div style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:16, color:"#f5f0e8", letterSpacing:"-.5px" }}>Messages</div>
        </div>

        {chatLoading ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(240,194,122,.6)", fontSize:12 }}>
            <div style={{ ...S.spinner, position:"static", display:"inline-block", marginRight:8 }}/>
            <div>Loading…</div>
          </div>
        ) : conversations.length === 0 ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", padding:20, color:"rgba(245,240,232,.25)", fontSize:13 }}>
            <div>
              <div style={{ fontSize:28, marginBottom:10 }}>💬</div>
              <p>No conversations yet</p>
              <p style={{ fontSize:11, marginTop:6, opacity:.6 }}>Add friends or join trips to start chatting</p>
              {chatError && <div style={{ fontSize:10, color:"#f87171", marginTop:12, padding:10, background:"rgba(248,113,113,.08)", borderRadius:8 }}>Error: {chatError}</div>}
            </div>
          </div>
        ) : (
          <div style={{ flex:1, overflowY:"auto", padding:"8px 8px" }}>
            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                style={{
                  padding:"12px 12px",
                  borderRadius:10,
                  background:selectedConversation?.id === conv.id?"rgba(240,194,122,.15)":"transparent",
                  border:selectedConversation?.id === conv.id?".5px solid rgba(240,194,122,.3)":"transparent",
                  cursor:"pointer",
                  marginBottom:4,
                  transition:"all .2s",
                }}
                onMouseEnter={e => {
                  if(selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.background = "rgba(240,194,122,.08)";
                  }
                }}
                onMouseLeave={e => {
                  if(selectedConversation?.id !== conv.id) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{
                    width:48,
                    height:48,
                    borderRadius:"50%",
                    background:conv.avatar?"":"rgba(240,194,122,.2)",
                    backgroundImage:conv.avatar?`url(${conv.avatar})`:undefined,
                    backgroundSize:"cover",
                    backgroundPosition:"center",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    flexShrink:0,
                    fontSize:22,
                    fontWeight:600,
                  }}>
                    {!conv.avatar && (conv.type === "group" ? "👥" : "👤")}
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#f5f0e8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{conv.name}</div>
                    {conv.type === "group" && (
                      <div style={{ fontSize:11, color:"rgba(245,240,232,.4)", marginTop:2 }}>
                        {conv.memberCount} members
                      </div>
                    )}
                    {conv.lastMessage && (
                      <div style={{ fontSize:11, color:"rgba(245,240,232,.35)", marginTop:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                        {conv.lastMessage}
                      </div>
                    )}
                  </div>
                  {conv.unread > 0 && (
                    <div style={{
                      minWidth:24,
                      height:24,
                      borderRadius:"50%",
                      background:"#f0c27a",
                      color:"#0f0e0d",
                      display:"flex",
                      alignItems:"center",
                      justifyContent:"center",
                      fontSize:11,
                      fontWeight:700,
                      flexShrink:0,
                    }}>
                      {conv.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Message Thread */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", background:"#07080f" }}>
        {!selectedConversation ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", textAlign:"center", color:"rgba(245,240,232,.25)" }}>
            <div>
              <div style={{ fontSize:48, marginBottom:16 }}>👋</div>
              <div style={{ fontSize:18, fontWeight:600, color:"rgba(245,240,232,.5)", marginBottom:8 }}>Select a conversation</div>
              <div style={{ fontSize:13 }}>to start chatting</div>
            </div>
          </div>
        ) : (
          <>
            {/* Message Header */}
            <div style={{
              display:"flex",
              alignItems:"center",
              gap:12,
              padding:"18px 24px",
              borderBottom:".5px solid rgba(240,194,122,.1)",
              background:"rgba(10,11,20,.4)",
              flexShrink:0,
            }}>
              <button
                onClick={() => {
                  setSelectedConversation(null);
                  setMessages([]);
                }}
                style={{
                  background:"transparent",
                  border:"none",
                  color:"#f0c27a",
                  cursor:"pointer",
                  fontSize:20,
                  padding:0,
                  display:"flex",
                  alignItems:"center",
                }}
                title="Back to conversations"
              >
                ←
              </button>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:15, fontWeight:600, color:"#f5f0e8" }}>{selectedConversation.name}</div>
                {selectedConversation.type === "group" && (
                  <div style={{ fontSize:12, color:"rgba(245,240,232,.4)", marginTop:2 }}>
                    {selectedConversation.memberCount} members
                  </div>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div style={{
              flex:1,
              overflowY:"auto",
              display:"flex",
              flexDirection:"column",
              padding:"20px 24px",
              gap:12,
            }}>
              {messages.length === 0 ? (
                <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", color:"rgba(245,240,232,.25)", textAlign:"center" }}>
                  <div>
                    <div style={{ fontSize:32, marginBottom:12 }}>💌</div>
                    <div>No messages yet</div>
                    <div style={{ fontSize:12, marginTop:4, opacity:.6 }}>Start the conversation!</div>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    style={{
                      display:"flex",
                      justifyContent:msg.isSent?"flex-end":"flex-start",
                      animation:"tm-slide .2s ease",
                    }}
                  >
                    <div style={{
                      maxWidth:"70%",
                      padding:"12px 16px",
                      borderRadius:16,
                      background:msg.isSent?"linear-gradient(135deg,rgba(201,152,58,.3),rgba(240,194,122,.25))":"rgba(255,255,255,.08)",
                      border:`.5px solid ${msg.isSent?"rgba(240,194,122,.3)":"rgba(255,255,255,.08)"}`,
                      color:"#f5f0e8",
                      fontSize:13,
                      lineHeight:1.6,
                      wordBreak:"break-word",
                    }}>
                      <div>{msg.content || msg.message}</div>
                      <div style={{ fontSize:10, color:"rgba(245,240,232,.35)", marginTop:6, textAlign:msg.isSent?"right":"left" }}>
                        {new Date(msg.created_at || msg.timestamp).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input Area */}
            <div style={{
              display:"flex",
              gap:10,
              padding:"16px 24px",
              borderTop:".5px solid rgba(240,194,122,.1)",
              background:"rgba(10,11,20,.4)",
              flexShrink:0,
            }}>
              <input
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                onKeyPress={e => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                placeholder="Type a message…"
                maxLength={1000}
                style={{
                  flex:1,
                  padding:"12px 16px",
                  border:".5px solid rgba(240,194,122,.1)",
                  borderRadius:24,
                  fontSize:13,
                  fontFamily:"'DM Sans',sans-serif",
                  background:"rgba(255,255,255,.04)",
                  color:"#f5f0e8",
                  outline:"none",
                  transition:"border-color .2s",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(240,194,122,.3)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(240,194,122,.1)")}
                disabled={sendingMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || sendingMessage}
                style={{
                  padding:"12px 22px",
                  borderRadius:24,
                  border:"none",
                  background:messageInput.trim() && !sendingMessage?"linear-gradient(135deg,#c9973a,#f0c27a)":"rgba(240,194,122,.1)",
                  color:messageInput.trim() && !sendingMessage?"#0f0e0d":"rgba(240,194,122,.4)",
                  cursor:messageInput.trim() && !sendingMessage?"pointer":"not-allowed",
                  fontWeight:600,
                  fontSize:13,
                  transition:"all .2s",
                  whiteSpace:"nowrap",
                }}
              >
                {sendingMessage ? "↻" : "Send"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const S = {
  spinner: { position:"absolute", right:11, top:"50%", transform:"translateY(-50%)", width:14, height:14, border:"2px solid #f0c27a", borderTopColor:"transparent", borderRadius:"50%", animation:"tm-spin .7s linear infinite" },
};
