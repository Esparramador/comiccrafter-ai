import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import HeroSection from "../components/home/HeroSection";
import LoginForm from "@/components/auth/LoginForm";
import { Loader } from "lucide-react";

export default function Home() {
  const [isAuth, setIsAuth] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = await base44.auth.isAuthenticated();
      setIsAuth(authenticated);

      if (authenticated) {
        // Send confirmation email on first login
        try {
          await base44.functions.invoke('sendConfirmationEmail', {});
        } catch (error) {
          console.error('Error sending confirmation email:', error);
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuth(false);
    }
  };

  if (isAuth === null) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader className="w-6 h-6 animate-spin text-violet-500" />
          <p className="text-gray-400 text-sm">Cargando...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-4">
        <LoginForm />
      </div>
    );
  }

  return <HeroSection />;
}