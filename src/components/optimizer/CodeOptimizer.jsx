import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function CodeOptimizer() {
  const [code, setCode] = useState("");
  const [filePath, setFilePath] = useState("component.jsx");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);

  const handleAnalyze = async () => {
    if (!code.trim()) {
      setError("Pega código para analizar");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const { data } = await base44.functions.invoke("codeReviewOptimizer", {
        code,
        filePath,
        fileType: filePath.endsWith(".jsx") ? "javascript" : "javascript",
      });

      if (data.success) {
        setAnalysis(data.analysis);
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
        <Zap className="w-5 h-5 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">Code Optimizer con Gemini</h2>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Nombre del archivo (ej: component.jsx)"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-400 outline-none"
        />

        <textarea
          placeholder="Pega tu código aquí..."
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={12}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-yellow-400 outline-none font-mono text-sm"
        />

        <Button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !code.trim()}
          className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 rounded-lg gap-2"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Analizando con Gemini...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Analizar y Optimizar
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

      {analysis && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-6 rounded-lg bg-white/[0.03] border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Análisis Completado</h3>
          </div>

          {analysis.ERRORS && analysis.ERRORS.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-red-400">🔴 Errores Críticos:</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                {analysis.ERRORS.map((err, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-red-400">•</span> {err}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.OPTIMIZATIONS && analysis.OPTIMIZATIONS.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-yellow-400">⚡ Optimizaciones:</h4>
              <ul className="text-xs text-gray-300 space-y-1">
                {analysis.OPTIMIZATIONS.map((opt, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-yellow-400">•</span> {opt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.PERFORMANCE && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-blue-400">🚀 Performance:</h4>
              <p className="text-xs text-gray-300">{analysis.PERFORMANCE}</p>
            </div>
          )}

          {analysis.FIXED_CODE && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-green-400">✅ Código Corregido:</h4>
              <pre className="p-3 rounded bg-black/50 text-xs text-green-300 overflow-auto max-h-48">
                {analysis.FIXED_CODE}
              </pre>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}