import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Reusable confirmation dialog
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900 border border-white/10 rounded-2xl p-6 max-w-sm"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className={`w-6 h-6 ${
                isDestructive ? 'text-red-400' : 'text-yellow-400'
              }`} />
              <h3 className="text-lg font-semibold text-white">{title}</h3>
            </div>
            
            <p className="text-gray-400 text-sm mb-6">{message}</p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="border-white/10"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className={isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-violet-600 hover:bg-violet-700'}
              >
                {isLoading ? 'Procesando...' : confirmText}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}