import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader, ChevronRight } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function Model3DWizardStep2({ characterData, onComplete, onBack, isGenerating }) {
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      const result = await base44.functions.invoke(
        "generateAIQuestionnaireForContent",
        {
          content_type: "character_3d",
          initial_input: `${characterData.name}: ${characterData.description}. Género: ${characterData.gender}`,
        }
      );

      setQuestions(result.data?.questions || []);
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-12 gap-4"
      >
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-violet-400" />
        </div>
        <p className="text-gray-400">Generando cuestionario personalizado...</p>
      </motion.div>
    );
  }

  const allAnswered = Object.keys(responses).length === questions.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Detalles Específicos del Personaje</h2>
        <p className="text-xs text-gray-500 mb-4">Responde estas preguntas para afinar la apariencia 3D</p>

        <div className="space-y-3 bg-white/5 border border-white/10 rounded-xl p-5">
          {questions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="space-y-2"
            >
              <label className="text-xs font-medium text-white">
                {q.id}. {q.question}
              </label>

              <div className="grid grid-cols-1 gap-1.5">
                {q.suggestions?.map((suggestion, sidx) => (
                  <button
                    key={sidx}
                    onClick={() => handleResponse(q.id, suggestion)}
                    className={`p-2 rounded-lg text-xs transition-all text-left ${
                      responses[q.id] === suggestion
                        ? "bg-violet-500 text-white"
                        : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10"
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              <input
                type="text"
                value={responses[q.id] || ""}
                onChange={(e) => handleResponse(q.id, e.target.value)}
                placeholder="O escribe tu respuesta..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:border-violet-500/50"
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500 transition-all"
            style={{ width: `${(Object.keys(responses).length / questions.length) * 100}%` }}
          />
        </div>
        <span>{Object.keys(responses).length}/{questions.length}</span>
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
          disabled={!allAnswered || isGenerating}
          className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500 gap-2"
        >
          {isGenerating ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Generando...
            </>
          ) : (
            <>
              Generar Modelo <ChevronRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}