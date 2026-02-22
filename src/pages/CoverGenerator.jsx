import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, Zap, Loader2, Download, RefreshCw, Upload, X } from "lucide-react";
import LanguageSelector from "../components/create/LanguageSelector";

const COVER_CATEGORIES = [
  { value: "comic", label: "Portada de Cómic", emoji: "📖", desc: "Cómic, novela gráfica, manga" },
  { value: "videogame", label: "Videojuego", emoji: "🎮", desc: "Box art, portada de juego" },
  { value: "clothing", label: "Campaña de Ropa", emoji: "👕", desc: "Diseño textil, colección" },
  { value: "movie", label: "Póster de Película", emoji: "🎬", desc: "Cine, serie, documental" },
  { value: "music", label: "Portada Musical", emoji: "🎵", desc: "Álbum, EP, single" },
  { value: "book", label: "Portada de Libro", emoji: "📚", desc: "Novela, ensayo, manual" },
  { value: "brand", label: "Identidad de Marca", emoji: "✨", desc: "Logo, branding, campaña" },
  { value: "event", label: "Evento / Festival", emoji: "🎪", desc: "Cartel, flyer, póster" },
];

const COVER_STYLES = [
  { value: "manga_seinen", label: "Manga Seinen", emoji: "🖤", prompt: "dark seinen manga cover art style, heavy ink, dramatic shadows" },
  { value: "american_comic", label: "Marvel/DC", emoji: "🦸", prompt: "classic american superhero comic cover, bold colors, dynamic composition" },
  { value: "anime", label: "Anime Key Visual", emoji: "✨", prompt: "anime key visual style cover, vibrant colors, detailed illustration" },
  { value: "cyberpunk", label: "Cyberpunk", emoji: "🌃", prompt: "cyberpunk neon cover art, electric colors, futuristic aesthetic" },
  { value: "fantasy", label: "Fantasy Epic", emoji: "🐉", prompt: "epic fantasy cover illustration, painterly, dramatic lighting, rich colors" },
  { value: "noir", label: "Noir", emoji: "🌑", prompt: "film noir cover art, high contrast black and white, moody shadows" },
  { value: "watercolor", label: "Acuarela", emoji: "🎨", prompt: "watercolor illustration cover, soft colors, artistic brushwork" },
  { value: "retro_80s", label: "Retro 80s", emoji: "🕹️", prompt: "retro 1980s cover art, synthwave palette, chrome text, bold geometry" },
  { value: "minimalist", label: "Minimalista", emoji: "⬜", prompt: "minimalist cover design, clean lines, bold typography, negative space" },
  { value: "streetwear", label: "Streetwear", emoji: "🧢", prompt: "streetwear brand aesthetic, urban graffiti style, bold graphic design" },
];

import CoverGeneratorImproved from "../components/covers/CoverGeneratorImproved";

export default function CoverGenerator() {
  return <CoverGeneratorImproved />;

}