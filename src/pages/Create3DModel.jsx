import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import Model3DWizardStep1 from "@/components/3d/Model3DWizardStep1";
import Model3DWizardStep2 from "@/components/3d/Model3DWizardStep2";
import Model3DViewer from "@/components/3d/Model3DViewer";
import AuthGuard from "@/components/auth/AuthGuard";

export default function Create3DModel() {
  const [step, setStep] = useState(1);
  const [model3DData, setModel3DData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedModel, setGeneratedModel] = useState(null);
  const queryClient = useQueryClient();

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStep1Complete = (data) => {
    setModel3DData(data);
    handleNext();
  };

  const handleStep2Complete = async (questionnaireResponses) => {
    setIsGenerating(true);
    try {
      const response = await base44.functions.invoke("generate3DModel", {
        ...model3DData,
        questionnaire_responses: questionnaireResponses,
      });
      setGeneratedModel(response.data);
      queryClient.invalidateQueries({ queryKey: ["models3d"] });
      setStep(3);
    } catch (error) {
      console.error("Error generating model:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModelClose = () => {
    setStep(1);
    setModel3DData(null);
    setGeneratedModel(null);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] text-white pt-20">
        {/* Header con botón atrás */}
        <div className="fixed top-20 left-0 right-0 z-40 bg-gradient-to-b from-[#0a0a0f]/80 to-transparent backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={step === 1 ? () => window.history.back() : handleBack}
              className="border-violet-500/30 hover:bg-violet-500/10"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              Crear Modelo 3D
              {step > 1 && ` - Paso ${step}`}
            </h1>
          </div>
        </div>

        {/* Contenido */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Model3DWizardStep1 onComplete={handleStep1Complete} />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Model3DWizardStep2
                characterData={model3DData}
                onComplete={handleStep2Complete}
                isGenerating={isGenerating}
              />
            </motion.div>
          )}

          {step === 3 && generatedModel && (
            <Model3DViewer model={generatedModel} onClose={handleModelClose} />
          )}
        </div>
      </div>
    </AuthGuard>
  );
}