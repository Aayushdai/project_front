import { useState, useCallback } from "react";
import Toast from "./Toast";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "success", duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type, duration }]);
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
    <div className="fixed bottom-6 right-6 pointer-events-none z-50">
      <div className="flex flex-col gap-2 pointer-events-auto">
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
