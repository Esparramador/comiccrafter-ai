import React from "react";
import { Trash2, Edit, BookOpen, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

export default function DraftCard({ draft, onEdit, onDelete, isDeleting }) {
  const isComic = draft.type === "comic";
  const data = draft.data || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isComic ? "bg-violet-500/15 text-violet-400" : "bg-pink-500/15 text-pink-400"
        }`}>
          {isComic ? <BookOpen className="w-5 h-5" /> : <Film className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{draft.title || "Sin título"}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isComic ? "bg-violet-500/10 text-violet-400" : "bg-pink-500/10 text-pink-400"
            }`}>
              {isComic ? `${data.pageCount || "?"} páginas` : `${data.frameCount || "?"} fotogramas`}
            </span>
            <span className="text-xs text-gray-500">
              {draft.updated_date ? format(new Date(draft.updated_date), "d MMM, HH:mm", { locale: es }) : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(draft)}
          className="text-gray-400 hover:text-white hover:bg-white/10 gap-1.5 text-xs"
        >
          <Edit className="w-3.5 h-3.5" /> Editar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(draft.id)}
          disabled={isDeleting}
          className="text-gray-600 hover:text-red-400 hover:bg-red-500/10 gap-1.5 text-xs"
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}