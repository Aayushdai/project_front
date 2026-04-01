import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../API/api";
import KYCBanner from "./KYCBanner";
import { Close as CloseIcon, Send as SendIcon } from "@mui/icons-material";
import ChatIcon from "@mui/icons-material/Chat";

export default function ChatbotWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! How can I help you with your travel plans?", sender: "bot", links: [] }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Fetch user profile for KYC status
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8000/users/api/me/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (!user) return null;

  // Parse response and extract bold keywords and links
  const parseResponse = (responseText, links = []) => {
    if (!responseText) return { parts: [], links };
    
    // Split by **keyword** pattern
    const parts = responseText.split(/(\*\*[^*]+\*\*)/);
    
    return {
      parts: parts.map(part => ({
        text: part.replace(/\*\*/g, ''), // Remove ** markers
        isBold: part.startsWith('**') && part.endsWith('**'),
        original: part
      })),
      links
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), text: input, sender: "user", links: [] };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const res = await api.post("chat/chat/", { message: input });
      const response = res.data.response || "I didn't understand that. Can you rephrase?";
      const links = res.data.response_metadata?.links || [];
      
      const botMsg = {
        id: Date.now() + 1,
        text: response,
        sender: "bot",
        links: links
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, {
        id: Date.now() + 1,
        text: "Sorry, I couldn't respond. Please try again.",
        sender: "bot",
        links: []
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = (route) => {
    setIsOpen(false);
    navigate(route);
  };

  return (
    <>
      <style>{`
        @keyframes cw-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cw-dot  { 0%,80%,100%{opacity:.2} 40%{opacity:1} }
        .cw-dot1{animation:cw-dot 1.2s infinite .0s}
        .cw-dot2{animation:cw-dot 1.2s infinite .2s}
        .cw-dot3{animation:cw-dot 1.2s infinite .4s}
        .cw-msg {animation:cw-fade .18s ease both}
        ::-webkit-scrollbar{width:3px}
        ::-webkit-scrollbar-thumb{background:rgba(240,194,122,.25);border-radius:3px}
      `}</style>

      {/* Floating button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        title="Chat with Travel Assistant"
        style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          width: 56, height: 56, borderRadius: "50%", border: "none",
          background: "linear-gradient(135deg,#c9973a,#f0c27a)",
          color: "#0f0e0d", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(240,194,122,.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .2s, box-shadow .2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="scale(1.08)"; e.currentTarget.style.boxShadow="0 6px 28px rgba(240,194,122,.6)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.boxShadow="0 4px 20px rgba(240,194,122,.45)"; }}
      >
        {isOpen ? <CloseIcon fontSize="small"/> : <ChatIcon fontSize="small"/>}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div style={{
          position: "fixed", bottom: 92, right: 24, zIndex: 9998,
          width: 320, height: 420,
          background: "#0a0b14",
          border: ".5px solid rgba(240,194,122,.18)",
          borderRadius: 16,
          boxShadow: "0 16px 48px rgba(0,0,0,.7)",
          display: "flex", flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
          animation: "cw-fade .2s ease",
          overflow: "hidden",
        }}>

          {/* Header */}
          <div style={{
            background: "linear-gradient(135deg,#c9973a,#f0c27a)",
            padding: "14px 16px", flexShrink: 0,
          }}>
            <div style={{ fontFamily:"'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#0f0e0d" }}>
              � Travel Assistant
            </div>
            <div style={{ fontSize: 11, color: "rgba(15,14,13,.6)", marginTop: 2 }}>
              Always here to help
            </div>
          </div>
          {/* KYC Banner */}
          {userProfile && userProfile.status !== 'approved' && (
            <div style={{ padding: "8px 12px", flexShrink: 0 }}>
              <KYCBanner status={userProfile.status} rejectionReason={userProfile.rejection_reason} />
            </div>
          )}
          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 12px", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((msg) => {
              const parsed = parseResponse(msg.text, msg.links);
              return (
                <div key={msg.id} className="cw-msg" style={{ display: "flex", justifyContent: msg.sender === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{
                    maxWidth: "78%",
                    padding: "9px 13px",
                    borderRadius: msg.sender === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                    background: msg.sender === "user"
                      ? "linear-gradient(135deg,#c9973a,#f0c27a)"
                      : "rgba(255,255,255,.06)",
                    border: msg.sender === "user"
                      ? "none"
                      : ".5px solid rgba(240,194,122,.12)",
                    color: msg.sender === "user" ? "#0f0e0d" : "rgba(245,240,232,.85)",
                    fontSize: 13,
                    lineHeight: 1.5,
                  }}>
                    {msg.sender === "bot" ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <div>
                          {parsed.parts.map((part, idx) => {
                            if (!part.isBold || !part.text.trim()) return part.text;
                            
                            // Find matching link
                            const matchingLink = parsed.links.find(l => l.keyword === part.text.trim());
                            
                            if (matchingLink) {
                              return (
                                <span
                                  key={idx}
                                  onClick={() => handleLinkClick(matchingLink.route)}
                                  style={{
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    color: "#fff",
                                    textDecoration: "underline",
                                    transition: "opacity .2s",
                                  }}
                                  onMouseEnter={e => (e.target.style.opacity = "0.7")}
                                  onMouseLeave={e => (e.target.style.opacity = "1")}
                                >
                                  {part.text}
                                </span>
                              );
                            }
                            
                            return <strong key={idx}>{part.text}</strong>;
                          })}
                        </div>
                      </div>
                    ) : (
                      msg.text
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div style={{
                  padding: "10px 14px", borderRadius: "12px 12px 12px 2px",
                  background: "rgba(255,255,255,.06)",
                  border: ".5px solid rgba(240,194,122,.12)",
                  display: "flex", gap: 5, alignItems: "center",
                }}>
                  {[0,1,2].map(i => (
                    <span key={i} className={`cw-dot${i+1}`} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: "#f0c27a", display: "inline-block",
                    }}/>
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{
            borderTop: ".5px solid rgba(240,194,122,.1)",
            padding: "10px 12px",
            background: "rgba(255,255,255,.02)",
            display: "flex", flexDirection: "column", gap: 8, flexShrink: 0,
          }}>
            {(!userProfile || userProfile.status !== 'approved') && (
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
                Complete KYC to use chat
              </div>
            )}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !(!userProfile || userProfile.status !== 'approved') && handleSendMessage()}
                placeholder={!userProfile || userProfile.status !== 'approved' ? "Complete KYC first..." : "Ask me something…"}
                disabled={!userProfile || userProfile.status !== 'approved'}
                style={{
                  flex: 1, padding: "9px 13px", fontSize: 13,
                  background: "rgba(255,255,255,.05)",
                  border: ".5px solid rgba(240,194,122,.15)",
                  borderRadius: 10, color: "#f5f0e8", outline: "none",
                  fontFamily: "'DM Sans', sans-serif",
                  transition: "border-color .2s",
                  opacity: !userProfile || userProfile.status !== 'approved' ? 0.5 : 1,
                  cursor: !userProfile || userProfile.status !== 'approved' ? 'not-allowed' : 'text'
                }}
                onFocus={e  => !(!userProfile || userProfile.status !== 'approved') && (e.target.style.borderColor = "rgba(240,194,122,.5)")}
                onBlur={e   => (e.target.style.borderColor = "rgba(240,194,122,.15)")}
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim() || !userProfile || userProfile.status !== 'approved'}
                style={{
                  width: 36, height: 36, borderRadius: 9, border: "none",
                  background: loading || !input.trim() || !userProfile || userProfile.status !== 'approved'
                    ? "rgba(255,255,255,.07)"
                  : "linear-gradient(135deg,#c9973a,#f0c27a)",
                color: loading || !input.trim() ? "rgba(255,255,255,.2)" : "#0f0e0d",
                cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all .2s", flexShrink: 0,
              }}
            >
              <SendIcon sx={{ fontSize: 16 }}/>
            </button>
          </div>
        </div>
        </div>
      )}
    </>
  );
}