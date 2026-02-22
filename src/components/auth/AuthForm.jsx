import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import GoogleLogin from "./GoogleLogin";

export default function AuthForm() {
  const [error, setError] = useState("");

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Auth check error:", err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-gradient-to-br from-gray-900 via-gray-900 to-black border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 mb-4"
          >
            <Sparkles className="w-6 h-6 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-1">ComicCrafter</h1>
          <p className="text-gray-400 text-sm">
            Crea cómics, videos y arte con IA
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Google Login Button */}
        <div className="w-full mb-6">
          <GoogleLogin />
        </div>

        {/* Info Text */}
        <p className="text-center text-gray-400 text-sm">
          Usa tu cuenta de Google para acceder de forma rápida y segura
        </p>
      </div>
    </motion.div>
  );
}