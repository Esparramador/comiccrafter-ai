import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Zap, Users, Landmark } from "lucide-react";

export default function AIRecommendations({ analysis }) {
  const [expandedOpportunity, setExpandedOpportunity] = useState(0);

  if (!analysis || typeof analysis !== 'object') {
    return <div className="text-gray-400">Sin datos disponibles</div>;
  }

  const opportunities = Array.isArray(analysis.opportunities) ? analysis.opportunities : [];
  const acquisitionChannels = Array.isArray(analysis.acquisitionChannels) ? analysis.acquisitionChannels : [];
  const premiumFeatures = Array.isArray(analysis.premiumFeatures) ? analysis.premiumFeatures : [];
  const partnerships = Array.isArray(analysis.partnerships) ? analysis.partnerships : [];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-3"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <div className="p-4 rounded-lg bg-gradient-to-br from-violet-500/20 to-violet-600/10 border border-violet-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-gray-400">OPORTUNIDADES</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {analysis.opportunities.length}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-pink-500/20 to-pink-600/10 border border-pink-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-gray-400">CANALES ADQUISICIÓN</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {analysis.acquisitionChannels?.length || 0}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border border-cyan-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Landmark className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">PARTNERSHIPS</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {analysis.partnerships?.length || 0}
          </div>
        </div>
      </div>

      {/* Oportunidades */}
      <div className="space-y-2">
        <h3 className="font-semibold text-white mb-4">Oportunidades de Monetización</h3>
        {analysis.opportunities.map((opportunity, idx) => (
          <motion.div key={idx} variants={item}>
            <button
              onClick={() =>
                setExpandedOpportunity(
                  expandedOpportunity === idx ? -1 : idx
                )
              }
              className="w-full text-left p-4 rounded-lg bg-white/5 border border-white/10 hover:border-violet-500/30 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-white">
                    {opportunity.title}
                  </h4>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                      {opportunity.potentialIncome}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-300">
                      Esfuerzo: {opportunity.effort}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                      {opportunity.timelineMonths} meses
                    </span>
                  </div>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedOpportunity === idx ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {expandedOpportunity === idx && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-4 rounded-lg bg-white/5 border border-white/10 border-t-0 rounded-t-none"
              >
                <p className="text-gray-300 text-sm leading-relaxed">
                  {opportunity.description}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Premium Features */}
      {analysis.premiumFeatures && (
        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <h4 className="font-semibold text-white mb-3">Features Premium a Priorizar</h4>
          <ul className="space-y-2">
            {analysis.premiumFeatures.map((feature, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-violet-400 mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Canales de Adquisición */}
      {analysis.acquisitionChannels && (
        <div className="mt-6 space-y-2">
          <h4 className="font-semibold text-white mb-3">Canales de Adquisición</h4>
          {analysis.acquisitionChannels.map((channel, idx) => (
            <div
              key={idx}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <h5 className="font-semibold text-white mb-2">{channel.channel}</h5>
              <div className="space-y-1 text-sm text-gray-300">
                <p>{channel.strategy}</p>
                <div className="flex gap-3 mt-2 text-xs">
                  <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300">
                    ${channel.costPerUser}/usuario
                  </span>
                  <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                    {channel.projectedReach}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Partnerships */}
      {analysis.partnerships && (
        <div className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10">
          <h4 className="font-semibold text-white mb-3">Partnerships Estratégicos</h4>
          <ul className="space-y-2">
            {analysis.partnerships.map((partner, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-300">
                <span className="text-pink-400 mt-1">→</span>
                <span>{partner}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}