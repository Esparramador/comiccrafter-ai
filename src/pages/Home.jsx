import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Film, Sparkles, Zap, ShoppingCart, Menu, X, Play } from "lucide-react";

const GALLERY_IMAGES = [
  "https://raw.githubusercontent.com/Esparramador/comiccrafter-ai/main/shopify-theme/assets/comic-cover.png",
  "https://raw.githubusercontent.com/Esparramador/comiccrafter-ai/main/shopify-theme/assets/custom-comics.png",
  "https://raw.githubusercontent.com/Esparramador/comiccrafter-ai/main/shopify-theme/assets/comiccrafter-showcase.png",
  "https://raw.githubusercontent.com/Esparramador/comiccrafter-ai/main/shopify-theme/assets/comic-banner.png",
];

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white overflow-hidden">
      {/* Animated Background Gallery */}
      <div className="fixed inset-0 z-0 opacity-30">
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 gap-1 overflow-hidden">
          {GALLERY_IMAGES.map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt="gallery"
              className="w-full h-full object-cover opacity-0 animate-pulse"
              style={{
                animationDelay: `${idx * 0.3}s`,
              }}
            />
          ))}
        </div>
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0D17] via-transparent to-[#0B0D17]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0D17] via-transparent to-[#0B0D17]"></div>
      </div>

      {/* Ambient Glows */}
      <div className="fixed top-0 right-0 w-1/2 h-1/2 bg-purple-600/20 rounded-full blur-3xl pointer-events-none z-1"></div>
      <div className="fixed bottom-0 left-0 w-1/2 h-1/2 bg-blue-600/20 rounded-full blur-3xl pointer-events-none z-1"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-[#0B0D17]/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">ComicCrafter AI</h1>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-300 hover:text-purple-400 transition">Características</a>
              <a href="#gallery" className="text-sm text-slate-300 hover:text-purple-400 transition">Galería</a>
              <a href="#pricing" className="text-sm text-slate-300 hover:text-purple-400 transition">Precios</a>
              <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition border border-white/10">
                <ShoppingCart className="w-4 h-4" /> Carrito
              </button>
            </nav>

            {/* Mobile Menu Toggle */}
            <button className="md:hidden" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-white/5 bg-[#111322]/90 backdrop-blur">
              <nav className="flex flex-col px-4 py-4 gap-3">
                <a href="#features" className="px-4 py-2 hover:bg-white/10 rounded transition text-sm">Características</a>
                <a href="#gallery" className="px-4 py-2 hover:bg-white/10 rounded transition text-sm">Galería</a>
                <a href="#pricing" className="px-4 py-2 hover:bg-white/10 rounded transition text-sm">Precios</a>
              </nav>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="relative px-4 py-20 md:py-32 max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-7xl font-bold">
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  ComicCrafter AI
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto">
                Crea cómics, vídeos y personajes 3D con inteligencia artificial
              </p>
            </div>

            {/* Main CTA Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto pt-8">
              <Link
                to={createPageUrl("Comics")}
                className="group relative bg-gradient-to-br from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-2xl py-8 px-8 transition flex flex-col items-center gap-4 active:scale-95 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
                <BookOpen className="w-10 h-10 group-hover:scale-110 transition relative z-10" />
                <div className="relative z-10">
                  <div className="font-bold text-lg">Crear Cómics</div>
                  <div className="text-xs text-white/70">Historias visuales con IA</div>
                </div>
              </Link>
              <Link
                to={createPageUrl("Videos")}
                className="group relative bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl py-8 px-8 transition flex flex-col items-center gap-4 active:scale-95 shadow-2xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition"></div>
                <Film className="w-10 h-10 group-hover:scale-110 transition relative z-10" />
                <div className="relative z-10">
                  <div className="font-bold text-lg">Crear Vídeos</div>
                  <div className="text-xs text-white/70">Cortometrajes animados</div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative px-4 py-20 max-w-7xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Características Principales
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Sparkles,
                title: "IA Generativa",
                desc: "Crea contenido visual único con IA avanzada",
              },
              {
                icon: Zap,
                title: "Rápido y Fácil",
                desc: "Interfaz intuitiva para cualquier usuario",
              },
              {
                icon: Play,
                title: "Múltiples Formatos",
                desc: "Cómics, vídeos, personajes 3D en un solo lugar",
              },
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:bg-white/10 hover:border-white/20 transition"
                >
                  <Icon className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition" />
                  <h4 className="font-bold text-lg mb-2">{feat.title}</h4>
                  <p className="text-slate-400 text-sm">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Gallery Section */}
        <section id="gallery" className="relative px-4 py-20 max-w-7xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Galería de Creaciones
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {GALLERY_IMAGES.map((img, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl overflow-hidden h-80 cursor-pointer"
              >
                <img
                  src={img}
                  alt={`gallery-${idx}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-6">
                  <button className="bg-purple-600 hover:bg-purple-500 rounded-full p-3 mx-auto transition">
                    <Play className="w-6 h-6 fill-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative px-4 py-20 max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-3xl p-12">
            <h3 className="text-3xl md:text-4xl font-bold mb-4">
              Comienza a Crear Hoy
            </h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Únete a miles de creadores que usan ComicCrafter AI para dar vida a sus historias
            </p>
            <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-10 py-4 rounded-full font-bold transition shadow-2xl hover:shadow-3xl">
              Acceso Gratuito
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}