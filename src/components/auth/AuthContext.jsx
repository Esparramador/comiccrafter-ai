import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verificar sesión activa al montar
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
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
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authUser");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await base44.auth.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem("authUser");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
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