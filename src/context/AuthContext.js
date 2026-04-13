import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("access_token") || null;
  });

  const login = (userData, accessToken) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", accessToken);
    setUser(userData);
    setToken(accessToken);
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      const accessToken = localStorage.getItem("access_token");
      if (accessToken) {
        const API_BASE = process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000";
        await fetch(`${API_BASE.replace('/api/', '')}/api/users/me/logout/`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          }
        }).catch(() => {
          // Logout even if backend call fails (in case of network error)
        });
      }
    } finally {
      // Always clear localStorage and redirect to login, regardless of backend response
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      setUser(null);
      setToken(null);
      // Redirect to login page using window.location (works without Router context)
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);