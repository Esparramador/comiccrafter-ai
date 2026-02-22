import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./utils";
import { 
  Sparkles, BookOpen, PlusCircle, Menu, X, Zap, Users, Film, FileText, Mic, Baby, LogOut, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LangProvider, useLang } from "@/components/i18n/i18n";
import LangSwitcher from "@/components/ui/LangSwitcher";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { base44 } from "@/api/base44Client";

function LayoutInner({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const { t } = useLang();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      if (currentUser) {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      // No redirigir - dejar que el usuario navegue
    }
  };

  const handleLogout = async () => {
    try {
      await base44.auth.logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  const n = t.nav;

  const navItems = [
    { name: "Home", label: n?.home || "Inicio", icon: Sparkles },
    { name: "Optimizer", label: "Optimizer", icon: Zap },
    { name: "CoverGenerator", label: n?.covers || "Portadas", icon: Zap },
    { name: "AnimatedShorts", label: n?.shorts || "Cortos", icon: Film },
    { name: "VideoProjects", label: "Crear Vídeo", icon: Baby },
    { name: "VoiceLibrary", label: "Voces", icon: Mic },
    { name: "MyComics", label: n?.myComics || "Mis Cómics", icon: BookOpen },
    { name: "MyCharacters", label: n?.characters || "Personajes", icon: Users },
    { name: "MyMedia", label: "Mis Vídeos", icon: BookOpen },
    { name: "MyDrafts", label: n?.drafts || "Borradores", icon: FileText },
  ];

  const isHome = currentPageName === "Home";

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <style>{`
        .glass-nav {
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(139, 92, 246, 0.15);
        }
        .nav-link-active {
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.1));
          border: 1px solid rgba(139, 92, 246, 0.3);
        }
      `}</style>

      {/* Navigation */}
      <nav className="glass-nav fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-300 group-hover:duration-200" />
                <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699a4ce7816376ddfb992652/c00fa5137_comic_app_cover.png" alt="ComicCrafter" className="relative w-10 h-10 rounded-xl object-cover" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight block">
                  <span className="bg-gradient-to-r from-white via-violet-200 to-pink-200 bg-clip-text text-transparent">ComicCrafter</span>
                </span>
                <span className="text-xs text-violet-400/60 block">IA Stories</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1.5">
              {Array.isArray(navItems) && navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-300 border border-violet-500/30 shadow-lg shadow-violet-500/10"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-violet-500/10 to-pink-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all relative group cursor-default">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-medium text-gray-300">{user.full_name || user.email.split('@')[0]}</span>
                  
                  {/* Dropdown menu */}
                  <div className="absolute top-full right-0 mt-2 w-48 bg-gradient-to-b from-slate-800 to-slate-900 border border-violet-500/20 rounded-xl shadow-2xl shadow-violet-500/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                    {user?.email === 'sadiagiljoan@gmail.com' && (
                      <Link
                        to={createPageUrl("AdminPanel")}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-violet-500/20 border-b border-violet-500/10 flex items-center gap-2 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await base44.auth.logout();
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Error:', error);
                        }
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-violet-500/20 ${user?.email === 'sadiagiljoan@gmail.com' ? 'border-b border-violet-500/10' : ''} flex items-center gap-2 transition-colors`}
                    >
                      <Users className="w-4 h-4" />
                      Cambiar cuenta
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-red-500/20 flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
              
              <LangSwitcher />
              
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={handleLogout}
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className={`lg:hidden transition-colors ${mobileOpen ? 'text-violet-400 bg-white/5' : 'text-gray-400'}`}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-violet-500/10 bg-gradient-to-b from-slate-900 via-[#0a0a0f] to-[#0a0a0f] backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              {Array.isArray(navItems) && navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-violet-500/20 to-pink-500/20 text-violet-300 border border-violet-500/30"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className={isHome ? "" : "pt-20"}>
        {children}
      </main>

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}

function LayoutWithProvider({ children, currentPageName }) {
  return (
    <LayoutInner currentPageName={currentPageName}>
      {children}
    </LayoutInner>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <LangProvider>
      <LayoutWithProvider currentPageName={currentPageName}>
        {children}
      </LayoutWithProvider>
    </LangProvider>
  );
}