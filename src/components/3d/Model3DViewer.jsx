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
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function Model3DViewer({ model, onClose }) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const [comments, setComments] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isModifying, setIsModifying] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Inicializar Three.js scene
  useEffect(() => {
    if (!mountRef.current || !model?.gltf_url) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0f);

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Optimización móvil
    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const light1 = new THREE.DirectionalLight(0xffffff, 0.8);
    light1.position.set(5, 5, 5);
    scene.add(light1);

    const light2 = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(light2);

    // Load GLTF model
    const loader = new THREE.GLTFLoader();
    loader.load(
      model.gltf_url,
      (gltf) => {
        const mesh = gltf.scene;
        mesh.scale.set(1.5, 1.5, 1.5);
        scene.add(mesh);

        // Auto-rotate
        const animate = () => {
          requestAnimationFrame(animate);
          mesh.rotation.y += 0.005;
          renderer.render(scene, camera);
        };
        animate();
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // Handle resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    sceneRef.current = { scene, camera, renderer, mesh: null };

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [model?.gltf_url]);

  // Generar sugerencias
  const generateSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `El usuario está personalizando un modelo 3D de "${model.name}".
        Descripción original: "${model.description}"
        Basándote en esto, sugiere 5 ideas creativas y específicas para mejorar o modificar el modelo 3D.
        
        Devuelve un JSON con estructura: {"suggestions": ["idea1", "idea2", ...]}`,
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
        model_id: model.id,
        comments,
      });

      // Aquí podrías actualizar el visor con el modelo modificado
      setComments("");
      setSuggestions([]);
    } catch (error) {
      console.error("Error modifying model:", error);
    } finally {
      setIsModifying(false);
    }
  };

  // Descargar modelo
  const downloadModel = async (format = "glb") => {
    try {
      const link = document.createElement("a");
      link.href = model.gltf_url;
      link.download = `${model.name}.${format}`;
      link.click();
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
          <h2 className="text-xl font-bold">{model.name} - Vista Previa 3D</h2>
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
          <div className="flex-1 relative bg-black/20 rounded-lg overflow-hidden border border-white/10">
            <div ref={mountRef} className="w-full h-full" />
            <div className="absolute bottom-4 left-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-white/20"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-white/20"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
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
              <h3 className="font-medium mb-3 flex items-center gap-2">
                <Download className="w-4 h-4" />
                Descargar
              </h3>
              <div className="space-y-2">
                <Button
                  onClick={() => downloadModel("glb")}
                  variant="outline"
                  className="w-full text-sm border-white/20"
                >
                  GLB/GLTF
                </Button>
                <Button
                  onClick={() => downloadModel("obj")}
                  variant="outline"
                  className="w-full text-sm border-white/20"
                >
                  OBJ
                </Button>
                <Button
                  onClick={() => downloadModel("stl")}
                  variant="outline"
                  className="w-full text-sm border-white/20"
                >
                  STL (Impresión 3D)
                </Button>
              </div>
            </div>

            {/* Info del Modelo */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm">
              <p className="text-gray-400">
                <span className="font-medium">Versión:</span> {model.version}
              </p>
              <p className="text-gray-400 mt-1">
                <span className="font-medium">Estilo:</span> {model.style}
              </p>
            </div>
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