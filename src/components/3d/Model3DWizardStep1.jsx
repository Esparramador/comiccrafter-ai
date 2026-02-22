import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus, X, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function Model3DWizardStep1({ onComplete, onBack }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("neutral");
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading(true);
    try {
      for (const file of files) {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setPhotoUrls(prev => [...prev, file_url]);
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim() || photoUrls.length === 0) {
      alert("Completa todos los campos");
      return;
    }
    
    onComplete({
      name,
      description,
      gender,
      character_photos: photoUrls,
    });
  };

  const canSubmit = name.trim() && description.trim() && photoUrls.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Descripción del Personaje</h2>
        
        <div className="space-y-4 bg-white/5 border border-white/10 rounded-xl p-5">
          {/* Nombre */}
          <div>
            <label className="text-xs font-medium text-gray-300 mb-2 block">Nombre del Personaje *</label>
            <Input
              placeholder="Ej: Alex, Luna, Shadow..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 h-10 rounded-lg"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="text-xs font-medium text-gray-300 mb-2 block">Descripción Física *</label>
            <Textarea
              placeholder="Describe la apariencia: complexión, rasgos faciales, pelo, estilo general..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 rounded-lg"
            />
          </div>

          {/* Género */}
          <div>
            <label className="text-xs font-medium text-gray-300 mb-2 block">Género</label>
            <div className="flex gap-2">
              {[
                { value: "male", label: "♂ Masculino" },
                { value: "female", label: "♀ Femenino" },
                { value: "neutral", label: "⊚ Neutral" }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value)}
                  className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                    gender === opt.value
                      ? "bg-violet-500 text-white"
                      : "bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Fotos de referencia */}
          <div>
            <label className="text-xs font-medium text-gray-300 mb-2 block">Fotos de Referencia *</label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-lg border-2 border-dashed border-white/10 hover:border-violet-500/50 bg-white/[0.02] cursor-pointer transition-colors group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin text-violet-400" />
                  <span className="text-xs text-gray-400">Subiendo...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 text-gray-500 group-hover:text-violet-400 transition-colors" />
                  <span className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    Sube 2-4 fotos del personaje
                  </span>
                </>
              )}
            </label>

            {photoUrls.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {photoUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`ref-${idx}`}
                      className="w-16 h-16 rounded-lg object-cover border border-white/10"
                    />
                    <button
                      onClick={() => setPhotoUrls(p => p.filter((_, i) => i !== idx))}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex gap-3">
        <Button
          onClick={onBack}
          variant="outline"
          className="flex-1 border-white/10 text-gray-400 hover:text-white"
        >
          ← Atrás
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 gap-2"
        >
          Siguiente →
        </Button>
      </div>
    </motion.div>
  );
}