import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useScrollbarExpand from "../hooks/useScrollbarExpand";
import { ChatListSkeleton, MessageThreadSkeleton } from "../components/SkeletonLoaders";

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════
const MESSAGES = {
  sidebarTitle: "Messages",
  searchPlaceholder: "Search…",
  noConversations: "No conversations yet",
  noConversationsHint: "Add friends or join trips to start chatting",
  directSection: "Direct",
  groupsSection: "Groups",
  selectConversation: "Select a conversation",
  startChatting: "to start chatting",
  noMessages: "No messages yet",
  sayHi: "Say hi!",
  dateToday: "Today",
  startConversation: "Start a conversation",
  membersLabel: "members",
  online: "Online",
  messagePrefix: "Message",
};

const AVATAR_COLORS = [
  { bg: "#dbeafe", color: "#1d4ed8" },
  { bg: "#fce7f3", color: "#be185d" },
  { bg: "#fef3c7", color: "#b45309" },
  { bg: "#dcfce7", color: "#15803d" },
  { bg: "#ede9fe", color: "#6d28d9" },
];const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

  .chat-root *, .chat-root *::before, .chat-root *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  .chat-root {
    font-family: 'DM Sans', sans-serif;
    display: flex;
    height: calc(100vh - 70px);
    overflow: hidden;
    background:
      radial-gradient(circle at top left, rgba(201, 168, 76, 0.08), transparent 26rem),
      var(--bg-page);
    color: var(--text-primary);

    --bg-page: #0f1219;
    --bg-surface: rgba(26, 31, 46, 0.96);
    --bg-surface-solid: #1a1f2e;
    --bg-muted: rgba(255, 255, 255, 0.055);
    --bg-hover: rgba(255, 255, 255, 0.075);
    --bg-soft: rgba(255, 255, 255, 0.035);

    --border: rgba(255, 255, 255, 0.10);
    --border-soft: rgba(255, 255, 255, 0.07);
    --border-strong: rgba(201, 168, 76, 0.32);

    --text-primary: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.76);
    --text-muted: rgba(255, 255, 255, 0.48);
    --text-faint: rgba(255, 255, 255, 0.28);

    --accent: #C9A84C;
    --accent-hover: #d7b85d;
    --accent-soft: rgba(201, 168, 76, 0.13);
    --accent-ring: rgba(201, 168, 76, 0.24);

    --bubble-in-bg: #252d3d;
    --bubble-in-border: rgba(255, 255, 255, 0.08);
    --bubble-out-bg: linear-gradient(135deg, #C9A84C, #f0c27a);
    --bubble-out-tx: #111827;

    --unread: #C9A84C;
    --online: #22c55e;

    --shadow-sm: 0 8px 24px rgba(0, 0, 0, 0.20);
    --shadow-md: 0 18px 45px rgba(0, 0, 0, 0.32);
  }

  [data-theme="dark"] .chat-root,
  .chat-root[data-theme="dark"] {
    background:
      radial-gradient(circle at top left, rgba(201, 168, 76, 0.08), transparent 26rem),
      var(--bg-page);
  }

  [data-theme="light"] .chat-root,
  .chat-root[data-theme="light"] {
    background:
      radial-gradient(circle at top left, rgba(249, 115, 22, 0.10), transparent 26rem),
      linear-gradient(180deg, #fffaf3 0%, #f8fafc 45%, #eef2f7 100%);

    --bg-page: #f8fafc;
    --bg-surface: rgba(255, 255, 255, 0.96);
    --bg-surface-solid: #ffffff;
    --bg-muted: #f1f5f9;
    --bg-hover: #fff7ed;
    --bg-soft: #f8fafc;

    --border: #e2e8f0;
    --border-soft: #e5e7eb;
    --border-strong: rgba(249, 115, 22, 0.35);

    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #64748b;
    --text-faint: #94a3b8;

    --accent: #ea580c;
    --accent-hover: #f97316;
    --accent-soft: #ffedd5;
    --accent-ring: rgba(249, 115, 22, 0.16);

    --bubble-in-bg: #ffffff;
    --bubble-in-border: #e2e8f0;
    --bubble-out-bg: linear-gradient(135deg, #fb923c, #ea580c);
    --bubble-out-tx: #ffffff;

    --unread: #ea580c;
    --online: #16a34a;

    --shadow-sm: 0 8px 24px rgba(15, 23, 42, 0.06);
    --shadow-md: 0 18px 45px rgba(15, 23, 42, 0.10);
  }

  /* ── Scrollbar ── */
  .chat-root ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .chat-root ::-webkit-scrollbar-track {
    background: transparent;
  }

  .chat-root ::-webkit-scrollbar-thumb {
    background: color-mix(in srgb, var(--accent) 42%, transparent);
    border-radius: 999px;
  }

  .chat-root ::-webkit-scrollbar-thumb:hover {
    background: color-mix(in srgb, var(--accent) 62%, transparent);
  }

  /* ── Sidebar ── */
  .sidebar {
    width: 320px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    background: var(--bg-surface);
    border-right: 1px solid var(--border);
    box-shadow: var(--shadow-sm);
    backdrop-filter: blur(18px);
  }

  .sidebar-header {
    padding: 22px 20px 14px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
  }

  .sidebar-title {
    font-size: 18px;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.03em;
  }

  .search-wrap {
    padding: 14px 14px 10px;
    flex-shrink: 0;
  }

  .search-row {
    display: flex;
    align-items: center;
    gap: 9px;
    background: var(--bg-muted);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 10px 13px;
    color: var(--text-muted);
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }

  .search-row:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-ring);
    background: var(--bg-surface-solid);
  }

  .search-row input {
    border: none;
    background: transparent;
    font-size: 13px;
    color: var(--text-primary);
    outline: none;
    width: 100%;
    font-family: inherit;
  }

  .search-row input::placeholder {
    color: var(--text-faint);
  }

  .section-label {
    font-size: 11px;
    font-weight: 800;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.10em;
    padding: 14px 12px 7px;
    flex-shrink: 0;
  }

  .conv-list {
    flex: 1;
    overflow-y: auto;
    padding: 4px 10px 12px;
  }

  .conv-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 11px 10px;
    border-radius: 14px;
    cursor: pointer;
    transition: background 0.14s, border-color 0.14s, transform 0.14s, box-shadow 0.14s;
    border: 1px solid transparent;
    margin-bottom: 4px;
  }

  .conv-item:hover {
    background: var(--bg-hover);
    transform: translateY(-1px);
  }

  .conv-item.active {
    background: var(--accent-soft);
    border-color: var(--border-strong);
    box-shadow: var(--shadow-sm);
  }

  /* ── Avatar ── */
  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
    flex-shrink: 0;
    background: var(--accent-soft);
    color: var(--accent);
    letter-spacing: -0.3px;
    overflow: hidden;
  }

  .avatar.group {
    border-radius: 12px;
    background: rgba(34, 197, 94, 0.14);
    color: var(--online);
  }

  .avatar.sm {
    width: 30px;
    height: 30px;
    font-size: 10px;
    align-self: flex-end;
  }

  .avatar svg {
    flex-shrink: 0;
  }

  .avatar-colors {
    background: rgba(168, 85, 247, 0.16);
    color: #a855f7;
  }

  .avatar-warm {
    background: var(--accent-soft);
    color: var(--accent);
  }

  /* ── Conv meta ── */
  .conv-meta {
    flex: 1;
    min-width: 0;
  }

  .conv-name {
    font-size: 13.5px;
    font-weight: 700;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .conv-preview {
    font-size: 12px;
    color: var(--text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 3px;
  }

  .conv-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
    flex-shrink: 0;
  }

  .conv-time {
    font-size: 11px;
    color: var(--text-faint);
  }

  .unread-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--unread);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--unread) 20%, transparent);
  }

  /* ── Empty state ── */
  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 28px;
    color: var(--text-muted);
    gap: 9px;
  }

  .empty-icon,
  .thread-empty-icon {
    width: 54px;
    height: 54px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent);
    background: var(--accent-soft);
    border: 1px solid var(--border-strong);
  }

  .thread-empty-icon.small {
    width: 48px;
    height: 48px;
  }

  .empty-title {
    font-size: 14px;
    font-weight: 700;
    color: var(--text-secondary);
  }

  .empty-sub {
    font-size: 12.5px;
    color: var(--text-muted);
    line-height: 1.55;
  }

  .error-box {
    font-size: 11px;
    color: #ef4444;
    margin-top: 10px;
    padding: 10px;
    background: rgba(239, 68, 68, 0.10);
    border-radius: 10px;
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  /* ── Thread ── */
  .thread {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: var(--bg-page);
  }

  .thread-header {
    padding: 15px 22px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 12px;
    flex-shrink: 0;
    background: var(--bg-surface);
    backdrop-filter: blur(18px);
  }

  .thread-info {
    flex: 1;
    min-width: 0;
  }

  .thread-name {
    font-size: 15px;
    font-weight: 800;
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .thread-sub {
    font-size: 12px;
    color: var(--text-muted);
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .online-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--online);
    flex-shrink: 0;
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--online) 16%, transparent);
  }

  .thread-actions {
    display: flex;
    gap: 7px;
  }

  .icon-btn {
    width: 34px;
    height: 34px;
    border: 1px solid var(--border);
    border-radius: 11px;
    background: var(--bg-muted);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    transition: background 0.12s, border-color 0.12s, color 0.12s, transform 0.12s;
  }

  .icon-btn:hover {
    background: var(--accent-soft);
    border-color: var(--border-strong);
    color: var(--accent);
    transform: translateY(-1px);
  }

  /* ── Messages ── */
  .messages-area {
    flex: 1;
    overflow-y: auto;
    padding: 24px 24px 20px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .date-divider {
    text-align: center;
    margin: 14px 0 14px;
  }

  .date-pill {
    display: inline-block;
    font-size: 11px;
    font-weight: 700;
    color: var(--text-muted);
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 13px;
    box-shadow: var(--shadow-sm);
  }

  .msg-row {
    display: flex;
    gap: 9px;
    margin-bottom: 1px;
  }

  .msg-row.sent {
    flex-direction: row-reverse;
  }

  .bubble-group {
    display: flex;
    flex-direction: column;
    gap: 3px;
    max-width: min(68%, 680px);
  }

  .msg-row.sent .bubble-group {
    align-items: flex-end;
  }

  .bubble {
    padding: 10px 14px;
    border-radius: 17px;
    font-size: 13.5px;
    line-height: 1.55;
    color: var(--text-primary);
    background: var(--bubble-in-bg);
    border: 1px solid var(--bubble-in-border);
    word-break: break-word;
    box-shadow: var(--shadow-sm);
  }

  .bubble.sent {
    background: var(--bubble-out-bg);
    border-color: transparent;
    color: var(--bubble-out-tx);
  }

  .bubble.first-in {
    border-top-left-radius: 6px;
  }

  .bubble.last-in {
    border-bottom-left-radius: 6px;
  }

  .bubble.first-out {
    border-top-right-radius: 6px;
  }

  .bubble.last-out {
    border-bottom-right-radius: 6px;
  }

  .msg-time {
    font-size: 10.5px;
    color: var(--text-faint);
    padding: 0 5px;
    margin-top: 3px;
  }

  .msg-time.right {
    text-align: right;
  }

  .system-message {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 16px 0;
    opacity: 0.9;
  }

  .system-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .system-pill {
    display: flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--bg-surface);
    border: 1px solid var(--border);
    color: var(--text-muted);
    font-size: 12px;
    font-weight: 700;
  }

  .system-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--online);
    flex-shrink: 0;
  }

  /* ── Spinner ── */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid var(--border-strong);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  /* ── Empty thread ── */
  .thread-empty {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 10px;
    color: var(--text-muted);
    text-align: center;
    padding: 24px;
  }

  .thread-empty-title {
    font-size: 15px;
    font-weight: 800;
    color: var(--text-secondary);
  }

  .thread-empty-sub {
    font-size: 13px;
    color: var(--text-muted);
  }

  /* ── Input area ── */
  .input-area {
    padding: 14px 18px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
    background: var(--bg-surface);
    backdrop-filter: blur(18px);
  }

  .input-row {
    display: flex;
    align-items: center;
    gap: 9px;
    background: var(--bg-muted);
    border: 1px solid var(--border-strong);
    border-radius: 999px;
    padding: 7px 7px 7px 17px;
    transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  }

  .input-row:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 4px var(--accent-ring);
    background: var(--bg-surface-solid);
  }

  .input-row input {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 13.5px;
    color: var(--text-primary);
    outline: none;
    font-family: inherit;
  }

  .input-row input::placeholder {
    color: var(--text-faint);
  }

  .send-btn {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: var(--accent);
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.15s, opacity 0.15s, transform 0.15s;
    color: #ffffff;
  }

  .send-btn:hover:not(:disabled) {
    background: var(--accent-hover);
    transform: translateY(-1px);
  }

  .send-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 760px) {
    .chat-root {
      height: calc(100vh - 64px);
    }

    .sidebar {
      width: 285px;
    }

    .messages-area {
      padding: 18px 14px;
    }

    .bubble-group {
      max-width: 82%;
    }
  }
