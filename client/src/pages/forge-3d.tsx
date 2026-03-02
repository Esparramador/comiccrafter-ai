import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, Grid, Environment, ContactShadows, useGLTF } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Hammer, Download, Eye, Box, Sparkles, Wand2, ChevronRight, Upload, Image as ImageIcon, Users, CheckCircle2, Play, Activity, Zap, FastForward, Loader2, RotateCw, Palette, Bone, Scissors, FileDown, ChevronDown, RefreshCw, Layers, Shapes, Grid3x3, Paintbrush } from "lucide-react";
import * as THREE from "three";
import bgImg from "../assets/images/bg.png";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { type Character } from "@shared/schema";
import AIProgress from "@/components/ai-progress";
import { CreditBadge, useCredits } from "@/lib/credits";

function RealModel({ url, action = "idle" }: { url: string; action?: string }) {
  const { scene, animations } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const mixer = useRef<THREE.AnimationMixer>(null);

  useEffect(() => {
    if (scene && animations.length > 0) {
      mixer.current = new THREE.AnimationMixer(scene);
      const clip = animations.find(a => a.name.toLowerCase().includes(action)) || animations[0];
      const animAction = mixer.current.clipAction(clip);
      animAction.play();
    }
    return () => {
      mixer.current?.stopAllAction();
    };
  }, [scene, animations, action]);

  useFrame((state, delta) => {
    mixer.current?.update(delta);
    if (!mixer.current && action === "idle" && group.current) {
      group.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return <primitive ref={group} object={scene} castShadow receiveShadow scale={2} position={[0, 0, 0]} />;
}

function MannequinModel({ action = "idle" }: { action?: string }) {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    if (action === "idle") {
      group.current.position.y = Math.sin(t * 2) * 0.05;
    } else if (action === "run") {
      group.current.position.y = Math.abs(Math.sin(t * 10)) * 0.2;
      group.current.rotation.y = Math.sin(t * 5) * 0.1;
    }
  });

  return (
    <group ref={group} castShadow receiveShadow>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.4]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.5} metalness={0.5} />
      </mesh>
      <mesh position={[-0.6, 1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.6, 1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-0.25, 0.25, 0]} castShadow>
        <boxGeometry args={[0.25, 0.8, 0.25]} />
        <meshStandardMaterial color="#312e81" roughness={0.6} metalness={0.2} />
      </mesh>
      <mesh position={[0.25, 0.25, 0]} castShadow>
        <boxGeometry args={[0.25, 0.8, 0.25]} />
        <meshStandardMaterial color="#312e81" roughness={0.6} metalness={0.2} />
      </mesh>
    </group>
  );
}

type PipelineStep = "idle" | "generating" | "model-ready" | "retopology" | "rigging" | "animating" | "texturing" | "stylizing" | "converting";

const ANIMATIONS = [
  { id: "preset:idle", name: "Idle", category: "Básico" },
  { id: "preset:walk", name: "Caminar", category: "Básico" },
  { id: "preset:run", name: "Correr", category: "Básico" },
  { id: "preset:jump", name: "Saltar", category: "Básico" },
  { id: "preset:sit", name: "Sentarse", category: "Básico" },
  { id: "preset:wave", name: "Saludar", category: "Emociones" },
  { id: "preset:dance", name: "Bailar", category: "Emociones" },
  { id: "preset:cheer", name: "Celebrar", category: "Emociones" },
  { id: "preset:cry", name: "Llorar", category: "Emociones" },
  { id: "preset:afraid", name: "Miedo", category: "Emociones" },
  { id: "preset:angry", name: "Enfadado", category: "Emociones" },
  { id: "preset:bow", name: "Reverencia", category: "Emociones" },
  { id: "preset:clap", name: "Aplaudir", category: "Emociones" },
  { id: "preset:climb", name: "Escalar", category: "Acción" },
  { id: "preset:cast_a_spell", name: "Lanzar Hechizo", category: "Acción" },
  { id: "preset:punch", name: "Puñetazo", category: "Acción" },
  { id: "preset:kick", name: "Patada", category: "Acción" },
  { id: "preset:slash", name: "Espadazo", category: "Acción" },
  { id: "preset:shoot", name: "Disparar", category: "Acción" },
  { id: "preset:throw", name: "Lanzar", category: "Acción" },
  { id: "preset:basketball_shot", name: "Tiro Basket", category: "Deporte" },
  { id: "preset:boxing", name: "Boxeo", category: "Deporte" },
];

