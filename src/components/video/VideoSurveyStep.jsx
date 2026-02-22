import React, { useState } from "react";
import { Wand2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const GENRES = [
  { id: "adventure", label: "⚔️ Aventura", desc: "Viajes épicos y emoción" },
  { id: "action", label: "💥 Acción", desc: "Combates y poder" },
  { id: "comedy", label: "😄 Comedia", desc: "Humor e hilaridad" },
  { id: "drama", label: "💧 Drama", desc: "Emociones profundas" },
  { id: "mystery", label: "🌀 Misterio", desc: "Secretos y suspense" },
  { id: "fantasy", label: "🧙 Fantasía", desc: "Magia y mundos mágicos" },
];

const THEMES = [
  { id: "friendship", label: "👥 Amistad", emoji: "👫" },
  { id: "courage", label: "💪 Valentía", emoji: "🦸" },
  { id: "growth", label: "📈 Crecimiento", emoji: "🌱" },
  { id: "love", label: "❤️ Amor", emoji: "💕" },
  { id: "justice", label: "⚖️ Justicia", emoji: "⚔️" },
  { id: "family", label: "👨‍👩‍👧‍👦 Familia", emoji: "🏠" },
];

export default function VideoSurveyStep({
  selectedGenre,
  setSelectedGenre,
  selectedThemes,
  setSelectedThemes,
  tone,
  setTone,
  title,
  setTitle,
  story,
  setStory,
  targetAge,
  characters,
  projectType,
}) {
  const [generating, setGenerating] = useState(false);

  const toggleTheme = (themeId) => {
    setSelectedThemes(
      selectedThemes.includes(themeId)
        ? selectedThemes.filter((t) => t !== themeId)
        : [...selectedThemes, themeId]
    );
  };

  const generateStory = async () => {
    setGenerating(true);
    const validChars = characters.filter((c) => c.name?.trim());
    const charDesc = validChars
      .map((c) => `${c.name}: ${c.description || "personaje"}`)
      .join(", ");

    const themesText = selectedThemes
      .map((t) => THEMES.find((th) => th.id === t)?.label)
      .join(", ");

    const genreObj = GENRES.find((g) => g.id === selectedGenre);

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Eres un experto guionista de vídeos animados infantiles con experiencia en cortometrajes de alta calidad.

Crea una historia cautivadora para un ${genreObj.label.split(" ")[1]} vídeo animado.

INFORMACIÓN DEL PROYECTO:
- Género: ${selectedGenre}
- Temas principales: ${themesText || "múltiples"}
- Tono: ${tone}
- Edad objetivo: ${targetAge} años
- Personajes: ${charDesc || "personajes originales"}
- Tipo: ${projectType}

REQUISITOS:
- Historia emocionante y apropiada para edad ${targetAge}
- Estructura clara: introducción → desarrollo → clímax → resolución satisfactoria
- Incluye los temas seleccionados de forma natural
- Tiene un mensaje moral o lección implícita
- Longitud: 150-250 palabras
- Tono ${tone}
- Escenas visuales dinámicas y cinematográficas

Responde con JSON: {"title": "Título Creativo", "story": "La historia completa..."}`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          story: { type: "string" },
        },
      },
    });

    if (result.title) setTitle(result.title);
    if (result.story) setStory(result.story);
    setGenerating(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          Configura tu Vídeo
        </h2>
        <p className="text-gray-400 text-sm">
          Selecciona género, temas y tono para generar una historia perfecta
        </p>
      </div>

      {/* Género */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          Género
        </label>
        <div className="grid grid-cols-3 gap-2">
          {GENRES.map((g) => (
            <button
              key={g.id}
              onClick={() => setSelectedGenre(g.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedGenre === g.id
                  ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-300"
                  : "border-white/5 bg-white/[0.02] text-gray-400 hover:border-yellow-500/20 hover:text-gray-300"
              }`}
            >
              <div className="text-sm font-medium">{g.label}</div>
              <div className="text-[11px] text-gray-600 mt-0.5">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Temas */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          Temas principales (puedes seleccionar varios)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => toggleTheme(th.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                selectedThemes.includes(th.id)
                  ? "border-pink-500/50 bg-pink-500/10 text-pink-300"
                  : "border-white/5 bg-white/[0.02] text-gray-400 hover:border-pink-500/20"
              }`}
            >
              <span className="text-lg mr-1">{th.emoji}</span>
              <span className="text-sm font-medium">{th.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tono */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">
          Tono de la historia
        </label>
        <div className="flex gap-2 flex-wrap">
          {["inspirador", "emocionante", "misterioso", "gracioso", "épico"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                  tone === t
                    ? "border-violet-500/50 bg-violet-500/10 text-violet-300"
                    : "border-white/5 bg-white/[0.02] text-gray-400 hover:border-violet-500/20"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            )
          )}
        </div>
      </div>

      {/* Generar historia */}
      <Button
        onClick={generateStory}
        disabled={generating}
        className="w-full h-11 bg-gradient-to-r from-yellow-600/20 to-pink-600/20 border border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20 hover:border-yellow-500/50 rounded-xl gap-2 text-sm"
        variant="outline"
      >
        {generating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wand2 className="w-4 h-4" />
        )}
        {generating
          ? "Generando historia..."
          : "✨ Generar Historia con IA"}
      </Button>

      {/* Título y Historia */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Título del vídeo
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: El Viaje Mágico, La Última Batalla..."
            className="w-full h-10 px-4 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-yellow-500/50 text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">
            Historia
          </label>
          <textarea
            value={story}
            onChange={(e) => setStory(e.target.value)}
            placeholder="Describe tu historia: trama, conflicto, escenas clave, resolución..."
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-gray-600 focus:border-yellow-500/50 min-h-[150px] text-sm resize-none"
          />
          <p className="text-xs text-gray-600 mt-1.5">
            {story.length} caracteres
          </p>
        </div>
      </div>
    </motion.div>
  );
}