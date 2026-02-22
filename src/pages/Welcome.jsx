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
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <image
                    href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%234285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'/%3E%3Cpath fill='%2334A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'/%3E%3Cpath fill='%23FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'/%3E%3Cpath fill='%23EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'/%3E%3C/svg%3E"
                    width="20"
                    height="20"
                  />
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