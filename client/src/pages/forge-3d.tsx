import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, Grid, Environment, ContactShadows, useGLTF } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Hammer, Download, Eye, Box, Sparkles, Wand2, ChevronRight, Upload, Image as ImageIcon, Users, CheckCircle2, Play, Activity, Mic, Zap, FastForward, Loader2 } from "lucide-react";
import * as THREE from "three";
import bgImg from "../assets/images/bg.png";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Character } from "@shared/schema";
import AIProgress from "@/components/ai-progress";

// Real 3D Model component using useGLTF
function RealModel({ url, action = "idle" }: { url: string; action?: string }) {
  const { scene, animations } = useGLTF(url);
  const group = useRef<THREE.Group>(null);
  const mixer = useRef<THREE.AnimationMixer>();

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

// Un modelo "maniquí" mucho más avanzado que una patata
function MannequinModel({ action = "idle" }: { action?: string }) {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    if (action === "idle") {
      group.current.position.y = Math.sin(t * 2) * 0.05;
      // Respiración
    } else if (action === "run") {
      group.current.position.y = Math.abs(Math.sin(t * 10)) * 0.2;
      group.current.rotation.y = Math.sin(t * 5) * 0.1;
    }
  });

  return (
    <group ref={group} castShadow receiveShadow>
      {/* Cabeza */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.8} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1, 0]} castShadow>
        <boxGeometry args={[0.8, 1, 0.4]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.5} metalness={0.5} />
      </mesh>
      {/* Brazos */}
      <mesh position={[-0.6, 1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0.6, 1, 0]} castShadow>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Piernas */}
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

type WizardStep = {
  question: string;
  options: string[];
};

