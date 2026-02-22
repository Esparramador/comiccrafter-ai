import React from "react";
import { motion } from "framer-motion";
import { Slider } from "@/components/ui/slider";

const STYLES = [
  { id: "cartoon_2d", label: "Dibujos Animados 2D", emoji: "🎨", desc: "Cartoon Network, Nickelodeon" },
  { id: "pixar_3d", label: "Estilo Pixar 3D", emoji: "✨", desc: "Pixar, Disney, DreamWorks" },
  { id: "storybook", label: "Libro de Cuentos", emoji: "📖", desc: "Ilustración clásica de cuento" },
  { id: "watercolor", label: "Acuarela", emoji: "🌸", desc: "Suave, pastel, artístico" },
  { id: "anime", label: "Anime Ghibli", emoji: "🌿", desc: "Studio Ghibli, Totoro" },
  { id: "disney_classic", label: "Disney Clásico", emoji: "🏰", desc: "Animación clásica de Disney" },
  { id: "realistic_3d", label: "Realista 3D", emoji: "🎬", desc: "Renderizado fotorrealista, cinemático" },
];

const MOODS = [
  { id: "magical", label: "Mágico", emoji: "✨" },
  { id: "adventure", label: "Aventura", emoji: "⚔️" },
  { id: "funny", label: "Divertido", emoji: "😄" },
  { id: "calm", label: "Tranquilo", emoji: "🌙" },
  { id: "dramatic", label: "Dramático", emoji: "🎭" },
  { id: "educational", label: "Educativo", emoji: "📚" },
];

export default function VideoStyleStep({ style, setStyle, sceneCount, setSceneCount, musicMood, setMusicMood, customPrompt, setCustomPrompt, targetAge }) {
  const recommendedCount = targetAge === "0-3" ? 6 : targetAge === "3-6" ? 8 : 10;
  const durationMinutes = Math.round(sceneCount * 0.5);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Estilo visual</h2>
        <p className="text-gray-500 text-sm mb-4">Elige cómo se verá tu vídeo animado</p>
        <div className="grid grid-cols-2 gap-2">
          {STYLES.map(s => (
            <button
              key={s.id}
              onClick={() => setStyle(s.id)}
              className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                style === s.id ? "border-yellow-500/40 bg-yellow-500/10" : "border-white/5 bg-white/[0.03] hover:bg-white/5"
              }`}
            >
              <span className="text-2xl">{s.emoji}</span>
              <div>
                <p className={`text-xs font-medium ${style === s.id ? "text-yellow-300" : "text-white"}`}>{s.label}</p>
                <p className="text-[10px] text-gray-600">{s.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
         <label className="text-xs text-gray-500 mb-3 block">
           Duración del vídeo: <span className="text-white font-semibold">~{durationMinutes} min</span>
           <span className="text-gray-600 ml-2">({sceneCount} escenas)</span>
           {sceneCount === recommendedCount && <span className="text-yellow-400 ml-1">(Recomendado)</span>}
         </label>
         <Slider
           value={[sceneCount]}
           onValueChange={([v]) => setSceneCount(v)}
           min={4} max={200} step={2}
           className="w-full"
         />
         <div className="flex justify-between text-[10px] text-gray-600 mt-1">
           <span>4 escenas (~2 min)</span>
           <span>200 escenas (~100 min)</span>
         </div>
       </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Música ambiente</p>
        <div className="grid grid-cols-3 gap-2">
          {MOODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMusicMood(m.id)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border text-xs transition-all ${
                musicMood === m.id ? "border-pink-500/40 bg-pink-500/10 text-pink-300" : "border-white/5 bg-white/[0.03] text-gray-500 hover:bg-white/5"
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Prompt visual personalizado (opcional)</label>
        <textarea
          value={customPrompt}
          onChange={e => setCustomPrompt(e.target.value)}
          placeholder="Describe el estilo visual exacto si quieres algo específico..."
          className="w-full h-20 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/40 resize-none"
        />
      </div>
    </motion.div>
  );
}