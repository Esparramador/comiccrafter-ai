import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";

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

export default function Home() {
  const [currentHero, setCurrentHero] = useState(0);

  return (
    <div className="min-h-screen bg-[#0B0D17] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#0B0D17]/95 backdrop-blur-xl border-b border-white/5 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-green-400 to-cyan-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <span className="text-sm font-bold">Comic<br/>Crafter</span>
            </div>

            {/* Nav - Desktop */}
            <nav className="hidden md:flex items-center gap-8 text-sm">
              <a href="#" className="flex items-center gap-2 hover:text-purple-400 transition">
                <span>🏠</span> Inicio
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-purple-400 transition">
                <span>📚</span> Portadas & Guiones
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-purple-400 transition">
                <span>🎬</span> Video / Cortos
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-purple-400 transition">
                <span>🎯</span> Modelos 3D
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-cyan-400 transition">
                <span>🎤</span> Voces IA
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-cyan-400 transition">
                <span>✨</span> Crear Personaje
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-green-400 transition">
                <span>🛍️</span> Tienda
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-purple-400 transition">
                <span>📁</span> Creaciones
              </a>
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              <button className="text-sm hover:text-purple-400 transition hidden md:block">ES</button>
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1 rounded-full text-xs font-bold hidden md:block">
                Unlimited
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Carousel */}
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#0B0D17]"></div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-4 py-16 md:py-0">
          <div className="max-w-5xl mx-auto w-full">
            {/* Badge */}
            <div className="flex items-center gap-2 mb-8 justify-start md:justify-center">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-green-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <span className="text-xs text-purple-300 font-semibold">COMIC CRAFTER IA STORIES</span>
              <span className="text-xs text-slate-500">Plataforma de Creación con Inteligencia Artificial</span>
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
              <div className="flex flex-col md:flex-row gap-4 pt-4">
                <Link
                  to={createPageUrl("Comics")}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-8 py-3 rounded-full font-bold transition shadow-lg flex items-center justify-center gap-2"
                >
                  <span>✨</span> Crear mi Cómic
                </Link>
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3 rounded-full font-bold transition flex items-center justify-center gap-2">
                  <span>🎯</span> Crear Modelo 3D
                </button>
                <button className="bg-white/10 hover:bg-white/20 border border-white/20 px-8 py-3 rounded-full font-bold transition flex items-center justify-center gap-2">
                  <span>🎤</span> Voces IA
                </button>
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