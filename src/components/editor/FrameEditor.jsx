import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Pencil, RefreshCw, Upload, Check, X, Loader2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FrameEditor({ frame, onSave, onClose }) {
  const [action, setAction] = useState(frame.action || "");
  const [dialogue, setDialogue] = useState(frame.dialogue || "");
  const [sceneDesc, setSceneDesc] = useState(frame.scene_description || "");
  const [soundEffect, setSoundEffect] = useState(frame.sound_effect || "");
  const [imageUrl, setImageUrl] = useState(frame.image_url);
  const [regenPrompt, setRegenPrompt] = useState(frame.visual_prompt || "");
  const [showRegenForm, setShowRegenForm] = useState(false);
  const [loading, setLoading] = useState(null);
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading("upload");
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setLoading(null);
  };

  const handleRegen = async () => {
    if (!regenPrompt.trim()) return;
    setLoading("regen");
    const result = await base44.integrations.Core.GenerateImage({ prompt: regenPrompt });
    setImageUrl(result.url);
    setLoading(null);
    setShowRegenForm(false);
  };

  const handleSave = () => {
    onSave({ ...frame, image_url: imageUrl, action, dialogue, scene_description: sceneDesc, sound_effect: soundEffect });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-[#0f0f1a] border border-white/10 rounded-t-3xl sm:rounded-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#0f0f1a] z-10">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-semibold text-white">Editar Fotograma {frame.frame_number}</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Image */}
          <div className="flex gap-4">
            <div className="w-32 h-44 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black relative">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              {(loading === "upload" || loading === "regen") && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-pink-400 animate-spin" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-500 mb-1">Reemplazar imagen</p>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={!!loading}
                className="w-full border-white/10 text-gray-300 hover:text-white gap-2 text-xs rounded-xl">
                <Upload className="w-3.5 h-3.5" /> Subir imagen
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <Button variant="outline" size="sm" onClick={() => setShowRegenForm(!showRegenForm)} disabled={!!loading}
                className="w-full border-pink-500/30 text-pink-300 hover:bg-pink-500/10 gap-2 text-xs rounded-xl">
                <Wand2 className="w-3.5 h-3.5" /> Regenerar con IA
                {showRegenForm ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </Button>
              <AnimatePresence>
                {showRegenForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <Textarea value={regenPrompt} onChange={e => setRegenPrompt(e.target.value)}
                      placeholder="Describe el fotograma que quieres generar..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-xs h-20 resize-none rounded-xl mb-2" />
                    <Button size="sm" onClick={handleRegen} disabled={loading === "regen" || !regenPrompt.trim()}
                      className="w-full bg-pink-600 hover:bg-pink-500 text-xs rounded-xl gap-2">
                      {loading === "regen" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Generar nueva imagen
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Text fields */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Acción / Escena</label>
            <Textarea value={action} onChange={e => setAction(e.target.value)}
              className="bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 h-20 resize-none rounded-xl"
              placeholder="¿Qué ocurre en este fotograma?" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1.5 block">Diálogo</label>
            <Textarea value={dialogue} onChange={e => setDialogue(e.target.value)}
              className="bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 h-16 resize-none rounded-xl"
              placeholder="Diálogos del fotograma..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Descripción de escena</label>
              <Textarea value={sceneDesc} onChange={e => setSceneDesc(e.target.value)}
                className="bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 h-16 resize-none rounded-xl"
                placeholder="Ambiente, luz, ángulo..." />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 mb-1.5 block">Efecto de sonido</label>
              <Input value={soundEffect} onChange={e => setSoundEffect(e.target.value)}
                className="bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 rounded-xl"
                placeholder="¡BOOM!, SHHHING..." />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-gray-400 hover:text-white rounded-xl">Cancelar</Button>
          <Button onClick={handleSave} disabled={!!loading}
            className="flex-1 bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 rounded-xl gap-2">
            <Check className="w-4 h-4" /> Guardar cambios
          </Button>
        </div>
      </div>
    </motion.div>
  );
}