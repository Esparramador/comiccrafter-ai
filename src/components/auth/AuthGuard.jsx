import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

/**
 * AuthGuard - Protects routes and ensures user is authenticated
 * If not authenticated, redirects to login
 */
export default function AuthGuard({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      setIsAuthenticated(isAuth);
      setHasChecked(true);

      if (!isAuth) {
        base44.auth.redirectToLogin();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setHasChecked(true);
    }
  };

  if (!hasChecked) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <p className="text-gray-400">Cargando...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via base44.auth.redirectToLogin()
  }

  return children;
}