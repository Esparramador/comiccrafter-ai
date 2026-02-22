import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const LANGUAGES = [
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ca", label: "Català", flag: "🏴" },
];

const AGE_THEMES = {
  "0-3": ["Animales simpáticos", "Juguetes mágicos", "Colores y formas", "Canciones de cuna"],
  "3-6": ["El dragón amistoso", "La princesa valiente", "El bosque encantado", "Los animales que hablan"],
  "6-10": ["El héroe inesperado", "La aventura del espacio", "El misterio de la cueva", "Los guardianes del tiempo"],
  "10-14": ["El elegido", "La prueba final", "El secreto de la familia", "El viaje de regreso"],
  "all_ages": ["El poder de la amistad", "El viaje mágico", "La gran aventura", "El mundo misterioso"],
};

export default function VideoStoryStep({ title, setTitle, story, setStory, moralLesson, setMoralLesson, language, setLanguage, projectType, targetAge }) {
  const [generating, setGenerating] = useState(false);
  const themes = AGE_THEMES[targetAge] || AGE_THEMES["all_ages"];

  const generateStory = async (theme) => {
    setGenerating(true);
    const typeLabels = {
      children_film: "cortometraje infantil animado",
      short_film: "cortometraje cinematográfico",
      animated_series_ep: "episodio de serie animada",
      music_video: "videoclip animado",
      documentary_short: "documental educativo animado"
    };
    const langNames = { es: "español", en: "inglés", fr: "francés", pt: "portugués", it: "italiano", ca: "catalán" };
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Genera una idea completa para un ${typeLabels[projectType] || "cortometraje animado"} para niños de ${targetAge} años.
Tema sugerido: "${theme}"
Idioma: ${langNames[language] || "español"}

Crea:
1. Un título atractivo y memorable
2. Una historia de 3-4 oraciones (planteamiento, nudo y desenlace)
3. Una moraleja o mensaje positivo breve

Responde de forma cálida, creativa y apropiada para la edad indicada.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          story: { type: "string" },
          moral_lesson: { type: "string" }
        }
      }
    });
    if (result.title) setTitle(result.title);
    if (result.story) setStory(result.story);
    if (result.moral_lesson) setMoralLesson(result.moral_lesson);
    setGenerating(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">La historia</h2>
        <p className="text-gray-500 text-sm mb-4">Escribe o genera automáticamente la historia de tu vídeo</p>
      </div>

      {/* Quick theme generator */}
      <div>
        <p className="text-xs text-gray-500 mb-2">💡 Genera una historia automáticamente:</p>
        <div className="flex flex-wrap gap-2">
          {themes.map(theme => (
            <button
              key={theme}
              onClick={() => generateStory(theme)}
              disabled={generating}
              className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:border-yellow-500/30 text-xs text-gray-400 hover:text-yellow-300 transition-all disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-3 h-3 animate-spin inline mr-1" /> : <Sparkles className="w-3 h-3 inline mr-1" />}
              {theme}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Título del vídeo *</label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej: El Dragoncito que no sabía volar"
          className="bg-white/5 border-white/10 text-white placeholder-gray-600"
        />
      </div>

      <div>
        <label className="text-xs text-gray-500 mb-1.5 block">Historia *</label>
        <Textarea
          value={story}
          onChange={e => setStory(e.target.value)}
          placeholder="Escribe aquí la historia... cuéntanos qué pasa, quiénes son los personajes y cómo termina."
          className="bg-white/5 border-white/10 text-white placeholder-gray-600 h-32 resize-none text-sm"
        />
      </div>

      {(projectType === "children_film" || projectType === "animated_series_ep") && (
        <div>
          <label className="text-xs text-gray-500 mb-1.5 block">Moraleja o mensaje ✨</label>
          <Input
            value={moralLesson}
            onChange={e => setMoralLesson(e.target.value)}
            placeholder="Ej: La valentía está en el corazón, no en el tamaño"
            className="bg-white/5 border-white/10 text-white placeholder-gray-600"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-gray-500 mb-2 block">Idioma del vídeo</label>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${
                language === l.code ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-300" : "border-white/5 bg-white/3 text-gray-400 hover:bg-white/5"
              }`}
            >
              <span>{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}