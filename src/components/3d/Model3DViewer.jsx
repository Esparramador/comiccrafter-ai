import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  X,
  Loader,
  MessageCircle,
  Lightbulb,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function Model3DViewer({ model, onClose }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [comments, setComments] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isModifying, setIsModifying] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentModel, setCurrentModel] = useState(model);

  // Inicializar Three.js scene
  useEffect(() => {
    if (!mountRef.current || !currentModel?.preview_image) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    // Iluminación profesional
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
    directionalLight.position.set(5, 10, 7);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x4c1d95, 0.4);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Canvas preview como fallback visual
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const image = new Image();
    
    image.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.drawImage(image, 0, 0, 512, 512);
      
      const texture = new THREE.CanvasTexture(canvas);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.MeshBasicMaterial({ map: texture });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      let rotation = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        mesh.rotation.z += 0.001;
        renderer.render(scene, camera);
      };
      animate();
    };
    
    image.src = currentModel.preview_image;

    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [currentModel?.preview_image]);

  // Generar sugerencias de IA
  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Usuario personalizando modelo 3D: "${currentModel.name}"
Descripción: "${currentModel.description}"
Versión: ${currentModel.version}

Sugiere 5 modificaciones creativas, específicas y prácticas para mejorar este modelo 3D. 
Incluye: ropa, accesorios, expresiones, estilos, detalles que harían el modelo más interesante.

JSON: {"suggestions": ["idea1", "idea2", ...]}`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: { type: "string" },
            },
          },
        },
      });

      setSuggestions(result.suggestions || []);
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Aplicar modificación
  const applyModification = async () => {
    if (!comments.trim()) return;

    setIsModifying(true);
    try {
      const response = await base44.functions.invoke("modify3DModel", {
        model_id: currentModel.id,
        comments,
      });

      if (response.data?.updated_model) {
        setCurrentModel(response.data.updated_model);
        setComments("");
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error modifying model:", error);
    } finally {
      setIsModifying(false);
    }
  };

  // Descargar modelo
  const downloadModel = async (format = "png") => {
    try {
      const res = await fetch(currentModel.preview_image);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${currentModel.name}_preview.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading model:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full h-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-[#0a0a0f] to-[#1a1a2e] border border-violet-500/20 rounded-lg overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">{currentModel.name}</h2>
            <p className="text-xs text-gray-500">Versión {currentModel.version} • Estilo: {currentModel.style}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden p-4">
          {/* Visor 3D */}
          <div className="flex-1 relative bg-gradient-to-b from-black/40 to-black/20 rounded-lg overflow-hidden border border-white/10">
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center" title="Zoom in">
                <ZoomIn className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center" title="Zoom out">
                <ZoomOut className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-9 h-9 rounded-lg bg-white/10 border border-white/10 hover:bg-white/20 transition-all flex items-center justify-center" title="Rotar">
                <RotateCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Panel Lateral - Modificaciones y Sugerencias */}
          <div className="w-80 space-y-4 overflow-y-auto pr-2">
            {/* Comentarios */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-4 h-4 text-violet-400" />
                <h3 className="font-medium">Comentarios</h3>
              </div>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Ej: Ropa azul, añade gafas, hazlo más musculoso..."
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 resize-none h-20"
              />
              <Button
                onClick={applyModification}
                disabled={!comments.trim() || isModifying}
                className="w-full mt-2 bg-violet-500 hover:bg-violet-600 text-sm"
              >
                {isModifying ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin mr-2" />
                    Aplicando...
                  </>
                ) : (
                  "Aplicar Cambios"
                )}
              </Button>
            </div>

            {/* Sugerencias de IA */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-400" />
                  <h3 className="font-medium">Sugerencias IA</h3>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={generateSuggestions}
                  disabled={loadingSuggestions}
                  className="text-xs"
                >
                  {loadingSuggestions ? (
                    <Loader className="w-3 h-3 animate-spin" />
                  ) : (
                    "Generar"
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => setComments(suggestion)}
                    className="w-full text-left text-xs bg-white/5 border border-white/10 rounded-lg p-2 hover:bg-white/10 transition-colors"
                  >
                    ✨ {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Descargas */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h3 className="font-medium mb-3 flex items-center gap-2 text-white">
                <Download className="w-4 h-4" />
                Descargar
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => downloadModel("png")}
                  variant="outline"
                  className="w-full text-sm border-white/20 text-gray-300 hover:text-white"
                >
                  Imagen PNG
                </Button>
                <Button
                  onClick={() => downloadModel("jpg")}
                  variant="outline"
                  className="w-full text-sm border-white/20 text-gray-300 hover:text-white"
                >
                  Imagen JPG
                </Button>
              </div>
            </div>

            {/* Historial de cambios */}
            {currentModel.modification_history?.length > 0 && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-white mb-2">Historial</h3>
                <div className="space-y-1 text-[10px] text-gray-500 max-h-24 overflow-y-auto">
                  {currentModel.modification_history.map((mod, idx) => (
                    <p key={idx} className="truncate">
                      v{idx + 1}: {mod.modification}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-4 flex justify-between">
          <p className="text-sm text-gray-400">
            Modelo guardado automáticamente
          </p>
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-violet-500 to-pink-500"
          >
            Finalizar y Cerrar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}