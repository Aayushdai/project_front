import { useNotificationPolling } from "../hooks/useNotificationPolling";

export default function NotificationPoller() {
  // Call hook unconditionally - it handles user check internally
  useNotificationPolling();
  
  return null;
}
