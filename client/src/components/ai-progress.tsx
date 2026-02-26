import { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Loader2 } from "lucide-react";

const STEP_MESSAGES: Record<string, string[]> = {
  script: [
    "Analizando el universo narrativo...",
    "Construyendo el arco dramático...",
    "Desarrollando personajes...",
    "Generando diálogos cinematográficos...",
    "Puliendo detalles del guion...",
    "Finalizando el guion...",
  ],
  character: [
    "Diseñando perfil del personaje...",
    "Generando apariencia visual con IA...",
    "Aplicando estilo artístico...",
    "Renderizando retrato en HD...",
    "Guardando en la base de datos...",
  ],
  cover: [
    "Componiendo la escena...",
    "Aplicando iluminación cinematográfica...",
    "Generando arte en alta resolución...",
    "Añadiendo detalles finales...",
    "Exportando portada...",
  ],
  comic: [
    "Diseñando composición de viñetas...",
    "Generando viñeta 1...",
    "Generando viñeta 2...",
    "Generando viñeta 3...",
    "Añadiendo diálogos y efectos...",
    "Compilando la página completa...",
  ],
  image: [
    "Interpretando tu prompt...",
    "Generando imagen con DALL-E 3 HD...",
    "Aplicando postprocesado...",
    "Guardando en galería...",
  ],
  "3d": [
    "Enviando tarea al motor 3D...",
    "Generando geometría base...",
    "Esculpiendo detalles del modelo...",
    "Aplicando texturas y materiales...",
    "Optimizando malla poligonal...",
    "Preparando modelo para descarga...",
  ],
  voice: [
    "Procesando texto de entrada...",
    "Sintetizando voz con ElevenLabs...",
    "Aplicando entonación natural...",
    "Generando audio final...",
  ],
  video: [
    "Analizando guion del vídeo...",
    "Preparando storyboard con IA...",
    "Generando escenas visuales...",
    "Procesando animaciones...",
    "Exportando vídeo final...",
  ],
  gallery: [
    "Generando prompts creativos con GPT-4o...",
    "Creando imagen 1 con DALL-E 3...",
    "Creando imagen 2 con DALL-E 3...",
    "Creando imagen 3 con DALL-E 3...",
    "Guardando galería en la base de datos...",
  ],
  default: [
    "Procesando con IA...",
    "Generando contenido...",
    "Aplicando mejoras...",
    "Finalizando...",
  ],
};

interface AIProgressProps {
  isActive: boolean;
  type?: keyof typeof STEP_MESSAGES | string;
  onComplete?: () => void;
  estimatedSeconds?: number;
  className?: string;
}

export default function AIProgress({ isActive, type = "default", estimatedSeconds = 30, className = "" }: AIProgressProps) {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const messages = STEP_MESSAGES[type] || STEP_MESSAGES.default;

  useEffect(() => {
    if (isActive) {
      setProgress(0);
      setCurrentStep(0);

      const increment = 95 / (estimatedSeconds * 10);
      intervalRef.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return 95;
          const jitter = Math.random() * increment * 0.5;
          return Math.min(prev + increment + jitter, 95);
        });
      }, 100);

      const stepDuration = (estimatedSeconds * 1000) / messages.length;
      stepIntervalRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= messages.length - 1) return messages.length - 1;
          return prev + 1;
        });
      }, stepDuration);
    } else {
      if (progress > 0 && progress < 100) {
        setProgress(100);
        setCurrentStep(messages.length - 1);
        setTimeout(() => {
          setProgress(0);
          setCurrentStep(0);
        }, 1500);
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [isActive]);

  if (!isActive && progress === 0) return null;

  const pct = Math.round(progress);

  return (
    <div className={`space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300 ${className}`} data-testid="ai-progress-bar">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isActive ? (
            <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-green-400" />
          )}
          <span className="text-sm font-medium text-white/80" data-testid="text-progress-step">
            {messages[currentStep]}
          </span>
        </div>
        <span className="text-xs font-mono text-white/50" data-testid="text-progress-percent">{pct}%</span>
      </div>

      <div className="relative">
        <Progress
          value={progress}
          className="h-2.5 bg-white/5 rounded-full overflow-hidden"
        />
        <div
          className="absolute inset-0 h-2.5 rounded-full overflow-hidden"
          style={{ width: `${progress}%` }}
        >
          <div className={`h-full rounded-full transition-all duration-300 ${
            progress >= 100
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-[length:200%] animate-[shimmer_2s_linear_infinite]"
          }`} />
        </div>
      </div>

      {isActive && (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {messages.map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  idx <= currentStep ? "bg-purple-500" : "bg-white/10"
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-white/30">
            Paso {currentStep + 1} de {messages.length}
          </span>
        </div>
      )}
    </div>
  );
}
