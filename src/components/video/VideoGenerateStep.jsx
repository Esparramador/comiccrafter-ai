import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Baby, Film, Sparkles, Loader2, Volume2 } from "lucide-react";

const TYPE_LABELS = {
  children_film: "Cortometraje Infantil",
  short_film: "Corto Cinematográfico",
  animated_series_ep: "Episodio de Serie",
  music_video: "Videoclip Animado",
  documentary_short: "Documental Educativo"
};

const STYLE_LABELS = {
  cartoon_2d: "Dibujos Animados 2D",
  pixar_3d: "Estilo Pixar 3D",
  storybook: "Libro de Cuentos",
  watercolor: "Acuarela",
  anime: "Anime Ghibli",
  disney_classic: "Disney Clásico"
};

export default function VideoGenerateStep({ title, story, style, sceneCount, characters, projectType, targetAge, isGenerating, progress, status, totalScenes, onGenerate }) {
  if (isGenerating) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <div className="text-6xl mb-6 animate-bounce">🎬</div>
        <h2 className="text-2xl font-bold text-white mb-2">Creando tu vídeo...</h2>
        <p className="text-gray-400 text-sm mb-8">{status}</p>
        <div className="w-full bg-white/5 rounded-full h-3 mb-3">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-yellow-500 to-pink-500 transition-all duration-500"
            style={{ width: `${Math.max(5, (progress / Math.max(totalScenes, 1)) * 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-600">{progress} / {totalScenes} escenas</p>
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: "🤖", label: "IA Guionista" },
            { icon: "🎨", label: "Imágenes IA" },
            { icon: "🎙️", label: "Voces ElevenLabs" },
          ].map((f, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/3 border border-white/5">
              <div className="text-2xl mb-1">{f.icon}</div>
              <p className="text-xs text-gray-500">{f.label}</p>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <div className="text-5xl mb-4">🎬</div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Todo listo!</h2>
        <p className="text-gray-400 text-sm">Revisa el resumen y genera tu vídeo</p>
      </div>

      <div className="p-4 rounded-2xl border border-white/10 bg-white/3 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Título</span>
          <span className="text-white font-medium">{title || "Sin título"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Tipo</span>
          <span className="text-yellow-300">{TYPE_LABELS[projectType] || projectType}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Estilo</span>
          <span className="text-white">{STYLE_LABELS[style] || style}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Escenas</span>
          <span className="text-white">{sceneCount}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">Personajes</span>
          <span className="text-white">{characters.filter(c => c.name?.trim()).map(c => c.name).join(", ") || "—"}</span>
        </div>
        {targetAge && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Edad objetivo</span>
            <span className="text-white">{targetAge} años</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: "🤖", label: "Guion IA", desc: "Narrativa profesional" },
          { icon: "🎨", label: "Imágenes IA", desc: "Escenas animadas" },
          { icon: "🎙️", label: "ElevenLabs", desc: "Voces profesionales" },
        ].map((f, i) => (
          <div key={i} className="p-3 rounded-xl bg-gradient-to-b from-white/5 to-white/3 border border-white/10">
            <div className="text-2xl mb-1">{f.icon}</div>
            <p className="text-xs text-white font-medium">{f.label}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>

      <Button
        onClick={onGenerate}
        disabled={!title || !story}
        className="w-full h-12 bg-gradient-to-r from-yellow-600 to-pink-600 hover:from-yellow-500 hover:to-pink-500 rounded-xl text-base font-bold gap-2 disabled:opacity-30"
      >
        <Sparkles className="w-5 h-5" /> Generar Vídeo Animado
      </Button>

      <p className="text-center text-xs text-gray-600">~{Math.round(sceneCount * 20)} segundos estimados</p>
    </motion.div>
  );
}