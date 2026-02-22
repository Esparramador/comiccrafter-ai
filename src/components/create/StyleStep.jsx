import React, { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2 } from "lucide-react";

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

const presets = [
  {
    id: "manga_seinen",
    label: "Manga Seinen Oscuro",
    style: "manga",
    tag: "🖤 Seinen",
    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&q=80",
    desc: "Trazos expresivos, claroscuro extremo, narrativa adulta y psicológica.",
    prompt: "Dark seinen manga style, heavy black ink, extreme contrast, gritty textures, psychological horror undertones, rough brushwork, detailed hatching, cinematic panel composition, adult themes, 1990s Japanese manga aesthetic, masterpiece"
  },
  {
    id: "slice_watercolor",
    label: "Slice of Life Acuarela",
    style: "watercolor",
    tag: "🎨 Acuarela",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80",
    desc: "Colores suaves y lavados, ambiente cotidiano, emociones delicadas.",
    prompt: "Watercolor comic style, soft pastel washes, loose flowing lines, everyday slice-of-life scenes, warm cozy atmosphere, gentle textures, ink and watercolor combination, light and airy, Studio Ghibli inspired palette, emotional and tender, masterpiece"
  },
  {
    id: "superhero_classic",
    label: "Cómic de Superhéroes Clásico",
    style: "american_comic",
    tag: "🦸 Marvel/DC",
    image: "https://images.unsplash.com/photo-1531259683007-016a7b628fc3?w=400&q=80",
    desc: "Colores primarios brillantes, onomatopeyas, héroes en poses épicas.",
    prompt: "Classic American superhero comic book style, bold primary colors, strong black ink outlines, dynamic action poses, halftone dot patterns, dramatic lighting, onomatopoeia sound effects, retro 1960s-80s Marvel DC aesthetic, muscular heroic figures, explosive action panels, speech bubbles, masterpiece quality"
  },
  {
    id: "epic_fantasy",
    label: "Fantasía Épica",
    style: "fantasy",
    tag: "🐉 Fantasy",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80",
    desc: "Magia, criaturas épicas, paisajes grandiosos y colores dorados.",
    prompt: "Epic high fantasy comic illustration, rich jewel-tone colors, detailed ornate environments, magical glowing effects, dramatic god-rays lighting, intricate armor and weapons, mythical creatures, sweeping landscapes, painterly detailed style, gold and deep purple palette, cinematic fantasy art, masterpiece quality, 8k"
  },
  {
    id: "cyberpunk_neo",
    label: "Neo-Cyberpunk Neon",
    style: "cyberpunk",
    tag: "🌃 Cyber",
    image: "https://images.unsplash.com/photo-1563089145-599997674d42?w=400&q=80",
    desc: "Luces de neón, lluvia, cyborgs y megaciudades distópicas.",
    prompt: "Neo-cyberpunk comic style, electric neon colors magenta cyan yellow, rain-slicked streets, holographic advertisements, chrome cyborg augmentations, dark dystopian megacity, glitch effects, high contrast shadows, blade runner atmosphere, detailed tech noir environments, vibrant luminous glow, masterpiece"
  },
  {
    id: "manga_shojo",
    label: "Shojo Romántico",
    style: "anime",
    tag: "🌸 Shojo",
    image: "https://images.unsplash.com/photo-1490750967868-88df5691cc1b?w=400&q=80",
    desc: "Ojos grandes, flores, tonos rosas y narrativas románticas.",
    prompt: "Shojo manga anime style, large expressive sparkling eyes, delicate line art, floral decorative backgrounds, soft pink and purple palette, romantic atmosphere, sparkles and flowers, elegant fashion, emotional close-ups, dreamy lighting, screen tones, heartfelt expressions, masterpiece quality"
  },
];

export default function StyleStep({ style, setStyle, pageCount, setPageCount, customPrompt, setCustomPrompt }) {
  const [selectedPreset, setSelectedPreset] = useState(null);

  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset.id);
    setStyle(preset.style);
    setCustomPrompt(preset.prompt);
  };

  const handleBaseStyleSelect = (value) => {
    setStyle(value);
    setSelectedPreset(null);
    setCustomPrompt("");
  };

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
          Selecciona un estilo predefinido curado o elige una base y personaliza.
        </p>
      </div>

      {/* Preset Gallery */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-violet-300 uppercase tracking-wider">Estilos Predefinidos</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {presets.map((preset) => {
            const isActive = selectedPreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset)}
                className={`relative rounded-xl overflow-hidden border text-left transition-all duration-200 group ${
                  isActive
                    ? "border-violet-500 shadow-lg shadow-violet-500/20 ring-1 ring-violet-500/40"
                    : "border-white/5 hover:border-white/15"
                }`}
              >
                {/* Image */}
                <div className="relative h-28 overflow-hidden">
                  <img
                    src={preset.image}
                    alt={preset.label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  {isActive && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-[10px] font-semibold bg-black/60 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                    {preset.tag}
                  </span>
                </div>
                {/* Info */}
                <div className={`p-3 ${isActive ? "bg-violet-500/10" : "bg-white/[0.02]"}`}>
                  <p className={`text-xs font-bold mb-0.5 ${isActive ? "text-violet-300" : "text-white"}`}>
                    {preset.label}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-snug line-clamp-2">{preset.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-white/5" />
        <span className="text-xs text-gray-600">o elige base</span>
        <div className="flex-1 h-px bg-white/5" />
      </div>

      {/* Base Style Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {styles.map((s) => {
          const isActive = style === s.value && !selectedPreset;
          return (
            <button
              key={s.value}
              onClick={() => handleBaseStyleSelect(s.value)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                isActive
                  ? "border-violet-500/50 bg-violet-500/10 shadow-lg shadow-violet-500/10"
                  : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
              }`}
            >
              <div className="text-2xl mb-2">{s.emoji}</div>
              <div className={`text-sm font-semibold mb-0.5 ${isActive ? "text-violet-300" : "text-white"}`}>
                {s.label}
              </div>
              <div className="text-[11px] text-gray-500 leading-snug">{s.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Active preset indicator */}
      {selectedPreset && (
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
          <Sparkles className="w-3 h-3" />
          Preset activo: <span className="font-semibold">{presets.find(p => p.id === selectedPreset)?.label}</span>
          <button onClick={() => { setSelectedPreset(null); setCustomPrompt(""); }} className="ml-auto text-gray-500 hover:text-white">✕</button>
        </div>
      )}

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