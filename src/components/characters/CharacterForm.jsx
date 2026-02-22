import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";
import { Camera, X, Plus, Loader2, Save, UserCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CharacterForm({ character, onSave, onCancel }) {
  const [name, setName] = useState(character?.name || "");
  const [description, setDescription] = useState(character?.description || "");
  const [photoUrls, setPhotoUrls] = useState(character?.photo_urls || []);
  const [tags, setTags] = useState(character?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (files) => {
    setUploading(true);
    const uploads = Array.from(files).map(f => base44.integrations.Core.UploadFile({ file: f }));
    const results = await Promise.all(uploads);
    setPhotoUrls(prev => [...prev, ...results.map(r => r.file_url)]);
    setUploading(false);
  };

  const removePhoto = (idx) => setPhotoUrls(prev => prev.filter((_, i) => i !== idx));

  const addTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    const data = { name: name.trim(), description, photo_urls: photoUrls, tags };
    let saved;
    if (character?.id) {
      saved = await base44.entities.Character.update(character.id, data);
    } else {
      saved = await base44.entities.Character.create(data);
    }
    setSaving(false);
    onSave(saved);
  };

  return (
    <div className="space-y-5">
      {/* Name */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Nombre del personaje *</label>
        <Input
          placeholder="Ej: Jay, Bulgarito, Loquita..."
          value={name}
          onChange={e => setName(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-violet-500/50"
        />
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Descripción</label>
        <Textarea
          placeholder="Personalidad, apariencia física, rol en la historia, rasgos distintivos..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-violet-500/50 h-24 resize-none"
        />
      </div>

      {/* Photos */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">
          Fotos de referencia
          <span className="text-gray-500 font-normal ml-2">— cuantas más, mejor resultado de la IA</span>
        </label>
        <div className="flex flex-wrap gap-3">
          <AnimatePresence>
            {photoUrls.map((url, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group"
              >
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Upload button */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 hover:border-violet-500/40 hover:bg-violet-500/5 flex flex-col items-center justify-center transition-all text-gray-500 hover:text-violet-400"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Camera className="w-5 h-5 mb-1" />
                <span className="text-[10px]">Añadir foto</span>
              </>
            )}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={e => { if (e.target.files?.length) handleUpload(e.target.files); e.target.value = ""; }}
        />
        <p className="text-xs text-gray-600 mt-2">{photoUrls.length} foto{photoUrls.length !== 1 ? "s" : ""} · Sube varias ángulos del personaje para mayor precisión</p>
      </div>

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Etiquetas</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag, i) => (
            <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/20 text-violet-300 text-xs">
              {tag}
              <button onClick={() => setTags(tags.filter((_, j) => j !== i))}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
        <form onSubmit={addTag} className="flex gap-2">
          <Input
            placeholder="protagonista, antagonista, secundario..."
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-violet-500/50 h-9 text-sm"
          />
          <Button type="submit" variant="outline" size="sm" className="border-white/10 text-gray-400 hover:text-white">
            <Plus className="w-4 h-4" />
          </Button>
        </form>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
            Cancelar
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={!name.trim() || saving}
          className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-30"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          {character?.id ? "Guardar cambios" : "Crear personaje"}
        </Button>
      </div>
    </div>
  );
}