import { useState, useCallback, useRef } from "react";
import Toast from "./Toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  const counterRef = useRef(0);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = `${Date.now()}-${++counterRef.current}`;
    setToasts([{ id, message, type, duration }]); // Only show latest message
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Expose methods globally for easy access
  if (typeof window !== "undefined") {
    window.ToastManager = { addToast, removeToast };
  }

  return (
    <div className="fixed bottom-96 left-6 pointer-events-none z-50">
      <div className="flex flex-row gap-2 pointer-events-auto">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </div>
  );
}
