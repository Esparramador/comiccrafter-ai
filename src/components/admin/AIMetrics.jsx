import React from "react";
import { motion } from "framer-motion";
import { Users, TrendingUp, Play, BookOpen } from "lucide-react";

export default function AIMetrics({ stats }) {
  const metrics = [
    {
      label: "Total Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "from-blue-500 to-blue-600",
    },
    {
      label: "Suscripciones Activas",
      value: stats.activeSubscriptions,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
    },
    {
      label: "Vídeos Completados",
      value: stats.completedVideos,
      icon: Play,
      color: "from-pink-500 to-pink-600",
    },
    {
      label: "Cómics Completados",
      value: stats.completedComics,
      icon: BookOpen,
      color: "from-violet-500 to-violet-600",
    },
  ];

  const conversionRate =
    stats.totalUsers > 0
      ? ((stats.activeSubscriptions / stats.totalUsers) * 100).toFixed(1)
      : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`p-4 rounded-lg bg-gradient-to-br ${metric.color} bg-opacity-10 border border-white/10`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 mb-1">{metric.label}</p>
                  <p className="text-2xl font-bold text-white">{metric.value}</p>
                </div>
                <Icon className="w-6 h-6 text-gray-500 opacity-50" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Conversion Rate */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 mb-1">Tasa de Conversión</p>
            <p className="text-3xl font-bold text-white">{conversionRate}%</p>
            <p className="text-xs text-gray-400 mt-1">
              {stats.activeSubscriptions} / {stats.totalUsers} usuarios
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-yellow-300">📊</div>
            <p className="text-xs text-gray-400 mt-2">Meta: 15%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}