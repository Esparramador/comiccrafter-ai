import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Zap, Sparkles, Clock, Gauge } from "lucide-react";

const QUALITY_LEVELS = [
  { id: "rapido", label: "Rápido ⚡", desc: "Generación ultrarrápida, buena calidad", time: "5-10 min" },
  { id: "estandar", label: "Estándar ✨", desc: "Calidad equilibrada, detalles moderados", time: "15-20 min" },
  { id: "premium", label: "Premium 🎬", desc: "Alta calidad, mucho detalle visual", time: "25-35 min" },
  { id: "cinematico", label: "Cinemático 🎥", desc: "Máxima calidad, fotograma a fotograma", time: "45-60 min" }
];

export default function VideoProductionWizard({ onProjectCreated }) {
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [story, setStory] = useState("");
  const [duration, setDuration] = useState(5);
  const [quality, setQuality] = useState("estandar");
  const [targetAge, setTargetAge] = useState("3-6");
  const [language, setLanguage] = useState("es");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState("");

  const handleGenerate = async () => {
    if (!title.trim() || !story.trim()) {
      alert("Por favor completa título y historia");
      return;
    }

    setIsGenerating(true);
    setProgress("Iniciando producción...");

    try {
      const response = await base44.functions.invoke('videoProductionOrchestrator', {
        title,
        story,
        duration: parseInt(duration),
        quality,
        targetAge,
        language
      });

      setProgress("¡Proyecto completado!");
      if (onProjectCreated) {
        onProjectCreated(response.data.project);
      }
    } catch (error) {
      setProgress(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400 mb-2">
            Estudio de Producción IA
          </h1>
          <p className="text-gray-400">Director inteligente que crea videos animados profesionales</p>
        </div>

        {!isGenerating ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 0 && (
              <div className="space-y-4 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white">Tu Proyecto</h2>
                <input
                  type="text"
                  placeholder="Título del video"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none"
                />
                <textarea
                  placeholder="Cuéntame la historia del video..."
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  className="w-full h-32 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-500 focus:border-cyan-400 focus:outline-none resize-none"
                />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Edad objetivo</label>
                    <select
                      value={targetAge}
                      onChange={(e) => setTargetAge(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="0-3">0-3 años</option>
                      <option value="3-6">3-6 años</option>
                      <option value="6-10">6-10 años</option>
                      <option value="10-14">10-14 años</option>
                      <option value="all_ages">Todas las edades</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Idioma</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:border-cyan-400 focus:outline-none"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="pt">Português</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Duration & Quality */}
            {step === 1 && (
              <div className="space-y-4 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                <h2 className="text-xl font-semibold text-white">Duración y Calidad</h2>

                {/* Duration */}
                <div>
                  <label className="text-sm text-gray-300 mb-2 block flex items-center gap-2">
                    <Clock className="w-4 h-4" /> Duración: <span className="text-cyan-400 font-bold">{duration} minutos</span>
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">1 - 100 minutos</div>
                </div>

                {/* Quality */}
                <div>
                  <label className="text-sm text-gray-300 mb-3 flex items-center gap-2">
                    <Gauge className="w-4 h-4" /> Nivel de Calidad
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {QUALITY_LEVELS.map((q) => (
                      <button
                        key={q.id}
                        onClick={() => setQuality(q.id)}
                        className={`p-3 rounded-lg border transition-all text-left text-sm ${
                          quality === q.id
                            ? "border-cyan-400 bg-cyan-400/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <p className="font-semibold text-white">{q.label}</p>
                        <p className="text-xs text-gray-400">{q.desc}</p>
                        <p className="text-xs text-cyan-300 mt-1">{q.time}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 justify-between">
              <Button
                variant="outline"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
                className="border-white/20 text-gray-400 hover:text-white rounded-lg"
              >
                Atrás
              </Button>

              {step === 0 && (
                <Button
                  onClick={() => setStep(1)}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg gap-2"
                >
                  Siguiente <Sparkles className="w-4 h-4" />
                </Button>
              )}

              {step === 1 && (
                <Button
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 rounded-lg gap-2"
                >
                  <Zap className="w-4 h-4" /> Generar Ahora
                </Button>
              )}
            </div>
          </motion.div>
        ) : (
          /* Generation Progress */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 text-center"
          >
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white animate-spin" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Creando tu video...</h3>
              <p className="text-gray-400">{progress}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✓ Escribiendo guion</p>
              <p>✓ Generando imágenes</p>
              <p>✓ Grabando voces con ElevenLabs</p>
              <p className="animate-pulse">⚙️ Procesando...</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}