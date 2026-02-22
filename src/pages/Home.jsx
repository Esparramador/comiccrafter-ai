import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import HeroSection from "../components/home/HeroSection";
import { useCapacitorInit } from "@/components/app/CapacitorInit";
import { createPageUrl } from "@/utils";
import { Loader } from "lucide-react";

export default function Home() {
  const [isAuth, setIsAuth] = useState(null);

  useCapacitorInit();

  useEffect(() => {
    verifyAuth();
  }, []);

  const verifyAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      
      if (!authenticated) {
        // Redirigir a Welcome si no está autenticado
        window.location.href = createPageUrl("Welcome");
        return;
      }
      
      setIsAuth(true);
    } catch (error) {
      console.error('Auth error:', error);
      window.location.href = createPageUrl("Welcome");
    }
  };

  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return <HeroSection />;
}