import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { ChevronRight, Loader } from "lucide-react";
import { motion } from "framer-motion";

export default function Model3DWizardStep2({
  characterData,
  onComplete,
  isGenerating,
}) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Basándote en esta descripción de personaje: "${characterData.description}" para un modelo 3D de género "${characterData.gender}", 
        genera exactamente 8 preguntas clave para ayudar al usuario a definir detalles específicos del personaje 3D.
        
        Las preguntas deben cubrir:
        1. Fisonomía/complexión
        2. Rasgos faciales
        3. Tipo de pelo
        4. Ropa superior
        5. Ropa inferior
        6. Accesorios
        7. Edad aparente
        8. Atmósfera/estilo general
        
        Devuelve un JSON con esta estructura:
        {
          "questions": [
            {"id": 1, "question": "...", "suggestions": ["opción1", "opción2", "opción3"]},
            ...
          ]
        }`,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  question: { type: "string" },
                  suggestions: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
          },
        },
      });

      setQuestions(result.questions || []);
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleResponse = (questionId, response) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: response,
    }));
  };

  const handleSubmit = () => {
    if (Object.keys(responses).length === questions.length) {
      onComplete(responses);
    }
  };

  if (loadingQuestions) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader className="w-8 h-8 animate-spin text-violet-400" />
        <p className="ml-3">Generando cuestionario personalizado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20 rounded-lg p-6"
      >
        <h2 className="text-xl font-bold mb-6">
          Detalles del Personaje 3D
        </h2>
        <p className="text-gray-400 mb-6">
          Responde estas preguntas para que la IA pueda generar tu modelo 3D perfecto
        </p>

        <div className="space-y-6">
          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <label className="text-sm font-medium mb-3 block">
                {q.id}. {q.question}
              </label>

              {/* Suggestions como botones */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                {q.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleResponse(q.id, suggestion)}
                    className={`py-2 px-3 rounded-lg text-sm transition-all ${
                      responses[q.id] === suggestion
                        ? "bg-violet-500 text-white"
                        : "bg-white/5 border border-white/10 hover:bg-white/10"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {/* Input personalizado */}
              <input
                type="text"
                value={responses[q.id] || ""}
                onChange={(e) => handleResponse(q.id, e.target.value)}
                placeholder="O escribe tu propia respuesta..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500"
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Botones de navegación */}
      <div className="flex justify-between">
        <div />
        <Button
          onClick={handleSubmit}
          disabled={
            Object.keys(responses).length !== questions.length || isGenerating
          }
          className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              Generar Modelo 3D <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}