const STYLES = [
  { id: "cartoon", name: "Cartoon", icon: "🎨" },
  { id: "clay", name: "Arcilla", icon: "🏺" },
  { id: "lego", name: "LEGO", icon: "🧱" },
  { id: "voxel", name: "Voxel", icon: "🎮" },
  { id: "voronoi", name: "Voronoi", icon: "🔷" },
  { id: "minecraft", name: "Minecraft", icon: "⛏️" },
  { id: "christmas", name: "Navidad", icon: "🎄" },
  { id: "steampunk", name: "Steampunk", icon: "⚙️" },
];

const EXPORT_FORMATS = [
  { id: "glb", name: "GLB", desc: "Web / Visor 3D", icon: "🌐" },
  { id: "fbx", name: "FBX", desc: "Unity / Unreal / Blender", icon: "🎮" },
  { id: "obj", name: "OBJ", desc: "Software 3D genérico", icon: "📦" },
  { id: "stl", name: "STL", desc: "Impresión 3D", icon: "🖨️" },
  { id: "usdz", name: "USDZ", desc: "Apple AR", icon: "📱" },
];

type TabMode = "generate" | "retopology" | "texture" | "rig" | "animate" | "stylize" | "export";

export default function Forge3D() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { checkCredits, PaywallModal, refreshUser, getAuthHeaders } = useCredits();
  const [activeTab, setActiveTab] = useState<TabMode>("generate");
  const [generateMode, setGenerateMode] = useState<"text" | "image">("text");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("idle");
  const [modelVersion, setModelVersion] = useState("v2.0-20240919");

  const [uploadedImageToken, setUploadedImageToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");

  const [originalTaskId, setOriginalTaskId] = useState<string | null>(null);
  const [rigTaskId, setRigTaskId] = useState<string | null>(null);

  const [retopologyTarget, setRetopologyTarget] = useState("10000");
  const [retopologyTopo, setRetopologyTopo] = useState<"quad" | "triangle">("quad");
  const [selectedAnimation, setSelectedAnimation] = useState("preset:idle");
  const [animCategoryFilter, setAnimCategoryFilter] = useState("Todos");
  const [selectedStyle, setSelectedStyle] = useState("cartoon");
  const [selectedExportFormat, setSelectedExportFormat] = useState("glb");
  const [exportQuad, setExportQuad] = useState(false);
  const [exportFaceLimit, setExportFaceLimit] = useState("");
  const [exportFlattenBottom, setExportFlattenBottom] = useState(false);

  const [modelInfo, setModelInfo] = useState<{
    topology?: string;
    faces?: number;
    vertices?: number;
    hasRig?: boolean;
    hasAnimation?: boolean;
  }>({});

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (currentTaskId && isProcessing) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/ai/3d-status/${currentTaskId}`);
          const data = await res.json();
          if (data.data) {
            setGenerationProgress(data.data.progress || 0);
            if (data.data.status === "success") {
              setIsProcessing(false);
              setCurrentTaskId(null);
              const outputModel = data.data.output?.model || data.data.output?.rendered_model;
              if (outputModel) {
                setModelUrl(outputModel);
              }
              if (!originalTaskId && data.data.task_id) {
                setOriginalTaskId(data.data.task_id);
              }
              if (data.data.output?.model_info) {
                setModelInfo(prev => ({
                  ...prev,
                  faces: data.data.output.model_info.faces,
                  vertices: data.data.output.model_info.vertices,
                }));
              }
              const stepName = pipelineStep === "generating" ? "Modelo 3D generado" :
                pipelineStep === "retopology" ? "Retopología completada" :
                pipelineStep === "rigging" ? "Rigging completado" :
                pipelineStep === "animating" ? "Animación aplicada" :
                pipelineStep === "texturing" ? "Texturas mejoradas" :
                pipelineStep === "stylizing" ? "Estilo aplicado" :
                pipelineStep === "converting" ? "Conversión completada" : "Proceso completado";
              toast({ title: stepName, description: "Operación exitosa." });
              if (pipelineStep === "rigging") {
                setRigTaskId(data.data.task_id || currentTaskId);
                setModelInfo(prev => ({ ...prev, hasRig: true }));
              }
              if (pipelineStep === "animating") {
                setModelInfo(prev => ({ ...prev, hasAnimation: true }));
              }
              setPipelineStep("model-ready");
              refreshUser();
            } else if (data.data.status === "failed") {
              setIsProcessing(false);
              setCurrentTaskId(null);
              setPipelineStep("model-ready");
              toast({ title: "Error", description: data.data.error || "Tripo3D no pudo completar la tarea.", variant: "destructive" });
            }
          }
        } catch (error) {
          console.error("Error polling status:", error);
        }
      }, 3000);
    }
    return () => { if (pollInterval) clearInterval(pollInterval); };
  }, [currentTaskId, isProcessing, pipelineStep]);

  const startTask = async (endpoint: string, body: any, step: PipelineStep) => {
    setIsProcessing(true);
    setPipelineStep(step);
    setGenerationProgress(0);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error en la operación");
      const taskId = data.data?.task_id;
      if (taskId) {
        setCurrentTaskId(taskId);
        if (step === "generating") setOriginalTaskId(taskId);
      } else {
        throw new Error("No se recibió ID de tarea");
      }
    } catch (error: any) {
      setIsProcessing(false);
      setPipelineStep(originalTaskId ? "model-ready" : "idle");
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleGenerate = async () => {
    const service = uploadedImageToken ? "generate-3d-from-image" : "generate-3d";
    if (!checkCredits(service)) return;
    setModelUrl(null);
    setOriginalTaskId(null);
    setRigTaskId(null);
    setModelInfo({});
    if (uploadedImageToken) {
      await startTask("/api/ai/generate-3d-from-image", { imageToken: uploadedImageToken }, "generating");
    } else {
      await startTask("/api/ai/generate-3d", {
        prompt,
        negativePrompt: negativePrompt || undefined,
        modelVersion,
      }, "generating");
    }
  };

  const handleRetopology = async () => {
    if (!originalTaskId) return;
    if (!checkCredits("3d-retopology")) return;
    await startTask("/api/ai/3d-retopology", {
      taskId: originalTaskId,
      targetFaceCount: parseInt(retopologyTarget) || 10000,
      topology: retopologyTopo,
    }, "retopology");
  };

  const handleRig = async () => {
    if (!originalTaskId) return;
    if (!checkCredits("3d-rig")) return;
    await startTask("/api/ai/3d-rig", { taskId: originalTaskId }, "rigging");
  };

  const handleAnimate = async () => {
    if (!rigTaskId) {
      toast({ title: "Rigging necesario", description: "Primero aplica Auto-Rig antes de animar.", variant: "destructive" });
      return;
    }
    if (!checkCredits("3d-animate")) return;
    await startTask("/api/ai/3d-animate", {
      rigTaskId,
      animation: selectedAnimation,
    }, "animating");
  };

  const handleTexture = async () => {
    if (!originalTaskId) return;
    if (!checkCredits("3d-texture")) return;
    await startTask("/api/ai/3d-texture", { taskId: originalTaskId }, "texturing");
  };

  const handleStylize = async () => {
    if (!originalTaskId) return;
    if (!checkCredits("3d-stylize")) return;
    await startTask("/api/ai/3d-stylize", {
      taskId: originalTaskId,
      style: selectedStyle,
    }, "stylizing");
  };

  const handleConvert = async () => {
    if (!originalTaskId) return;
    if (!checkCredits("3d-convert")) return;
    await startTask("/api/ai/3d-convert", {
      taskId: originalTaskId,
      format: selectedExportFormat,
      quad: exportQuad,
      faceLimit: exportFaceLimit ? parseInt(exportFaceLimit) : undefined,
      flattenBottom: exportFlattenBottom,
    }, "converting");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      try {
        const res = await fetch("/api/ai/upload-3d-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64, filename: file.name }),
        });
        const data = await res.json();
        if (data.data?.image_token) {
          setUploadedImageToken(data.data.image_token);
          toast({ title: "Imagen subida", description: "Referencia lista para Image-to-3D" });
        }
      } catch (error: any) {
        toast({ title: "Error de subida", description: error.message, variant: "destructive" });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadModel = () => {
    if (modelUrl) window.open(modelUrl, "_blank");
  };

  const tabs: { id: TabMode; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { id: "generate", label: t("forge3d.tabGenerate"), icon: <Box className="w-4 h-4" /> },
    { id: "retopology", label: t("forge3d.tabRetopo"), icon: <Grid3x3 className="w-4 h-4" />, disabled: !originalTaskId },
    { id: "texture", label: t("forge3d.tabTexture"), icon: <Paintbrush className="w-4 h-4" />, disabled: !originalTaskId },
    { id: "rig", label: t("forge3d.tabRig"), icon: <Bone className="w-4 h-4" />, disabled: !originalTaskId },
    { id: "animate", label: t("forge3d.tabAnimate"), icon: <Play className="w-4 h-4" />, disabled: !rigTaskId },
    { id: "stylize", label: t("forge3d.tabStylize"), icon: <Palette className="w-4 h-4" />, disabled: !originalTaskId },
    { id: "export", label: t("forge3d.tabExport"), icon: <FileDown className="w-4 h-4" />, disabled: !originalTaskId },
  ];

  const filteredAnimations = animCategoryFilter === "Todos"
    ? ANIMATIONS
    : ANIMATIONS.filter(a => a.category === animCategoryFilter);

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-in fade-in duration-500 bg-[#0B0D17]">
      <div className="w-[420px] border-r border-white/5 bg-[#111322]/90 flex flex-col backdrop-blur-xl z-10 relative">
        <div className="p-4 border-b border-white/5 flex items-center gap-2">
          <Hammer className="w-5 h-5 text-blue-400" />
          <h2 className="text-lg font-bold tracking-tight text-white">Comic Crafter 3D</h2>
          <span className="ml-auto text-[9px] font-mono text-blue-400/60 bg-blue-500/10 px-2 py-0.5 rounded">Tripo3D Engine</span>
        </div>

        <div className="flex border-b border-white/5 overflow-x-auto scrollbar-none">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && setActiveTab(tab.id)}
              disabled={tab.disabled}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400 bg-blue-500/5"
                  : tab.disabled
                  ? "border-transparent text-white/20 cursor-not-allowed"
                  : "border-transparent text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
              data-testid={`tab-${tab.id}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === "generate" && (
            <>
              <div className="flex bg-black/50 p-1 rounded-lg border border-white/5">
                <button
                  className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${generateMode === "text" ? "bg-blue-600 text-white shadow-lg" : "text-white/50 hover:text-white"}`}
                  onClick={() => setGenerateMode("text")}
                  data-testid="button-mode-text"
                >
                  {t("forge3d.fromText")}
                </button>
                <button
                  className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${generateMode === "image" ? "bg-blue-600 text-white shadow-lg" : "text-white/50 hover:text-white"}`}
                  onClick={() => setGenerateMode("image")}
                  data-testid="button-mode-image"
                >
                  {t("forge3d.fromImage")}
                </button>
              </div>

              {generateMode === "text" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">{t("forge3d.modelDescription")}</label>
                    <Textarea
                      placeholder={t("forge3d.prompt3D")}
                      className="h-24 resize-none bg-black/50 border-white/10 text-white placeholder:text-white/20 text-sm focus-visible:ring-blue-500"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      data-testid="input-3d-prompt"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">{t("forge3d.negativePrompt")}</label>
                    <Textarea
                      placeholder={t("forge3d.negativePromptPlaceholder")}
                      className="h-14 resize-none bg-black/50 border-white/10 text-white placeholder:text-white/20 text-xs focus-visible:ring-blue-500"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      data-testid="input-3d-negative"
                    />
                  </div>
                </div>
              )}

              {generateMode === "image" && (
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-3 h-3" /> {t("forge3d.referenceImage")}
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      onChange={handleFileUpload}
                      disabled={isUploading || isProcessing}
                    />
                    <div className="w-full h-28 rounded-lg border-2 border-dashed border-white/10 bg-black/30 flex flex-col items-center justify-center text-white/40 hover:text-white/70 hover:border-blue-500/50 transition-all">
                      {isUploading ? <Loader2 className="w-6 h-6 mb-2 animate-spin" /> : <Upload className="w-6 h-6 mb-2" />}
                      <span className="text-xs font-medium">
                        {uploadedImageToken ? t("forge3d.imageLoaded") : t("forge3d.dragDrop")}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">{t("forge3d.modelVersion")}</label>
                <select
                  className="w-full bg-black/50 border border-white/10 text-white rounded-md px-3 py-2.5 text-sm focus:ring-blue-500"
                  value={modelVersion}
                  onChange={(e) => setModelVersion(e.target.value)}
                  data-testid="select-model-version"
                >
                  <option value="v2.0-20240919">v2.0 ({t("forge3d.highQuality")})</option>
                  <option value="v1.4-20240625">v1.4 ({t("forge3d.fast")})</option>
                </select>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-[0_0_20px_rgba(79,70,229,0.4)] h-12 text-sm font-bold tracking-wide transition-all hover:scale-[1.02]"
                onClick={handleGenerate}
                disabled={isProcessing || (generateMode === "text" ? !prompt : !uploadedImageToken)}
                data-testid="button-generate-3d"
              >
                {isProcessing && pipelineStep === "generating" ? (
                  <span className="flex items-center gap-2"><FastForward className="w-4 h-4 animate-pulse" /> {generationProgress}% {t("forge3d.generating3D")}</span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2 text-yellow-300" />
                    {generateMode === "text" ? t("forge3d.generate3D") : t("forge3d.generateFromImage")}
                  </>
                )}
              </Button>
              <div className="flex justify-center">
                <CreditBadge service={generateMode === "image" ? "generate-3d-from-image" : "generate-3d"} />
              </div>
              <AIProgress isActive={isProcessing && pipelineStep === "generating"} type="3d" estimatedSeconds={60} />
            </>
          )}

          {activeTab === "retopology" && (
            <>
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400">
                  <Grid3x3 className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Retopología Inteligente</h3>
                </div>
                <p className="text-xs text-white/50">Convierte la malla de alta densidad en una malla limpia y optimizada, ideal para animación o juegos.</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Caras Objetivo</label>
                <input
                  type="number"
                  className="w-full bg-black/50 border border-white/10 text-white rounded-md px-3 py-2.5 text-sm focus:ring-blue-500"
                  value={retopologyTarget}
                  onChange={(e) => setRetopologyTarget(e.target.value)}
                  placeholder="10000"
                  data-testid="input-retopo-faces"
                />
                <p className="text-[9px] text-white/30 mt-1">Recomendado: 5K-15K para juegos, 30K+ para cine</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1.5 block">Topología</label>
                <div className="flex gap-2">
                  <button
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${retopologyTopo === "quad" ? "bg-cyan-600 border-cyan-500 text-white" : "bg-black/30 border-white/10 text-white/50 hover:text-white"}`}
                    onClick={() => setRetopologyTopo("quad")}
                    data-testid="button-topo-quad"
                  >
                    Quad (Animación)
                  </button>
                  <button
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold border transition-all ${retopologyTopo === "triangle" ? "bg-cyan-600 border-cyan-500 text-white" : "bg-black/30 border-white/10 text-white/50 hover:text-white"}`}
                    onClick={() => setRetopologyTopo("triangle")}
                    data-testid="button-topo-triangle"
                  >
                    Triángulos (Juegos)
                  </button>
                </div>
              </div>

              {modelInfo.faces && (
                <div className="bg-black/40 rounded-lg p-3 border border-white/5 text-xs space-y-1">
                  <div className="flex justify-between"><span className="text-white/40">Caras actuales:</span><span className="text-cyan-300 font-mono">{modelInfo.faces?.toLocaleString()}</span></div>
                  {modelInfo.vertices && <div className="flex justify-between"><span className="text-white/40">Vértices:</span><span className="text-cyan-300 font-mono">{modelInfo.vertices?.toLocaleString()}</span></div>}
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 h-12 font-bold"
                onClick={handleRetopology}
                disabled={isProcessing}
                data-testid="button-retopology"
              >
                {isProcessing && pipelineStep === "retopology" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {generationProgress}% Retopologizando...</span>
                ) : (
                  <><Scissors className="w-4 h-4 mr-2" /> APLICAR RETOPOLOGÍA</>
                )}
              </Button>
              <div className="flex justify-center"><CreditBadge service="3d-retopology" /></div>
              <AIProgress isActive={isProcessing && pipelineStep === "retopology"} type="3d" estimatedSeconds={15} />
            </>
          )}

          {activeTab === "texture" && (
            <>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <Paintbrush className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Mejorar Texturas</h3>
                </div>
                <p className="text-xs text-white/50">Genera texturas PBR de alta calidad: albedo, normal maps, roughness y metalness.</p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 h-12 font-bold"
                onClick={handleTexture}
                disabled={isProcessing}
                data-testid="button-texture"
              >
                {isProcessing && pipelineStep === "texturing" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {generationProgress}% Texturizando...</span>
                ) : (
                  <><Paintbrush className="w-4 h-4 mr-2" /> MEJORAR TEXTURAS</>
                )}
              </Button>
              <div className="flex justify-center"><CreditBadge service="3d-texture" /></div>
              <AIProgress isActive={isProcessing && pipelineStep === "texturing"} type="3d" estimatedSeconds={20} />
            </>
          )}

          {activeTab === "rig" && (
            <>
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-purple-400">
                  <Bone className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Rigging y Animación 3D</h3>
                </div>
                <p className="text-xs text-white/50">Genera automáticamente un esqueleto con skin weights para animar tu modelo. Compatible con humanoides y criaturas.</p>
              </div>

              <div className="bg-black/40 rounded-lg p-3 border border-white/5 text-xs space-y-1.5">
                <div className="flex justify-between"><span className="text-white/40">Esqueleto:</span><span className={modelInfo.hasRig ? "text-green-400 font-bold" : "text-red-400"}>
                  {modelInfo.hasRig ? "✓ Generado" : "✗ Sin esqueleto"}
                </span></div>
                <div className="flex justify-between"><span className="text-white/40">Tipo de modelo:</span><span className="text-purple-300">Humanoide (auto-detect)</span></div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 h-12 font-bold shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                onClick={handleRig}
                disabled={isProcessing}
                data-testid="button-rig"
              >
                {isProcessing && pipelineStep === "rigging" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {generationProgress}% Rigging IA...</span>
                ) : (
                  <><Bone className="w-4 h-4 mr-2" /> {modelInfo.hasRig ? "REINTENTAR RIGGING" : "AUTO-RIG MODELO"}</>
                )}
              </Button>
              <div className="flex justify-center"><CreditBadge service="3d-rig" /></div>
              <AIProgress isActive={isProcessing && pipelineStep === "rigging"} type="3d" estimatedSeconds={30} />
            </>
          )}

          {activeTab === "animate" && (
            <>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Play className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Biblioteca de Animaciones</h3>
                </div>
                <p className="text-xs text-white/50">Selecciona una animación del catálogo profesional para aplicar a tu modelo con rig.</p>
              </div>

              <div className="flex gap-1 flex-wrap">
                {["Todos", "Básico", "Emociones", "Acción", "Deporte"].map(cat => (
                  <button
                    key={cat}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${animCategoryFilter === cat ? "bg-emerald-600 text-white" : "bg-white/5 text-white/40 hover:text-white/70"}`}
                    onClick={() => setAnimCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-1.5 max-h-[240px] overflow-y-auto pr-1">
                {filteredAnimations.map(anim => (
                  <button
                    key={anim.id}
                    onClick={() => setSelectedAnimation(anim.id)}
                    className={`p-2 rounded-lg text-[10px] font-bold text-center transition-all border ${
                      selectedAnimation === anim.id
                        ? "bg-emerald-600 border-emerald-500 text-white shadow-lg"
                        : "bg-black/30 border-white/5 text-white/50 hover:text-white hover:border-emerald-500/30"
                    }`}
                    data-testid={`button-anim-${anim.id}`}
                  >
                    {anim.name}
                  </button>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 h-12 font-bold"
                onClick={handleAnimate}
                disabled={isProcessing || !rigTaskId}
                data-testid="button-animate"
              >
                {isProcessing && pipelineStep === "animating" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {generationProgress}% Animando...</span>
                ) : (
                  <><Play className="w-4 h-4 mr-2" /> APLICAR ANIMACIÓN</>
                )}
              </Button>
              <div className="flex justify-center"><CreditBadge service="3d-animate" /></div>
              <AIProgress isActive={isProcessing && pipelineStep === "animating"} type="3d" estimatedSeconds={20} />
            </>
          )}

          {activeTab === "stylize" && (
            <>
              <div className="bg-pink-500/10 border border-pink-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-pink-400">
                  <Palette className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Estilización Artística</h3>
                </div>
                <p className="text-xs text-white/50">Transforma el estilo visual de tu modelo manteniendo la geometría.</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {STYLES.map(style => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-xl text-xs font-bold text-center transition-all border flex flex-col items-center gap-1.5 ${
                      selectedStyle === style.id
                        ? "bg-pink-600 border-pink-500 text-white shadow-lg"
                        : "bg-black/30 border-white/5 text-white/50 hover:text-white hover:border-pink-500/30"
                    }`}
                    data-testid={`button-style-${style.id}`}
                  >
                    <span className="text-lg">{style.icon}</span>
                    {style.name}
                  </button>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 h-12 font-bold"
                onClick={handleStylize}
                disabled={isProcessing}
                data-testid="button-stylize"
              >
                {isProcessing && pipelineStep === "stylizing" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {generationProgress}% Estilizando...</span>
                ) : (
                  <><Palette className="w-4 h-4 mr-2" /> APLICAR ESTILO</>
                )}
              </Button>
              <div className="flex justify-center"><CreditBadge service="3d-stylize" /></div>
              <AIProgress isActive={isProcessing && pipelineStep === "stylizing"} type="3d" estimatedSeconds={20} />
            </>
          )}

          {activeTab === "export" && (
            <>
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400">
                  <FileDown className="w-5 h-5" />
                  <h3 className="font-bold text-sm">Exportar Modelo</h3>
                </div>
                <p className="text-xs text-white/50">Convierte y descarga en el formato que necesites.</p>
              </div>

              <div className="space-y-2">
                {EXPORT_FORMATS.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedExportFormat(fmt.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all border flex items-center gap-3 ${
                      selectedExportFormat === fmt.id
                        ? "bg-indigo-600/20 border-indigo-500/50 text-white"
                        : "bg-black/20 border-white/5 text-white/50 hover:text-white hover:border-indigo-500/30"
                    }`}
                    data-testid={`button-format-${fmt.id}`}
                  >
                    <span className="text-lg">{fmt.icon}</span>
                    <div>
                      <p className="text-xs font-bold">{fmt.name}</p>
                      <p className="text-[10px] text-white/40">{fmt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportQuad}
                    onChange={(e) => setExportQuad(e.target.checked)}
                    className="rounded bg-black/50 border-white/20 text-indigo-600"
                  />
                  Convertir a Quads
                </label>
                <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportFlattenBottom}
                    onChange={(e) => setExportFlattenBottom(e.target.checked)}
                    className="rounded bg-black/50 border-white/20 text-indigo-600"
                  />
                  Aplanar base (Impresión 3D)
                </label>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1 block">Límite de Caras (opcional)</label>
                  <input
                    type="number"
                    className="w-full bg-black/50 border border-white/10 text-white rounded-md px-3 py-2 text-sm"
                    value={exportFaceLimit}
                    onChange={(e) => setExportFaceLimit(e.target.value)}
                    placeholder="Sin límite"
                  />
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 h-12 font-bold"
                onClick={handleConvert}
                disabled={isProcessing}
                data-testid="button-convert"
              >
                {isProcessing && pipelineStep === "converting" ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> {generationProgress}% Convirtiendo...</span>
                ) : (
                  <><FileDown className="w-4 h-4 mr-2" /> CONVERTIR A {selectedExportFormat.toUpperCase()}</>
                )}
              </Button>
              <div className="flex justify-center"><CreditBadge service="3d-convert" /></div>

              {modelUrl && (
                <Button
                  variant="outline"
                  className="w-full bg-transparent border-white/10 text-white/70 hover:text-white h-10"
                  onClick={handleDownloadModel}
                  data-testid="button-download-direct"
                >
                  <Download className="w-4 h-4 mr-2" /> Descargar Modelo Actual (.GLB)
                </Button>
              )}
            </>
          )}
        </div>

        {originalTaskId && (
          <div className="p-3 border-t border-white/5 bg-black/30 space-y-1.5">
            <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Pipeline del Modelo</p>
            <div className="flex gap-1 flex-wrap">
              {[
                { label: "Modelo", done: !!originalTaskId },
                { label: "Retopo", done: !!modelInfo.topology },
                { label: "Textura", done: false },
                { label: "Rig", done: !!modelInfo.hasRig },
                { label: "Anim", done: !!modelInfo.hasAnimation },
              ].map((s, i) => (
                <span
                  key={i}
                  className={`px-2 py-0.5 rounded text-[8px] font-bold ${s.done ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-white/5 text-white/20 border border-white/5"}`}
                >
                  {s.done ? "✓" : "○"} {s.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 bg-gradient-to-b from-[#0a0a0a] to-[#000000] relative overflow-hidden flex flex-col">
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0 mix-blend-screen" style={{ backgroundImage: `url(${bgImg})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>

        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
          <div className="flex gap-2 pointer-events-auto">
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-md px-3 py-1.5 flex items-center gap-2 text-xs text-white/90 font-mono shadow-2xl">
              <Eye className="w-3.5 h-3.5 text-blue-400" /> Render View
            </div>
            {modelUrl && (
              <div className="bg-green-500/10 text-green-400 border border-green-500/30 rounded-md px-3 py-1.5 flex items-center gap-2 text-xs font-mono">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> Modelo Activo
              </div>
            )}
          </div>
          {modelUrl && (
            <div className="flex gap-2 pointer-events-auto">
              <Button size="sm" variant="outline" className="bg-black/80 backdrop-blur-xl border-white/10 text-white text-xs hover:bg-white/10" onClick={handleDownloadModel} data-testid="button-export-glb">
                <Download className="w-3.5 h-3.5 mr-1" /> .GLB
              </Button>
            </div>
          )}
        </div>

        <div className="w-full h-full relative cursor-move z-10">
          {(modelUrl || isProcessing) ? (
            <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 45 }}>
              <Environment preset="studio" />
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow shadow-mapSize={2048} />
              <pointLight position={[-5, 5, -5]} intensity={0.5} color="#8b5cf6" />
              {modelUrl ? (
                <RealModel url={modelUrl} action={currentAnimation} />
              ) : (
                <MannequinModel action={currentAnimation} />
              )}
              <ContactShadows resolution={1024} scale={10} blur={2} opacity={0.5} far={10} color="#000000" />
              <Grid infiniteGrid fadeDistance={30} sectionColor="#4f46e5" cellColor="#1e1b4b" sectionThickness={1} cellThickness={0.5} />
              <OrbitControls makeDefault autoRotate={!modelUrl} autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-white/30 flex-col gap-6">
              <div className="w-32 h-32 rounded-full border-2 border-white/5 border-dashed flex items-center justify-center bg-black/20">
                <Box className="w-14 h-14 opacity-20 text-white" />
              </div>
              <div className="text-center max-w-md px-4">
                <h2 className="text-xl font-black tracking-widest text-white/80 mb-2">MOTOR 3D INACTIVO</h2>
                <p className="text-sm text-white/40 leading-relaxed">
                  Describe tu modelo o sube una imagen para generar un activo 3D profesional con Tripo3D AI.
                </p>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
              <div className="flex flex-col items-center gap-6">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_50px_rgba(59,130,246,0.5)]"></div>
                  <div className="absolute inset-2 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin" style={{ animationDirection: "reverse" }}></div>
                  <Zap className="w-8 h-8 text-blue-400 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <h2 className="text-lg font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">
                    {pipelineStep === "generating" && `GENERANDO MODELO (${generationProgress}%)`}
                    {pipelineStep === "retopology" && `RETOPOLOGÍA (${generationProgress}%)`}
                    {pipelineStep === "rigging" && `AUTO-RIG IA (${generationProgress}%)`}
                    {pipelineStep === "animating" && `ANIMANDO (${generationProgress}%)`}
                    {pipelineStep === "texturing" && `TEXTURIZANDO (${generationProgress}%)`}
                    {pipelineStep === "stylizing" && `ESTILIZANDO (${generationProgress}%)`}
                    {pipelineStep === "converting" && `CONVIRTIENDO (${generationProgress}%)`}
                  </h2>
                  <p className="text-xs text-white/50 font-mono">Tripo3D AI procesando...</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <PaywallModal />
    </div>
  );
}
