import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { BookOpen, Lightbulb, Wand2 } from "lucide-react";
import { motion } from "framer-motion";
import StoryWizard from "./StoryWizard";
import LanguageSelector from "./LanguageSelector";

export default function StoryStep({ title, setTitle, story, setStory, language, setLanguage }) {
  const [showPrompt, setShowPrompt] = React.useState(false);
  const [showWizard, setShowWizard] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Cuenta tu Historia</h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Escribe tu historia o deja que la IA la genere para ti mediante un cuestionario.
        </p>
      </div>

      {/* Story Wizard */}
      <div>
        <button
          onClick={() => setShowWizard(!showWizard)}
          className={`w-full flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
            showWizard
              ? "border-violet-500/40 bg-violet-500/10 text-violet-300"
              : "border-white/5 bg-white/[0.02] text-gray-400 hover:text-violet-300 hover:border-violet-500/20"
          }`}
        >
          <Wand2 className="w-4 h-4" />
          {showWizard ? "Ocultar asistente IA" : "✨ Generar historia con IA (cuestionario)"}
        </button>
        {showWizard && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
            <StoryWizard onStoryGenerated={(t, s) => { setTitle(t); setStory(s); setShowWizard(false); }} />
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Título del Cómic</label>
          <Input
            placeholder="Ej: Crónicas del Dragón Estelar"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-12 bg-white/5 border-white/10 text-white text-lg placeholder:text-gray-600 focus:border-violet-500/50 rounded-xl"
          />
        </div>

        {/* Language */}
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Idioma del cómic</label>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Tu Historia</label>
          </div>
          <Textarea
            placeholder="Describe tu historia con todo el detalle posible: trama, escenas clave, giros argumentales, emociones..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-violet-500/50 min-h-[200px] rounded-xl leading-relaxed"
          />
          <p className="text-xs text-gray-600 mt-2">
            {story.length} caracteres · Cuantos más detalles, mejor resultado
          </p>
        </div>
      </div>
    </motion.div>
  );
}