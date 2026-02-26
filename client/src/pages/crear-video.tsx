import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Video, Users, Clapperboard, Send, PlayCircle, Loader2, Film, Pause, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import AIProgress from "@/components/ai-progress";

type Message = {
  id: string;
  role: 'system' | 'ai' | 'user';
  content: string;
  options?: string[];
  isGenerating?: boolean;
};

export default function CrearVideo() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [input, setInput] = useState("");
  const [isRendering, setIsRendering] = useState(false);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [scriptContext, setScriptContext] = useState("");

  const { data: myCharacters = [] } = useQuery({
    queryKey: ["/api/characters"],
    queryFn: async () => {
      const res = await fetch("/api/characters");
      if (!res.ok) throw new Error("Failed to load characters");
      return res.json();
    },
  });

  const generateScriptMutation = useMutation({
    mutationFn: async (data: { customPrompt: string; characters?: string[] }) => {
      const res = await apiRequest("POST", "/api/ai/generate-script", {
        customPrompt: data.customPrompt,
        characters: data.characters,
        genre: "Video/Animación",
        language: "Español",
      });
      return res.json();
    },
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'system',
      content: 'Director IA Inicializado. Conectado a Tripo3D + ElevenLabs.'
    },
    {
      id: '2',
      role: 'ai',
      content: '¡Hola! Soy tu Director IA para vídeo. Para empezar a generar el entorno y las animaciones, ¿qué tipo de contenido visual vamos a crear?',
      options: ['Manga / Anime Animado', 'Serie Infantil / Dibujos', 'Contenido Educativo para Escuela', 'Anuncio de TV (Publicidad)', 'Cinemática Realista 3D']
    }
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: text }]);
    setInput("");

    const aiId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: aiId, role: 'ai', content: '', isGenerating: true }]);

    try {
      const selectedNames = myCharacters
        .filter((c: any) => selectedCharacters.includes(c.id.toString()))
        .map((c: any) => c.name);

      const result = await generateScriptMutation.mutateAsync({
        customPrompt: `Eres un director de vídeo IA. El usuario dice: "${text}". Responde como director creativo dando sugerencias sobre la escena, personajes y estilo visual. Si tiene sentido, genera un mini guion de escena. Responde en español, máximo 3 párrafos. Sé conversacional y entusiasta.`,
        characters: selectedNames,
      });

      const scriptContent = result.script || "He procesado tu solicitud. ¿Quieres que ajuste algo?";

      setMessages(prev => prev.map(msg =>
        msg.id === aiId ? { ...msg, content: scriptContent, isGenerating: false } : msg
      ));
    } catch {
      setMessages(prev => prev.map(msg =>
        msg.id === aiId ? {
          ...msg,
          content: "Lo siento, hubo un error al procesar tu solicitud. ¿Podrías intentarlo de nuevo?",
          isGenerating: false
        } : msg
      ));
    }
  };

  const handleRender = () => {
    setIsRendering(true);
    setTimeout(() => {
      setIsRendering(false);
      setVideoUrl("https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4");
    }, 3000);
  };

  const toggleCharacter = (id: string) => {
    setSelectedCharacters(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex h-full bg-[#0B0D17] animate-in fade-in duration-500" data-testid="video-creator-page">
      <div className="flex-1 flex flex-col relative border-r border-white/5">
        <div className="p-6 border-b border-white/5 bg-[#111322]/80 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-3 text-blue-400">
             <Clapperboard className="w-6 h-6" />
             <h2 className="text-xl font-bold tracking-tight text-white">Estudio de Vídeo + Director IA</h2>
           </div>
           <span className="bg-blue-500/10 text-blue-300 text-xs px-3 py-1 rounded-full border border-blue-500/20">
             Modo Asistido Activo
           </span>
        </div>

        {videoUrl && (
          <div className="border-b border-white/5 bg-black p-4">
            <div className="relative rounded-lg overflow-hidden bg-black max-w-2xl mx-auto shadow-2xl">
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video"
                muted={isMuted}
                onEnded={() => setIsPlaying(false)}
                data-testid="video-player"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 flex items-center gap-3">
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10 w-8 h-8"
                  onClick={togglePlay}
                  data-testid="button-play-pause"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10 w-8 h-8"
                  onClick={() => setIsMuted(!isMuted)}
                  data-testid="button-mute"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <div className="flex-1" />
                <span className="text-xs text-white/60 flex items-center gap-1">
                  <Film className="w-3 h-3" /> Preview
                </span>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-white hover:bg-white/10 w-8 h-8"
                  onClick={() => videoRef.current?.requestFullscreen()}
                  data-testid="button-fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#0a0a0a]" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
              {msg.role === 'system' && (
                <div className="w-full text-center py-4">
                  <span className="text-xs font-mono text-blue-500/50 uppercase tracking-widest border border-blue-500/20 bg-blue-500/5 px-4 py-1 rounded-full">
                    {msg.content}
                  </span>
                </div>
              )}

              {msg.role === 'ai' && (
                <div className="flex gap-4 max-w-3xl">
                  <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="space-y-3">
                    {msg.isGenerating ? (
                      <div className="bg-[#15182B] border border-white/5 p-4 rounded-2xl rounded-tl-sm flex items-center gap-2 w-24">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-75" />
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce delay-150" />
                      </div>
                    ) : (
                      <>
                        <div className="bg-[#15182B] border border-white/5 p-5 rounded-2xl rounded-tl-sm shadow-lg text-white/90 leading-relaxed text-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>
                        {msg.options && (
                          <div className="flex flex-wrap gap-2 pt-2">
                            {msg.options.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => handleSend(opt)}
                                className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-full hover:bg-blue-500/20 hover:border-blue-500/40 transition-colors"
                                data-testid={`button-option-${i}`}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {msg.role === 'user' && (
                <div className="flex gap-4 max-w-2xl">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-5 rounded-2xl rounded-tr-sm shadow-lg text-white leading-relaxed text-sm">
                    {msg.content}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0 mt-1">
                    U
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 bg-[#0a0a0a] border-t border-white/5 shrink-0">
          <div className="relative flex items-end gap-4">
            <div className="flex-1 relative">
              <Textarea
                placeholder="Responde al Director IA o describe tu escena libremente..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="min-h-[60px] max-h-48 bg-[#15182B] border-white/10 text-white placeholder:text-white/30 resize-none pr-12 focus-visible:ring-blue-500 text-sm"
                data-testid="input-chat"
              />
            </div>
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || generateScriptMutation.isPending}
              className="h-[60px] w-[60px] rounded-xl bg-blue-600 hover:bg-blue-500 text-white shrink-0"
              data-testid="button-send"
            >
              {generateScriptMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <div className="w-[350px] bg-[#111322]/80 flex flex-col p-6 overflow-y-auto">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 flex items-center gap-2">
           <Video className="w-4 h-4" /> Parámetros de Render
        </h3>

        <div className="space-y-6 flex-1">
           <div className="space-y-3">
              <div className="flex justify-between items-center">
                 <label className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center gap-2">
                   <Users className="w-3 h-3" /> Asignar Actores
                 </label>
              </div>
              <p className="text-[10px] text-white/40">Selecciona quién aparecerá o narrará este vídeo.</p>
              <div className="flex flex-col gap-2">
                {myCharacters.map((char: any) => (
                  <button
                    key={char.id}
                    onClick={() => toggleCharacter(char.id.toString())}
                    className={`text-left px-3 py-2 rounded-md text-xs border transition-colors ${selectedCharacters.includes(char.id.toString()) ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-black/50 border-white/10 text-white/60 hover:text-white hover:bg-white/5'}`}
                    data-testid={`button-character-${char.id}`}
                  >
                    {char.name} {char.role ? `(${char.role})` : ''}
                  </button>
                ))}
                {myCharacters.length === 0 && (
                  <p className="text-xs text-white/30 italic">No hay personajes. Crea uno primero.</p>
                )}
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Duración Estimada</label>
              <select className="w-full bg-black/50 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:ring-blue-500" data-testid="select-duration">
                <option>Corto (TikTok/Reel) - 30s</option>
                <option>Escena Estándar - 2m</option>
                <option>Capítulo Completo - 10m</option>
                <option>Video Educativo - 5m</option>
                <option>Película / Sin Límite - 90m+</option>
              </select>
           </div>

           <div className="space-y-2 pt-4 border-t border-white/5 mt-4">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest">Idioma (Voces/Textos)</label>
              <select className="w-full bg-black/50 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:ring-blue-500" data-testid="select-language">
                <option>Español</option>
                <option>English</option>
                <option>日本語 (Japonés)</option>
                <option>Français</option>
              </select>
           </div>

           <div className="space-y-2 pt-4 mt-4 border-t border-white/5">
              <label className="text-xs font-medium text-white/50 uppercase tracking-widest flex items-center gap-2">
                <Clapperboard className="w-3 h-3" /> Guion Base / Contexto
              </label>
              <p className="text-[10px] text-white/40">La IA utilizará este texto como base para generar las escenas.</p>
              <Textarea
                placeholder="Pega aquí el guion o la historia a seguir..."
                value={scriptContext}
                onChange={(e) => setScriptContext(e.target.value)}
                className="h-24 resize-none bg-black/50 border-white/10 text-white placeholder:text-white/30 text-xs focus-visible:ring-blue-500"
                data-testid="input-script-context"
              />
           </div>
        </div>

        <Button
          className="w-full mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg h-14 font-bold text-sm"
          onClick={handleRender}
          disabled={isRendering || messages.length < 3}
          data-testid="button-render"
        >
          {isRendering ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" /> Procesando Render...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5" /> GENERAR VÍDEO FINAL
            </span>
          )}
        </Button>

        <AIProgress 
          isActive={isRendering} 
          type="video" 
          estimatedSeconds={15}
          className="mt-6"
        />
      </div>
    </div>
  );
}
