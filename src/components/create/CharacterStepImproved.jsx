import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Plus, X, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function CharacterStepImproved({
  characters,
  setCharacters,
  showGenderSelector = true,
  showVoiceSelector = false,
}) {
  const [uploading, setUploading] = useState({});
  const [voices, setVoices] = useState([]);
  const [loadingVoices, setLoadingVoices] = useState(false);

  useEffect(() => {
    if (showVoiceSelector) {
      loadVoices();
    }
  }, [showVoiceSelector]);

  const loadVoices = async () => {
    setLoadingVoices(true);
    try {
      const allVoices = await base44.entities.VoiceProfile.list();
      setVoices(allVoices || []);
    } catch (error) {
      console.error("Error loading voices:", error);
    } finally {
      setLoadingVoices(false);
    }
  };

  const handleCharacterChange = (idx, field, value) => {
    const updated = [...characters];
    updated[idx] = { ...updated[idx], [field]: value };
    setCharacters(updated);
  };

  const handlePhotoUpload = async (e, idx) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploading((prev) => ({ ...prev, [idx]: true }));
    try {
      for (const file of files) {
        const response = await base44.integrations.Core.UploadFile({ file });
        const updated = [...characters];
        if (!updated[idx].photo_urls) {
          updated[idx].photo_urls = [];
        }
        updated[idx].photo_urls.push(response.file_url);
        setCharacters(updated);
      }
    } catch (error) {
      console.error("Error uploading photos:", error);
    } finally {
      setUploading((prev) => ({ ...prev, [idx]: false }));
    }
  };

  const assignVoiceAutomatically = async (idx) => {
    try {
      const character = characters[idx];
      const result = await base44.functions.invoke("assignVoiceToCharacter", {
        character_id: character.id,
        gender: character.gender,
        age_range: character.age_range,
        personality: character.description,
      });

      if (result.data?.voice_id) {
        handleCharacterChange(idx, "voice_profile_id", result.data.voice_id);
      }
    } catch (error) {
      console.error("Error assigning voice:", error);
    }
  };

  const addCharacter = () => {
    setCharacters([
      ...characters,
      {
        name: "",
        description: "",
        gender: "neutral",
        photo_urls: [],
        voice_profile_id: null,
      },
    ]);
  };

  const removeCharacter = (idx) => {
    setCharacters(characters.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-4">
      {characters.map((char, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-white">Personaje {idx + 1}</h3>
            {characters.length > 1 && (
              <button
                onClick={() => removeCharacter(idx)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Nombre del personaje"
              value={char.name || ""}
              onChange={(e) =>
                handleCharacterChange(idx, "name", e.target.value)
              }
              className="bg-white/5 border-white/10"
            />

            {showGenderSelector && (
              <div className="flex gap-2">
                {["male", "female", "neutral"].map((g) => (
                  <button
                    key={g}
                    onClick={() => handleCharacterChange(idx, "gender", g)}
                    className={`flex-1 py-2 text-xs rounded transition-all ${
                      char.gender === g
                        ? "bg-violet-500 text-white"
                        : "bg-white/5 border border-white/10"
                    }`}
                  >
                    {g === "male" ? "♂" : g === "female" ? "♀" : "⊚"}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Textarea
            placeholder="Descripción del personaje"
            value={char.description || ""}
            onChange={(e) =>
              handleCharacterChange(idx, "description", e.target.value)
            }
            rows={2}
            className="bg-white/5 border-white/10"
          />

          {/* Fotos de referencia */}
          <div>
            <label className="text-xs font-medium text-gray-400 mb-1 block">
              Fotos de referencia
            </label>
            <label className="flex items-center gap-2 px-3 py-2 rounded bg-white/5 border border-dashed border-white/10 cursor-pointer hover:border-violet-500/30 transition-colors">
              <Upload className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">
                {uploading[idx] ? "Subiendo..." : "Subir fotos"}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, idx)}
                disabled={uploading[idx]}
                className="hidden"
              />
            </label>

            {char.photo_urls && char.photo_urls.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {char.photo_urls.map((url, pidx) => (
                  <div key={pidx} className="relative group">
                    <img
                      src={url}
                      alt={`ref-${pidx}`}
                      className="w-12 h-12 rounded object-cover border border-white/10"
                    />
                    <button
                      onClick={() => {
                        const updated = [...characters];
                        updated[idx].photo_urls = updated[idx].photo_urls.filter(
                          (_, i) => i !== pidx
                        );
                        setCharacters(updated);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="w-2.5 h-2.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selector de voz */}
          {showVoiceSelector && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-400">
                  Voz del personaje
                </label>
                <button
                  onClick={() => assignVoiceAutomatically(idx)}
                  className="text-xs text-violet-400 hover:text-violet-300"
                >
                  Auto asignar
                </button>
              </div>

              {loadingVoices ? (
                <Loader className="w-4 h-4 animate-spin text-violet-400" />
              ) : (
                <select
                  value={char.voice_profile_id || ""}
                  onChange={(e) =>
                    handleCharacterChange(idx, "voice_profile_id", e.target.value)
                  }
                  className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white"
                >
                  <option value="">Selecciona una voz...</option>
                  {voices.map((voice) => (
                    <option key={voice.id} value={voice.id}>
                      {voice.avatar_emoji} {voice.name} ({voice.gender})
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
        </motion.div>
      ))}

      <Button
        onClick={addCharacter}
        variant="outline"
        className="w-full border-dashed border-white/20 text-gray-400 hover:text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Añadir personaje
      </Button>
    </div>
  );
}