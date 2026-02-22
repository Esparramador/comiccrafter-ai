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

export default function CoverGenerator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("comic");
  const [coverStyle, setCoverStyle] = useState("american_comic");
  const [language, setLanguage] = useState("es");
  const [referencePhotos, setReferencePhotos] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [uploading, setUploading] = useState(false);

  const selectedStyle = COVER_STYLES.find(s => s.value === coverStyle);
  const selectedCat = COVER_CATEGORIES.find(c => c.value === category);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    for (const file of files) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setReferencePhotos(prev => [...prev, file_url]);
    }
    setUploading(false);
  };

  const handleGenerate = async () => {
    if (!title) return;
    setGenerating(true);
    setResult(null);

    const categoryPrompts = {
      comic: "professional comic book cover, strong hero pose, dynamic action, title typography",
      videogame: "epic video game box art cover, cinematic composition, game title logo",
      clothing: "fashion campaign cover, editorial photography style, brand aesthetic",
      movie: "cinematic movie poster, dramatic lighting, professional typography, film aesthetic",
      music: "album cover art, music industry standard, creative visual metaphor",
      book: "professional book cover design, compelling composition, editorial style",
      brand: "brand identity cover, corporate design, modern aesthetic, logo integration",
      event: "event poster design, festival atmosphere, bold graphic design",
    };

    const prompt = `Professional ${selectedCat?.label} cover for "${title}". ${selectedStyle?.prompt}. ${categoryPrompts[category]}. Description: ${description}. Include title text "${title}" prominently. Ultra high quality, print-ready, masterpiece illustration, 8k resolution, professional design.`;

    const imageResult = await base44.integrations.Core.GenerateImage({
      prompt,
      ...(referencePhotos.length > 0 ? { existing_image_urls: referencePhotos } : {})
    });

    setResult(imageResult.url);
    setGenerating(false);
  };

  const handleDownload = async () => {
    const res = await fetch(result);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}_cover.png`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center shadow-lg shadow-pink-500/20">
              <ImageIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Generador de Portadas</h1>
              <p className="text-sm text-gray-500">Crea portadas profesionales con IA para cualquier proyecto</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left - Config */}
          <div className="space-y-5">
            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Tipo de Portada</label>
              <div className="grid grid-cols-2 gap-2">
                {COVER_CATEGORIES.map(cat => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      category === cat.value
                        ? "border-pink-500/50 bg-pink-500/10 shadow shadow-pink-500/10"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    <span className="text-xl">{cat.emoji}</span>
                    <p className={`text-xs font-semibold mt-1 ${category === cat.value ? "text-pink-300" : "text-white"}`}>{cat.label}</p>
                    <p className="text-[10px] text-gray-600">{cat.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Título del Proyecto *</label>
              <Input
                placeholder="Ej: Shadow Realm, Nike Air 2090, The Last Pulse..."
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500/50 rounded-xl"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Descripción visual</label>
              <Textarea
                placeholder="Describe la atmósfera, personajes, colores, elementos clave que quieres en la portada..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-pink-500/50 min-h-[100px] rounded-xl"
              />
            </div>

            {/* Style */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-3 block">Estilo Visual</label>
              <div className="grid grid-cols-2 gap-2">
                {COVER_STYLES.map(s => (
                  <button
                    key={s.value}
                    onClick={() => setCoverStyle(s.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      coverStyle === s.value
                        ? "border-violet-500/50 bg-violet-500/10"
                        : "border-white/5 bg-white/[0.02] hover:border-white/10"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <p className={`text-xs font-medium mt-0.5 ${coverStyle === s.value ? "text-violet-300" : "text-white"}`}>{s.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Language */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Idioma del texto</label>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>

            {/* Reference photos */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Fotos de referencia (opcional)</label>
              <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-white/10 hover:border-violet-500/30 bg-white/[0.02] cursor-pointer transition-all group">
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
                {uploading ? <Loader2 className="w-4 h-4 text-violet-400 animate-spin" /> : <Upload className="w-4 h-4 text-gray-500 group-hover:text-violet-400 transition-colors" />}
                <span className="text-sm text-gray-500 group-hover:text-gray-300 transition-colors">
                  {uploading ? "Subiendo..." : "Subir referencias"}
                </span>
              </label>
              {referencePhotos.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {referencePhotos.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} className="w-12 h-12 rounded-lg object-cover border border-white/10" alt="" />
                      <button
                        onClick={() => setReferencePhotos(p => p.filter((_, j) => j !== i))}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X className="w-2.5 h-2.5 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!title || generating}
              className="w-full h-12 bg-gradient-to-r from-pink-600 to-orange-500 hover:from-pink-500 hover:to-orange-400 rounded-xl gap-2 font-semibold shadow-lg shadow-pink-500/20 disabled:opacity-30"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {generating ? "Generando portada..." : "Generar Portada"}
            </Button>
          </div>

          {/* Right - Preview */}
          <div className="flex flex-col">
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden flex-1 flex items-center justify-center min-h-[400px] relative">
              <AnimatePresence mode="wait">
                {generating && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-pink-400 animate-spin" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Creando tu portada...</p>
                      <p className="text-sm text-gray-500 mt-1">La IA está diseñando algo increíble</p>
                    </div>
                  </motion.div>
                )}

                {result && !generating && (
                  <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full h-full p-3">
                    <img src={result} alt="Generated cover" className="w-full h-auto rounded-xl object-contain max-h-[500px]" />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={handleGenerate} variant="outline" className="flex-1 border-white/10 text-gray-400 hover:text-white rounded-xl gap-1.5 text-sm">
                        <RefreshCw className="w-3.5 h-3.5" /> Regenerar
                      </Button>
                      <Button onClick={handleDownload} className="flex-1 bg-violet-600 hover:bg-violet-500 rounded-xl gap-1.5 text-sm">
                        <Download className="w-3.5 h-3.5" /> Descargar
                      </Button>
                    </div>
                  </motion.div>
                )}

                {!result && !generating && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 text-center p-8">
                    <div className="w-20 h-20 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-center">
                      <ImageIcon className="w-10 h-10 text-gray-700" />
                    </div>
                    <p className="text-gray-600 text-sm">Tu portada aparecerá aquí</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}