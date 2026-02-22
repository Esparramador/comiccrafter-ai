import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Code2, Smartphone, Gauge } from "lucide-react";
import CodeOptimizer from "@/components/optimizer/CodeOptimizer";
import AndroidOptimizer from "@/components/optimizer/AndroidOptimizer";
import PerformanceOptimizer from "@/components/optimizer/PerformanceOptimizer";

export default function Optimizer() {
  const [tab, setTab] = useState("code");

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-medium mb-4">
            <Zap className="w-3.5 h-3.5" />
            Optimización con Gemini 3.1 Flash
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Code & Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">Optimizer</span>
          </h1>
          <p className="text-gray-400 text-sm">Revisa, optimiza y prepara tu código para producción + Android</p>
        </div>

        {/* Tabs */}
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-auto p-1 bg-white/5 rounded-2xl border border-white/10 gap-1 mb-8">
            <TabsTrigger
              value="code"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-yellow-600 data-[state=active]:to-orange-600`}
            >
              <Code2 className="w-4 h-4" />
              <span className="hidden sm:inline">Código</span>
            </TabsTrigger>
            <TabsTrigger
              value="performance"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600`}
            >
              <Gauge className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger
              value="android"
              className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-emerald-600`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Android</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="code">
            <CodeOptimizer />
          </TabsContent>

          <TabsContent value="performance">
            <PerformanceOptimizer />
          </TabsContent>

          <TabsContent value="android">
            <AndroidOptimizer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}