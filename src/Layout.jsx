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
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to load user:', error);
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
            <Link to={createPageUrl("Home")} className="flex items-center gap-2.5 group">
              <img src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/699a4ce7816376ddfb992652/c00fa5137_comic_app_cover.png" alt="ComicCrafter" className="w-9 h-9 rounded-lg object-cover shadow-lg group-hover:shadow-violet-500/40 transition-shadow" />
              <span className="text-lg font-bold tracking-tight">
                Comic<span className="text-violet-400">Crafter</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {Array.isArray(navItems) && navItems.map(item => {
                const Icon = item.icon;
                const isActive = currentPageName === item.name;
                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "nav-link-active text-violet-300"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* User Menu + Lang + Mobile Toggle */}
            <div className="flex items-center gap-2">
              {user && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 relative group">
                  <span className="text-xs text-gray-400 cursor-pointer">{user.full_name || user.email}</span>
                  
                  {/* Dropdown menu */}
                  <div className="absolute top-full right-0 mt-1 w-48 bg-[#1a1a2e] border border-white/10 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {user?.email === 'sadiagiljoan@gmail.com' && (
                      <Link
                        to={createPageUrl("AdminPanel")}
                        className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 border-b border-white/5 flex items-center gap-2"
                      >
                        <Settings className="w-3 h-3" />
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={async () => {
                        try {
                          await base44.auth.logout();
                          window.location.href = '/';
                        } catch (error) {
                          console.error('Error changing account:', error);
                        }
                      }}
                      className={`w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 ${user?.email === 'sadiagiljoan@gmail.com' ? 'border-b border-white/5' : ''} flex items-center gap-2`}
                    >
                      <Users className="w-3 h-3" />
                      Cambiar cuenta
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-b-lg flex items-center gap-2"
                    >
                      <LogOut className="w-3 h-3" />
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              )}
              <LangSwitcher />
              {user && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white"
                  onClick={handleLogout}
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className={`md:hidden transition-colors ${mobileOpen ? 'text-white' : 'text-gray-400'}`}
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
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
                        ? "nav-link-active text-violet-300"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
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