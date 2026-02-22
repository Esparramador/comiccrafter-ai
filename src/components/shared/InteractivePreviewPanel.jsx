import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Lightbulb, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function InteractivePreviewPanel({
  contentType,
  contentData,
  onApplyModification,
}) {
  const [comments, setComments] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isModifying, setIsModifying] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const promptMap = {
        comic: `El usuario está creando un cómic sobre: "${contentData.story}"
          Sugiere 5 ideas específicas para mejorar la narrativa visual, composición de viñetas o elementos artísticos.`,
        
        short: `El usuario está creando un corto animado sobre: "${contentData.story}"
          Sugiere 5 ideas específicas para mejorar la animación, pacing, o efectos visuales.`,
        
        cover: `El usuario está diseñando una portada para: "${contentData.title}"
          Sugiere 5 ideas específicas para mejorar el diseño, composición o impacto visual.`,
        
        video: `El usuario está creando un vídeo sobre: "${contentData.story}"
          Sugiere 5 ideas específicas para mejorar planos de cámara, efectos o producción.`,
      };

      const prompt = promptMap[contentType] || promptMap.comic;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `${prompt}
        
        Devuelve un JSON: {"suggestions": ["idea1", "idea2", ...]}`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });

      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const applyModification = async () => {
    if (!comments.trim()) return;

    setIsModifying(true);
    try {
      await onApplyModification(comments);
      setComments("");
      setSuggestions([]);
    } catch (error) {
      console.error("Error applying modification:", error);
    } finally {
      setIsModifying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 bg-white/5 border border-white/10 rounded-lg p-4"
    >
      {/* Comentarios */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <MessageCircle className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-medium">Ajustes y comentarios</h3>
        </div>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Cuéntale a la IA qué cambios quieres: colores, elementos, estilo..."
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-500 resize-none h-16"
        />
        <Button
          onClick={applyModification}
          disabled={!comments.trim() || isModifying}
          className="w-full mt-2 bg-violet-500 hover:bg-violet-600 text-xs"
        >
          {isModifying ? (
            <>
              <Loader className="w-3 h-3 animate-spin mr-2" />
              Aplicando...
            </>
          ) : (
            "Aplicar cambios"
          )}
        </Button>
      </div>

      {/* Sugerencias IA */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <h3 className="text-sm font-medium">Ideas IA</h3>
          </div>
          <button
            onClick={generateSuggestions}
            disabled={loadingSuggestions}
            className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50"
          >
            {loadingSuggestions ? "..." : "Generar"}
          </button>
        </div>

        <div className="space-y-1.5">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => setComments(suggestion)}
              className="w-full text-left text-xs bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-colors"
            >
              ✨ {suggestion}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}