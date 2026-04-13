export const useToast = () => {
  const showToast = (message, type = "success", duration = 4000) => {
    if (typeof window !== "undefined" && window.ToastManager) {
      return window.ToastManager.addToast(message, type, duration);
    }
    console.warn("ToastManager not available");
  };

  const hideToast = (id) => {
    if (typeof window !== "undefined" && window.ToastManager) {
      window.ToastManager.removeToast(id);
    }
  };

  return {
    showToast,
    hideToast,
    success: (message, duration) => showToast(message, "success", duration),
    error: (message, duration) => showToast(message, "error", duration),
    info: (message, duration) => showToast(message, "info", duration),
  };
};
