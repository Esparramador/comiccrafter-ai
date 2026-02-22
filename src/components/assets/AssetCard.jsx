import React from "react";
import { Trash2, Eye, FileVideo, Image, Box, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

const typeConfig = {
  cover: { icon: Sparkles, label: "Portada", color: "bg-yellow-500/15 text-yellow-400" },
  model_3d: { icon: Box, label: "Modelo 3D", color: "bg-blue-500/15 text-blue-400" },
  comic: { icon: BookOpen, label: "Cómic", color: "bg-violet-500/15 text-violet-400" },
  short: { icon: FileVideo, label: "Corto", color: "bg-pink-500/15 text-pink-400" },
  video: { icon: FileVideo, label: "Vídeo", color: "bg-red-500/15 text-red-400" }
};

export default function AssetCard({ asset, onPreview, onDelete, isDeleting }) {
  const config = typeConfig[asset.type] || typeConfig.cover;
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{asset.title}</p>
          <p className="text-xs text-gray-500">
            {format(new Date(asset.created_date), "d MMM, HH:mm", { locale: es })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onPreview(asset)}
          className="text-gray-400 hover:text-white hover:bg-white/10 gap-1.5 text-xs"
        >
          <Eye className="w-3.5 h-3.5" /> Ver
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(asset.id)}
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