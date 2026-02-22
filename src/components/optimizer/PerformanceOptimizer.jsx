import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Gauge, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PerformanceOptimizer() {
  const [functionCode, setFunctionCode] = useState("");
  const [functionName, setFunctionName] = useState("myFunction");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState(null);
  const [error, setError] = useState(null);

  const handleOptimize = async () => {
    if (!functionCode.trim()) {
      setError("Pega código de una función para optimizar");
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setOptimization(null);

    try {
      const { data } = await base44.functions.invoke("performanceOptimizer", {
        functionCode,
        functionName,
      });

      if (data.success) {
        setOptimization(data.optimization);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="w-5 h-5 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Performance Optimizer</h2>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Nombre de la función (ej: generateVideo)"
          value={functionName}
          onChange={(e) => setFunctionName(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-400 outline-none"
        />

        <textarea
          placeholder="Pega tu función aquí..."
          value={functionCode}
          onChange={(e) => setFunctionCode(e.target.value)}
          rows={15}
          className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-blue-400 outline-none font-mono text-sm"
        />

        <Button
          onClick={handleOptimize}
          disabled={isOptimizing || !functionCode.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 rounded-lg gap-2"
        >
          {isOptimizing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Optimizando... (10x más rápido)
            </>
          ) : (
            <>
              <Gauge className="w-4 h-4" />
              Optimizar Función
            </>
          )}
        </Button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300"
        >
          {error}
        </motion.div>
      )}

      {optimization && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 p-6 rounded-lg bg-white/[0.03] border border-white/10"
        >
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-5 h-5 text-green-400" />
            <h3 className="text-lg font-semibold text-white">Optimización Completada</h3>
            <span className="ml-auto text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300">
              Speedup: {optimization.estimatedSpeedup}
            </span>
          </div>

          {optimization.PARALLEL_CALLS && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-cyan-400">⚡ Llamadas en Paralelo:</h4>
              <p className="text-xs text-gray-300">{optimization.PARALLEL_CALLS}</p>
            </div>
          )}

          {optimization.CACHING && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-purple-400">💾 Caché:</h4>
              <p className="text-xs text-gray-300">{optimization.CACHING}</p>
            </div>
          )}

          {optimization.REMOVE_REDUNDANT && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-orange-400">🧹 Eliminar Redundancias:</h4>
              <p className="text-xs text-gray-300">{optimization.REMOVE_REDUNDANT}</p>
            </div>
          )}

          {optimization.OPTIMIZED_CODE && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-green-400">✅ Función Optimizada:</h4>
              <pre className="p-4 rounded bg-black/50 text-xs text-green-300 overflow-auto max-h-64 border border-green-500/20">
                {optimization.OPTIMIZED_CODE}
              </pre>
              <button
                onClick={() => navigator.clipboard.writeText(optimization.OPTIMIZED_CODE)}
                className="text-xs text-blue-400 hover:text-blue-300 mt-2"
              >
                Copiar código optimizado
              </button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}