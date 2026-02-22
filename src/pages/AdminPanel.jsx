import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle, CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";
import AIDashboard from "@/components/admin/AIDashboard";
import { motion } from "framer-motion";

export default function AdminPanel() {
  const [step, setStep] = useState("auth"); // "auth", "setup", "dashboard"
  const [adminSettings, setAdminSettings] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser?.email !== "sadiagiljoan@gmail.com") {
        window.location.href = "/";
        return;
      }
      setUser(currentUser);
      checkAdminSettings();
    } catch (error) {
      window.location.href = "/";
    }
  };

  const checkAdminSettings = async () => {
    try {
      const settings = await base44.entities.AdminSettings.filter({
        admin_email: "sadiagiljoan@gmail.com",
      });
      if (settings && settings.length > 0) {
        setAdminSettings(settings[0]);
        setStep("auth");
      } else {
        setStep("setup");
      }
    } catch (error) {
      setStep("setup");
    }
  };

  const validatePassword = (pwd) => {
    if (pwd.length < 6) return "Mínimo 6 caracteres";
    if (!/\d/.test(pwd)) return "Debe contener al menos un número";
    if (!/[a-zA-Z]/.test(pwd)) return "Debe contener al menos una letra";
    return "";
  };

  const hashPassword = async (pwd) => {
    const res = await base44.functions.invoke("hashPassword", { password: pwd });
    return res.data.hash;
  };

  const handleSetupPassword = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordError("");

    const validation = validatePassword(password);
    if (validation) {
      setPasswordError(validation);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      setLoading(true);
      const hashedPassword = await hashPassword(password);
      const newSettings = await base44.entities.AdminSettings.create({
        admin_email: "sadiagiljoan@gmail.com",
        admin_password: hashedPassword,
        password_set: true,
      });
      setAdminSettings(newSettings);
      setPassword("");
      setConfirmPassword("");
      setStep("auth");
    } catch (err) {
      setError("Error al guardar la contraseña");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Ingresa la contraseña");
      return;
    }

    try {
      setLoading(true);
      const hashedInput = await hashPassword(password);

      if (hashedInput === adminSettings.admin_password) {
        setStep("dashboard");
        setPassword("");
      } else {
        setError("Contraseña incorrecta");
      }
    } catch (err) {
      setError("Error al verificar contraseña");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  // Setup Password Screen
  if (step === "setup") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 pt-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] border border-violet-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <Lock className="w-10 h-10 text-violet-400" />
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Configurar Admin
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              Crea tu contraseña de acceso (mínimo 6 caracteres)
            </p>

            <form onSubmit={handleSetupPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordError("");
                    }}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-gray-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-yellow-300">{passwordError}</p>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 h-11 font-semibold mt-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Crear Contraseña
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300">
                💡 Tu contraseña será encriptada y guardada de forma segura
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  // Login Screen
  if (step === "auth") {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 pt-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=800&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-10 max-w-md w-full"
        >
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1e] border border-violet-500/30 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Panel Admin
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8">
              Ingresa tu contraseña de acceso
            </p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder-gray-500 h-12 text-lg tracking-widest pr-10"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 h-11 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Verificando...
                  </>
                ) : (
                  "Acceder"
                )}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // Dashboard
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundImage:
          "linear-gradient(135deg, rgba(10, 10, 15, 0.95), rgba(10, 10, 15, 0.95)), url('https://images.unsplash.com/photo-1557821552-17105176677c?w=1200&h=800&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="relative z-10">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Panel de Administrador
              </h1>
              <p className="text-gray-400">
                Gestiona suscripciones, planes y monetización de la app
              </p>
            </div>

            {/* Alec Monopoly Style Art */}
            <div className="hidden lg:block relative">
              <div
                className="w-48 h-48 rounded-2xl border-2 border-violet-500 p-4 bg-gradient-to-br from-yellow-300 to-orange-300 text-gray-900 font-bold text-center flex flex-col items-center justify-center shadow-2xl transform hover:rotate-3 transition-transform"
                style={{
                  backgroundImage:
                    "linear-gradient(135deg, #FCD34D, #F97316), url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text x=%2250%22 y=%2240%22 font-size=%2240%22 font-weight=%22bold%22 text-anchor=%22middle%22 fill=%22%23000%22>💰</text><text x=%2250%22 y=%2280%22 font-size=%2220%22 font-weight=%22bold%22 text-anchor=%22middle%22 fill=%22%23000%22>ADMIN</text></svg>')",
                  backgroundSize: "cover",
                }}
              >
                <div className="text-5xl mb-2">💰</div>
                <div className="text-xl font-black">ADMIN</div>
                <div className="text-xs mt-2 opacity-75">PANEL</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
          {/* AI Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <AIDashboard />
          </motion.div>

          {/* Subscriptions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <AdminSubscriptions />
          </motion.div>
        </div>
      </div>
    </div>
  );
}