import React, { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import HeroSection from "../components/home/HeroSection";
import { useCapacitorInit } from "@/components/app/CapacitorInit";
import { createPageUrl } from "@/utils";
import { Loader } from "lucide-react";

export default function Home() {
  const { isAuthenticated, loading } = useAuth();

  useCapacitorInit();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = createPageUrl("Welcome");
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return <HeroSection />;
}