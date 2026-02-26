import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Mic2, PlayCircle, BrainCircuit, UserPlus, Save, Loader2, Music, Upload, Volume2, Settings2 } from "lucide-react";
import { Character } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AIProgress from "@/components/ai-progress";

interface ElevenVoice {
  voice_id: string;
  name: string;
  category: string;
  preview_url: string;
}

export default function VoiceStudio() {
  const { toast } = useToast();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [ttsText, setTtsText] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stability, setStability] = useState([0.5]);
  const [similarity, setSimilarity] = useState([0.75]);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  // Fetch characters
  const { data: characters = [], isLoading: loadingChars } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  // Fetch voices
  const { data: voices = [], isLoading: loadingVoices } = useQuery<ElevenVoice[]>({
    queryKey: ["/api/voices"],
  });

  const selectedVoice = voices.find(v => v.voice_id === selectedVoiceId);

  useEffect(() => {
    if (selectedVoice?.preview_url && audioPreviewRef.current) {
      audioPreviewRef.current.src = selectedVoice.preview_url;
      audioPreviewRef.current.play().catch(err => console.log("Audio preview failed:", err));
    }
  }, [selectedVoiceId]);

  // Update character voice mutation
  const updateVoiceMutation = useMutation({
    mutationFn: async ({ charId, voiceId }: { charId: number; voiceId: string }) => {
      const res = await fetch(`/api/characters/${charId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voice: voiceId }),
      });
      if (!res.ok) throw new Error("Failed to update voice");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({ title: "Voz asignada", description: "El personaje ahora tiene una voz de ElevenLabs." });
    },
  });

  const handleGenerateTTS = async () => {
    if (!selectedVoiceId || !ttsText) {
      toast({ title: "Error", description: "Selecciona una voz y escribe un texto.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voiceId: selectedVoiceId,
          text: ttsText,
          stability: stability[0],
          similarity: similarity[0],
        }),
      });

      if (!res.ok) throw new Error("Error generando audio");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      toast({ title: "Audio generado", description: "Puedes escucharlo ahora." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 bg-background text-foreground min-h-screen">
      <header>
        <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3 text-white">
          <Mic2 className="w-8 h-8 text-purple-500" /> Voice & Memory Studio
        </h1>
        <p className="text-slate-400">Manage character voices via ElevenLabs and persistent AI memory.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Character List & Assignment */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-white/90">
            <UserPlus className="w-5 h-5 text-purple-400" /> Personajes y Voces
          </h2>
          {loadingChars ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((char) => (
                <Card key={char.id} className="p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm hover:border-purple-500/50 transition-colors">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{char.name}</h3>
                      <p className="text-sm text-slate-400">{char.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-slate-500 block mb-1 uppercase tracking-wider font-semibold">Voz ElevenLabs</label>
                      <Select 
                        value={char.voice === "No asignada" ? "" : char.voice} 
                        onValueChange={(val) => updateVoiceMutation.mutate({ charId: char.id, voiceId: val })}
                      >
                        <SelectTrigger className="w-full bg-slate-950 border-slate-800 text-slate-200">
                          <SelectValue placeholder="Seleccionar voz" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                          {voices.map((v) => (
                            <SelectItem key={v.voice_id} value={v.voice_id}>
                              {v.name} ({v.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-slate-950/50 rounded-md p-3 border border-slate-800/50">
                       <div className="flex items-center gap-2 mb-1 text-xs font-medium text-slate-400">
                          <BrainCircuit className="w-3 h-3 text-purple-400" /> Memoria/Descripción
                       </div>
                       <p className="text-xs font-mono text-slate-300 line-clamp-3 leading-relaxed">{char.description || "Sin descripción"}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: TTS Preview & Cloning */}
        <div className="space-y-8">
          <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Music className="w-5 h-5 text-purple-500" /> Probar Voz (TTS)
            </h2>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Seleccionar Voz</label>
              <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                <SelectTrigger className="bg-slate-950 border-slate-800 text-slate-200">
                  <SelectValue placeholder="Elegir para prueba" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800 text-slate-200">
                  {voices.map((v) => (
                    <SelectItem key={v.voice_id} value={v.voice_id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedVoice?.preview_url && (
                <div className="flex items-center gap-2 text-xs text-purple-400 mt-1 animate-pulse">
                  <Volume2 className="w-3 h-3" />
                  <span>Escuchando muestra...</span>
                </div>
              )}
              <audio ref={audioPreviewRef} className="hidden" />
            </div>

            <div className="space-y-4 py-2 border-y border-slate-800/50">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Settings2 className="w-4 h-4 text-purple-400" /> Parámetros de Voz
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Estabilidad</span>
                  <span className="text-purple-400 font-mono">{Math.round(stability[0] * 100)}%</span>
                </div>
                <Slider 
                  value={stability} 
                  onValueChange={setStability} 
                  max={1} 
                  step={0.01}
                  className="[&_[role=slider]]:bg-purple-500"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Similitud</span>
                  <span className="text-purple-400 font-mono">{Math.round(similarity[0] * 100)}%</span>
                </div>
                <Slider 
                  value={similarity} 
                  onValueChange={setSimilarity} 
                  max={1} 
                  step={0.01}
                  className="[&_[role=slider]]:bg-purple-500"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Texto a voz</label>
              <Textarea 
                placeholder="Escribe lo que el personaje debería decir..." 
                className="min-h-[100px] bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-600 focus:border-purple-500/50"
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Button 
                className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white" 
                onClick={handleGenerateTTS}
                disabled={isGenerating || !selectedVoiceId || !ttsText}
                data-testid="button-generate-voice"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                Generar y Escuchar
              </Button>

              <AIProgress isActive={isGenerating} type="voice" estimatedSeconds={15} />
            </div>

            {audioUrl && (
              <div className="pt-4 border-t border-slate-800/50">
                <audio controls className="w-full h-10 accent-purple-500" data-testid="audio-preview">
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-slate-900/50 border-slate-800 backdrop-blur-sm space-y-4 opacity-50 grayscale">
            <h2 className="text-xl font-bold flex items-center gap-2 text-white">
              <Upload className="w-5 h-5 text-purple-400" /> Clonación (Próximamente)
            </h2>
            <p className="text-sm text-slate-400">
              Sube muestras de audio (MP3/WAV) para crear una voz personalizada idéntica a tu personaje.
            </p>
            <Button variant="outline" className="w-full gap-2 border-slate-800 text-slate-500" disabled>
              Subir Muestras
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
