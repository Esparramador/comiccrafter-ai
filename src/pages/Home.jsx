import { useState } from "react";
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight, Menu, X, LogOut, LogIn } from "lucide-react";

const HEROES = [
  {
    title: "Del Guion al Cómic",
    subtitle: "en minutos",
    desc: "Genera guiones, diseña personajes, crea modelos 3D, produce voces profesionales y monta videos animados. Todo con IA, todo en un solo lugar.",
  },
  {
    title: "Estudio Creativo",
    subtitle: "del futuro",
    desc: "Genera guiones, diseña personajes, crea modelos 3D, produce voces profesionales y monta videos animados. Todo con IA, todo en un solo lugar.",
  },
];

const NAV_ITEMS = [
  { label: "Inicio", emoji: "🏠", href: "#" },
  { label: "Portadas & Guiones", emoji: "📚", href: "#" },
  { label: "Video / Cortos", emoji: "🎬", href: "#" },
  { label: "Modelos 3D", emoji: "🎯", href: "#" },
  { label: "Voces IA", emoji: "🎤", href: "#" },
  { label: "Crear Personaje", emoji: "✨", href: "#" },
  { label: "Tienda", emoji: "🛍️", href: "#" },
  { label: "Creaciones", emoji: "📁", href: "#" },
];

export default function Home() {
  const [currentHero, setCurrentHero] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout("/");
  };

  const handleLogin = async () => {
    await base44.auth.redirectToLogin(window.location.pathname);
  };

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0D17]/95 backdrop-blur-xl border-b border-white/5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-xs">CC</span>
              </div>
              <div className="text-xs font-bold leading-tight">
                <div>Comic</div>
                <div>Crafter</div>
              </div>
            </div>

            {/* Nav - Desktop */}
            <nav className="hidden lg:flex items-center gap-6 text-sm">
              {NAV_ITEMS.map((item) => (
                <a 
                  key={item.label}
                  href={item.href} 
                  className="flex items-center gap-1 hover:text-purple-400 transition whitespace-nowrap"
                >
                  <span>{item.emoji}</span>
                  <span className="hidden xl:inline">{item.label}</span>
                </a>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              <button className="text-sm hidden md:block hover:text-purple-400 transition">ES</button>
              
              {!loading && (
                user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 rounded-lg transition text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Salir</span>
                  </button>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg transition font-semibold text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Iniciar Sesión</span>
                  </button>
                )
              )}

              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-xs font-bold hidden md:block">
                Unlimited
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                className="lg:hidden"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <nav className="lg:hidden border-t border-white/5 py-4 space-y-2">
              {NAV_ITEMS.map((item) => (
                <a 
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded transition text-sm"
                >
                  <span>{item.emoji}</span>
                  {item.label}
                </a>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0D17]"></div>
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4 py-16 md:py-0">
          <div className="max-w-5xl mx-auto w-full">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-8">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-black text-lg">CC</span>
              </div>
              <div>
                <div className="text-xs text-purple-300 font-semibold">COMIC CRAFTER IA STORIES</div>
                <div className="text-xs text-slate-500">Plataforma de Creación con Inteligencia Artificial</div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl md:text-7xl font-black mb-2">
                  {HEROES[currentHero].title}
                </h1>
                <h2 className="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                  {HEROES[currentHero].subtitle}
                </h2>
              </div>

              <p className="text-base md:text-lg text-slate-400 max-w-2xl">
                {HEROES[currentHero].desc}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {user ? (
                  <>
                    <a
                      href={createPageUrl("Comics")}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-3 rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2 text-center"
                    >
                      <span>✨</span> Crear mi Cómic
                    </a>
                    <a
                      href={createPageUrl("Videos")}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3 rounded-full font-bold transition flex items-center justify-center gap-2 text-center"
                    >
                      <span>🎬</span> Crear Vídeo
                    </a>
                  </>
                ) : (
                  <button
                    onClick={handleLogin}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-3 rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>🚀</span> Comienza Ahora
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6">
          <button
            onClick={() => setCurrentHero(currentHero === 0 ? HEROES.length - 1 : currentHero - 1)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            {HEROES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentHero(idx)}
                className={`h-1 transition-all ${
                  idx === currentHero
                    ? "bg-purple-600 w-8"
                    : "bg-white/20 w-2 hover:bg-white/40"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentHero(currentHero === HEROES.length - 1 ? 0 : currentHero + 1)}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>
    </div>
  );
}