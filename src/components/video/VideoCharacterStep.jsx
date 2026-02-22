import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, X, Plus, Mic, Volume2, Library } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import ElevenLabsVoicePicker from "@/components/voices/ElevenLabsVoicePicker";

export default function VideoCharacterStep({ characters, setCharacters, narratorVoiceId, setNarratorVoiceId }) {
  const fileRefs = useRef([]);
  const [showLibrary, setShowLibrary] = useState(false);

  const { data: savedCharacters = [] } = useQuery({
    queryKey: ['characters'],
    queryFn: () => base44.entities.Character.list()
  });

  const addCharacterFromLibrary = (savedChar) => {
    const newChar = {
      name: savedChar.name,
      description: savedChar.description || "",
      photo_url: savedChar.photo_urls?.[0] || "",
      voice_profile: null,
      elevenlabs_voice_id: ""
    };
    setCharacters([...characters, newChar]);
    setShowLibrary(false);
  };

  const isCharacterAdded = (savedCharId) => {
    return characters.some(c => c.name === savedCharId);
  };

  const updateChar = (i, key, val) => {
    const updated = [...characters];
    updated[i] = { ...updated[i], [key]: val };
    setCharacters(updated);
  };

  const addChar = () => setCharacters([...characters, { name: "", description: "", photo_url: "", voice_profile: null, elevenlabs_voice_id: "" }]);
  const removeChar = (i) => setCharacters(characters.filter((_, idx) => idx !== i));

  const handlePhoto = async (i, file) => {
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateChar(i, "photo_url", file_url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Personajes</h2>
          <p className="text-gray-500 text-sm">Define quién aparece en tu vídeo y asígnales voces de ElevenLabs</p>
        </div>
        <button
          onClick={() => setShowLibrary(!showLibrary)}
          className="flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border border-violet-500/30 bg-violet-500/10 text-violet-300 hover:bg-violet-500/20 transition-all"
        >
          <Library className="w-3.5 h-3.5" /> Biblioteca
        </button>
      </div>

      {showLibrary && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 space-y-3 mb-4">
          <p className="text-xs text-violet-300 font-medium">Tus personajes guardados</p>
          {savedCharacters.length === 0 ? (
            <p className="text-xs text-gray-500">No tienes personajes guardados aún</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {savedCharacters.map(char => (
                <button
                  key={char.id}
                  onClick={() => addCharacterFromLibrary(char)}
                  disabled={isCharacterAdded(char.name)}
                  className={`p-3 rounded-lg border text-left text-xs transition-all ${
                    isCharacterAdded(char.name)
                      ? "border-white/10 bg-white/5 opacity-50 cursor-not-allowed text-gray-500"
                      : "border-violet-500/30 bg-violet-500/5 hover:bg-violet-500/10 text-white"
                  }`}
                >
                  <p className="font-medium">{char.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{char.description}</p>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      <div className="p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-center gap-2 mb-3">
          <Volume2 className="w-4 h-4 text-blue-400" />
          <p className="text-sm font-medium text-blue-300">Voz del Narrador</p>
        </div>
        <ElevenLabsVoicePicker
          selectedVoiceId={narratorVoiceId}
          onSelect={setNarratorVoiceId}
          placeholder="Elige voz para el narrador..."
        />
      </div>

      <AnimatePresence>
        {characters.map((char, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 rounded-2xl border border-white/10 bg-white/[0.03] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Personaje {i + 1}</span>
              {i > 0 && (
                <button onClick={() => removeChar(i)} className="text-red-400 hover:text-red-300">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <Input
              value={char.name}
              onChange={e => updateChar(i, "name", e.target.value)}
              placeholder="Nombre del personaje"
              className="bg-white/5 border-white/10 text-white placeholder-gray-600"
            />
            <Textarea
              value={char.description}
              onChange={e => updateChar(i, "description", e.target.value)}
              placeholder="Descripción (edad, personalidad, aspecto...)"
              className="bg-white/5 border-white/10 text-white placeholder-gray-600 h-20 resize-none text-sm"
            />

            <div>
              <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                <Mic className="w-3 h-3" /> Voz del personaje (ElevenLabs)
              </p>
              <ElevenLabsVoicePicker
                selectedVoiceId={char.elevenlabs_voice_id}
                onSelect={v => updateChar(i, "elevenlabs_voice_id", v)}
                placeholder="Asignar voz profesional..."
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Foto de referencia</p>
              {char.photo_url ? (
                <div className="relative inline-block">
                  <img src={char.photo_url} className="w-16 h-16 rounded-xl object-cover border border-white/10" alt="ref" />
                  <button onClick={() => updateChar(i, "photo_url", "")} className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                </div>
              ) : (
                <>
                  <input type="file" accept="image/*" className="hidden" ref={el => fileRefs.current[i] = el} onChange={e => handlePhoto(i, e.target.files[0])} />
                  <button onClick={() => fileRefs.current[i]?.click()} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 px-3 py-2 rounded-lg border border-dashed border-white/10 hover:border-white/20 transition-all">
                    <Upload className="w-3.5 h-3.5" /> Subir foto
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      <button
        onClick={addChar}
        className="w-full py-3 rounded-xl border border-dashed border-yellow-500/30 text-yellow-400 text-sm hover:bg-yellow-500/5 transition-all flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" /> Añadir personaje
      </button>
    </motion.div>
  );
}