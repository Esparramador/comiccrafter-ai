import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, ChevronRight, Check, Loader2 } from "lucide-react";

const QUESTIONS = [
  {
    id: "genre",
    question: "¿Qué tipo de historia quieres contar?",
    options: ["Aventura épica", "Romance", "Ciencia ficción", "Terror y misterio", "Comedia", "Drama", "Superhéroes", "Fantasy oscura", "Thriller de espías", "Historia de vida"]
  },
  {
    id: "setting",
    question: "¿Dónde y cuándo transcurre?",
    options: ["Mundo medieval fantástico", "Futuro distópico", "Japón moderno", "Nueva York actual", "Espacio exterior", "Japón feudal", "Era victoriana", "Mundo post-apocalíptico", "Ciudad costera", "Otro planeta"]
  },
  {
    id: "protagonist",
    question: "¿Cómo es el protagonista?",
    options: ["Héroe clásico valiente", "Antihéroe oscuro", "Joven aprendiz", "Detective brillante", "Guerrero solitario", "Científico rebelde", "Artista soñador", "Líder carismático", "Forastero misterioso", "Persona ordinaria en situación extraordinaria"]
  },
  {
    id: "conflict",
    question: "¿Cuál es el conflicto central?",
    options: ["Salvar el mundo de una amenaza", "Buscar venganza", "Encontrar identidad propia", "Amor imposible", "Traición y redención", "Supervivencia extrema", "Descubrir un secreto", "Lucha por el poder", "Misión imposible", "Viaje de transformación"]
  },
  {
    id: "tone",
    question: "¿Qué tono quieres transmitir?",
    options: ["Épico y grandioso", "Oscuro e intenso", "Emotivo y personal", "Divertido y ligero", "Misterioso y tenso", "Romántico y soñador", "Brutal y sin censura", "Esperanzador", "Melancólico", "Caótico y frenético"]
  },
  {
    id: "twist",
    question: "¿Te gustaría incluir un giro inesperado?",
    options: ["El aliado es el villano", "El protagonista tiene poderes ocultos", "Todo era un sueño... o no", "El antagonista tenía razón", "Hay una traición en el último momento", "El mundo no es lo que parece", "Viaje en el tiempo", "El protagonista muere... y vuelve", "Doble identidad revelada", "Sin giro, historia directa"]
  }
];

export default function StoryWizard({ onStoryGenerated, characters = [] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const current = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;

  const handleSelect = (option) => {
    const newAnswers = { ...answers, [current.id]: option };
    setAnswers(newAnswers);
    if (!isLast) {
      setTimeout(() => setStep(step + 1), 250);
    } else {
      generateStory(newAnswers);
    }
  };

  const generateStory = async (ans) => {
    setGenerating(true);
    const validChars = characters.filter(c => c.name);
    const charContext = validChars.length > 0
      ? `\n\nPERSONAJES DEFINIDOS (¡DEBES usarlos por su nombre real en la historia!):
${validChars.map(c => `- ${c.name}${c.description ? `: ${c.description}` : ""}`).join("\n")}

IMPORTANTE: La historia DEBE estar protagonizada por estos personajes con sus nombres exactos y características. No inventes personajes nuevos como protagonistas, usa los listados.`
      : "";

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Genera una historia de cómic atractiva basada en estas preferencias del usuario:
- Género: ${ans.genre}
- Ambientación: ${ans.setting}
- Tipo de protagonista: ${ans.protagonist}
- Conflicto central: ${ans.conflict}
- Tono: ${ans.tone}
- Giro argumental: ${ans.twist}
${charContext}

Crea:
1. Un título llamativo (máximo 6 palabras)
2. Una sinopsis rica y detallada (300-500 palabras) que un artista de cómic pueda usar para crear paneles. Incluye los nombres reales de los personajes, escenas específicas, momentos emocionales y climáticos. Escribe en un estilo vívido y cinematográfico.

Escribe todo en español.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          story: { type: "string" }
        }
      }
    });
    setResult(result);
    setGenerating(false);
  };

  const handleUse = () => {
    if (result) onStoryGenerated(result.title, result.story);
  };

  const handleRegenerate = () => {
    setResult(null);
    generateStory(answers);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
    setGenerating(false);
  };

  return (
    <div className="rounded-2xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-semibold text-violet-300">Generador de Historia por IA</span>
        {step > 0 && !generating && !result && (
          <button onClick={handleReset} className="ml-auto text-xs text-gray-500 hover:text-gray-300 transition-colors">
            Reiniciar
          </button>
        )}
      </div>

      {/* Progress */}
      {!generating && !result && (
        <div className="flex gap-1 mb-3">
          {QUESTIONS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= step ? "bg-violet-500" : "bg-white/5"}`} />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Generating */}
        {generating && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-6 gap-3">
            <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
            </div>
            <p className="text-sm text-gray-400">La IA está creando tu historia...</p>
          </motion.div>
        )}

        {/* Result */}
        {result && !generating && (
          <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-500 mb-1">Título generado</p>
              <p className="text-white font-bold text-lg">{result.title}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5 max-h-48 overflow-y-auto">
              <p className="text-xs text-gray-500 mb-1">Historia</p>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{result.story}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRegenerate} variant="outline" className="flex-1 border-white/10 text-gray-400 hover:text-white rounded-xl gap-1.5 text-sm">
                <RefreshCw className="w-3.5 h-3.5" /> Regenerar
              </Button>
              <Button onClick={handleUse} className="flex-1 bg-violet-600 hover:bg-violet-500 rounded-xl gap-1.5 text-sm">
                <Check className="w-3.5 h-3.5" /> Usar esta historia
              </Button>
            </div>
          </motion.div>
        )}

        {/* Question */}
        {!generating && !result && (
          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
            <p className="text-sm font-semibold text-white">{current.question}</p>
            <div className="grid grid-cols-2 gap-2">
              {current.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleSelect(opt)}
                  className={`text-left px-3 py-2.5 rounded-lg border text-xs transition-all duration-150 ${
                    answers[current.id] === opt
                      ? "border-violet-500/50 bg-violet-500/15 text-violet-300"
                      : "border-white/5 bg-white/[0.02] text-gray-400 hover:text-white hover:border-white/10 hover:bg-white/5"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 text-right">
              Pregunta {step + 1} de {QUESTIONS.length}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}