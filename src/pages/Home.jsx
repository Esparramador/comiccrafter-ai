import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { BookOpen, Film, Wand2, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center px-4 py-16">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="mb-6 flex justify-center">
          <div className="inline-block bg-black rounded-full p-4">
            <Sparkles className="w-8 h-8" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">ComicCrafter AI</h1>
        <p className="text-slate-400 text-base">
          Crea cómics, vídeos y personajes 3D con IA
        </p>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-2 gap-4 mb-10 max-w-2xl mx-auto w-full">
        <Link
          to={createPageUrl("Comics")}
          className="bg-blue-600 hover:bg-blue-700 rounded-lg py-6 px-4 transition flex flex-col items-center gap-3 active:scale-95"
        >
          <BookOpen className="w-7 h-7" />
          <span className="font-semibold text-sm">Cómics</span>
        </Link>
        <Link
          to={createPageUrl("Videos")}
          className="bg-purple-600 hover:bg-purple-700 rounded-lg py-6 px-4 transition flex flex-col items-center gap-3 active:scale-95"
        >
          <Film className="w-7 h-7" />
          <span className="font-semibold text-sm">Vídeos</span>
        </Link>
      </div>

      {/* Features */}
      <div className="max-w-sm mx-auto w-full space-y-3">
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-4">
          <div className="flex gap-3">
            <Wand2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">IA Generativa</h3>
              <p className="text-xs text-slate-400">
                Crea contenido visual con inteligencia artificial
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/40 backdrop-blur-sm rounded-lg p-4">
          <div className="flex gap-3">
            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Fácil de Usar</h3>
              <p className="text-xs text-slate-400">
                Interfaz intuitiva para cualquier usuario
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}