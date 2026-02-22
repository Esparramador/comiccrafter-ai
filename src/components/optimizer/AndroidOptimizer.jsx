import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function AndroidOptimizer() {
  const [projectType, setProjectType] = useState("react-capacitor");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [checklist, setChecklist] = useState(null);
  const [error, setError] = useState(null);

  const projectTypes = [
    { value: "react-capacitor", label: "React + Capacitor" },
    { value: "react-native", label: "React Native" },
    { value: "flutter-web", label: "Flutter Web" },
    { value: "ionic", label: "Ionic" },
  ];

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setChecklist(null);

    try {
      const { data } = await base44.functions.invoke("androidBuildOptimizer", {
        projectType,
      });

      if (data.success) {
        setChecklist(data.checklist);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Smartphone className="w-5 h-5 text-green-400" />
        <h2 className="text-xl font-bold text-white">Android Build Optimizer</h2>
      </div>

      <div className="space-y-3">
        <label className="block text-sm text-gray-400 font-medium">Tipo de Proyecto</label>
        <select
          value={projectType}
          onChange={(e) => setProjectType(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white focus:border-green-400 outline-none"
        >
          {projectTypes.map((type) => (
            <option key={type.value} value={type.value} className="bg-gray-900">
              {type.label}
            </option>
          ))}
        </select>

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg gap-2 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando configuración...
            </>
          ) : (
            <>
              <Smartphone className="w-4 h-4" />
              Generar Checklist Android
            </>
          )}
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex gap-3"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-red-300">{error}</div>
        </motion.div>
      )}

      {checklist && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-6 rounded-lg bg-white/[0.03] border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Checklist para Android</h3>
          </div>

          {Object.entries(checklist).map(([section, content]) => {
            if (!Array.isArray(content) && typeof content === "string" && content.startsWith("raw")) {
              return null;
            }

            const sectionIcons = {
              BUILD_ERRORS: "🔴",
              PERFORMANCE: "⚡",
              CAPACITOR_CONFIG: "⚙️",
              GRADLE_CONFIG: "🔧",
              MANIFEST_FIXES: "📋",
              CODE_CHANGES: "💻",
              TESTING_STEPS: "✅",
              COMMON_ISSUES: "⚠️",
            };

            const icon = sectionIcons[section] || "•";

            return (
              <div key={section} className="space-y-2">
                <h4 className="text-sm font-semibold text-green-400">
                  {icon} {section.replace(/_/g, " ")}
                </h4>
                {Array.isArray(content) ? (
                  <ul className="text-xs text-gray-300 space-y-1 ml-4">
                    {content.map((item, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-green-400 flex-shrink-0">▸</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-gray-300 ml-4">{content}</p>
                )}
              </div>
            );
          })}

          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <p className="text-xs text-green-300">
              <CheckCircle2 className="w-4 h-4 inline mr-2" />
              Sigue estos pasos para construir sin errores en Android Studio
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}