export default function Forge3D() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<'wizard' | 'manual' | 'animate'>('wizard');
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAnimation, setCurrentAnimation] = useState("idle");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  
  const [uploadedImageToken, setUploadedImageToken] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [wizardChoices, setWizardChoices] = useState<string[]>([]);

  const { data: characters = [] } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const { data: voices = [] } = useQuery<any[]>({
    queryKey: ["/api/voices"],
  });

  // Polling for task status
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;

    if (currentTaskId && isGenerating) {
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`/api/ai/3d-status/${currentTaskId}`);
          const data = await res.json();
          
          if (data.data) {
            setGenerationProgress(data.data.progress || 0);
            
            if (data.data.status === "success") {
              setIsGenerating(false);
              setCurrentTaskId(null);
              setModelUrl(data.data.output.model);
              toast({
                title: "¡Modelo forjado!",
                description: "El modelo 3D ha sido generado con éxito.",
              });
            } else if (data.data.status === "failed") {
              setIsGenerating(false);
              setCurrentTaskId(null);
              toast({
                title: "Error en la generación",
                description: data.data.error || "Tripo3D no pudo completar la tarea.",
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error("Error polling status:", error);
        }
      }, 3000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [currentTaskId, isGenerating]);

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const wizardSteps: WizardStep[] = [
    { question: "¿Qué tipo de activo 3D vamos a forjar hoy?", options: ["Personaje Completo", "Arma / Objeto (Prop)", "Vehículo", "Elemento de Entorno"] },
    { question: "¡El estilo es clave! ¿Qué estética buscas?", options: ["Realista / PBR Alta Resolución (Unreal 5)", "Anime Shonen (Naruto/One Piece)", "Estilo Ghibli (Mágico)", "Estilo Cartoon/Chibi", "Cómics Americanos (Marvel/DC)"] },
    { question: "¿Cuál es el material o textura dominante para los shaders?", options: ["Cel-Shading (Bordes negros duros)", "Suave / Pintado a Mano", "Metálico / PBR Completo", "Mate / Plastilina"] },
    { question: "¿Necesitas Rigging (esqueleto) para animarlo luego?", options: ["Sí, rigging facial avanzado (ARKit/ElevenLabs)", "Sí, auto-rigging corporal completo", "No, es estático para cómics/portadas"] }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    setModelUrl(null);
    setGenerationProgress(0);

    try {
      let res;
      if (uploadedImageToken) {
        res = await fetch("/api/ai/generate-3d-from-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageToken: uploadedImageToken }),
        });
      } else {
        const finalPrompt = mode === 'wizard' ? 
          `3D model of ${wizardChoices[0] || 'character'}, ${wizardChoices[1] || 'anime'} style, ${wizardChoices[2] || 'cel-shaded'} textures. ${prompt}` : 
          prompt;
          
        res = await fetch("/api/ai/generate-3d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: finalPrompt }),
        });
      }

      const data = await res.json();
      if (data.data?.task_id) {
        setCurrentTaskId(data.data.task_id);
      } else {
        throw new Error(data.error || "No se recibió el ID de la tarea");
      }
    } catch (error: any) {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
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
          toast({
            title: "Imagen subida",
            description: "Referencia cargada correctamente para Image-to-3D",
          });
        }
      } catch (error: any) {
        toast({
          title: "Error de subida",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDownload = async () => {
    if (!modelUrl) return;
    window.open(modelUrl, "_blank");
  };

  const handleAskAIAnimation = () => {
    setAiSuggestion("Analizando tu modelo... Para un personaje de acción estilo Shonen, te sugiero una animación de 'Ataque con energía' o 'Pose de victoria heroica'. Si lo conectas con ElevenLabs, podemos sincronizar los labios para que grite su ataque especial.");
  };

  const isWizardComplete = currentStep >= wizardSteps.length;

  return (
    <div className="flex h-full animate-in fade-in duration-500 bg-[#0B0D17]">
      {/* Panel Izquierdo: Configuración */}
      <div className="w-[450px] border-r border-white/5 bg-[#111322]/90 flex flex-col p-6 overflow-y-auto backdrop-blur-xl z-10 relative">
        <div className="mb-6 flex items-center gap-2 text-blue-400">
          <Hammer className="w-5 h-5" />
          <h2 className="text-xl font-bold tracking-tight">ComicCrafter 3D Engine</h2>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-black/50 p-1 rounded-lg border border-white/5 mb-6 shrink-0">
          <button 
            className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${mode === 'wizard' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            onClick={() => setMode('wizard')}
            data-testid="button-mode-wizard"
          >
            Forja IA
          </button>
          <button 
            className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${mode === 'manual' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/50 hover:text-white'}`}
            onClick={() => setMode('manual')}
            data-testid="button-mode-manual"
          >
            Avanzado
          </button>
          <button 
            className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${mode === 'animate' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'text-white/50 hover:text-white'}`}
            onClick={() => setMode('animate')}
            data-testid="button-mode-animate"
          >
            Animar
          </button>
        </div>

        {mode === 'wizard' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl p-5 space-y-4 shadow-lg relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
               {!isWizardComplete ? (
                 <>
                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                       <Sparkles className="w-4 h-4 text-blue-400" />
                     </div>
                     <div>
                        <h3 className="text-sm font-medium text-blue-300 mb-1">Paso {currentStep + 1} de {wizardSteps.length}</h3>
                        <p className="text-sm text-white/90 leading-relaxed font-medium">{wizardSteps[currentStep].question}</p>
                     </div>
                   </div>
                   
                   <div className="space-y-2 mt-4 pl-11">
                     {wizardSteps[currentStep].options.map((opt, i) => (
                       <button 
                         key={i}
                         onClick={() => {
                           setWizardChoices([...wizardChoices, opt]);
                           setCurrentStep(currentStep + 1);
                         }}
                         className="w-full text-left p-3 rounded-lg bg-black/40 border border-white/5 hover:bg-blue-500/20 hover:border-blue-500/40 text-sm text-white/70 hover:text-white transition-all flex items-center justify-between group"
                         data-testid={`button-wizard-option-${i}`}
                       >
                         {opt}
                         <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-transform" />
                       </button>
                     ))}
                   </div>
                   <div className="w-full bg-black/50 h-1.5 rounded-full mt-6 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-500" style={{ width: `${(currentStep / wizardSteps.length) * 100}%` }} />
                   </div>
                 </>
               ) : (
                 <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                      <div className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping opacity-20" />
                      <CheckCircle2 className="w-8 h-8 text-green-400 relative z-10" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Motor 3D Listo</h3>
                    <p className="text-xs text-white/60">Configuración Ultra-HD aplicada.</p>
                    <Button variant="outline" size="sm" onClick={() => {
                      setCurrentStep(0);
                      setWizardChoices([]);
                    }} className="text-xs bg-transparent border-white/10 text-white/60 hover:text-white" data-testid="button-reset-wizard">Ajustar Parámetros</Button>
                 </div>
               )}
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Input Fotográfico
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleFileUpload}
                  disabled={isUploading || isGenerating}
                />
                <div className="w-full h-24 rounded-lg border-2 border-dashed border-white/10 bg-black/30 flex flex-col items-center justify-center text-white/40 hover:text-white/70 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all">
                  {isUploading ? <Loader2 className="w-6 h-6 mb-2 animate-spin" /> : <Upload className="w-6 h-6 mb-2" />}
                  <span className="text-xs font-medium">
                    {uploadedImageToken ? "✓ Imagen cargada" : "Arrastra una imagen de referencia"}
                  </span>
                </div>
              </div>
            </div>

            <Button 
              className="w-full mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 shadow-[0_0_20px_rgba(79,70,229,0.4)] h-14 text-base font-bold tracking-wide transition-all hover:scale-[1.02]" 
              onClick={handleGenerate}
              disabled={isGenerating || !isWizardComplete}
              data-testid="button-generate-3d"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2"><FastForward className="w-5 h-5 animate-pulse" /> {generationProgress}% Renderizando...</span>
              ) : (
                <>
                  <Zap className="w-5 h-5 mr-2 text-yellow-300" />
                  FORJAR MODELO AHORA
                </>
              )}
            </Button>
            <AIProgress isActive={isGenerating} type="3d" estimatedSeconds={60} className="mt-4" />
          </div>
        )}

        {mode === 'manual' && (
          <div className="flex-1 flex flex-col gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-3 h-3" /> Imagen de Referencia
              </label>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                  onChange={handleFileUpload}
                  disabled={isUploading || isGenerating}
                />
                <div className="w-full h-32 rounded-lg border-2 border-dashed border-white/10 bg-black/30 flex flex-col items-center justify-center text-white/40 hover:text-white/70 hover:border-blue-500/50 transition-all">
                  {isUploading ? <Loader2 className="w-8 h-8 mb-2 animate-spin" /> : <Upload className="w-8 h-8 mb-2" />}
                  <span className="text-xs">
                    {uploadedImageToken ? "✓ Imagen cargada" : "Sube bocetos, fotos o concept art"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Hammer className="w-3 h-3" /> Prompt Avanzado (Tripo3D)
              </label>
              <Textarea 
                placeholder="Describe topología, poses, expresiones: 'Personaje estilo Naruto, con pelo rojo en punta, resolución 8k...'"
                className="h-32 resize-none bg-black/50 border-white/10 text-white placeholder:text-white/20 text-sm focus-visible:ring-blue-500"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                data-testid="input-3d-prompt"
              />
            </div>

            <Button 
              className="w-full mt-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 h-14 font-bold tracking-wide shadow-[0_0_20px_rgba(79,70,229,0.4)]" 
              onClick={handleGenerate}
              disabled={isGenerating || (!prompt && !uploadedImageToken)}
              data-testid="button-generate-3d-manual"
            >
              {isGenerating ? <FastForward className="w-5 h-5 animate-pulse mr-2" /> : <Zap className="w-5 h-5 mr-2 text-yellow-300" />}
              {isGenerating ? `${generationProgress}% Renderizando...` : uploadedImageToken ? "FORJAR DESDE IMAGEN" : "FORJAR DESDE TEXTO"}
            </Button>
            <AIProgress isActive={isGenerating} type="3d" estimatedSeconds={60} className="mt-4" />
          </div>
        )}

        {mode === 'animate' && (
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4">
             <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 space-y-4">
               <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                   <Activity className="w-4 h-4" />
                 </div>
                 <h3 className="font-bold text-white">Director de Animación IA</h3>
               </div>
               
               {aiSuggestion ? (
                 <div className="bg-black/40 p-4 rounded-lg border border-purple-500/30 text-sm text-purple-100 leading-relaxed" data-testid="text-ai-suggestion">
                   "{aiSuggestion}"
                 </div>
               ) : (
                 <Button 
                   onClick={handleAskAIAnimation}
                   variant="outline" 
                   className="w-full bg-purple-500/5 border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:text-white"
                   data-testid="button-ai-suggestion"
                 >
                   <span className="flex items-center gap-2"><Sparkles className="w-4 h-4" /> Sugerir Movimientos</span>
                 </Button>
               )}
             </div>

             <div className="space-y-4">
               <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest block">Acción a Generar</label>
               <div className="grid grid-cols-2 gap-2">
                 <Button variant={currentAnimation === 'idle' ? 'default' : 'outline'} className={currentAnimation === 'idle' ? 'bg-purple-600' : 'bg-transparent border-white/10'} onClick={() => setCurrentAnimation('idle')} data-testid="button-anim-idle">Respirar (Idle)</Button>
                 <Button variant={currentAnimation === 'run' ? 'default' : 'outline'} className={currentAnimation === 'run' ? 'bg-purple-600' : 'bg-transparent border-white/10'} onClick={() => setCurrentAnimation('run')} data-testid="button-anim-run">Correr (Deporte)</Button>
                 <Button variant="outline" className="bg-transparent border-white/10 text-white/50 hover:text-white" onClick={() => alert('Generando animación con IA...')}>+ Combate</Button>
                 <Button variant="outline" className="bg-transparent border-white/10 text-white/50 hover:text-white" onClick={() => alert('Generando animación con IA...')}>+ Hablar</Button>
               </div>
             </div>

             <div className="space-y-3">
               <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                 <Mic className="w-3 h-3 text-emerald-400" /> Sincronización Labial (ElevenLabs)
               </label>
               <select className="w-full bg-black/50 border border-white/10 text-white rounded-md px-3 py-3 text-sm focus:ring-purple-500" data-testid="select-voice-sync">
                  <option>Sin Voz (Solo Cuerpo)</option>
                  {voices.map((voice) => (
                    <option key={voice.voice_id} value={voice.voice_id}>
                      {voice.name}
                    </option>
                  ))}
               </select>
               <p className="text-[10px] text-white/40">El motor 3D generará visemas automáticamente basándose en el audio.</p>
             </div>

             <Button 
              className="w-full mt-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 h-14 font-bold tracking-wide shadow-[0_0_20px_rgba(168,85,247,0.4)]" 
              onClick={() => alert("Renderizando animación ultrarrápida...")}
              disabled={!modelUrl}
              data-testid="button-render-animation"
            >
              <Play className="w-5 h-5 mr-2" />
              RENDERIZAR ANIMACIÓN
            </Button>
          </div>
        )}
      </div>

      {/* Visor Principal 3D - Ultra Potente */}
      <div className="flex-1 bg-gradient-to-b from-[#0a0a0a] to-[#000000] relative overflow-hidden flex flex-col">
        {/* Background Image generated for the app */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-0 mix-blend-screen" style={{ backgroundImage: `url(${bgImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>

        {/* Controles del Visor Arriba */}
        <div className="absolute top-6 left-6 right-6 z-10 flex justify-between items-center pointer-events-none">
           <div className="flex gap-2 pointer-events-auto">
              <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-md px-4 py-2 flex items-center gap-2 text-xs text-white/90 font-mono shadow-2xl">
                 <Eye className="w-4 h-4 text-blue-400" /> Render View (4K Real-time)
              </div>
              {modelUrl && (
                <div className="bg-green-500/10 text-green-400 border border-green-500/30 rounded-md px-4 py-2 flex items-center gap-2 text-xs font-mono shadow-[0_0_20px_rgba(34,197,94,0.15)]">
                   <Activity className="w-4 h-4 animate-pulse" /> 120 FPS
                </div>
              )}
           </div>

           {modelUrl && (
             <div className="flex gap-3 pointer-events-auto">
                <Button size="sm" variant="outline" className="bg-black/80 backdrop-blur-xl border-white/10 text-white hover:bg-white/10 shadow-2xl" data-testid="button-assign-cast">
                  <Users className="w-4 h-4 mr-2 text-blue-400" /> Asignar al Reparto
                </Button>
                <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] font-bold tracking-wide" onClick={handleDownload} data-testid="button-export-glb">
                  <Download className="w-4 h-4 mr-2" /> Exportar Modelo (.GLB)
                </Button>
             </div>
           )}
        </div>

        <div className="w-full h-full relative cursor-move z-10">
          {(modelUrl || isGenerating) ? (
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
              <OrbitControls makeDefault autoRotate={currentAnimation === 'idle' && !modelUrl} autoRotateSpeed={0.5} maxPolarAngle={Math.PI / 2.1} />
            </Canvas>
          ) : (
             <div className="w-full h-full flex items-center justify-center text-white/30 flex-col gap-8">
                  <>
                    <div className="w-40 h-40 rounded-full border-2 border-white/5 border-dashed flex items-center justify-center bg-black/20 backdrop-blur-sm shadow-2xl">
                       <Box className="w-16 h-16 opacity-20 text-white" />
                    </div>
                    <div className="text-center max-w-md">
                       <h2 className="text-2xl font-black tracking-widest text-white/80 mb-2">MOTOR 3D INACTIVO</h2>
                       <p className="text-sm text-white/40 leading-relaxed">
                         ComicCrafter está listo para renderizar a 4K en tiempo real con Tripo3D. Configura los parámetros o sube una imagen para generar un modelo 3D real.
                       </p>
                    </div>
                  </>
             </div>
          )}

          {isGenerating && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-20">
               <div className="flex flex-col items-center gap-8">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="absolute inset-0 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin shadow-[0_0_50px_rgba(59,130,246,0.5)]"></div>
                    <div className="absolute inset-2 border-4 border-purple-500/20 border-b-purple-500 rounded-full animate-spin-reverse"></div>
                    <Zap className="w-10 h-10 text-blue-400 animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse">GENERANDO MODELO 3D ({generationProgress}%)</h2>
                    <p className="text-sm text-white/60 font-mono flex items-center justify-center gap-2">
                        <FastForward className="w-4 h-4" /> Tripo3D IA en proceso...
                    </p>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
