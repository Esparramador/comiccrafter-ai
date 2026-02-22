import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader } from "lucide-react";
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";

export default function Welcome() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        window.location.href = createPageUrl("Home");
      }
    } catch (error) {
      console.error("Session check error:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Cargar Google Sign-In script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;

      script.onload = () => {
        if (window.google?.accounts?.id) {
          window.google.accounts.id.initialize({
            client_id: "783742843638-88j2f3nqkp6hvk4nvlqnvtoj08g7t6o1.apps.googleusercontent.com",
            callback: handleCredentialResponse
          });
          window.google.accounts.id.prompt();
        }
      };

      document.head.appendChild(script);
    } catch (error) {
      console.error("Google login error:", error);
      setLoading(false);
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      // Validar token con backend
      const result = await base44.functions.invoke("verifyGoogleToken", {
        token: response.credential
      });

      if (result.data?.success) {
        // Token válido - proceder al login
        await processUserLogin(result.data.user);
      }
    } catch (error) {
      console.error("Error validating token:", error);
      setLoading(false);
    }
  };

  const processUserLogin = async (userData) => {
    try {
      // Llamar a función de upsert
      const loginResult = await base44.functions.invoke("handleUserLogin", {
        email: userData.email,
        full_name: userData.full_name,
        profile_image: userData.picture
      });

      if (loginResult.data?.success) {
        // Redirigir al Home
        setTimeout(() => {
          window.location.href = createPageUrl("Home");
        }, 500);
      }
    } catch (error) {
      console.error("Login processing error:", error);
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <style>{`
        .glass-effect {
          background: rgba(15, 23, 42, 0.7);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(168, 85, 247, 0.2);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #a855f7, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .button-glow:hover {
          box-shadow: 0 0 30px rgba(168, 85, 247, 0.4);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .float-animation {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="glass-effect rounded-2xl p-8 sm:p-10">
          {/* Logo y Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="float-animation inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg"
            >
              <Sparkles className="w-7 h-7 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-3xl sm:text-4xl font-bold mb-2"
            >
              <span className="gradient-text">ComicCrafter</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300 text-sm sm:text-base"
            >
              Crea historias épicas con IA
            </motion.p>
          </div>

          {/* Features Preview */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-3 mb-8 text-sm text-gray-300"
          >
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <span>Cómics generados por IA en segundos</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 mt-1.5 flex-shrink-0" />
              <span>Personajes 3D personalizados</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
              <span>Videos animados automáticos</span>
            </div>
          </motion.div>

          {/* Login Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="button-glow w-full flex items-center justify-center gap-3 bg-white text-slate-900 font-semibold py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Conectando...</span>
              </>
            ) : (
              <>
                <img src="https://www.google.com/favicon.ico" alt="google" className="w-5 h-5" />
                <span>Continuar con Google</span>
              </>
            )}
          </motion.button>

          {/* Footer Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-gray-400 mt-6"
          >
            Crea una cuenta o inicia sesión con tu cuenta de Google
          </motion.p>
        </div>

        {/* Decorative Elements */}
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 right-10 w-72 h-72 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"
        />
      </motion.div>
    </div>
  );
}