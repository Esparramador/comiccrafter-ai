import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Zap, Sparkles, Plus, X, Loader2, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AuthGuard from "@/components/auth/AuthGuard";


function Create3DModelContent() {
  const [step, setStep] = useState(0);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [characterName, setCharacterName] = useState("");
  const [characterDescription, setCharacterDescription] = useState("");
  const [style, setStyle] = useState("realistic");
  const [photos, setPhotos] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedModel, setGeneratedModel] = useState(null);
  const [customizations, setCustomizations] = useState("");

  const { data: characters = [] } = useQuery({
    queryKey: ["characters"],
    queryFn: () => base44.entities.Character.list(),
  });

  const handlePhotoUpload = async (file) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setPhotos([...photos, file_url]);
    } catch (error) {
      console.error("Photo upload error:", error);
    }
  };

  const generateModel = async () => {
    if (!photos.length || !characterDescription) {
      alert("Agrega fotos y descripción");
      return;
    }

    try {
      setIsGenerating(true);
      setProgress(0);

      // 1. Analizar fotos y descripción
      setProgress(20);
      const analysisResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Analiza esta descripción de personaje y genera especificaciones técnicas para un modelo 3D:

DESCRIPCIÓN: ${characterDescription}
ESTILO: ${style === "realistic" ? "Fotorrealista, detallado, profesional para cine/juegos" : "3D estilizado adaptado al estilo"}

Genera JSON con:
- facial_features (ojos, nariz, boca, orejas)
- body_structure (altura, complexión, proporciones)
- hair (color, estilo, detalles)
- distinctive_marks (cicatrices, tatuajes, etc.)
- clothing (si aplica)
- pose_recommendation
- rendering_settings (colores, materiales, iluminación)`,
        response_json_schema: {
          type: "object",
          properties: {
            facial_features: { type: "object" },
            body_structure: { type: "object" },
            hair: { type: "object" },
            distinctive_marks: { type: "array" },
            clothing: { type: "object" },
            rendering_settings: { type: "object" },
          },
        },
        file_urls: photos,
      });

      setProgress(40);

      // 2. Generar imágenes de referencia multiángulo
      const stylePrompt = style === "realistic" 
        ? "Fotorrealista, renderizado profesional cinemático, studio lighting"
        : style === "cartoon_3d" 
        ? "3D cartoon estilizado, colores vibrantes, proporciones caricaturescas"
        : style === "anime_3d"
        ? "3D estilo anime, grandes ojos expresivos, cabello dinámico"
        : "3D estilizado fantasía, colores mágicos, efectos luminosos";

      const referenceImages = await Promise.all([
        base44.integrations.Core.GenerateImage({
          prompt: `Modelo 3D ${style} vista frontal. ${analysisResult.facial_features && analysisResult.body_structure ? "Características: " + JSON.stringify(analysisResult).slice(0, 200) : ""} ${stylePrompt}`,
          existing_image_urls: photos,
        }),
        base44.integrations.Core.GenerateImage({
          prompt: `Modelo 3D ${style} vista lateral. ${stylePrompt}`,
          existing_image_urls: photos,
        }),
      ]);

      setProgress(60);

      // 3. Llamar función backend para generar modelo 3D (será integración con Meshy/Rodin)
      const modelResult = await base44.functions.invoke("generate3DModel", {
        name: characterName || "Personaje 3D",
        description: characterDescription,
        style,
        photos,
        specifications: analysisResult,
        referenceImages: referenceImages.map((r) => r.url),
      });

      setProgress(80);

      // 4. Guardar en BD
      const model = await base44.entities.Model3D.create({
        character_id: selectedCharacter?.id || null,
        name: characterName || "Modelo 3D",
        description: characterDescription,
        character_photos: photos,
        style,
        gltf_url: modelResult.data?.model_url,
        preview_image: referenceImages[0]?.url,
        generation_status: "completed",
        ai_provider: "Meshy/Rodin",
        polygon_count: 50000,
        optimization_level: "medium",
        export_formats: ["glb", "gltf", "obj", "stl"],
        tags: [style, "generated"],
      });

      setProgress(100);
      setGeneratedModel(model);
      setIsGenerating(false);
    } catch (error) {
      console.error("Generation error:", error);
      alert("Error generando modelo: " + error.message);
      setIsGenerating(false);
    }
  };

  const saveCustomizations = async () => {
    if (!generatedModel) return;

    try {
      await base44.entities.Model3D.update(generatedModel.id, {
        customizations: {
          outfit: customizations,
        },
      });
      alert("Personalizaciones guardadas");
    } catch (error) {
      console.error("Error saving customizations:", error);
    }
  };

  if (generatedModel) {
    return (
      <div className="min-h-screen pb-20">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Modelo 3D <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Generado</span>
            </h1>
          </div>

          {/* Modelo 3D Preview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-xl border border-white/10 bg-white/[0.03] mb-8"
          >
            {generatedModel.preview_image && (
              <img src={generatedModel.preview_image} alt={generatedModel.name} className="w-full rounded-lg mb-4" />
            )}
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">Modelo 3D generado exitosamente</p>
              <a href={generatedModel.gltf_url} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300 text-sm font-medium">
                Ver modelo completo →
              </a>
            </div>
          </motion.div>

          {/* Personalizaciones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 rounded-xl border border-white/10 bg-white/[0.03]"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Personalizar Modelo</h3>
            <Textarea
              value={customizations}
              onChange={(e) => setCustomizations(e.target.value)}
              placeholder="Ej: Agregar camiseta del Barça, balón en mano, gafas de sol..."
              className="bg-white/5 border-white/10 text-white placeholder-gray-600 h-24 mb-4"
            />
            <Button
              onClick={saveCustomizations}
              className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Aplicar Personalizaciones
            </Button>
          </motion.div>

          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              className="flex-1 border-white/10"
              onClick={() => {
                setGeneratedModel(null);
                setPhotos([]);
                setCharacterName("");
                setCharacterDescription("");
                setStep(0);
              }}
            >
              Crear Otro Modelo
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600"
              onClick={() => {
                const link = document.createElement("a");
                link.href = generatedModel.gltf_url;
                link.download = `${generatedModel.name}.glb`;
                link.click();
              }}
            >
              <Upload className="w-4 h-4 mr-2" />
              Descargar STL
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Generador de Modelos 3D
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Crea Modelos 3D <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Profesionales</span>
          </h1>
          <p className="text-gray-400 text-sm">Convierte fotos de personajes en modelos 3D listos para exportar</p>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white mb-4">Selecciona un personaje</h2>
                {characters.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {characters.map((char) => (
                      <button
                        key={char.id}
                        onClick={() => {
                          setSelectedCharacter(char);
                          setCharacterName(char.name);
                          setCharacterDescription(char.description || "");
                          setPhotos(char.photo_urls || []);
                          setStep(1);
                        }}
                        className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 transition-all text-left"
                      >
                        <p className="font-medium text-white">{char.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{char.description?.slice(0, 50)}...</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No tienes personajes aún</p>
                )}

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-2 bg-gray-900 text-gray-500 text-sm">O crea uno nuevo</span>
                  </div>
                </div>

                <Button onClick={() => setStep(1)} className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 h-11">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Modelo 3D
                </Button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Nombre del personaje</label>
                <Input
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="Ej: Héroe Protagonista"
                  className="bg-white/5 border-white/10 text-white placeholder-gray-600"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Descripción detallada</label>
                <Textarea
                  value={characterDescription}
                  onChange={(e) => setCharacterDescription(e.target.value)}
                  placeholder="Describe al personaje: edad, contextura, rasgos faciales, cabello, estilo, personalidad..."
                  className="bg-white/5 border-white/10 text-white placeholder-gray-600 h-32"
                />
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-3 block">Estilo del Modelo 3D</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "realistic", label: "Realista 3D", emoji: "🎬" },
                    { id: "cartoon_3d", label: "Cartoon 3D", emoji: "🎨" },
                    { id: "anime_3d", label: "Anime 3D", emoji: "✨" },
                    { id: "stylized", label: "Estilizado", emoji: "🌈" },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStyle(s.id)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        style === s.id ? "border-violet-500 bg-violet-500/20 text-white" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                      }`}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-gray-400 mb-2 block">Fotos de referencia</label>
                <div className="space-y-3">
                  {photos.map((photo, i) => (
                    <div key={i} className="relative inline-block">
                      <img src={photo} alt="ref" className="w-20 h-20 rounded-lg object-cover border border-white/10" />
                      <button onClick={() => setPhotos(photos.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  ))}
                  <label className="flex items-center justify-center w-full h-20 rounded-lg border-2 border-dashed border-white/10 hover:border-violet-500 cursor-pointer transition-colors">
                    <input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e.target.files[0])} className="hidden" />
                    <div className="text-center">
                      <Upload className="w-4 h-4 mx-auto text-gray-500 mb-1" />
                      <p className="text-xs text-gray-500">Agregar foto</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(0)} className="flex-1 border-white/10">
                  Atrás
                </Button>
                <Button
                  onClick={generateModel}
                  disabled={isGenerating || !characterDescription || !photos.length}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-30"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generando ({progress}%)
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generar Modelo 3D
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function Create3DModel() {
  return (
    <AuthGuard>
      <Create3DModelContent />
    </AuthGuard>
  );
}