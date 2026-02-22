import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import {
  Languages, SpellCheck, CheckCircle2, ChevronDown, ChevronUp,
  Loader2, RotateCcw, Copy, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
  { code: "it", label: "Italiano" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文" },
  { code: "ar", label: "العربية" },
  { code: "ru", label: "Русский" },
];

/**
 * TextAssistant – IA para corrección, mejora y traducción de texto.
 * Props:
 *   text        – texto original
 *   onApply     – callback(newText) para aplicar el resultado
 *   accentColor – clase tailwind para el color de acento (ej. "violet" | "pink")
 */
export default function TextAssistant({ text, onApply, accentColor = "violet" }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState(null); // 'correct' | 'improve' | 'translate'
  const [targetLang, setTargetLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const accent = accentColor === "pink"
    ? { btn: "border-pink-500/30 text-pink-300 hover:bg-pink-500/10", badge: "bg-pink-500/20 text-pink-300", ring: "ring-pink-500/40" }
    : { btn: "border-violet-500/30 text-violet-300 hover:bg-violet-500/10", badge: "bg-violet-500/20 text-violet-300", ring: "ring-violet-500/40" };

  const runAssistant = async (selectedMode) => {
    if (!text?.trim()) return;
    setMode(selectedMode);
    setLoading(true);
    setResult(null);

    let prompt = "";

    if (selectedMode === "correct") {
      prompt = `Eres un experto lingüista con dominio de todos los idiomas del mundo.
Analiza el siguiente texto y realiza:
1. Corrección ortográfica y gramatical
2. Corrección de puntuación y acentuación
3. Detección y corrección de errores sintácticos
4. Coherencia estructural de las frases

Devuelve ÚNICAMENTE el texto corregido, sin explicaciones ni comentarios. Preserva el idioma original del texto.

TEXTO:
${text}`;
    } else if (selectedMode === "improve") {
      prompt = `Eres un editor literario experto con dominio de todos los idiomas y géneros narrativos.
Mejora el siguiente texto manteniendo el significado original pero:
1. Mejorando la fluidez y ritmo narrativo
2. Enriqueciendo el vocabulario con sinónimos más precisos
3. Fortaleciendo la estructura de las frases
4. Añadiendo expresividad sin perder la esencia del mensaje
5. Adaptando el tono si es diálogo de personaje (más dinámico, natural)

Devuelve ÚNICAMENTE el texto mejorado, sin explicaciones. Preserva el idioma original.

TEXTO:
${text}`;
    } else if (selectedMode === "translate") {
      const langLabel = LANGUAGES.find(l => l.code === targetLang)?.label || targetLang;
      prompt = `Eres un traductor profesional experto con dominio nativo de todos los idiomas del mundo.
Traduce el siguiente texto al idioma: ${langLabel} (código: ${targetLang}).

Reglas:
1. Traducción natural y fluida, no literal
2. Adapta expresiones idiomáticas y coloquiales al idioma destino
3. Si es diálogo de personaje, mantén el tono y personalidad
4. Preserva onomatopeyas o efectos de sonido adaptándolos culturalmente cuando sea posible
5. Mantén el estilo narrativo (dramático, cómico, épico, etc.)

Devuelve ÚNICAMENTE el texto traducido, sin explicaciones ni notas.

TEXTO:
${text}`;
    }

    const response = await base44.integrations.Core.InvokeLLM({ prompt });
    setResult(response);
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleApply = () => {
    onApply(result);
    setResult(null);
    setOpen(false);
  };

  const reset = () => {
    setResult(null);
    setMode(null);
  };

  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-all ${accent.btn}`}
      >
        <Languages className="w-3 h-3" />
        Asistente de texto IA
        {open ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2"
          >
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3">
              {!result ? (
                <>
                  <p className="text-[11px] text-gray-500">Selecciona una acción para el texto:</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAssistant("correct")}
                      disabled={loading || !text?.trim()}
                      className={`text-xs rounded-lg border gap-1.5 ${accent.btn}`}
                    >
                      {loading && mode === "correct" ? <Loader2 className="w-3 h-3 animate-spin" /> : <SpellCheck className="w-3 h-3" />}
                      Corregir texto
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAssistant("improve")}
                      disabled={loading || !text?.trim()}
                      className={`text-xs rounded-lg border gap-1.5 ${accent.btn}`}
                    >
                      {loading && mode === "improve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                      Mejorar estilo
                    </Button>
                  </div>

                  {/* Translate section */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <Languages className="w-3 h-3 text-gray-400" />
                      <span className="text-[11px] text-gray-400">Traducir a:</span>
                    </div>
                    <select
                      value={targetLang}
                      onChange={e => setTargetLang(e.target.value)}
                      className="bg-white/10 border border-white/10 text-white text-xs rounded-lg px-2 py-1 outline-none focus:ring-1 ring-white/20"
                    >
                      {LANGUAGES.map(l => (
                        <option key={l.code} value={l.code} className="bg-[#0f0f1a]">{l.label}</option>
                      ))}
                    </select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => runAssistant("translate")}
                      disabled={loading || !text?.trim()}
                      className={`text-xs rounded-lg border gap-1.5 ${accent.btn}`}
                    >
                      {loading && mode === "translate" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                      Traducir
                    </Button>
                  </div>

                  {loading && (
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Procesando con IA...
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${accent.badge}`}>
                      {mode === "correct" ? "✓ Texto corregido" : mode === "improve" ? "✨ Estilo mejorado" : "🌐 Traducción"}
                    </span>
                    <button onClick={reset} className="text-gray-500 hover:text-gray-300 text-[11px] flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Volver
                    </button>
                  </div>
                  <div className="bg-black/30 rounded-lg p-3 text-xs text-gray-200 leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {result}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleCopy}
                      className="flex-1 border-white/10 text-gray-400 hover:text-white text-xs rounded-lg gap-1.5">
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copiado" : "Copiar"}
                    </Button>
                    <Button size="sm" onClick={handleApply}
                      className={`flex-1 text-xs rounded-lg gap-1.5 ${accentColor === "pink" ? "bg-pink-600 hover:bg-pink-500" : "bg-violet-600 hover:bg-violet-500"}`}>
                      <Check className="w-3 h-3" /> Aplicar al campo
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}