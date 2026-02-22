import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, UserCircle, Plus, Camera } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";

export default function CharacterStep({ characters, setCharacters }) {
  const fileInputRef = useRef(null);
  const [uploadingIndex, setUploadingIndex] = React.useState(null);

  const addCharacter = () => {
    setCharacters([...characters, { name: "", description: "", photo_url: "" }]);
  };

  const removeCharacter = (index) => {
    setCharacters(characters.filter((_, i) => i !== index));
  };

  const updateCharacter = (index, field, value) => {
    const updated = [...characters];
    updated[index] = { ...updated[index], [field]: value };
    setCharacters(updated);
  };

  const handlePhotoUpload = async (index, file) => {
    setUploadingIndex(index);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateCharacter(index, "photo_url", file_url);
    setUploadingIndex(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Define tus Personajes</h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Sube fotos reales de referencia y la IA creará personajes estilo anime basados en ellas. 
          Cuantos más detalles des, mejor será el resultado.
        </p>
      </div>

      <AnimatePresence>
        {characters.map((char, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative p-5 rounded-2xl border border-white/5 bg-white/[0.02] group"
          >
            {characters.length > 1 && (
              <button
                onClick={() => removeCharacter(index)}
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-gray-500 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="flex flex-col sm:flex-row gap-5">
              {/* Photo Upload */}
              <div className="flex-shrink-0">
                <div
                  onClick={() => {
                    fileInputRef.current?.setAttribute("data-index", index);
                    fileInputRef.current?.click();
                  }}
                  className={`w-28 h-28 rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center transition-all ${
                    char.photo_url
                      ? "border-violet-500/30"
                      : "border-white/10 hover:border-violet-500/30"
                  }`}
                >
                  {uploadingIndex === index ? (
                    <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                  ) : char.photo_url ? (
                    <img src={char.photo_url} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-gray-500 mb-1" />
                      <span className="text-[10px] text-gray-500">Subir foto</span>
                    </>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <UserCircle className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                    Personaje {index + 1}
                  </span>
                </div>
                <Input
                  placeholder="Nombre del personaje"
                  value={char.name}
                  onChange={(e) => updateCharacter(index, "name", e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-violet-500/50"
                />
                <Textarea
                  placeholder="Describe al personaje: personalidad, apariencia, rol en la historia..."
                  value={char.description}
                  onChange={(e) => updateCharacter(index, "description", e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-violet-500/50 h-20 resize-none"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const index = parseInt(e.target.getAttribute("data-index") || "0");
          if (file) handlePhotoUpload(index, file);
          e.target.value = "";
        }}
      />

      <Button
        variant="outline"
        onClick={addCharacter}
        className="w-full h-12 border-dashed border-white/10 text-gray-400 hover:text-violet-300 hover:border-violet-500/30 hover:bg-violet-500/5 rounded-xl"
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir Personaje
      </Button>
    </motion.div>
  );
}