import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Loader } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

export default function CoverQuestionnaireStep({ coverTitle, onComplete }) {
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
          content_type: "cover",
          initial_input: coverTitle,
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
      <div className="flex items-center justify-center py-12">
        <Loader className="w-6 h-6 animate-spin text-violet-400 mr-2" />
        <p className="text-sm text-gray-400">Generando preguntas de diseño...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-white mb-4">
        Detalles del diseño
      </h2>

      <div className="space-y-4">
        {questions.map((q, idx) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-lg p-3"
          >
            <label className="text-xs font-medium text-white mb-2 block">
              {q.id}. {q.question}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-2">
              {q.suggestions?.map((suggestion, sidx) => (
                <button
                  key={sidx}
                  onClick={() => handleResponse(q.id, suggestion)}
                  className={`py-1.5 px-2 rounded text-xs transition-all ${
                    responses[q.id] === suggestion
                      ? "bg-pink-500 text-white"
                      : "bg-white/5 border border-white/10 hover:bg-white/10"
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
              placeholder="O describe tu idea..."
              className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder:text-gray-500"
            />
          </motion.div>
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={Object.keys(responses).length !== questions.length}
        className="w-full bg-gradient-to-r from-pink-600 to-orange-500 gap-2"
      >
        Continuar <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}