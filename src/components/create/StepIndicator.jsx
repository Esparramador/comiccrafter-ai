import React from "react";
import { Check } from "lucide-react";

const steps = [
  { label: "Personajes" },
  { label: "Historia" },
  { label: "Estilo" },
  { label: "Generar" },
];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-10">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isCompleted = i < currentStep;
        return (
          <React.Fragment key={i}>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                isCompleted
                  ? "bg-violet-600 text-white"
                  : isActive
                  ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white shadow-lg shadow-violet-500/30"
                  : "bg-white/5 text-gray-500 border border-white/10"
              }`}>
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`hidden sm:inline text-sm font-medium transition-colors ${
                isActive ? "text-white" : isCompleted ? "text-violet-400" : "text-gray-500"
              }`}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 sm:w-16 h-px transition-colors ${
                i < currentStep ? "bg-violet-500" : "bg-white/10"
              }`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}