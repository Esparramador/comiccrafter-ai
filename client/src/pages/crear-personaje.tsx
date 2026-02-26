import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Upload, Camera, Mic2, Sparkles, Wand2, RefreshCw, Save, Image as ImageIcon, PenTool } from "lucide-react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function CrearPersonaje() {
  const [, setLocation] = useLocation();
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [description, setDescription] = useState("");
  const [voice, setVoice] = useState("");
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  const [aiPrompt, setAiPrompt] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setUploadedPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSave = async () => {
    setIsGenerating(true);
    try {
      if (mode === 'ai') {
        const res = await apiRequest("POST", "/api/ai/generate-character", {
          prompt: aiPrompt || "Genera un personaje aleatorio para un cómic cyberpunk"
        });
        const character = await res.json();
        toast({ title: "Personaje creado", description: `${character.name} ha sido generado por IA y guardado.` });
      } else {
        const res = await apiRequest("POST", "/api/characters", {
          name: name || "Nuevo Personaje",
          role: role || "Secundario",
          description: description || "Sin descripción",
          voice: voice || "No asignada",
          has3D: false,
          photoUrls: uploadedPhotos.length > 0 ? uploadedPhotos : [],
        });
        const character = await res.json();
        toast({ title: "Personaje guardado", description: `${character.name} se ha añadido al repositorio.` });
      }
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      setLocation("/personajes");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-[#0B0D17] animate-in fade-in duration-500">
      
      <div className="w-[300px] border-r border-white/5 bg-[#111322]/80 p-6 flex flex-col gap-4 relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">Character Lab</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Creación de Actores</p>
          </div>
        </div>

        <button 
          className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden ${mode === 'ai' ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
          onClick={() => setMode('ai')}
          data-testid="mode-ai"
        >
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className={`w-5 h-5 ${mode === 'ai' ? 'text-purple-400' : 'text-slate-500'}`} />
            <h3 className={`font-bold ${mode === 'ai' ? 'text-purple-300' : 'text-slate-300'}`}>Generación IA</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">Inventa un personaje desde cero usando solo texto e imaginación.</p>
        </button>

        <button 
          className={`w-full text-left p-4 rounded-xl border transition-all ${mode === 'manual' ? 'bg-blue-500/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]' : 'bg-black/40 border-white/5 hover:border-white/20'}`}
          onClick={() => setMode('manual')}
          data-testid="mode-manual"
        >
          <div className="flex items-center gap-3 mb-2">
            <Plus className={`w-5 h-5 ${mode === 'manual' ? 'text-blue-400' : 'text-slate-500'}`} />
            <h3 className={`font-bold ${mode === 'manual' ? 'text-blue-300' : 'text-slate-300'}`}>Ficha Manual</h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">Sube tus propias fotos para entrenar la cara del personaje en el cómic.</p>
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-[#0a0a0a] relative overflow-y-auto">
        <div className="max-w-4xl mx-auto w-full p-12">
          
          {mode === 'ai' ? (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Wand2 className="w-8 h-8 text-purple-500" />
                  Auto-Generador de Personajes
                </h1>
                <p className="text-slate-400">Describe el personaje y la IA se encargará de crear su aspecto, lore y variantes faciales.</p>
              </div>

              <div className="bg-[#111322] border border-white/5 p-8 rounded-2xl shadow-xl space-y-6">
                <div>
                  <label className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <PenTool className="w-4 h-4" /> Descripción / Prompt
                  </label>
                  <Textarea 
                    placeholder="Ej: Un mercenario cibernético con un brazo robótico negro, aspecto sombrío, pelo blanco despeinado, lleva una gabardina de cuero... (Déjalo en blanco para que la IA lo invente 100%)"
                    className="h-32 resize-none bg-black/50 border-white/10 text-white placeholder:text-white/20 text-sm focus-visible:ring-purple-500"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    data-testid="input-ai-prompt"
                  />
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex gap-4">
                  <Sparkles className="w-6 h-6 text-purple-400 shrink-0" />
                  <p className="text-sm text-purple-200/80 leading-relaxed">
                    Al generar, la IA creará automáticamente su <strong>Hoja de Personaje</strong> (Character Sheet) con su nombre, rol, lore y una imagen de retrato generada por IA.
                  </p>
                </div>

                <Button 
                  className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold tracking-widest shadow-[0_0_30px_rgba(147,51,234,0.3)] transition-all hover:scale-[1.01]"
                  onClick={handleSave}
                  disabled={isGenerating}
                  data-testid="button-generate-character"
                >
                  {isGenerating ? (
                    <span className="flex items-center gap-2"><RefreshCw className="w-5 h-5 animate-spin" /> GENERANDO CON IA...</span>
                  ) : (
                    <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> INVENTAR PERSONAJE Y GUARDAR</span>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Plus className="w-8 h-8 text-blue-500" />
                  Creación Manual (Clonación de Rostro)
                </h1>
                <p className="text-slate-400">Rellena la ficha y sube fotos tuyas o de actores reales para que la IA los dibuje en el cómic.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[#111322] border border-white/5 p-6 rounded-2xl shadow-xl space-y-5">
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Nombre del Personaje</label>
                      <Input 
                        value={name} onChange={(e) => setName(e.target.value)}
                        className="bg-black/50 border-white/10 focus-visible:ring-blue-500 h-12"
                        placeholder="Ej: Jax, Sarah..."
                        data-testid="input-char-name"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Rol / Arquetipo</label>
                      <Input 
                        value={role} onChange={(e) => setRole(e.target.value)}
                        className="bg-black/50 border-white/10 focus-visible:ring-blue-500 h-12"
                        placeholder="Ej: Villano Principal, Mentor..."
                        data-testid="input-char-role"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Descripción Física y Lore</label>
                      <Textarea 
                        value={description} onChange={(e) => setDescription(e.target.value)}
                        className="bg-black/50 border-white/10 focus-visible:ring-blue-500 min-h-[120px] resize-none"
                        placeholder="Historia de fondo y detalles de su vestimenta recurrente..."
                        data-testid="input-char-desc"
                      />
                   </div>
                   <div>
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Voz Asignada (ElevenLabs)</label>
                      <select 
                        className="w-full h-12 bg-black/50 border border-white/10 text-white rounded-md px-3 py-2 text-sm focus:ring-blue-500"
                        value={voice} onChange={(e) => setVoice(e.target.value)}
                        data-testid="select-voice"
                      >
                        <option value="">-- Seleccionar Voz --</option>
                        <option value="Marcus">Marcus (Grave, Rasposa)</option>
                        <option value="Sarah">Sarah (Joven, Enérgica)</option>
                        <option value="Liam">Liam (Intenso, Dramático)</option>
                      </select>
                   </div>
                </div>

                <div className="bg-[#111322] border border-white/5 p-6 rounded-2xl shadow-xl flex flex-col">
                   <label className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <Camera className="w-4 h-4" /> Fotos de Referencia
                   </label>
                   
                   <div className="flex-1 border-2 border-dashed border-white/10 rounded-xl p-4 bg-black/30 flex flex-col relative overflow-hidden">
                     {uploadedPhotos.length === 0 ? (
                       <label className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-6 text-center cursor-pointer hover:bg-white/5 transition-colors">
                         <Upload className="w-10 h-10 mb-4 opacity-50" />
                         <p className="font-bold text-white/70 mb-2">Sube entre 3 y 5 fotos de la misma persona</p>
                         <p className="text-xs">Para resultados perfectos, asegúrate de que el rostro se vea claramente desde distintos ángulos.</p>
                         <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                       </label>
                     ) : (
                       <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                         {uploadedPhotos.map((photo, i) => (
                           <div key={i} className="aspect-square rounded-lg overflow-hidden border border-white/20">
                             <img src={photo} alt="Ref" className="w-full h-full object-cover" />
                           </div>
                         ))}
                       </div>
                     )}
                   </div>
                   
                   <label className="mt-4">
                     <Button variant="outline" className="w-full bg-transparent border-blue-500/30 text-blue-400 hover:bg-blue-500/10" asChild>
                       <span className="cursor-pointer">
                         <Upload className="w-4 h-4 mr-2" /> Añadir Foto
                         <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                       </span>
                     </Button>
                   </label>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <Button 
                  className="w-full md:w-auto md:px-12 md:float-right h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.3)]"
                  onClick={handleSave}
                  disabled={isGenerating || (!name && !role)}
                  data-testid="button-save-character"
                >
                  {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                  GUARDAR FICHA TÉCNICA
                </Button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
