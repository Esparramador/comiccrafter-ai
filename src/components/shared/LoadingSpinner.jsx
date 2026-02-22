import React from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

/**
 * Reusable loading spinner with animation
 */
export default function LoadingSpinner({ 
  text = "Cargando...", 
  size = "lg",
  fullScreen = false 
}) {
  const sizeMap = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8"
  };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-3"
        >
          <Loader2 className={`${sizeMap[size]} text-violet-400 animate-spin`} />
          <p className="text-white font-medium">{text}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Loader2 className={`${sizeMap[size]} text-violet-400 animate-spin`} />
      {text && <p className="text-gray-400 text-sm">{text}</p>}
    </div>
  );
}