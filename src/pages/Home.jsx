import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Film, Sparkles, Zap, ShoppingCart, Menu, X } from "lucide-react";

export default function Home() {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white">
      {/* Ambient Glows */}
      <div className="fixed top-0 right-0 w-1/3 h-1/3 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-1/3 h-1/3 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0D17]/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold">ComicCrafter AI</h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm hover:text-purple-400 transition">Características</a>
            <a href="#showcase" className="text-sm hover:text-purple-400 transition">Galería</a>
            <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full transition">
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
          <div className="md:hidden border-t border-white/5 bg-[#111322]/80 backdrop-blur">
            <nav className="flex flex-col gap-2 px-4 py-4">
              <a href="#features" className="px-4 py-2 hover:bg-white/10 rounded transition">Características</a>
              <a href="#showcase" className="px-4 py-2 hover:bg-white/10 rounded transition">Galería</a>
            </nav>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-10 h-10" />
            </div>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-4">ComicCrafter AI</h2>
          <p className="text-xl text-slate-400 mb-12">
            Crea cómics, vídeos y personajes 3D con inteligencia artificial
          </p>

          {/* Main CTA Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-12">
            <Link
              to={createPageUrl("Comics")}
              className="group bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-2xl py-8 px-6 transition flex flex-col items-center gap-3 active:scale-95 shadow-xl"
            >
              <BookOpen className="w-8 h-8 group-hover:scale-110 transition" />
              <span className="font-bold">Cómics</span>
            </Link>
            <Link
              to={createPageUrl("Videos")}
              className="group bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-2xl py-8 px-6 transition flex flex-col items-center gap-3 active:scale-95 shadow-xl"
            >
              <Film className="w-8 h-8 group-hover:scale-110 transition" />
              <span className="font-bold">Vídeos</span>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto mb-16">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="flex items-start gap-4">
                <Zap className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold mb-2">IA Generativa</h3>
                  <p className="text-sm text-slate-400">
                    Crea contenido visual único con inteligencia artificial avanzada
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition">
              <div className="flex items-start gap-4">
                <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                <div className="text-left">
                  <h3 className="font-bold mb-2">Fácil de Usar</h3>
                  <p className="text-sm text-slate-400">
                    Interfaz intuitiva para cualquier nivel de experiencia
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-4 rounded-full font-bold transition shadow-xl hover:shadow-2xl">
            Comenzar Gratis
          </button>
        </div>
      </section>
    </div>
  );
}