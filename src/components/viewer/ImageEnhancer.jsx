import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Sliders, Sparkles, Loader2, Download, RotateCcw, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEFAULT_ADJUSTMENTS = { brightness: 100, contrast: 100, saturation: 100 };

export default function ImageEnhancer({ imageUrl, pageLabel, onClose }) {
  const [adjustments, setAdjustments] = useState(DEFAULT_ADJUSTMENTS);
  const [enhancedUrl, setEnhancedUrl] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [activeTab, setActiveTab] = useState("adjust"); // "adjust" | "upscale"
  const imgRef = useRef(null);

  const cssFilter = `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturation}%)`;

  const displayUrl = enhancedUrl || imageUrl;

  const handleUpscale = async () => {
    setIsEnhancing(true);
    const result = await base44.integrations.Core.GenerateImage({
      prompt: `Ultra high resolution upscaled version of this comic page. Enhance sharpness, clarity, line art quality, color vibrancy, and fine details. Keep the exact same composition, characters, panels layout and art style. Professional comic art, 8k resolution, masterpiece quality.`,
      existing_image_urls: [imageUrl],
    });
    setEnhancedUrl(result.url);
    setIsEnhancing(false);
  };

  const handleDownload = async () => {
    // Apply CSS filter via canvas
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      ctx.filter = cssFilter;
      ctx.drawImage(img, 0, 0);
      canvas.toBlob(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pageLabel || "page"}_enhanced.png`;
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    };
    img.src = displayUrl;
  };

  const resetAdjustments = () => setAdjustments(DEFAULT_ADJUSTMENTS);
  const hasCustomAdjustments = JSON.stringify(adjustments) !== JSON.stringify(DEFAULT_ADJUSTMENTS);

  const sliders = [
    { key: "brightness", label: "Brillo", min: 50, max: 200, unit: "%" },
    { key: "contrast", label: "Contraste", min: 50, max: 200, unit: "%" },
    { key: "saturation", label: "Saturación", min: 0, max: 300, unit: "%" },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        onClick={e => e.stopPropagation()}
        className="bg-[#12121a] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <div>
            <h2 className="text-base font-bold text-white">Mejorar Imagen</h2>
            <p className="text-xs text-gray-500">{pageLabel}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0">
          {/* Image Preview */}
          <div className="flex-1 flex items-center justify-center bg-black/40 p-4 min-h-[300px]">
            {isEnhancing ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-violet-500/20 flex items-center justify-center">
                  <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
                </div>
                <p className="text-sm text-gray-400">IA mejorando la imagen...</p>
                <p className="text-xs text-gray-600">Esto puede tardar unos segundos</p>
              </div>
            ) : (
              <div className="relative max-h-full">
                <img
                  ref={imgRef}
                  src={displayUrl}
                  alt={pageLabel}
                  className="max-h-[50vh] md:max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
                  style={{ filter: cssFilter, transition: "filter 0.2s ease" }}
                />
                {enhancedUrl && (
                  <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-violet-600/90 text-white text-[10px] font-medium flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> IA mejorada
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="md:w-72 flex flex-col border-t md:border-t-0 md:border-l border-white/5 overflow-y-auto">
            {/* Tabs */}
            <div className="flex border-b border-white/5">
              {[
                { id: "adjust", icon: Sliders, label: "Ajustes" },
                { id: "upscale", icon: Sparkles, label: "IA Upscale" },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-violet-300 border-b-2 border-violet-500"
                      : "text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 p-5 space-y-5">
              {activeTab === "adjust" && (
                <>
                  <div className="space-y-5">
                    {sliders.map(({ key, label, min, max }) => (
                      <div key={key}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs font-medium text-gray-300">{label}</span>
                          <span className="text-xs text-violet-400 font-mono">{adjustments[key]}%</span>
                        </div>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          value={adjustments[key]}
                          onChange={e => setAdjustments(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                          className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-violet-500 bg-white/10"
                        />
                        <div className="flex justify-between mt-1">
                          <span className="text-[10px] text-gray-600">{min}%</span>
                          <span className="text-[10px] text-gray-600">{max}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {hasCustomAdjustments && (
                    <button
                      onClick={resetAdjustments}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Restablecer valores
                    </button>
                  )}
                </>
              )}

              {activeTab === "upscale" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-violet-500/10 border border-violet-500/20">
                    <div className="flex items-start gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-violet-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-violet-300 mb-1">Mejora con IA</p>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          Genera una versión mejorada de esta imagen con mayor resolución, nitidez y calidad de color usando IA generativa.
                        </p>
                      </div>
                    </div>
                  </div>

                  {enhancedUrl && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <p className="text-xs text-green-300">Imagen mejorada con IA ✓</p>
                    </div>
                  )}

                  <Button
                    onClick={handleUpscale}
                    disabled={isEnhancing}
                    className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl gap-2 disabled:opacity-50"
                  >
                    {isEnhancing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Mejorando...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> {enhancedUrl ? "Regenerar" : "Mejorar con IA"}</>
                    )}
                  </Button>

                  <p className="text-[10px] text-gray-600 text-center">
                    ~15-30 segundos · Genera una nueva versión mejorada
                  </p>
                </div>
              )}
            </div>

            {/* Download */}
            <div className="p-5 border-t border-white/5">
              <Button
                onClick={handleDownload}
                disabled={isEnhancing}
                variant="outline"
                className="w-full border-white/10 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl gap-2"
              >
                <Download className="w-4 h-4" />
                Descargar imagen
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}