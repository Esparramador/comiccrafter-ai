import React from "react";
import { Baby, Film, Tv, Music, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

const PROJECT_TYPES = [
  { id: "children_film", label: "Cortometraje Infantil", icon: Baby, color: "from-yellow-500 to-orange-500", desc: "Para niños de 0-10 años, con moraleja" },
  { id: "short_film", label: "Corto Cinematográfico", icon: Film, color: "from-violet-500 to-pink-500", desc: "Corto con narrativa cinemática completa" },
  { id: "animated_series_ep", label: "Episodio de Serie", icon: Tv, color: "from-blue-500 to-cyan-500", desc: "Capítulo de una serie animada" },
  { id: "music_video", label: "Videoclip Animado", icon: Music, color: "from-pink-500 to-rose-500", desc: "Vídeo musical animado con ritmo" },
  { id: "documentary_short", label: "Documental Educativo", icon: BookOpen, color: "from-green-500 to-teal-500", desc: "Contenido educativo animado" },
];

const AGE_GROUPS = [
  { id: "0-3", label: "0-3 años", emoji: "👶", desc: "Bebés y primeros pasos" },
  { id: "3-6", label: "3-6 años", emoji: "🧒", desc: "Preescolar, imaginación" },
  { id: "6-10", label: "6-10 años", emoji: "🧒‍♀️", desc: "Aventura y amistad" },
  { id: "10-14", label: "10-14 años", emoji: "🧑", desc: "Retos y crecimiento" },
  { id: "all_ages", label: "Todas las edades", emoji: "👨‍👩‍👧", desc: "Universal y familiar" },
];

export default function VideoTypeStep({ projectType, setProjectType, targetAge, setTargetAge }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">¿Qué tipo de vídeo quieres crear?</h2>
        <p className="text-gray-500 text-sm mb-4">Elige el formato de tu proyecto</p>
        <div className="space-y-2">
          {PROJECT_TYPES.map(t => {
            const Icon = t.icon;
            const active = projectType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setProjectType(t.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                  active ? "border-yellow-500/40 bg-yellow-500/10" : "border-white/5 bg-white/[0.03] hover:bg-white/5"
                }`}
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className={`font-medium text-sm ${active ? "text-yellow-300" : "text-white"}`}>{t.label}</p>
                  <p className="text-gray-500 text-xs">{t.desc}</p>
                </div>
                {active && <div className="ml-auto w-2 h-2 rounded-full bg-yellow-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {(projectType === "children_film" || projectType === "animated_series_ep") && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">¿Para qué edad?</h2>
          <p className="text-gray-500 text-sm mb-4">Adaptamos el lenguaje y contenido</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {AGE_GROUPS.map(a => (
              <button
                key={a.id}
                onClick={() => setTargetAge(a.id)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  targetAge === a.id ? "border-orange-500/40 bg-orange-500/10 text-orange-300" : "border-white/5 bg-white/[0.03] hover:bg-white/5 text-gray-400"
                }`}
              >
                <div className="text-2xl mb-1">{a.emoji}</div>
                <div className="text-xs font-semibold">{a.label}</div>
                <div className="text-[10px] text-gray-600 mt-0.5">{a.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}