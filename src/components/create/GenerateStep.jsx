import React from "react";
import { Button } from "@/components/ui/button";
import { Zap, Loader2, FileText, Users, Palette, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function GenerateStep({
  title, story, style, pageCount, characters,
  isGenerating, generationProgress, generationStatus,
  onGenerate
}) {
  const styleLabels = {
    manga: "Manga", anime: "Anime", american_comic: "Cómic USA",
    noir: "Noir", watercolor: "Acuarela", ligne_claire: "Línea Clara",
    cyberpunk: "Cyberpunk", fantasy: "Fantasía"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          {isGenerating ? "Generando tu Cómic..." : "Todo Listo"}
        </h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          {isGenerating
            ? "La IA está creando tu cómic. Esto puede tardar unos minutos."
            : "Revisa el resumen y dale a generar cuando estés listo."
          }
        </p>
      </div>

      {/* Summary */}
      {!isGenerating && (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <FileText className="w-5 h-5 text-violet-400 mb-2" />
            <p className="text-xs text-gray-500">Título</p>
            <p className="text-sm font-semibold text-white truncate">{title || "Sin título"}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <Users className="w-5 h-5 text-pink-400 mb-2" />
            <p className="text-xs text-gray-500">Personajes</p>
            <p className="text-sm font-semibold text-white">{characters.filter(c => c.name).length}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <Palette className="w-5 h-5 text-orange-400 mb-2" />
            <p className="text-xs text-gray-500">Estilo</p>
            <p className="text-sm font-semibold text-white">{styleLabels[style]}</p>
          </div>
          <div className="p-4 rounded-xl border border-white/5 bg-white/[0.02]">
            <BookOpen className="w-5 h-5 text-cyan-400 mb-2" />
            <p className="text-xs text-gray-500">Páginas</p>
            <p className="text-sm font-semibold text-white">{pageCount}</p>
          </div>
        </div>
      )}

      {/* Generation Progress */}
      {isGenerating && (
        <div className="p-6 rounded-2xl border border-violet-500/20 bg-violet-500/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{generationStatus}</p>
              <p className="text-xs text-gray-400">Página {generationProgress} de {pageCount}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-pink-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(generationProgress / pageCount) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-right">
            {Math.round((generationProgress / pageCount) * 100)}%
          </p>
        </div>
      )}

      {/* Generate Button */}
      {!isGenerating && (
        <Button
          onClick={onGenerate}
          disabled={!title || !story}
          className="w-full h-14 text-base font-semibold bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 shadow-xl shadow-violet-500/20 rounded-xl gap-2 disabled:opacity-30"
        >
          <Zap className="w-5 h-5" />
          Generar Cómic
        </Button>
      )}
    </motion.div>
  );
}