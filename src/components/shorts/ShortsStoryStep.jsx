import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, Loader2, RefreshCw } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { value: "es", label: "Español" },
  { value: "en", label: "English" },
  { value: "ja", label: "日本語" },
  { value: "fr", label: "Français" },
  { value: "pt", label: "Português" },
];

const GENRES = [
  { id: "adventure", label: "⚔️ Aventura", desc: "Viajes épicos y batallas" },
  { id: "action", label: "💥 Acción", desc: "Combates y poder" },
  { id: "drama", label: "💧 Drama", desc: "Emociones profundas" },
  { id: "mystery", label: "🌀 Misterio", desc: "Secretos y revelaciones" },
  { id: "romance", label: "🌸 Romance", desc: "Vínculos y sentimientos" },
  { id: "supernatural", label: "✨ Sobrenatural", desc: "Poderes y magia" },
];

export default function ShortsStoryStep({ title, setTitle, story, setStory, language, setLanguage, characters }) {
  const [generating, setGenerating] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("adventure");

  const generateStory = async () => {
    setGenerating(true);
    const validChars = characters.filter(c => c.name?.trim());
    const charDesc = validChars.map(c => `${c.name}: ${c.description || "protagonist"}`).join(", ");
    const langNames = { es: "Spanish", en: "English", ja: "Japanese", fr: "French", pt: "Portuguese" };

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert anime writer inspired by ONE PIECE, Naruto, Inuyasha, Dragon Ball, and Demon Slayer.

Create a compelling ${selectedGenre} anime short story for a ${selectedGenre} animated short.

CHARACTERS: ${charDesc || "Create original characters"}
GENRE: ${selectedGenre}
LANGUAGE: ${langNames[language] || "Spanish"}

Requirements:
- Epic, emotionally resonant story in ${langNames[language] || "Spanish"}
- Classic anime storytelling: strong bonds, personal growth, dramatic conflicts
- 3-act structure: hook → escalation → powerful resolution
- Include a memorable moment or twist
- Suitable for an animated short (8-12 frames)

Output: {"title": "...", "story": "..."}
The story should be 100-200 words. Make it feel like a real anime episode.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          story: { type: "string" }
        }
      }
    });

    if (result.title) setTitle(result.title);
    if (result.story) setStory(result.story);
    setGenerating(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Historia del Corto</h2>
        <p className="text-gray-400 text-sm">Escribe tu historia o genera una con IA al estilo anime</p>
      </div>

      {/* Genre picker */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Género</label>
        <div className="grid grid-cols-3 gap-2">
          {GENRES.map(g => (
            <button key={g.id} onClick={() => setSelectedGenre(g.id)}
              className={`p-3 rounded-xl border text-left transition-all ${selectedGenre === g.id ? "border-pink-500/50 bg-pink-500/10 text-pink-300" : "border-white/5 bg-white/[0.02] text-gray-400 hover:border-pink-500/20 hover:text-gray-300"}`}
            >
              <div className="text-sm font-medium">{g.label}</div>
              <div className="text-[11px] text-gray-600 mt-0.5">{g.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* AI Generate button */}
      <Button onClick={generateStory} disabled={generating}
        className="w-full h-11 bg-gradient-to-r from-pink-600/20 to-violet-600/20 border border-pink-500/30 text-pink-300 hover:bg-pink-500/20 hover:border-pink-500/50 rounded-xl gap-2 text-sm"
        variant="outline"
      >
        {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
        {generating ? "Generando historia anime..." : "✨ Generar historia con IA (estilo anime)"}
      </Button>

      {/* Language */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Idioma de los diálogos</label>
        <div className="flex gap-2 flex-wrap">
          {LANGUAGES.map(l => (
            <button key={l.value} onClick={() => setLanguage(l.value)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${language === l.value ? "border-pink-500/50 bg-pink-500/10 text-pink-300" : "border-white/5 bg-white/[0.02] text-gray-400 hover:border-pink-500/20"}`}
            >{l.label}</button>
          ))}
        </div>
      </div>

      {/* Title & Story */}
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Título del Corto</label>
          <Input placeholder="Ej: El Último Nakama, La Llama del Hokage..." value={title} onChange={e => setTitle(e.target.value)}
            className="h-12 bg-white/5 border-white/10 text-white text-base placeholder:text-gray-600 focus:border-pink-500/50 rounded-xl"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Historia</label>
          <Textarea placeholder="Describe tu historia: trama, conflicto, escenas clave, resolución emocional..." value={story} onChange={e => setStory(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500/50 min-h-[180px] rounded-xl leading-relaxed"
          />
          <p className="text-xs text-gray-600 mt-1.5">{story.length} caracteres</p>
        </div>
      </div>
    </div>
  );
}