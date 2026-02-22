import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Zap,
  TrendingUp,
  Target,
  Brain,
  BarChart3,
  RefreshCw,
  Download,
  ChevronDown,
} from "lucide-react";
import { motion } from "framer-motion";
import AIRecommendations from "./AIRecommendations";
import AIMetrics from "./AIMetrics";

export default function AIDashboard() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadAnalysis();
  }, []);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await base44.functions.invoke("aiStrategicAnalyzer", {});
      setAnalysis(res.data);
    } catch (err) {
      setError("Error al cargar análisis de IA");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysis) return;
    const report = JSON.stringify(analysis, null, 2);
    const blob = new Blob([report], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `strategic-analysis-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-400" />
            Motor de IA Estratégica
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Análisis y recomendaciones para maximizar monetización
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={loadAnalysis}
            disabled={loading}
            variant="outline"
            className="border-white/20 hover:bg-white/5"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Analizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </>
            )}
          </Button>

          {analysis && (
            <Button
              onClick={handleDownloadReport}
              className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar
            </Button>
          )}
        </div>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300"
        >
          {error}
        </motion.div>
      )}

      {/* Loading State */}
      {loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 bg-white/5 rounded-lg animate-pulse border border-white/10"
            />
          ))}
        </motion.div>
      )}

      {/* Content */}
      {analysis && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Tabs */}
          <div className="flex gap-2 border-b border-white/10">
            {[
              { id: "overview", label: "Resumen", icon: BarChart3 },
              { id: "opportunities", label: "Oportunidades", icon: Zap },
              { id: "metrics", label: "Métricas", icon: TrendingUp },
              { id: "actions", label: "Acciones", icon: Target },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-all ${
                  activeTab === id
                    ? "text-violet-400 border-b-2 border-violet-400"
                    : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === "overview" &&
          <div className="space-y-4">
                <AIMetrics stats={analysis.stats} />
                {analysis.analysis?.summary &&
            <div className="p-4 rounded-lg bg-gradient-to-br from-violet-500/10 to-pink-500/10 border border-violet-500/20">
                    <h3 className="font-semibold text-white mb-2">
                      Resumen Estratégico
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {analysis.analysis.summary}
                    </p>
                  </div>
            }
              </div>
          }

            {activeTab === "opportunities" &&
          <AIRecommendations analysis={analysis.analysis} />
          }

            {activeTab === "metrics" &&
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analysis.analysis?.pricingStrategy &&
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">
                      Estrategia de Precios
                    </h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>
                        <strong>Problema:</strong>{" "}
                        {analysis.analysis.pricingStrategy.currentIssue}
                      </p>
                      <p>
                        <strong>Recomendación:</strong>{" "}
                        {analysis.analysis.pricingStrategy.recommendation}
                      </p>
                      <p className="text-violet-400 font-semibold">
                        Incremento proyectado:{" "}
                        {analysis.analysis.pricingStrategy.projectedIncrease}
                      </p>
                    </div>
                  </div>
            }

                {analysis.analysis?.financialProjections &&
            <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">
                      Proyecciones Financieras
                    </h4>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>
                        <strong>Año 1:</strong>{" "}
                        {analysis.analysis.financialProjections.year1}
                      </p>
                      <p>
                        <strong>Año 2:</strong>{" "}
                        {analysis.analysis.financialProjections.year2}
                      </p>
                      <p>
                        <strong>Año 3:</strong>{" "}
                        {analysis.analysis.financialProjections.year3}
                      </p>
                    </div>
                  </div>
            }
              </div>
          }

            {activeTab === "actions" &&
          <div className="space-y-3">
                {analysis.analysis?.actionItems?.map((item, idx) =>
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors cursor-pointer">

                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-white">
                          {item.action}
                        </h4>
                        <div className="flex gap-3 mt-2 text-xs">
                          <span className="px-2 py-1 rounded-full bg-violet-500/20 text-violet-300">
                            {item.priority}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                            ROI: {item.estimatedROI}
                          </span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    </div>
                  </motion.div>
            )}
              </div>
          }
          </div>
        </motion.div>
      }
    </div>);

}