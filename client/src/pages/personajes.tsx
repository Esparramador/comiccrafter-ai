import { useState } from "react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Image as ImageIcon, Upload, Mic, Plus, Users, Settings2, Trash2, Box, X, RefreshCw } from "lucide-react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Character } from "@shared/schema";

function MiniMannequin() {
  const group = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.position.y = Math.sin(t * 2) * 0.05;
  });

  return (
    <group ref={group}>
      <mesh position={[0, 1.8, 0]}>
        <boxGeometry args={[0.5, 0.6, 0.5]} />
        <meshStandardMaterial color="#8b5cf6" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.8, 1, 0.4]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.5} />
      </mesh>
      <mesh position={[-0.6, 1, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
      <mesh position={[0.6, 1, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color="#6366f1" />
      </mesh>
    </group>
  );
}

export default function Personajes() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const { toast } = useToast();
  
  const [charName, setCharName] = useState("");
  const [charRole, setCharRole] = useState("Protagonista");
  const [charDesc, setCharDesc] = useState("");
  const [charVoice, setCharVoice] = useState("No asignada");
  const [charPhotos, setCharPhotos] = useState<string[]>([]);

  const { data: characters = [], isLoading } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/characters", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      setIsFormOpen(false);
      toast({ title: "Personaje creado" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const res = await apiRequest("PUT", `/api/characters/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      setIsFormOpen(false);
      toast({ title: "Personaje actualizado" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/characters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({ title: "Personaje eliminado" });
    },
  });

  const [viewMode, setViewMode] = useState<'photo' | '3d'>('photo');

  const openCreateForm = () => {
    setEditingId(null);
    setCharName("");
    setCharRole("Nuevo Personaje");
    setCharDesc("");
    setCharVoice("No asignada");
    setCharPhotos([]);
    setIsFormOpen(true);
  };

  const openEditForm = (char: Character) => {
    setEditingId(char.id);
    setCharName(char.name);
    setCharRole(char.role);
    setCharDesc(char.description);
    setCharVoice(char.voice);
    setCharPhotos(char.photoUrls || []);
    setIsFormOpen(true);
  };

  const handleSave = () => {
    if (!charName) return;
    
    const payload = {
      name: charName,
      role: charRole,
      description: charDesc,
      voice: charVoice,
      has3D: false,
      photoUrls: charPhotos,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Estás seguro de querer eliminar este personaje?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setCharPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setCharPhotos(charPhotos.filter((_, i) => i !== index));
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white flex items-center gap-3" data-testid="text-page-title">
            <Users className="w-8 h-8 text-blue-500" /> Repositorio de Personajes
          </h1>
          <p className="text-white/50">Crea, edita y guarda tu reparto. Alterna entre visualización de fotos 2D o modelos 3D interactivos.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-black/50 p-1 rounded-lg border border-white/10 flex">
             <button 
               className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === 'photo' ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white'}`}
               onClick={() => setViewMode('photo')}
               data-testid="button-view-photo"
             >
               <ImageIcon className="w-3 h-3" /> Foto 2D
             </button>
             <button 
               className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${viewMode === '3d' ? 'bg-blue-600 text-white' : 'text-white/50 hover:text-white'}`}
               onClick={() => setViewMode('3d')}
               data-testid="button-view-3d"
             >
               <Box className="w-3 h-3" /> Modelo 3D
             </button>
          </div>
          <Link href="/crear-personaje">
            <Button 
              className="bg-blue-600 hover:bg-blue-500 text-white gap-2 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
              data-testid="button-create-new"
            >
               <Plus className="w-4 h-4" /> Crear Nuevo
            </Button>
          </Link>
        </div>
      </header>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : isFormOpen ? (
        <Card className="bg-[#111322] border-white/10 p-8 rounded-xl max-w-4xl mx-auto w-full animate-in slide-in-from-bottom-4 shadow-2xl overflow-y-auto max-h-[80vh] scrollbar-none">
           <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                 <Settings2 className="w-5 h-5 text-blue-400" />
               </div>
               <div>
                 <h2 className="text-xl font-bold text-white">{editingId ? "Editar Personaje" : "Forjar Personaje"}</h2>
                 <p className="text-xs text-white/50">Añade múltiples fotos para un entrenamiento de IA (LoRA) perfecto.</p>
               </div>
             </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <label className="text-xs font-medium text-white/70 uppercase tracking-wider flex justify-between items-center">
                    <span>Fotos de Referencia ({charPhotos.length})</span>
                    <span className="text-[10px] text-blue-400">Recomendado: 3-5 fotos</span>
                 </label>
                 
                 <div className="grid grid-cols-2 gap-3">
                    {charPhotos.map((photo, i) => (
                      <div key={i} className="aspect-square relative rounded-lg overflow-hidden border border-white/10 group shadow-lg">
                        <img src={photo} alt={`Ref ${i}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removePhoto(i)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500/80 hover:bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    <label className="aspect-square rounded-lg border-2 border-dashed border-white/20 bg-black/30 flex flex-col items-center justify-center text-white/40 hover:text-white/70 hover:border-white/40 hover:bg-white/5 transition-all cursor-pointer">
                       <Upload className="w-6 h-6 mb-2" />
                       <span className="text-[10px] text-center px-2 font-medium">Añadir foto</span>
                       <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                 </div>
              </div>

              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Nombre del Personaje</label>
                    <Input 
                      value={charName}
                      onChange={(e) => setCharName(e.target.value)}
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-500 h-12" 
                      placeholder="Ej. Kael Thorne"
                      data-testid="input-edit-name"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Rol Principal</label>
                    <Input 
                      value={charRole}
                      onChange={(e) => setCharRole(e.target.value)}
                      className="bg-black/50 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-500 h-12"
                      data-testid="input-edit-role"
                    />
                 </div>
                 
                 <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Personalidad & Lore</label>
                    <Textarea 
                      value={charDesc}
                      onChange={(e) => setCharDesc(e.target.value)}
                      className="h-28 resize-none bg-black/50 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-blue-500 text-sm" 
                      placeholder="Describe su personalidad, miedos, motivaciones..."
                      data-testid="input-edit-desc"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-xs font-bold text-white/70 uppercase tracking-wider flex justify-between">
                       <span>Voz Asignada</span>
                       <span className="text-[10px] text-emerald-400">ElevenLabs Sync</span>
                    </label>
                    <select 
                       className="w-full bg-black/50 border border-white/10 text-white rounded-md px-3 py-3 text-sm focus:ring-blue-500"
                       value={charVoice}
                       onChange={(e) => setCharVoice(e.target.value)}
                       data-testid="select-edit-voice"
                    >
                       <option value="No asignada">Sin voz...</option>
                       <option value="eleven_jax_01">eleven_jax_01 (Grave)</option>
                       <option value="eleven_el_04">eleven_el_04 (Suave)</option>
                       <option value="mi_voz_clonada">Mi Voz (Clonada)</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="mt-8 flex gap-3 justify-end border-t border-white/5 pt-6">
              <Button variant="ghost" onClick={() => setIsFormOpen(false)} className="text-white/70 hover:text-white" data-testid="button-cancel">Cancelar</Button>
              <Button 
                onClick={handleSave} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-10 font-bold"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save"
              >
                {(createMutation.isPending || updateMutation.isPending) && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
                Guardar Personaje
              </Button>
           </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {characters.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-white/40">
              <Users className="w-16 h-16 mb-4 opacity-30" />
              <p className="text-lg font-bold mb-2">No hay personajes todavía</p>
              <p className="text-sm mb-6">Crea tu primer personaje con IA o manualmente</p>
              <Link href="/crear-personaje">
                <Button className="bg-purple-600 hover:bg-purple-500" data-testid="button-create-first">
                  <Sparkles className="w-4 h-4 mr-2" /> Crear Primer Personaje
                </Button>
              </Link>
            </div>
          )}
          {characters.map(char => (
            <Card key={char.id} className="bg-[#111322] border-white/5 overflow-hidden hover:border-blue-500/30 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all group" data-testid={`card-character-${char.id}`}>
              <div className="aspect-square bg-gradient-to-b from-[#111322] to-black flex items-center justify-center relative overflow-hidden">
                 
                 {viewMode === 'photo' ? (
                   char.photoUrls && char.photoUrls.length > 0 ? (
                     <img src={char.photoUrls[0]} alt={char.name} className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                   ) : (
                     <div className="text-center text-white/30 z-0 flex flex-col items-center">
                       <ImageIcon className="w-8 h-8 mb-2 opacity-50 text-purple-400" />
                       <p className="text-[10px] uppercase tracking-widest font-bold">Sin imagen</p>
                     </div>
                   )
                 ) : (
                   <>
                     {char.has3D ? (
                        <div className="absolute inset-0 w-full h-full cursor-move z-0">
                          <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 40 }}>
                             <ambientLight intensity={0.5} />
                             <spotLight position={[5, 5, 5]} angle={0.2} penumbra={1} intensity={1.5} castShadow />
                             <MiniMannequin />
                             <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={2} />
                          </Canvas>
                        </div>
                     ) : (
                        <div className="text-center text-white/30 z-0 flex flex-col items-center">
                           <Box className="w-8 h-8 mb-2 opacity-50 text-blue-400" />
                           <p className="text-[10px] uppercase tracking-widest font-bold">Sin modelo 3D</p>
                           <Button variant="link" className="text-xs text-blue-400 mt-2 h-auto py-1 hover:text-blue-300" onClick={() => window.location.href='/forge-3d'}>Generar en Forja</Button>
                        </div>
                     )}
                   </>
                 )}

                 <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D17] via-transparent to-transparent opacity-90 pointer-events-none z-10" />
                 
                 {viewMode === 'photo' && char.photoUrls && char.photoUrls.length > 1 && (
                   <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] text-white/90 font-bold z-20 flex items-center gap-1 shadow-lg">
                      <ImageIcon className="w-3 h-3 text-blue-400" /> {char.photoUrls.length} Referencias
                   </div>
                 )}
                 
                 <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                    <button 
                      className="w-8 h-8 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-blue-500/20 hover:border-blue-500/50 transition-all shadow-lg" 
                      onClick={() => openEditForm(char)}
                      data-testid={`button-edit-${char.id}`}
                    >
                      <Settings2 className="w-4 h-4" />
                    </button>
                    <button 
                      className="w-8 h-8 rounded bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-red-400 hover:text-red-300 hover:bg-red-500/20 hover:border-red-500/50 transition-all shadow-lg" 
                      onClick={() => handleDelete(char.id)}
                      data-testid={`button-delete-${char.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                 </div>
              </div>
              <div className="p-5 relative z-20 bg-[#111322]">
                 <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-white text-lg line-clamp-1" data-testid={`text-char-name-${char.id}`}>{char.name}</h3>
                   <span className="text-[10px] uppercase font-bold tracking-wider bg-blue-500/20 text-blue-300 px-2 py-1 rounded border border-blue-500/20 whitespace-nowrap ml-2 shadow-[0_0_10px_rgba(59,130,246,0.1)]">{char.role}</span>
                 </div>
                 <p className="text-xs text-white/50 line-clamp-2 mb-4 leading-relaxed">{char.description}</p>
                 <div className="flex items-center gap-2 text-xs text-white/60 bg-black/40 border border-white/5 px-3 py-2 rounded-md font-mono">
                    <Mic className="w-3 h-3 text-emerald-400" /> {char.voice}
                 </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
