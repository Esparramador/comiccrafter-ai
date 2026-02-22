import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Upload } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function Model3DWizardStep1({ onComplete }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [gender, setGender] = useState("neutral");
  const [photos, setPhotos] = useState([]);
  const [photoUrls, setPhotoUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        setPhotoUrls((prev) => [...prev, response.file_url]);
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!name.trim() || !description.trim() || photoUrls.length === 0) {
      alert("Por favor completa todos los campos y sube al menos una foto");
      return;
    }
    onComplete({
      name,
      description,
      gender,
      character_photos: photoUrls,
    });
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6">Información del Personaje</h2>

        <div className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="text-sm font-medium mb-2 block">Nombre</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre del personaje"
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Género */}
          <div>
            <label className="text-sm font-medium mb-3 block">Género</label>
            <div className="flex gap-3">
              {["male", "female", "neutral"].map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2 px-4 rounded-lg transition-all ${
                    gender === g
                      ? "bg-violet-500 text-white"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
                  }`}
                >
                  {g === "male" ? "🧑‍🦱 Masculino" : g === "female" ? "👩 Femenino" : "🧑 Neutral"}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="text-sm font-medium mb-2 block">Descripción</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe la apariencia, personalidad y características del personaje..."
              rows={4}
              className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Fotos de Referencia */}
          <div>
            <label className="text-sm font-medium mb-2 block">Fotos de Referencia</label>
            <div className="border-2 border-dashed border-violet-500/30 rounded-lg p-6 text-center hover:border-violet-500/60 transition-colors">
              <Upload className="w-8 h-8 mx-auto mb-2 text-violet-400" />
              <p className="text-sm mb-3">Sube fotos de referencia del personaje</p>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={uploading}
                className="hidden"
                id="photo-upload"
              />
              <label htmlFor="photo-upload" className="cursor-pointer">
                <Button
                  variant="outline"
                  className="border-violet-500/30 hover:bg-violet-500/10"
                  disabled={uploading}
                >
                  {uploading ? "Subiendo..." : "Seleccionar Fotos"}
                </Button>
              </label>
            </div>

            {photoUrls.length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {photoUrls.map((url, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={url}
                      alt={`Referencia ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() =>
                        setPhotoUrls((prev) => prev.filter((_, i) => i !== idx))
                      }
                      className="absolute top-1 right-1 bg-red-500 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {photoUrls.length} foto(s) subida(s)
            </p>
          </div>
        </div>
      </motion.div>

      {/* Botón Siguiente */}
      <div className="flex justify-end">
        <Button
          onClick={handleSubmit}
          className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 gap-2"
          disabled={!name.trim() || !description.trim() || photoUrls.length === 0}
        >
          Siguiente <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}