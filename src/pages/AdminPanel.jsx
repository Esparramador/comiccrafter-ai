import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, AlertCircle } from "lucide-react";
import AdminSubscriptions from "@/components/admin/AdminSubscriptions";

const ADMIN_PASSWORD = "ComicCrafter2024!";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  React.useEffect(() => {
    const checkUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (currentUser?.email !== "sadiagiljoan@gmail.com") {
          window.location.href = "/";
          return;
        }
        setUser(currentUser);
      } catch (error) {
        window.location.href = "/";
      }
    };
    checkUser();
  }, []);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError("");
      setPassword("");
    } else {
      setError("Contraseña incorrecta");
      setPassword("");
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-violet-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4 pt-20">
        <div className="max-w-md w-full">
          <div className="bg-[#1a1a2e] border border-violet-500/20 rounded-xl p-8 shadow-xl">
            <div className="flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-violet-500" />
            </div>
            <h1 className="text-2xl font-bold text-white text-center mb-2">
              Panel de Administrador
            </h1>
            <p className="text-gray-400 text-sm text-center mb-6">
              Ingresa la contraseña para acceder
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder-gray-500"
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-violet-600 hover:bg-violet-700"
              >
                Acceder
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Panel de Administrador</h1>
          <p className="text-gray-400">
            Administra suscripciones, planes y limitaciones de la app
          </p>
        </div>

        <AdminSubscriptions />
      </div>
    </div>
  );
}