import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const authenticated = await base44.auth.isAuthenticated();
      
      if (authenticated) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
        setIsAuthenticated(true);
        localStorage.setItem("authUser", JSON.stringify(currentUser));
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("authUser");
      }
    } catch (error) {
      console.error("Session check error:", error);
      setError(error?.message || "Session verification failed");
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authUser");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setError(null);
      await base44.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authUser");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
      setError(error?.message || "Logout failed");
    }
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    checkSession,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}