import { useEffect, useState } from "react";
import { X, CheckCircle, XCircle, Mail, AlertCircle, Loader2 } from "lucide-react";
import api from "../API/api";

export default function NotificationPanel({ onClose, onUnreadChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await api.get("trips/notifications/");
      setNotifications(res.data || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setNotifications([]);
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notification) => {
    if (notification.is_read) return;

    try {
      await api.patch(`trips/notifications/${notification.id}/read/`);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notification.id ? { ...n, is_read: true } : n
        )
      );
      // Update parent state
      const unreadCount = notifications.filter(n => !n.is_read).length - 1;
      onUnreadChange(Math.max(0, unreadCount));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("trips/notifications/read-all/");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      onUnreadChange(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleInvitationAction = async (notification, action) => {
    setActionLoading(prev => ({ ...prev, [notification.id]: true }));
    try {
      // Use the invitation_id stored in the notification directly
      if (!notification.invitation) {
        console.warn("Invitation ID not found in notification");
        alert("Invitation has already been responded to or is no longer available");
        // Remove the notification from the list anyway
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        return;
      }
      
      const response = await api.patch(`trips/invitations/${notification.invitation}/respond/`, { action });
      
      if (response.status === 200 || response.status === 201) {
        // Mark notification as read and remove from list
        await handleMarkAsRead(notification);
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
        // Show success message
        const successMsg = action === 'accept' 
          ? `Successfully joined the trip!` 
          : `Invitation declined`;
        alert(successMsg);
      }
    } catch (err) {
      console.error(`Failed to ${action} invitation:`, err);
      
      // Provide more specific error messages
      let errorMessage = `Failed to ${action} invitation`;
      if (err.response?.status === 403) {
        errorMessage = err.response.data?.detail || "You don't have permission to respond to this invitation";
      } else if (err.response?.status === 400) {
        errorMessage = err.response.data?.error || "Invalid action";
      }
      
      alert(errorMessage);
      
      // Refresh notifications to sync with server state
      setTimeout(() => fetchNotifications(), 1000);
    } finally {
      setActionLoading(prev => ({ ...prev, [notification.id]: false }));
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const getTimeRemaining = (expiresAt) => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expireTime = new Date(expiresAt);
    const diffMs = expireTime - now;
    
    if (diffMs <= 0) {
      return "Expired";
    }
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMins % 60}m remaining`;
    }
    return `${diffMins}m remaining`;
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "invitation_received":
      case "invitation_accepted":
      case "invitation_rejected":
        return <Mail size={16} className="text-blue-400" />;
      case "member_joined":
        return <CheckCircle size={16} className="text-green-400" />;
      case "member_left":
        return <XCircle size={16} className="text-red-400" />;
      default:
        return <AlertCircle size={16} className="text-yellow-400" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "invitation_received":
        return "bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/15";
      case "invitation_accepted":
        return "bg-green-500/10 border-green-500/30 hover:bg-green-500/15";
      case "invitation_rejected":
        return "bg-red-500/10 border-red-500/30 hover:bg-red-500/15";
      case "member_joined":
        return "bg-green-500/10 border-green-500/30 hover:bg-green-500/15";
      case "member_left":
        return "bg-red-500/10 border-red-500/30 hover:bg-red-500/15";
      default:
        return "bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/15";
    }
  };

  const isActionableNotification = (type) => {
    return type === "invitation_received";
  };

  return (
    <div
      className="absolute right-0 top-12 w-96 rounded-2xl bg-[#111] shadow-2xl z-50 border border-white/10 overflow-hidden"
      style={{ maxHeight: "500px", display: "flex", flexDirection: "column" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0a0c16]">
        <h3 className="font-semibold text-white flex items-center gap-2">
          <AlertCircle size={16} />
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-500/30 text-red-300 rounded-full">
              {unreadCount}
            </span>
          )}
        </h3>
        <button onClick={onClose} className="text-white/50 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Notifications  List */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={20} className="text-white/40 animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-center text-red-400 text-sm">{error}</div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-white/40 text-sm">
            No notifications yet. Stay tuned!
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {notifications.map(notif => (
              <div
                key={notif.id}
                className={`p-3 border-l-4 transition ${
                  notif.is_read
                    ? "bg-white/3 border-l-white/10"
                    : "bg-white/5 border-l-blue-500"
                }`}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notif.notification_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 cursor-pointer" onClick={() => handleMarkAsRead(notif)}>
                        <p className="text-sm font-medium text-white">
                          {notif.trip_title}
                        </p>
                        <p className="text-xs text-white/60 mt-0.5">
                          {notif.actor_name && `${notif.actor_name} - `}
                          {notif.notification_type_display}
                        </p>
                        <p className="text-xs text-white/40 mt-1">{notif.message}</p>
                      </div>
                      {!notif.is_read && (
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-blue-500 mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-white/40 mt-2">{notif.time_ago}</p>

                    {/* Show expiration time for pending invitations */}
                    {notif.notification_type === "invitation_received" && notif.is_expired && (
                      <p className="text-xs text-red-400 mt-1">⚠ {getTimeRemaining(notif.expires_at)}</p>
                    )}
                    {notif.notification_type === "invitation_received" && !notif.is_expired && (
                      <p className="text-xs text-yellow-400/70 mt-1">⏱ {getTimeRemaining(notif.expires_at)}</p>
                    )}

                    {/* Action Buttons for Invitations */}
                    {isActionableNotification(notif.notification_type) && !notif.is_expired && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleInvitationAction(notif, "accept")}
                          disabled={actionLoading[notif.id]}
                          className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-500/20 text-green-300 hover:bg-green-500/30 rounded-lg transition disabled:opacity-50"
                        >
                          {actionLoading[notif.id] ? "..." : "✓ Accept"}
                        </button>
                        <button
                          onClick={() => handleInvitationAction(notif, "reject")}
                          disabled={actionLoading[notif.id]}
                          className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 rounded-lg transition disabled:opacity-50"
                        >
                          {actionLoading[notif.id] ? "..." : "✗ Decline"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {unreadCount > 0 && notifications.length > 0 && (
        <div className="border-t border-white/10 p-3 bg-[#0a0c16]">
          <button
            onClick={handleMarkAllAsRead}
            className="w-full text-center text-xs font-medium text-blue-400 hover:text-blue-300 py-2 rounded-lg hover:bg-blue-500/10 transition"
          >
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
}
