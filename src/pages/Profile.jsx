import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { User, Mail } from "lucide-react";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Mi Perfil</h1>

        {user && (
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Nombre</p>
                <p className="font-semibold">{user.full_name}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm text-muted-foreground mb-2">Rol</p>
              <p className="font-semibold capitalize">{user.role || "usuario"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}