`;

// ── Helper: get avatar initials ──────────────────────────────────────────────
function initials(name = "") {
  return name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ── Helper: reliably get sender ID from message ─────────────────────
function getSenderId(msg) {
  // Backend sends 'sender' directly as an ID number
  return msg?.sender || msg?.sender_id || msg?.user?.id || msg?.user_id;
}

// ── Helper: avatar color class by index ─────────────────────────────────────
function avatarStyle(idx) {
  const c = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return { background: c.bg, color: c.color };
}

// ── SendIcon ─────────────────────────────────────────────────────────────────
function SendIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="white">
      <path d="M14.5 8L2 2l3 6-3 6z" />
    </svg>
  );
}

// ── SearchIcon ───────────────────────────────────────────────────────────────
function SearchIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      style={{ flexShrink: 0 }}
    >
      <circle cx="6.5" cy="6.5" r="4.5" />
      <line x1="10.5" y1="10.5" x2="14" y2="14" />
    </svg>
  );
}

function EmptyChatIcon() {
  return (
    <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5A8.48 8.48 0 0 1 21 11v.5Z" />
    </svg>
  );
}

function SelectConversationIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v10H7l-3 3V5Z" />
      <path d="M8 9h8" />
      <path d="M8 12h5" />
    </svg>
  );
}

function EmptyMessageIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 2 11 13" />
      <path d="m22 2-7 20-4-9-9-4 20-7Z" />
    </svg>
  );
}

function GroupIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Chat() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) { navigate("/"); return; }

        setChatLoading(true);
        setChatError(null);

        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
        const [friendsRes, tripsRes] = await Promise.all([
          fetch(`${backendUrl}users/friends/`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl.replace('/api/', '')}/api/trips/`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => ({ ok: false })),
        ]);

        let convos = [];

        if (friendsRes.ok) {
          const friendsData = await friendsRes.json();
          const friends = Array.isArray(friendsData)
            ? friendsData
            : friendsData.friends || friendsData.results || [];
          
          const baseUrl = backendUrl.replace('/api/', '');
          
          convos = friends.map(friend => {
            // Get profile picture - API returns relative path, need to make it absolute
            let profilePic = friend.profile_pic || friend.avatar || friend.profile_picture || friend.profile_image || null;
            
            // If it's a relative path (starts with /), prepend the base URL
            if (profilePic && profilePic.startsWith('/')) {
              profilePic = `${baseUrl}${profilePic}`;
            }
            
            return {
              id: `friend-${friend.id}`,
              type: "direct",
              name: friend.first_name
                ? `${friend.first_name} ${friend.last_name || ""}`.trim()
                : friend.username || "Friend",
              avatar: profilePic,
              userId: friend.id,
              unread: 0,
              lastMessage: "",
              lastMessageTime: null,
            };
          });
        }

        if (tripsRes?.ok) {
          try {
            const tripsData = await tripsRes.json();
            const trips = Array.isArray(tripsData)
              ? tripsData
              : tripsData.results || tripsData.trips || [];
            
            // Get current user's ID to filter joined trips
            let currentUserId = null;
            try {
              const user = JSON.parse(localStorage.getItem("user") || "{}");
              currentUserId = user?.id;
            } catch (e) {
              console.error("Failed to get user ID:", e);
            }
            
            // Filter trips to show only ones user is a participant of
            const joinedTrips = trips.filter(trip => {
              if (!trip.participants) return false;
              return trip.participants.some(p => 
                (p.id === currentUserId) || (p.user?.id === currentUserId)
              );
            });
            
            const groupConvos = joinedTrips.map(trip => ({
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
          } catch (e) {
            console.warn("Failed to parse trips data:", e);
          }
        }

        setConversations(convos);
        setChatLoading(false);

        // Auto-select from sessionStorage
        const selectedFriendId = sessionStorage.getItem("selectedFriendId");
        if (selectedFriendId) {
          const friendConvo = convos.find(
            c => c.userId?.toString() === selectedFriendId
          );
          if (friendConvo) setSelectedConversation(friendConvo);
          sessionStorage.removeItem("selectedFriendId");
          sessionStorage.removeItem("selectedFriendName");
        }
      } catch (error) {
        setChatError("Could not load conversations: " + error.message);
        setChatLoading(false);
      }
    };

    fetchConversations();
  }, [navigate]);

  /* ── Enable scrollbar expansion on hover ── */
  useScrollbarExpand(".conv-list, .messages-area, .scrollbar-expandable");

  // Fetch messages for selected conversation (with polling)
  useEffect(() => {
    if (!selectedConversation) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) return;

        // Get current user ID fresh each time
        let userId = null;
        try {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          userId = user?.id;
        } catch (e) {
          console.error("Failed to get user ID:", e);
        }

        const recipientId =
          selectedConversation.userId || selectedConversation.tripId;
        const type = selectedConversation.type;
        const actionName =
          type === "direct" ? "direct_messages" : "group_messages";
        const paramName = type === "direct" ? "recipient_id" : "trip_id";

        const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";
        const res = await fetch(
          `${backendUrl.replace('/api/', '')}/api/chat/messages/${actionName}/?${paramName}=${recipientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res.ok) {
          const data = await res.json();
          const messagesData = Array.isArray(data) ? data : data.results || [];
          
          let messagesWithSender = messagesData.map((msg, idx) => {
            // Backend sends 'isSent' (camelCase) as a boolean field
            let isSent = msg.isSent;
            const senderId = getSenderId(msg);
            
            if (isSent === undefined) {
              isSent = Number(senderId) === Number(userId);
            }
            
            return {
              ...msg,
              isSent,
            };
          });

          // For direct messages, use conversation avatar (friend's profile pic)
          // For group messages, profile pics should already be in message.sender
          // No need to fetch - we have what we need!

          setMessages(messagesWithSender);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    };

    setChatLoading(true);
    fetchMessages().finally(() => setChatLoading(false));
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Send message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation || sendingMessage) return;

    setSendingMessage(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const recipientId =
        selectedConversation.userId || selectedConversation.tripId;
      const type = selectedConversation.type;
      const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://127.0.0.1:8000/api/";

      const res = await fetch(`${backendUrl.replace('/api/', '')}/api/chat/messages/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: messageInput,
          ...(type === "direct"
            ? { receiver_id: recipientId }
            : { trip_id: recipientId }),
        }),
      });

      if (res.ok) {
        const newMessage = await res.json();
        console.log("✅ Message sent! Backend response:", {
          id: newMessage.id,
          content: newMessage.content?.slice(0, 30),
          sender: newMessage.sender,
          isSent: newMessage.isSent,
          timestamp: newMessage.timestamp
        });
        // Always mark newly sent messages as sent (from current user)
        setMessages(prev => [...prev, { ...newMessage, isSent: true }]);
        setMessageInput("");
      } else {
        const err = await res.json();
        console.error("Send error:", err);
        setChatError("Could not send message");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setChatError("Could not send message");
    }
    setSendingMessage(false);
  };

  // Search filter
  const filteredConversations = conversations.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const directConvos = filteredConversations.filter(c => c.type === "direct");
  const groupConvos  = filteredConversations.filter(c => c.type === "group");

  // Group consecutive messages for cleaner bubble rendering
  const groupedMessages = messages.reduce((groups, msg, i) => {
    const prev = messages[i - 1];
    // Use same sender ID extraction for consistency
    const isSameAuthor =
      prev && getSenderId(prev) === getSenderId(msg);
    if (!isSameAuthor) {
      groups.push([msg]);
    } else {
      groups[groups.length - 1].push(msg);
    }
    return groups;
  }, []);

  return (
    <div className="chat-root">
      <style>{styles}</style>

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-title">{MESSAGES.sidebarTitle}</div>
        </div>

        <div className="search-wrap">
          <div className="search-row">
            <SearchIcon />
            <input
              type="text"
              placeholder={MESSAGES.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {chatLoading && conversations.length === 0 ? (
          <div style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
            <ChatListSkeleton count={8} />
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><EmptyChatIcon /></div>
            <div className="empty-title">{MESSAGES.noConversations}</div>
            <div className="empty-sub">
              {MESSAGES.noConversationsHint}
            </div>
            {chatError && <div className="error-box">{chatError}</div>}
          </div>
        ) : (
          <div className="conv-list">
            {directConvos.length > 0 && (
              <>
                <div className="section-label">{MESSAGES.directSection}</div>
                {directConvos.map((conv, idx) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    idx={idx}
                    active={selectedConversation?.id === conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setMessages([]);
                    }}
                  />
                ))}
              </>
            )}
            {groupConvos.length > 0 && (
              <>
                <div className="section-label">{MESSAGES.groupsSection}</div>
                {groupConvos.map((conv, idx) => (
                  <ConvItem
                    key={conv.id}
                    conv={conv}
                    idx={idx}
                    active={selectedConversation?.id === conv.id}
                    onClick={() => {
                      setSelectedConversation(conv);
                      setMessages([]);
                    }}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Thread ── */}
      <div className="thread">
        {!selectedConversation ? (
          <div className="thread-empty">
            <div className="thread-empty-icon"><SelectConversationIcon /></div>
            <div className="thread-empty-title">{MESSAGES.selectConversation}</div>
            <div className="thread-empty-sub">{MESSAGES.startChatting}</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="thread-header">
              <div
                className="avatar"
                style={
                  selectedConversation.type === "group"
                    ? { borderRadius: 12, background: "rgba(34, 197, 94, 0.14)", color: "var(--online)" }
                    : selectedConversation.avatar
                    ? {
                        borderRadius: "50%",
                        backgroundImage: `url(${selectedConversation.avatar})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : avatarStyle(0)
                }
              >
                {selectedConversation.type === "group" ? <GroupIcon size={17} /> : !selectedConversation.avatar && initials(selectedConversation.name)}
              </div>
              <div className="thread-info">
                <div className="thread-name">{selectedConversation.name}</div>
                <div className="thread-sub">
                  {selectedConversation.type === "group" ? (
                    `${selectedConversation.memberCount} ${MESSAGES.membersLabel}`
                  ) : (
                    <>
                      <span className="online-dot" />
                      {MESSAGES.online}
                    </>
                  )}
                </div>
              </div>
              <div className="thread-actions">
                <button className="icon-btn" title="Info" onClick={() => {}}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="8" r="6" />
                    <line x1="8" y1="7" x2="8" y2="11" />
                    <circle cx="8" cy="5" r="0.6" fill="currentColor" />
                  </svg>
                </button>
                <button className="icon-btn" title="More" onClick={() => {}}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <circle cx="8" cy="3.5" r="1.1" fill="currentColor" stroke="none" />
                    <circle cx="8" cy="8"   r="1.1" fill="currentColor" stroke="none" />
                    <circle cx="8" cy="12.5" r="1.1" fill="currentColor" stroke="none" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="messages-area">
              {chatLoading && messages.length === 0 ? (
                <MessageThreadSkeleton count={6} />
              ) : messages.length === 0 ? (
                <div className="thread-empty">
                  <div className="thread-empty-icon small"><EmptyMessageIcon /></div>
                  <div className="thread-empty-title">{MESSAGES.noMessages}</div>
                  <div className="thread-empty-sub">{MESSAGES.sayHi}</div>
                </div>
              ) : (
                <>
                  <div className="date-divider">
                    <span className="date-pill">{MESSAGES.dateToday}</span>
                  </div>
                  {groupedMessages.map((group, gi) => {
                    const first = group[0];
                    const isSent = first.isSent || first.is_sender;
                    const isSystem = first.is_system;

                    // System messages are rendered differently
                    if (isSystem) {
                      // Get the actual username from sender_name
                      const username = first.sender_name || "A user";
                      const displayText = `${username} joined`;
                      
                      return (
                        <div key={gi} className="system-message">
                          <div className="system-line" />
                          <div className="system-pill">
                            <div className="system-dot" />
                            <span>{displayText}</span>
                          </div>
                          <div className="system-line" />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={gi}
                        className={`msg-row${isSent ? " sent" : ""}`}
                        style={{ marginBottom: 8 }}
                      >
                        {!isSent && (
                          <div
                            className="avatar sm"
                            style={
                              first.sender?.profile_pic || first.profile_pic || selectedConversation.avatar
                                ? {
                                    width: 28,
                                    height: 28,
                                    borderRadius: "50%",
                                    backgroundImage: `url(${first.sender?.profile_pic || first.profile_pic || selectedConversation.avatar})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    flexShrink: 0,
                                    alignSelf: "flex-end",
                                  }
                                : { ...avatarStyle(gi), fontSize: 10 }
                            }
                          >
                            {!first.sender?.profile_pic && !first.profile_pic && !selectedConversation.avatar && initials(
                              first.sender?.username ||
                              first.sender_name ||
                              selectedConversation.name
                            )}
                          </div>
                        )}
                        <div className="bubble-group">
                          {group.map((msg, mi) => {
                            const isFirst = mi === 0;
                            const isLast = mi === group.length - 1;
                            const cls = [
                              "bubble",
                              isSent ? "sent" : "",
                              isFirst && !isSent ? "first-in" : "",
                              isLast  && !isSent ? "last-in"  : "",
                              isFirst && isSent  ? "first-out" : "",
                              isLast  && isSent  ? "last-out"  : "",
                            ]
                              .filter(Boolean)
                              .join(" ");
                            return (
                              <div key={mi} className={cls}>
                                {msg.content || msg.message}
                              </div>
                            );
                          })}
                          <div className={`msg-time${isSent ? " right" : ""}`}>
                            {new Date(
                              group[group.length - 1].created_at ||
                              group[group.length - 1].timestamp
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="input-area">
              {chatError && (
                <div style={{
                  fontSize: 11, color: "#dc2626", marginBottom: 8,
                  padding: "6px 12px", background: "#fef2f2",
                  borderRadius: 8, border: "1px solid #fecaca"
                }}>
                  {chatError}
                </div>
              )}
              <div className="input-row">
                <input
                  type="text"
                  placeholder={`${MESSAGES.messagePrefix} ${selectedConversation.name}…`}
                  value={messageInput}
                  maxLength={1000}
                  onChange={e => setMessageInput(e.target.value)}
                  onKeyDown={e =>
                    e.key === "Enter" && !e.shiftKey && handleSendMessage()
                  }
                  disabled={sendingMessage}
                />
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim() || sendingMessage}
                >
                  {sendingMessage ? (
                    <div
                      className="spinner"
                      style={{ width: 14, height: 14, borderColor: "rgba(255,255,255,0.4)", borderTopColor: "#fff" }}
                    />
                  ) : (
                    <SendIcon />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── ConvItem sub-component ────────────────────────────────────────────────────
function ConvItem({ conv, idx, active, onClick }) {
  const ac = AVATAR_COLORS[idx % AVATAR_COLORS.length];

  return (
    <div className={`conv-item${active ? " active" : ""}`} onClick={onClick}>
      {conv.avatar ? (
        <div
          className={`avatar${conv.type === "group" ? " group" : ""}`}
          style={{
            backgroundImage: `url(${conv.avatar})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : (
        <div
          className={`avatar${conv.type === "group" ? " group" : ""}`}
          style={conv.type === "group" ? {} : { background: ac.bg, color: ac.color }}
        >
          {conv.type === "group"
            ? <GroupIcon size={16} />
            : conv.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="conv-meta">
        <div className="conv-name">{conv.name}</div>
        <div className="conv-preview">
          {conv.lastMessage ||
            (conv.type === "group"
              ? `${conv.memberCount} ${MESSAGES.membersLabel}`
              : MESSAGES.startConversation)}
        </div>
      </div>

      <div className="conv-right">
        {conv.lastMessageTime && (
          <div className="conv-time">
            {new Date(conv.lastMessageTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        )}
        {conv.unread > 0 && <div className="unread-dot" />}
      </div>
    </div>
  );
}