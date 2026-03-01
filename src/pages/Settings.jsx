import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { LogOut, AlertCircle } from "lucide-react";

export default function Settings() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await base44.auth.logout("/");
    } catch (error) {
      console.error("Error logging out:", error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Ajustes</h1>

        <div className="space-y-4">
          {/* Logout */}
          <div className="bg-card border border-border rounded-lg p-4">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full flex items-center gap-3 text-destructive hover:bg-destructive/10 p-3 rounded transition disabled:opacity-50"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-semibold">
                {isLoading ? "Cerrando sesión..." : "Cerrar sesión"}
              </span>
            </button>
          </div>

          {/* About */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Sobre ComicCrafter</h3>
                <p className="text-sm text-muted-foreground">
                  Versión 1.0.0
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Crea cómics, vídeos y personajes 3D con IA
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}