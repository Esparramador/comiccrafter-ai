import { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Film, Wand2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="px-4 py-12 text-center">
        <div className="mb-6">
          <div className="inline-block bg-black rounded-full p-4 mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-2">ComicCrafter AI</h1>
        <p className="text-slate-300 text-lg mb-8">
          Crea cómics, vídeos y personajes 3D con IA
        </p>

        {/* Main Actions */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Link
            to={createPageUrl("Comics")}
            className="bg-blue-600 hover:bg-blue-700 rounded-lg p-4 transition flex flex-col items-center gap-2"
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-sm font-semibold">Cómics</span>
          </Link>
          <Link
            to={createPageUrl("Videos")}
            className="bg-purple-600 hover:bg-purple-700 rounded-lg p-4 transition flex flex-col items-center gap-2"
          >
            <Film className="w-6 h-6" />
            <span className="text-sm font-semibold">Vídeos</span>
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto">
          <div className="bg-slate-700/50 rounded-lg p-4 text-left">
            <div className="flex gap-3">
              <Wand2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">IA Generativa</h3>
                <p className="text-sm text-slate-300">
                  Crea contenido visual con inteligencia artificial
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-4 text-left">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-1">Fácil de Usar</h3>
                <p className="text-sm text-slate-300">
                  Interfaz intuitiva para cualquier usuario
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}