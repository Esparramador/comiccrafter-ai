import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Wand2 } from "lucide-react";
import { motion } from "framer-motion";

const personalityTypes = [
  { id: "hero", label: "Héroe", emoji: "⚔️" },
  { id: "villain", label: "Villano", emoji: "👿" },
  { id: "comedic", label: "Cómico", emoji: "😂" },
  { id: "romantic", label: "Romántico", emoji: "💕" },
  { id: "wise", label: "Sabio", emoji: "🧙" },
  { id: "child", label: "Infantil", emoji: "👶" },
];

const genderOptions = [
  { id: "male", label: "Masculina" },
  { id: "female", label: "Femenina" },
  { id: "neutral", label: "Neutra" },
];

const ageRanges = [
  { id: "child", label: "Niño (5-12)" },
  { id: "teen", label: "Adolescente (13-18)" },
  { id: "young_adult", label: "Joven Adulto (19-35)" },
  { id: "adult", label: "Adulto (35-60)" },
  { id: "senior", label: "Mayor (60+)" },
];

export default function VoiceGeneratorForm({ onVoiceGenerated }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    personality: "hero",
    gender: "neutral",
    age_range: "adult",
    nationality: "Spanish",
    text: "Hola, esta es una voz generada por inteligencia artificial. Puedo ser usada para tus proyectos de animación.",
  });

  const handleGenerate = async () => {
    if (!formData.name.trim()) {
      alert("Por favor, ingresa un nombre para la voz");
      return;
    }

    try {
      setIsGenerating(true);
      await base44.functions.invoke("generateAIVoice", {
        name: formData.name,
        personality: formData.personality,
        gender: formData.gender,
        age_range: formData.age_range,
        nationality: formData.nationality,
        text: formData.text,
      });

      setFormData({
        ...formData,
        name: "",
        text: "Hola, esta es una voz generada por inteligencia artificial. Puedo ser usada para tus proyectos de animación.",
      });
      onVoiceGenerated?.();
      alert("¡Voz generada exitosamente!");
    } catch (error) {
      console.error("Error generating voice:", error);
      alert("Error al generar la voz");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-purple-500/20"
    >
      <h3 className="text-lg font-semibold mb-6">Generar Voz con IA</h3>

      <div className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nombre de la Voz *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="ej: Voz de Dragón, Princesa Mágica"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Personality Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tipo de Personalidad
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {personalityTypes.map((type) => (
              <button
                key={type.id}
                onClick={() =>
                  setFormData({ ...formData, personality: type.id })
                }
                className={`p-3 rounded-lg border transition-all text-sm font-medium ${
                  formData.personality === type.id
                    ? "bg-purple-600/30 border-purple-500 text-white"
                    : "bg-white/5 border-white/10 text-gray-300 hover:text-white"
                }`}
              >
                <span className="text-lg block mb-1">{type.emoji}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Género de Voz
          </label>
          <div className="grid grid-cols-3 gap-2">
            {genderOptions.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  setFormData({ ...formData, gender: option.id })
                }
                className={`p-2 rounded-lg border transition-all text-sm font-medium ${
                  formData.gender === option.id
                    ? "bg-purple-600/30 border-purple-500 text-white"
                    : "bg-white/5 border-white/10 text-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age Range Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Rango de Edad
          </label>
          <select
            value={formData.age_range}
            onChange={(e) =>
              setFormData({ ...formData, age_range: e.target.value })
            }
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-purple-500"
          >
            {ageRanges.map((range) => (
              <option key={range.id} value={range.id}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Nationality Input */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Nacionalidad/Acento
          </label>
          <input
            type="text"
            value={formData.nationality}
            onChange={(e) =>
              setFormData({ ...formData, nationality: e.target.value })
            }
            placeholder="ej: Español, Argentino, Mexicano"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Sample Text */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Texto de Muestra
          </label>
          <textarea
            value={formData.text}
            onChange={(e) =>
              setFormData({ ...formData, text: e.target.value })
            }
            rows="3"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Máximo 500 caracteres. Este texto se usará para generar el audio de muestra.
          </p>
        </div>

        {/* Generate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating || !formData.name.trim()}
          className={`w-full py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
            isGenerating || !formData.name.trim()
              ? "bg-gray-600 cursor-not-allowed opacity-50"
              : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              Generar Voz
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  );
}