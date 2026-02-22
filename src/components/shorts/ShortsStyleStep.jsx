import React from "react";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Film } from "lucide-react";

const STYLES = [
  { id: "anime", label: "Anime Clásico", emoji: "🎌", desc: "Colores vibrantes, expresiones dinámicas", ref: "Studio Ghibli, Demon Slayer" },
  { id: "one_piece", label: "One Piece", emoji: "☠️", desc: "Estilo Oda, aventura y comedia", ref: "One Piece, Dr. Stone" },
  { id: "naruto", label: "Naruto / Boruto", emoji: "🍥", desc: "Acción ninja, chakra effects", ref: "Naruto, Boruto, Jujutsu Kaisen" },
  { id: "inuyasha", label: "Inuyasha / Retro", emoji: "🌸", desc: "Japón feudal, drama sobrenatural", ref: "Inuyasha, Bleach, Rurouni Kenshin" },
  { id: "manga", label: "Manga B&W", emoji: "📖", desc: "Tinta negra, screentones, dinámico", ref: "Berserk, Vagabond, Attack on Titan" },
  { id: "cyberpunk_anime", label: "Cyberpunk Anime", emoji: "🤖", desc: "Neón, futuro, tech aesthetic", ref: "Ghost in the Shell, Akira, Psycho-Pass" },
  { id: "fantasy_anime", label: "Fantasy Épico", emoji: "⚔️", desc: "Magia, batallas épicas, mundos vastos", ref: "Re:Zero, Sword Art Online, Overlord" },
];

export default function ShortsStyleStep({ style, setStyle, frameCount, setFrameCount, customPrompt, setCustomPrompt }) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Estilo Visual</h2>
        <p className="text-gray-400 text-sm">Elige la estética anime de tu corto animado</p>
      </div>

      {/* Style grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STYLES.map(s => (
          <button key={s.id} onClick={() => setStyle(s.id)}
            className={`p-4 rounded-2xl border text-left transition-all ${style === s.id ? "border-pink-500/50 bg-gradient-to-br from-pink-500/10 to-violet-500/10" : "border-white/5 bg-white/[0.02] hover:border-pink-500/20 hover:bg-white/[0.04]"}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{s.emoji}</span>
              <span className={`text-sm font-semibold ${style === s.id ? "text-pink-300" : "text-white"}`}>{s.label}</span>
            </div>
            <p className="text-xs text-gray-500 mb-1">{s.desc}</p>
            <p className="text-[10px] text-gray-700">Refs: {s.ref}</p>
          </button>
        ))}
      </div>

      {/* Frame count */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-300">Fotogramas del Corto</label>
          <span className="text-sm font-bold text-pink-400">{frameCount} frames</span>
        </div>
        <Slider value={[frameCount]} onValueChange={([v]) => setFrameCount(v)} min={6} max={16} step={2}
          className="[&_[role=slider]]:bg-pink-500 [&_[role=slider]]:border-pink-500"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>6 (Corto rápido)</span>
          <span>12 (Estándar)</span>
          <span>16 (Largo)</span>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          ~{Math.round(frameCount * 3)} segundos de visualización a 30fps estimado
        </p>
      </div>

      {/* Custom prompt */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Prompt personalizado (opcional)</label>
        <Textarea
          placeholder="Describe un estilo visual específico, paleta de colores, referencias de arte adicionales..."
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500/50 h-24 rounded-xl resize-none"
        />
      </div>

      {/* Info tag */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-pink-500/5 border border-pink-500/10">
        <Film className="w-4 h-4 text-pink-400 flex-shrink-0" />
        <p className="text-xs text-gray-400">La IA generará cada fotograma como una escena de anime clave, con composición cinematográfica y calidad de producción.</p>
      </div>
    </div>
  );
}