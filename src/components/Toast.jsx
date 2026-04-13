import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function Toast({ message, type = "success", duration = 4000, onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 300); // Allow fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={20} className="text-green-400" />;
      case "error":
        return <AlertCircle size={20} className="text-red-400" />;
      case "info":
        return <Info size={20} className="text-blue-400" />;
      default:
        return null;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-900/40 border-green-700 text-green-100";
      case "error":
        return "bg-red-900/40 border-red-700 text-red-100";
      case "info":
        return "bg-blue-900/40 border-blue-700 text-blue-100";
      default:
        return "bg-gray-900/40 border-gray-700 text-gray-100";
    }
  };

  return (
    <div
      className={`fixed bottom-6 right-6 flex items-center gap-3 px-4 py-3 rounded-lg border ${getBgColor()} backdrop-blur-sm shadow-lg transition-all duration-300 ${
        isExiting ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
      }`}
      role="alert"
    >
      {getIcon()}
      <span className="text-sm font-medium flex-1">{message}</span>
      <button
        onClick={() => {
          setIsExiting(true);
          setTimeout(onClose, 300);
        }}
        className="text-white/60 hover:text-white transition ml-2"
        aria-label="Close notification"
      >
        <X size={16} />
      </button>
    </div>
  );
}
