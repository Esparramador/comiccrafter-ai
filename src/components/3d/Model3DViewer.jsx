import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stage, Loader } from "@react-three/drei";
import { motion } from "framer-motion";
import { Download, RotateCw, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";

function Model3DViewer({ modelUrl, modelName = "Modelo 3D" }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">{modelName}</h3>
          <p className="text-xs text-gray-500">Arrastra para rotar · Scroll para zoom</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="border-white/10">
            <ZoomIn className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-white/10">
            <ZoomOut className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" className="border-white/10">
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative w-full h-96 rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent overflow-hidden">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-red-500/10 border border-red-500/20">
            <div className="text-center">
              <p className="text-red-400 text-sm">Error al cargar modelo</p>
              <p className="text-red-300/60 text-xs mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 2.5], fov: 50 }}
            onCreated={() => setLoading(false)}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 10, 7]} intensity={1.2} />
            <pointLight position={[-5, -5, 5]} intensity={0.6} color="#8b5cf6" />

            <Stage environment="sunset" intensity={0.8}>
              <group>
                {modelUrl && (
                  <Model3D url={modelUrl} onError={setError} />
                )}
              </group>
            </Stage>

            <OrbitControls
              autoRotate
              autoRotateSpeed={4}
              enableZoom={true}
              enablePan={true}
            />
          </Canvas>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader />
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
          onClick={() => {
            // Exportar modelo
            const link = document.createElement("a");
            link.href = modelUrl;
            link.download = `${modelName}.glb`;
            link.click();
          }}
        >
          <Download className="w-4 h-4 mr-2" />
          Descargar STL
        </Button>
      </div>
    </motion.div>
  );
}

function Model3D({ url, onError }) {
  const groupRef = useRef();
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    const loader = new THREE.GLTFLoader();
    loader.load(
      url,
      (gltf) => {
        setGltf(gltf);
        if (groupRef.current) {
          groupRef.current.add(gltf.scene);
        }
      },
      undefined,
      (error) => {
        console.error("Error loading model:", error);
        onError?.("No se pudo cargar el modelo 3D");
      }
    );
  }, [url, onError]);

  return <group ref={groupRef} />;
}

export default Model3DViewer;