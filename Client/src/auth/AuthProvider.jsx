/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import axios from "axios";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const logoutTimerRef = useRef(null);

  // Clear token + user
  const clearAuth = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  }, []);

  // Schedule logout when token expires
  const scheduleLogout = useCallback(
    (exp) => {
      const timeUntilExpiry = exp * 1000 - Date.now();
      if (timeUntilExpiry > 0) {
        logoutTimerRef.current = setTimeout(() => {
          clearAuth();
        }, timeUntilExpiry);
      } else {
        clearAuth();
      }
    },
    [clearAuth]
  );

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

  // Axios interceptor → logout on 401 Unauthorized
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          clearAuth();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [clearAuth]);

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
