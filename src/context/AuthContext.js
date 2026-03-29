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

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);