import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Sparkles, Save, ChevronRight, PenTool, LayoutTemplate, Image as ImageIcon, CheckCircle2, RefreshCw, Wand2, Users, FileVideo, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/schema";
import AIProgress from "@/components/ai-progress";

type StoryStep = {
  question: string;
  options: string[];
};

export default function StoryWeaver() {
  const [activeTab, setActiveTab] = useState<'guion' | 'portada' | 'comic'>('comic');
  const [mode, setMode] = useState<'wizard' | 'manual'>('wizard');
  const [storyIdea, setStoryIdea] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);
  const { toast } = useToast();

  const [generatedScript, setGeneratedScript] = useState("");
  const [generatedCoverUrl, setGeneratedCoverUrl] = useState("");
  const [generatedPanels, setGeneratedPanels] = useState<{ imageUrl: string; dialogue: string; sfx: string }[]>([]);

  const [wizardChoices, setWizardChoices] = useState<string[]>([]);

  const { data: dbCharacters = [] } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const myCharacters = dbCharacters.map(c => ({ id: c.id.toString(), name: `${c.name} (${c.role})` }));

  const toggleCharacter = (id: string) => {
    if (selectedCharacters.includes(id)) {
      setSelectedCharacters(selectedCharacters.filter(c => c !== id));
    } else {
      setSelectedCharacters([...selectedCharacters, id]);
    }
  };

  const [coverStep, setCoverStep] = useState(0);
  const coverSteps: StoryStep[] = [
    { question: "¿Qué atmósfera o tono visual buscas para la portada?", options: ["Acción Épica / Explosiva", "Misterio / Oscura (Noir)", "Magia y Fantasía", "Ciencia Ficción Cyberpunk", "Romance / Drama Emocional"] },
    { question: "¿Quién o qué será el foco principal en la ilustración?", options: ["El Protagonista Principal (Pose heroica)", "Un combate entre Protagonista y Villano", "Un paisaje o ciudad imponente", "Un objeto mágico/tecnológico clave", "Todo el reparto (Ensemble cast)"] },
    { question: "¿Qué estilo artístico prefieres para la portada?", options: ["Estilo Cómic Americano (Marvel/DC)", "Manga Shonen (Dragon Ball/One Piece)", "Manga Seinen (Oscuro/Maduro)", "Acuarela / Cuento Infantil", "Arte Conceptual 3D Renderizado"] },
    { question: "¿Para qué formato de publicación es esta portada?", options: ["Capítulo Semanal (Manga/Webtoon)", "Tomo Recopilatorio / Volumen", "Novela Gráfica Única", "Póster Promocional"] }
  ];

  const [scriptStep, setScriptStep] = useState(0);
  const scriptSteps: StoryStep[] = [
    { question: "Empecemos a tejer la historia. ¿Qué género principal quieres explorar hoy?", options: ["Cyberpunk / Scifi", "Fantasía Oscura", "Noir / Detectives", "Educativo / Infantil", "Shonen (Lucha y Superación)"] },
    { question: "¿Cuál será el conflicto central?", options: ["Venganza personal", "Salvar al mundo / ciudad", "Descubrir la verdad oculta", "Un viaje de aprendizaje", "Torneo de Artes Marciales / Poderes"] },
    { question: "¿Qué ritmo (pacing) debe tener la narrativa?", options: ["Frenético, pura acción", "Lento, construcción de mundo", "Equilibrado, con pausas reflexivas", "Misterioso, tensión constante"] },
    { question: "¿Qué longitud tendrá esta historia?", options: ["Corto (One-shot / 1 Capítulo)", "Medio (Arco de 5-10 Capítulos)", "Largo (Saga Completa)", "Épico (Libro completo / Sin Límite)"] },
    { question: "Idioma de Generación del Guion:", options: ["Español", "English", "日本語 (Japonés)", "Français"] }
  ];

  const [comicStep, setComicStep] = useState(0);
  const comicSteps: StoryStep[] = [
    { question: "¿Qué estructura visual tendrá la página del cómic?", options: ["Clásica (6-9 viñetas simétricas)", "Dinámica Manga (Viñetas diagonales, acción)", "Splash Page (1 gran ilustración principal)", "Webtoon (Lectura vertical continua)"] },
    { question: "¿Qué nivel de diálogo o narración habrá?", options: ["Mucha acción, sin diálogos", "Equilibrio entre diálogo y arte", "Narración en off (Cajas de texto)", "Diálogos intensos tipo novela gráfica"] },
    { question: "Estilo e Inspiración Visual:", options: ["Shonen Clásico (Dragon Ball, Naruto, One Piece)", "Seinen Oscuro (Berserk, Tokyo Ghoul)", "Cómic Americano Moderno (Marvel/DC)", "Blanco y Negro Entintado Clásico", "Color Completo Vibrante"] },
    { question: "¿Cuántas páginas tendrá tu proyecto?", options: ["1 Página (Ilustración Suelta)", "5-10 Páginas (Escena/Corto)", "20-30 Páginas (Capítulo Estándar)", "100+ Páginas (Libro completo / Sin límite)"] },
    { question: "Idioma de Generación (Textos/Bocadillos):", options: ["Español", "English", "日本語 (Japonés)", "Français"] }
  ];

  const handleAutoGenerateScript = async () => {
    setIsGenerating(true);
    try {
      const charNames = selectedCharacters.map(id => {
        const c = myCharacters.find(ch => ch.id === id);
        return c?.name || "";
      }).filter(Boolean);

      const res = await apiRequest("POST", "/api/ai/generate-script", {
        genre: wizardChoices[0] || "Cyberpunk / Scifi",
        conflict: wizardChoices[1] || "Salvar al mundo",
        pacing: wizardChoices[2] || "Equilibrado",
        length: wizardChoices[3] || "Corto",
        language: wizardChoices[4] || "Español",
        characters: charNames,
      });
      const data = await res.json();
      setStoryIdea(data.script);
      toast({ title: "Guion generado", description: "La IA ha creado la narrativa. Puedes editarla antes de generar." });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      if (activeTab === 'guion') {
        const res = await apiRequest("POST", "/api/ai/generate-script", {
          customPrompt: storyIdea || "Genera un guion cyberpunk épico",
          characters: selectedCharacters.map(id => myCharacters.find(ch => ch.id === id)?.name || "").filter(Boolean),
        });
        const data = await res.json();
        setGeneratedScript(data.script);
        setOutput('script_generated');
      } else if (activeTab === 'portada') {
        const res = await apiRequest("POST", "/api/ai/generate-cover", {
          atmosphere: wizardChoices[0] || "",
          focus: wizardChoices[1] || "",
          style: wizardChoices[2] || "",
          format: wizardChoices[3] || "",
          customPrompt: mode === 'manual' ? storyIdea : undefined,
        });
        const data = await res.json();
        setGeneratedCoverUrl(data.imageUrl);
        setOutput('cover_generated');
      } else {
        const style = wizardChoices[2] || "manga shonen";
        const res = await apiRequest("POST", "/api/ai/generate-comic-page", {
          script: storyIdea || undefined,
          style,
          panelCount: 5,
          language: wizardChoices[4] || "Español",
          customPrompt: mode === 'manual' ? storyIdea : undefined,
        });
        const data = await res.json();
        setGeneratedPanels(
          (data.panels || []).map((p: any, i: number) => ({
            imageUrl: data.panelImages?.[i] || "",
            dialogue: p.dialogue || "",
            sfx: p.sfx || "",
          }))
        );
        setOutput('comic_generated');
      }
      toast({ title: "Generación completa", description: `Tu ${activeTab === 'portada' ? 'portada' : activeTab === 'guion' ? 'guion' : 'página de cómic'} ha sido generada por IA.` });
    } catch (e: any) {
      toast({ title: "Error en la generación", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const activeWizard = activeTab === 'portada' ? coverSteps : (activeTab === 'guion' ? scriptSteps : comicSteps);
  const activeStep = activeTab === 'portada' ? coverStep : (activeTab === 'guion' ? scriptStep : comicStep);
  const setActiveStep = activeTab === 'portada' ? setCoverStep : (activeTab === 'guion' ? setScriptStep : setComicStep);
  const isWizardComplete = activeStep >= activeWizard.length;

  const handleWizardChoice = (option: string, stepIndex: number) => {
    const newChoices = [...wizardChoices];
    newChoices[stepIndex] = option;
    setWizardChoices(newChoices);
    setActiveStep(stepIndex + 1);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] animate-in fade-in duration-500 bg-[#0B0D17]">
      <div className="w-[450px] border-r border-white/5 bg-[#111322]/90 flex flex-col p-6 overflow-y-auto backdrop-blur-xl z-10 relative">
        <div className="mb-6 flex items-center gap-2 text-purple-400">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-xl font-bold tracking-tight">Narrative Engine</h2>
        </div>

        <div className="flex bg-black/60 p-1.5 rounded-xl border border-white/10 mb-8 shrink-0 relative shadow-inner">
          <button 
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 z-10 ${activeTab === 'comic' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
            onClick={() => { setActiveTab('comic'); setOutput(null); setComicStep(0); setWizardChoices([]); }}
            data-testid="tab-comic"
          >
            <BookOpen className="w-4 h-4" /> Páginas de Cómic
          </button>
          <button 
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 z-10 ${activeTab === 'portada' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
            onClick={() => { setActiveTab('portada'); setOutput(null); setCoverStep(0); setWizardChoices([]); }}
            data-testid="tab-cover"
          >
            <ImageIcon className="w-4 h-4" /> Portadas IA
          </button>
          <button 
            className={`flex-1 py-3 text-xs font-bold rounded-lg transition-all flex flex-col items-center justify-center gap-1 z-10 ${activeTab === 'guion' ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/80'}`}
            onClick={() => { setActiveTab('guion'); setOutput(null); setScriptStep(0); setWizardChoices([]); }}
            data-testid="tab-script"
          >
            <PenTool className="w-4 h-4" /> Guiones IA
          </button>
          <div className={`absolute top-1.5 bottom-1.5 w-[calc(33.33%-0.375rem)] bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg transition-all duration-300 ease-out ${activeTab === 'comic' ? 'left-1.5' : activeTab === 'portada' ? 'left-[calc(33.33%+0.1875rem)]' : 'left-[calc(66.66%)]'}`} />
        </div>

        <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 mb-6 shrink-0">
          <button 
            className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${mode === 'wizard' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            onClick={() => setMode('wizard')}
            data-testid="mode-wizard"
          >
            Director IA (Cuestionario)
          </button>
          <button 
            className={`flex-1 py-2 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all ${mode === 'manual' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'}`}
            onClick={() => setMode('manual')}
            data-testid="mode-manual-story"
          >
            Modo Manual
          </button>
        </div>

        {mode === 'wizard' ? (
          <div className="flex-1 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-xl p-5 space-y-4 shadow-lg">
               {!isWizardComplete ? (
                 <>
                   <div className="flex items-start gap-3">
                     <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                       <Sparkles className="w-4 h-4 text-purple-400" />
                     </div>
                     <div>
                        <h3 className="text-sm font-medium text-purple-300 mb-1">Paso {activeStep + 1} de {activeWizard.length}</h3>
                        <p className="text-sm text-white/90 leading-relaxed font-medium">{activeWizard[activeStep].question}</p>
                     </div>
                   </div>
                   
                   <div className="space-y-2 mt-4 pl-11">
                     {activeWizard[activeStep].options.map((opt, i) => (
                       <button 
                         key={i}
                         onClick={() => handleWizardChoice(opt, activeStep)}
                         className="w-full text-left p-3 rounded-lg bg-black/40 border border-white/5 hover:bg-purple-500/20 hover:border-purple-500/40 text-sm text-white/70 hover:text-white transition-all flex items-center justify-between group"
                         data-testid={`wizard-option-${activeStep}-${i}`}
                       >
                         {opt}
                         <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-purple-400 group-hover:translate-x-1 transition-transform" />
                       </button>
                     ))}
                   </div>
                   <div className="w-full bg-black/50 h-1.5 rounded-full mt-6 overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-full transition-all duration-500" style={{ width: `${(activeStep / activeWizard.length) * 100}%` }} />
                   </div>
                 </>
               ) : (
                 <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Parámetros Completados</h3>
                    <p className="text-sm text-white/60">La IA está lista para procesar tu {activeTab}.</p>
                    
                    <div className="text-left mt-6 bg-black/40 p-4 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                          <PenTool className="w-3 h-3" /> Guion / Contexto Narrativo
                        </label>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleAutoGenerateScript}
                          disabled={isGenerating}
                          className="h-7 text-[10px] bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30 hover:text-white"
                          data-testid="button-auto-script"
                        >
                          {isGenerating ? <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> : <Sparkles className="w-3 h-3 mr-1" />} Auto-Generar Historia
                        </Button>
                      </div>
                      <Textarea 
                        placeholder="Pega aquí tu guion, la idea base, o presiona 'Auto-Generar Historia' para que la IA la invente basándose en tus personajes..."
                        className="h-24 resize-none bg-black/50 border-white/10 text-white placeholder:text-white/20 text-sm focus-visible:ring-purple-500"
                        value={storyIdea}
                        onChange={(e) => setStoryIdea(e.target.value)}
                        data-testid="input-story-idea"
                      />
                    </div>

                    <Button variant="outline" size="sm" onClick={() => { setActiveStep(0); setWizardChoices([]); }} className="text-xs bg-transparent border-white/10 text-white/60 hover:text-white mt-2">Reiniciar Mago</Button>
                 </div>
               )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Users className="w-3 h-3" /> Añadir Reparto de Personajes
              </label>
              <div className="flex flex-wrap gap-2">
                {myCharacters.length === 0 && <p className="text-xs text-white/30">Crea personajes primero en "Crear Personaje"</p>}
                {myCharacters.map(char => (
                  <button 
                    key={char.id}
                    onClick={() => toggleCharacter(char.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${selectedCharacters.includes(char.id) ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-black/50 border-white/10 text-white/60 hover:text-white'}`}
                    data-testid={`char-toggle-${char.id}`}
                  >
                    {char.name}
                  </button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-14 font-bold tracking-wide shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02] border-0 uppercase" 
              onClick={handleGenerate}
              disabled={isGenerating || !isWizardComplete}
              data-testid="button-generate"
            >
              {isGenerating ? (
                <span className="flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> Generando...</span>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  GENERAR {activeTab === 'portada' ? 'PORTADA 4K' : activeTab === 'guion' ? 'SCRIPT IA' : 'PÁGINA DE CÓMIC'}
                </>
              )}
            </Button>
            <AIProgress
              isActive={isGenerating}
              type={activeTab === 'portada' ? 'cover' : activeTab === 'guion' ? 'script' : 'comic'}
              estimatedSeconds={activeTab === 'guion' ? 15 : activeTab === 'portada' ? 25 : 60}
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-6 animate-in fade-in">
            <div>
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Users className="w-3 h-3" /> Añadir Reparto de Personajes
              </label>
              <div className="flex flex-wrap gap-2">
                {myCharacters.length === 0 && <p className="text-xs text-white/30">Crea personajes primero</p>}
                {myCharacters.map(char => (
                  <button 
                    key={char.id}
                    onClick={() => toggleCharacter(char.id)}
                    className={`shrink-0 px-3 py-1.5 rounded-full text-xs border transition-colors ${selectedCharacters.includes(char.id) ? 'bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-black/50 border-white/10 text-white/60 hover:text-white'}`}
                  >
                    {char.name}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3 flex items-center gap-2">
                {activeTab === 'portada' || activeTab === 'comic' ? <ImageIcon className="w-3 h-3" /> : <PenTool className="w-3 h-3" />} 
                {activeTab === 'portada' || activeTab === 'comic' ? 'Prompt de Imagen (IA)' : 'Idea de Historia (IA)'}
              </label>
              <Textarea 
                placeholder={activeTab === 'portada' 
                  ? "Describe la imagen: 'Jax de pie en un edificio ciberpunk lloviendo...'"
                  : activeTab === 'comic' ? "Describe las viñetas: 'Viñeta 1: Jax mira a lo lejos. Viñeta 2: Zoom a sus ojos. Viñeta 3: Salta del edificio...'"
                  : "Escribe la base de tu historia: 'Quiero un cómic de 5 páginas donde Elara hackea un servidor...'"}
                className="h-40 resize-none bg-black/50 border-white/10 text-white placeholder:text-white/20 text-sm focus-visible:ring-purple-500"
                value={storyIdea}
                onChange={(e) => setStoryIdea(e.target.value)}
                data-testid="input-manual-prompt"
              />
            </div>

            <Button 
              className="w-full mt-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 h-14 font-bold tracking-wide shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.02] border-0 uppercase" 
              onClick={handleGenerate}
              disabled={isGenerating || !storyIdea}
              data-testid="button-generate-manual"
            >
              {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Wand2 className="w-5 h-5 mr-2 text-yellow-300" />}
              {isGenerating ? "Procesando..." : "GENERAR DESDE TEXTO"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 bg-black relative overflow-hidden flex flex-col">
        <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0a0c14] z-10">
           <h3 className="font-bold text-white flex items-center gap-2">
             <LayoutTemplate className="w-4 h-4 text-purple-400" /> Output Studio
           </h3>
           {output && (
             <div className="flex gap-3">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20" data-testid="button-save-output">
                  <Save className="w-4 h-4 mr-2" /> Guardado Automáticamente
                </Button>
             </div>
           )}
        </div>

        <div className="flex-1 overflow-y-auto p-8 relative">
          {!output && !isGenerating && (
             <div className="absolute inset-0 flex items-center justify-center flex-col text-white/30">
               <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center mb-6 bg-white/5 backdrop-blur-sm shadow-[0_0_30px_rgba(255,255,255,0.02)]">
                  {activeTab === 'portada' || activeTab === 'comic' ? <ImageIcon className="w-10 h-10 opacity-50" /> : <PenTool className="w-10 h-10 opacity-50" />}
               </div>
               <p className="font-bold text-xl tracking-widest mb-2 text-white/50 uppercase" data-testid="text-canvas-empty">El lienzo está en blanco</p>
               <p className="text-sm font-medium">Completa la configuración en el panel izquierdo para generar {activeTab === 'portada' ? 'tu Portada' : activeTab === 'guion' ? 'tu Guion' : 'tu Página de Cómic'}.</p>
             </div>
          )}

          {isGenerating && (
             <div className="absolute inset-0 flex items-center justify-center flex-col text-purple-400">
               <div className="relative w-24 h-24 flex items-center justify-center mb-6">
                 <div className="absolute inset-0 border-2 border-purple-500/20 border-t-purple-500 rounded-full animate-spin shadow-[0_0_30px_rgba(168,85,247,0.3)]"></div>
                 {activeTab === 'portada' || activeTab === 'comic' ? <ImageIcon className="w-8 h-8 animate-pulse" /> : <PenTool className="w-8 h-8 animate-pulse" />}
               </div>
               <p className="font-mono text-sm font-bold tracking-widest animate-pulse uppercase" data-testid="text-generating">
                 SINTETIZANDO {activeTab === 'portada' || activeTab === 'comic' ? 'ARTE CON IA' : 'NARRATIVA IA'}...
               </p>
               <p className="text-xs text-purple-300/60 mt-3">Esto puede tardar entre 30 segundos y 2 minutos</p>
             </div>
          )}

          {output === 'cover_generated' && activeTab === 'portada' && generatedCoverUrl && (
            <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-500 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl blur opacity-30 animate-pulse"></div>
              <Card className="bg-[#111322] border-white/10 overflow-hidden shadow-2xl p-2 relative">
                 <img src={generatedCoverUrl} alt="Generated Cover" className="w-full h-auto rounded-lg" data-testid="img-generated-cover" />
              </Card>
            </div>
          )}

          {output === 'comic_generated' && activeTab === 'comic' && generatedPanels.length > 0 && (
            <div className="max-w-4xl mx-auto animate-in zoom-in-95 duration-700 relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 animate-pulse"></div>
              
              <div className="bg-white p-2 md:p-6 rounded-lg relative z-10 shadow-2xl">
                <div className="flex justify-between items-center mb-4 text-black border-b-2 border-black pb-2">
                   <h4 className="font-black text-xl tracking-tighter uppercase">Página Generada por IA</h4>
                   <span className="font-bold text-sm tracking-widest">COMICCRAFTER AI</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 auto-rows-[150px] md:auto-rows-[220px] bg-white">
                  {generatedPanels.map((panel, i) => {
                    const spanClass = i === 0 ? "col-span-3 row-span-1" : 
                                     i === 1 ? "col-span-1 row-span-2" :
                                     i === generatedPanels.length - 1 ? "col-span-3 row-span-1" : "col-span-2 row-span-1";
                    return (
                      <div key={i} className={`${spanClass} border-[3px] border-black relative overflow-hidden group`}>
                        {panel.imageUrl ? (
                          <img src={panel.imageUrl} alt={`Panel ${i + 1}`} className="absolute inset-0 w-full h-full object-cover grayscale contrast-[1.2] group-hover:scale-105 transition-transform duration-[2s]" />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center">
                            <span className="text-gray-600 font-bold">Panel {i + 1}</span>
                          </div>
                        )}
                        
                        <div className="absolute inset-0 opacity-20 mix-blend-overlay pointer-events-none bg-[radial-gradient(circle,black_1px,transparent_1px)]" style={{ backgroundSize: '4px 4px' }}></div>
                        
                        {panel.dialogue && (
                          <div className="absolute top-4 left-4 bg-white border-2 border-black rounded-[2rem] rounded-bl-none px-4 py-3 text-black font-bold text-sm max-w-[250px] leading-snug z-10 shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                            {panel.dialogue}
                          </div>
                        )}
                        
                        {panel.sfx && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <span className="text-white text-4xl md:text-6xl font-black italic drop-shadow-[0_0_15px_rgba(255,255,255,1)] transform -rotate-12" style={{ WebkitTextStroke: '2px black' }}>{panel.sfx}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {output === 'script_generated' && activeTab === 'guion' && generatedScript && (
             <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-4 duration-500">
               <Card className="bg-[#111322] border-white/10 p-8 shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                   <Sparkles className="w-32 h-32 text-purple-500" />
                 </div>
                 
                 <div className="prose prose-invert prose-purple max-w-none relative z-10">
                   <h1 className="text-3xl font-black mb-2 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-200" data-testid="text-script-title">Guion Generado por IA</h1>
                   <p className="text-purple-400 font-mono text-sm mb-8 uppercase tracking-widest border-b border-white/10 pb-4">ComicCrafter AI - Narrative Engine</p>

                   <div className="space-y-4 text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed" data-testid="text-script-content">
                     {generatedScript}
                   </div>
                 </div>
               </Card>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
