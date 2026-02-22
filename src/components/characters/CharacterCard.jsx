import React from "react";
import { motion } from "framer-motion";
import { UserCircle, Camera, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CharacterCard({ character, onEdit, onDelete, selectable, selected, onSelect }) {
  const photos = character.photo_urls || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative rounded-2xl border bg-white/[0.02] overflow-hidden group transition-all cursor-pointer ${
        selectable
          ? selected
            ? "border-violet-500/60 ring-2 ring-violet-500/30 bg-violet-500/5"
            : "border-white/5 hover:border-violet-500/20"
          : "border-white/5"
      }`}
      onClick={() => selectable && onSelect?.(character)}
    >
      {/* Photo grid */}
      <div className="h-36 bg-white/[0.02] relative overflow-hidden">
        {photos.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
            <UserCircle className="w-12 h-12 mb-1" />
            <span className="text-xs">Sin foto</span>
          </div>
        ) : photos.length === 1 ? (
          <img src={photos[0]} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className={`grid h-full ${photos.length >= 4 ? "grid-cols-2 grid-rows-2" : "grid-cols-2"}`}>
            {photos.slice(0, 4).map((url, i) => (
              <img key={i} src={url} alt="" className="w-full h-full object-cover" />
            ))}
          </div>
        )}
        {photos.length > 1 && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/60 rounded-full px-1.5 py-0.5 text-[10px] text-gray-300 flex items-center gap-1">
            <Camera className="w-2.5 h-2.5" /> {photos.length}
          </div>
        )}
        {selectable && selected && (
          <div className="absolute inset-0 bg-violet-500/20 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center shadow-lg">
              <span className="text-white text-base">✓</span>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-white text-sm truncate">{character.name}</p>
        {character.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{character.description}</p>
        )}
        {character.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {character.tags.slice(0, 2).map((t, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/10">{t}</span>
            ))}
          </div>
        )}
      </div>

      {/* Actions (non-selectable mode) */}
      {!selectable && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="icon" variant="ghost" className="h-7 w-7 bg-black/50 hover:bg-black/70 text-gray-300" onClick={() => onEdit?.(character)}>
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 bg-black/50 hover:bg-red-900/60 text-gray-300 hover:text-red-400" onClick={() => onDelete?.(character)}>
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </motion.div>
  );
}