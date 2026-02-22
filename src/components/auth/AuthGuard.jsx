import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Navigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";

/**
 * AuthGuard - Protects routes and ensures user is authenticated
 */
export default function AuthGuard({ children, requireAdmin = false, requireFounder = false }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [user, setUser] = useState(null);
  const [hasChecked, setHasChecked] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      }

      setHasChecked(true);
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
    return <Navigate to="/login" replace />;
  }

  // Check role restrictions
  if (requireFounder && user?.email !== import.meta.env.VITE_FOUNDER_EMAIL) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-gray-400">Esta sección es solo para el fundador</p>
        </div>
      </div>
    );
  }

  if (requireAdmin && user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Acceso Denegado</h2>
          <p className="text-gray-400">Se requieren permisos de administrador</p>
        </div>
      </div>
    );
  }

  return children;
}