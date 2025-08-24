/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [logoutTimer, setLogoutTimer] = useState(null);

  // Helper: clear token + user
  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    if (logoutTimer) {
      clearTimeout(logoutTimer);
      setLogoutTimer(null);
    }
  }, [logoutTimer]);

  // Auto logout when token expires
  const scheduleLogout = useCallback((exp) => {
    const timeUntilExpiry = exp * 1000 - Date.now();
    if (timeUntilExpiry > 0) {
      const timer = setTimeout(() => {
        clearAuth();
      }, timeUntilExpiry);
      setLogoutTimer(timer);
    } else {
      clearAuth();
    }
  }, [clearAuth]);

  // On mount → check existing token
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 < Date.now()) {
          clearAuth(); // Expired
        } else {
          setUser(decoded);
          scheduleLogout(decoded.exp);
        }
      } catch (error) {
        clearAuth(); // Invalid token
      }
    }
  }, [token, clearAuth, scheduleLogout]);

  // Called after successful login
  const login = (newToken) => {
    try {
      const decoded = jwtDecode(newToken);
      localStorage.setItem("token", newToken);
      setUser(decoded);
      setToken(newToken);
      scheduleLogout(decoded.exp);
    } catch (error) {
      console.error("Invalid token", error);
    }
  };

  // Manual logout
  const logout = () => {
    clearAuth();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
}

