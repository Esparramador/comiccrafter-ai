import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

export default function AuthForm() {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Obtener config de Google del backend (API key encriptada)
      const configResponse = await base44.functions.invoke('getGoogleAuthConfig', {});
      const { clientId } = configResponse.data;

      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (response.credential) {
              try {
                const result = await base44.functions.invoke('verifyGoogleToken', {
                  token: response.credential,
                });
                if (result.data.success) {
                  window.location.href = '/';
                } else {
                  setError("Error al verificar autenticación");
                }
              } catch (err) {
                setError("Error al procesar autenticación");
              }
            }
            setIsLoading(false);
          },
        });
        
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'dark',
            size: 'large',
            width: '100%',
          }
        );
      }
    } catch (err) {
      setError("Error al inicializar Google");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      return;
    }

    if (mode === "signup") {
      if (password !== confirmPassword) {
        setError("Las contraseñas no coinciden");
        return;
      }
      if (password.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres");
        return;
      }
    }

    try {
      setIsLoading(true);
      // La autenticación se maneja a través de Google OAuth
      // Este formulario es principalmente para UI, la app usa Google
      setError("Por favor usa Google para iniciar sesión");
    } catch (err) {
      setError("Error al procesar la solicitud");
    } finally {
      setIsLoading(false);
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

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg border border-white/10">
          <button
            onClick={() => {
              setMode("login");
              setError("");
            }}
            className={`flex-1 py-2 rounded-md font-semibold transition-all ${
              mode === "login"
                ? "bg-violet-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Acceder
          </button>
          <button
            onClick={() => {
              setMode("signup");
              setError("");
            }}
            className={`flex-1 py-2 rounded-md font-semibold transition-all ${
              mode === "signup"
                ? "bg-violet-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Registrarse
          </button>
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

        {/* Google Login */}
        <div
          id="google-signin-button"
          className="w-full mb-4"
          onClick={handleGoogleLogin}
        ></div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-500">
              o continúa con email
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="bg-white/5 border-white/10 text-white placeholder-gray-600 h-11"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Contraseña
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white/5 border-white/10 text-white placeholder-gray-600 h-11 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? (
                       <EyeOff className="w-4 h-4" />
                     ) : (
                       <Eye className="w-4 h-4" />
                     )}
                   </button>
                 </div>
                </div>

                {mode === "signup" && (
                 <div>
                   <label className="block text-sm font-medium text-gray-300 mb-2">
                     Confirmar tu contraseña
                   </label>
              <div className="relative">
                <Input
                  type={showConfirm ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-600 h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 h-11 rounded-xl font-semibold flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                {mode === "login" ? "Acceder" : "Registrarse"}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-600 text-xs">
          Google es la forma más rápida y segura de acceder
        </p>
      </div>
    </motion.div>
  );
}