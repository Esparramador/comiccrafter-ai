import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import HeroSection from "../components/home/HeroSection";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Home() {
  useEffect(() => {
    // Send confirmation email on first login
    const sendWelcomeEmail = async () => {
      try {
        await base44.functions.invoke('sendConfirmationEmail', {});
      } catch (error) {
        console.error('Error sending confirmation email:', error);
      }
    };

    sendWelcomeEmail();
  }, []);

  return (
    <AuthGuard>
      <HeroSection />
    </AuthGuard>
  );
}