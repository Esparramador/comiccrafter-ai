import React from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { BookMarked, X, Clock } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DraftBanner({ draft, onRestore, onDiscard, type = "comic" }) {
  const savedAt = draft?.savedAt ? new Date(draft.savedAt) : null;
  const label = type === "short" ? "corto animado" : "cómic";
  const title = draft?.title || "Sin título";

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="mb-6 p-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col sm:flex-row items-start sm:items-center gap-3"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
          <BookMarked className="w-4 h-4 text-amber-400" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-amber-300">Tienes un borrador guardado</p>
          <p className="text-xs text-gray-500 truncate">
            "{title}" {savedAt ? `· guardado ${format(savedAt, "d MMM, HH:mm", { locale: es })}` : ""}
          </p>
        </div>
      </div>
      <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
        <Button size="sm" onClick={onRestore}
          className="flex-1 sm:flex-none bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded-xl text-xs">
          Restaurar borrador
        </Button>
        <Button size="sm" variant="ghost" onClick={onDiscard} className="text-gray-500 hover:text-gray-300 rounded-xl text-xs">
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </motion.div>
  );
}