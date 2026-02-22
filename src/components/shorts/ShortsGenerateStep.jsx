import React from "react";
import { Button } from "@/components/ui/button";
import { Film, Sparkles, Loader2, Zap } from "lucide-react";
import { motion } from "framer-motion";

const styleLabels = {
  anime: "Anime Clásico", manga: "Manga B&W", one_piece: "One Piece",
  naruto: "Naruto", inuyasha: "Inuyasha", cyberpunk_anime: "Cyberpunk Anime", fantasy_anime: "Fantasy Épico"
};

export default function ShortsGenerateStep({ title, story, style, frameCount, characters, isGenerating, progress, status, totalFrames, onGenerate }) {
  const validChars = (characters || []).filter(c => c.name?.trim());

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isGenerating ? "Animando tu Corto..." : "¡Listo para Animar!"}
        </h2>
        <p className="text-gray-400 text-sm">
          {isGenerating ? "La IA está creando cada fotograma. Esto puede tardar unos minutos." : "Revisa los detalles y genera tu corto animado estilo anime."}
        </p>
      </div>

      {isGenerating ? (
        <div className="space-y-6">
          {/* Animated film strip */}
          <div className="flex justify-center gap-1.5 py-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2], scaleY: [0.6, 1, 0.6] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15 }}
                className="w-4 rounded-sm bg-gradient-to-b from-pink-500 to-violet-500"
                style={{ height: 40 + Math.sin(i) * 15 }}
              />
            ))}
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">{status}</span>
              <span className="text-sm font-bold text-pink-400">{progress}/{totalFrames}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-pink-500 to-violet-500 rounded-full"
                animate={{ width: `${totalFrames > 0 ? (progress / totalFrames) * 100 : 5}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="text-xs text-gray-600 text-center">Guion IA + {totalFrames} fotogramas en paralelo</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <div className="p-5 rounded-2xl border border-white/5 bg-white/[0.02] space-y-3">
            {[
              { label: "Título", value: title || "Sin título" },
              { label: "Personajes", value: validChars.map(c => c.name).join(", ") || "Sin personajes" },
              { label: "Estilo", value: styleLabels[style] || style },
              { label: "Fotogramas", value: `${frameCount} frames (~${Math.round(frameCount * 3)}s)` },
              { label: "Historia", value: story?.slice(0, 100) + (story?.length > 100 ? "..." : "") || "Sin historia" },
            ].map(item => (
              <div key={item.label} className="flex gap-3">
                <span className="text-xs text-gray-500 w-24 flex-shrink-0 pt-0.5">{item.label}</span>
                <span className="text-sm text-white leading-relaxed">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2">
            {["Guion IA estilo anime", `${frameCount} keyframes HD`, "Visor cinematográfico"].map(f => (
              <div key={f} className="p-3 rounded-xl bg-pink-500/5 border border-pink-500/10 text-center">
                <Zap className="w-4 h-4 text-pink-400 mx-auto mb-1" />
                <p className="text-[11px] text-gray-400">{f}</p>
              </div>
            ))}
          </div>

          <Button
            onClick={onGenerate}
            disabled={!title || !story}
            className="w-full h-14 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 rounded-xl gap-3 text-base font-semibold disabled:opacity-30"
          >
            <Film className="w-5 h-5" />
            ¡Generar Corto Animado!
          </Button>
          <p className="text-xs text-gray-600 text-center">La generación tarda 2-4 minutos dependiendo de los fotogramas</p>
        </div>
      )}
    </motion.div>
  );
}