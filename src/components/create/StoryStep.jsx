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
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Cuenta tu Historia</h2>
        <p className="text-gray-400 text-sm max-w-lg mx-auto">
          Escribe la historia que quieres convertir en cómic. La IA se encargará de dividirla en paneles, 
          crear diálogos y generar las escenas.
        </p>
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

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">Tu Historia</label>
            <button
              onClick={() => setShowPrompt(!showPrompt)}
              className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 transition-colors"
            >
              <Lightbulb className="w-3.5 h-3.5" />
              Ideas
            </button>
          </div>

          {showPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-3 space-y-2"
            >
              {storyPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => { setStory(prompt); setShowPrompt(false); }}
                  className="w-full text-left p-3 rounded-lg border border-white/5 bg-white/[0.02] text-sm text-gray-400 hover:text-violet-300 hover:border-violet-500/20 hover:bg-violet-500/5 transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 inline mr-2 text-violet-500" />
                  {prompt}
                </button>
              ))}
            </motion.div>
          )}

          <Textarea
            placeholder="Describe tu historia con todo el detalle posible: trama, escenas clave, giros argumentales, emociones..."
            value={story}
            onChange={(e) => setStory(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-violet-500/50 min-h-[240px] rounded-xl leading-relaxed"
          />
          <p className="text-xs text-gray-600 mt-2">
            {story.length} caracteres · Cuantos más detalles, mejor resultado
          </p>
        </div>
      </div>
    </motion.div>
  );
}