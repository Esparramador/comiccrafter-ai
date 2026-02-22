import React from "react";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";

const styles = [
  { value: "manga", label: "Manga", emoji: "🇯🇵", desc: "Estilo manga japonés clásico" },
  { value: "anime", label: "Anime", emoji: "✨", desc: "Anime moderno con colores vibrantes" },
  { value: "american_comic", label: "Cómic USA", emoji: "🦸", desc: "Estilo Marvel/DC americano" },
  { value: "noir", label: "Noir", emoji: "🌑", desc: "Oscuro, misterioso, alto contraste" },
  { value: "watercolor", label: "Acuarela", emoji: "🎨", desc: "Suave, artístico, texturas acuarela" },
  { value: "ligne_claire", label: "Línea Clara", emoji: "📐", desc: "Limpio, detallado, estilo europeo" },
  { value: "cyberpunk", label: "Cyberpunk", emoji: "🌃", desc: "Futurista, neón, tecnología" },
  { value: "fantasy", label: "Fantasía", emoji: "🐉", desc: "Épico, mágico, mundos fantásticos" },
];

export default function StyleStep({ style, setStyle, pageCount, setPageCount }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Elige el Estilo</h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Selecciona el estilo visual para tu cómic y define cuántas páginas quieres generar.
        </p>
      </div>

      {/* Style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {styles.map((s) => (
          <button
            key={s.value}
            onClick={() => setStyle(s.value)}
            className={`p-4 rounded-xl border text-left transition-all duration-200 ${
              style === s.value
                ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
            }`}
          >
            <div className="text-2xl mb-2">{s.emoji}</div>
            <div className={`text-sm font-semibold mb-0.5 ${style === s.value ? "text-violet-300" : "text-white"}`}>
              {s.label}
            </div>
            <div className="text-[11px] text-gray-500 leading-snug">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Page Count */}
      <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold">Número de Páginas</h3>
            <p className="text-xs text-gray-500">Más páginas = historia más detallada</p>
          </div>
          <div className="text-3xl font-black bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
            {pageCount}
          </div>
        </div>
        <Slider
          value={[pageCount]}
          onValueChange={([val]) => setPageCount(val)}
          min={2}
          max={20}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>2 páginas</span>
          <span>20 páginas</span>
        </div>
      </div>
    </motion.div>
  );
}