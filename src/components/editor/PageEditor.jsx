import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";
import { Pencil, RefreshCw, Upload, Check, X, Loader2, Wand2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TextAssistant from "./TextAssistant";

export default function PageEditor({ page, pageIndex, isCover, onSave, onClose }) {
  const [panelDesc, setPanelDesc] = useState(page.panel_descriptions || "");
  const [dialogues, setDialogues] = useState(page.dialogues || "");
  const [pageSummary, setPageSummary] = useState(page.page_summary || "");
  const [imageUrl, setImageUrl] = useState(page.image_url);
  const [regenPrompt, setRegenPrompt] = useState(page.visual_prompt || "");
  const [showRegenForm, setShowRegenForm] = useState(false);
  const [loading, setLoading] = useState(null); // 'regen' | 'upload' | 'save'
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
    setLoading("save");
    onSave({
      ...page,
      image_url: imageUrl,
      panel_descriptions: panelDesc,
      dialogues,
      page_summary: pageSummary,
    });
    setLoading(null);
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
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 sticky top-0 bg-[#0f0f1a] z-10">
          <div className="flex items-center gap-2">
            <Pencil className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-white">
              {isCover ? "Editar Portada" : `Editar Página ${page.page_number}`}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Image preview + actions */}
          <div className="flex gap-4">
            <div className="w-32 h-44 flex-shrink-0 rounded-xl overflow-hidden border border-white/10 bg-black relative">
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
              {loading === "upload" || loading === "regen" ? (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
              ) : null}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-xs text-gray-500 mb-1">Reemplazar imagen</p>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}
                disabled={!!loading}
                className="w-full border-white/10 text-gray-300 hover:text-white gap-2 text-xs rounded-xl">
                <Upload className="w-3.5 h-3.5" /> Subir imagen
              </Button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
              <Button variant="outline" size="sm" onClick={() => setShowRegenForm(!showRegenForm)}
                disabled={!!loading}
                className="w-full border-violet-500/30 text-violet-300 hover:bg-violet-500/10 gap-2 text-xs rounded-xl">
                <Wand2 className="w-3.5 h-3.5" />
                Regenerar con IA
                {showRegenForm ? <ChevronUp className="w-3 h-3 ml-auto" /> : <ChevronDown className="w-3 h-3 ml-auto" />}
              </Button>
              <AnimatePresence>
                {showRegenForm && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                    <Textarea
                      value={regenPrompt}
                      onChange={e => setRegenPrompt(e.target.value)}
                      placeholder="Describe la escena que quieres generar..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 text-xs h-20 resize-none rounded-xl mb-2"
                    />
                    <Button size="sm" onClick={handleRegen} disabled={loading === "regen" || !regenPrompt.trim()}
                      className="w-full bg-violet-600 hover:bg-violet-500 text-xs rounded-xl gap-2">
                      {loading === "regen" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                      Generar nueva imagen
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Text fields */}
          {!isCover && (
            <>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Descripción de paneles</label>
                <Textarea value={panelDesc} onChange={e => setPanelDesc(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 h-24 resize-none rounded-xl leading-relaxed"
                  placeholder="Describe lo que ocurre en cada panel..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Diálogos</label>
                <Textarea value={dialogues} onChange={e => setDialogues(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 h-24 resize-none rounded-xl leading-relaxed"
                  placeholder="Escribe los diálogos y bocadillos de texto..." />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-400 mb-1.5 block">Resumen de página</label>
                <Input value={pageSummary} onChange={e => setPageSummary(e.target.value)}
                  className="bg-white/5 border-white/10 text-white text-xs placeholder:text-gray-600 rounded-xl"
                  placeholder="Una frase que resume esta página..." />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 border-white/10 text-gray-400 hover:text-white rounded-xl">
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={!!loading}
            className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl gap-2">
            {loading === "save" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Guardar cambios
          </Button>
        </div>
      </div>
    </motion.div>
  );
}