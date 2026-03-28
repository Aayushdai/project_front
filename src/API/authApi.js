import api from "./api";

export const authApi = {
  // 🆕 Register user
  register: async (data) => {
    const response = await api.post("register/", data);

    // Optional: auto-login after register
    if (response.data.access) {
      localStorage.setItem("access", response.data.access);
    }

    if (response.data.refresh) {
      localStorage.setItem("refresh", response.data.refresh);
    }

    return response.data;
  },

  // 🔐 Login user
  login: async (data) => {
    const response = await api.post("login/", data);

    localStorage.setItem("access", response.data.access);
    localStorage.setItem("refresh", response.data.refresh);

    return response.data;
  },

  // 🚪 Logout
  logout: () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
  },

  // 👤 Get current user
  getMe: () => api.get("user/"),

  // 🔄 Refresh token
  refreshToken: async () => {
    const refresh = localStorage.getItem("refresh");

    const response = await api.post("token/refresh/", {
      refresh,
    });

    localStorage.setItem("access", response.data.access);

    return response.data;
  },
};