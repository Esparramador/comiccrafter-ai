import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import HeroSection from "../components/home/HeroSection";
import AuthForm from "@/components/auth/AuthForm";
import { useCapacitorInit } from "@/components/app/CapacitorInit";
import { Loader } from "lucide-react";

export default function Home() {
  const [isAuth, setIsAuth] = useState(null);
  const [error, setError] = useState(false);

  useCapacitorInit();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isAuth === null) setError(true);
    }, 5000);

    checkAuth();
    return () => clearTimeout(timeout);
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuth(authenticated);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuth(false);
    }
  };

  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          {error ? (
            <>
              <p className="text-red-400 text-sm font-medium">Error de conexión</p>
              <button
                onClick={() => {
                  setError(false);
                  setIsAuth(null);
                  checkAuth();
                }}
                className="px-3 py-1 text-xs bg-violet-600 hover:bg-violet-500 text-white rounded"
              >
                Reintentar
              </button>
            </>
          ) : (
            <>
              <Loader className="w-6 h-6 animate-spin text-violet-500" />
              <p className="text-gray-400 text-sm">Cargando...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show auth form if not authenticated
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return <HeroSection />;
}