import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { BookOpen, Trash2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

const styleEmojis = {
  manga: "🇯🇵", anime: "✨", american_comic: "🦸", noir: "🌑",
  watercolor: "🎨", ligne_claire: "📐", cyberpunk: "🌃", fantasy: "🐉"
};

export default function ComicCard({ comic, onDelete, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-violet-500/20 transition-all duration-300"
    >
      <Link to={createPageUrl("ComicViewer") + `?id=${comic.id}`}>
        {/* Cover Image */}
        <div className="aspect-[3/4] relative overflow-hidden">
          {comic.cover_image_url ? (
            <img
              src={comic.cover_image_url}
              alt={comic.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-violet-900/50 to-pink-900/50 flex items-center justify-center">
              <BookOpen className="w-12 h-12 text-gray-600" />
            </div>
          )}
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          
          {/* Status Badge */}
          {comic.status === "generating" && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Generando...
            </div>
          )}

          {/* Style Badge */}
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium">
            {styleEmojis[comic.style]} {comic.style}
          </div>

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="text-white font-bold text-sm truncate">{comic.title}</h3>
            <p className="text-gray-400 text-[11px] mt-1">
              {comic.generated_pages?.length || 0} páginas · {comic.created_date && format(new Date(comic.created_date), "dd MMM yyyy")}
            </p>
          </div>
        </div>
      </Link>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(comic.id); }}
        className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/20 transition-all opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}