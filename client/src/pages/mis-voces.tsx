import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic2, PlayCircle, Settings, Share2, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MisVoces() {
  const voces = [
    { id: 1, name: "Jax (Clonada)", type: "personalizada", tags: ["Grave", "Masculino"], date: "Hace 1 mes" },
    { id: 2, name: "Mi Voz (Sadiagiljoan)", type: "personalizada", tags: ["Real", "Propia"], date: "Hace 2 meses" },
    { id: 3, name: "Narrador Épico AI", type: "ia", tags: ["Profundo", "Fantasía"], date: "ElevenLabs Core" },
    { id: 4, name: "Profesora Amable AI", type: "ia", tags: ["Dulce", "Educativo"], date: "ElevenLabs Core" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white flex items-center gap-3">
            <Mic2 className="w-8 h-8 text-emerald-500" /> Mis Voces
          </h1>
          <p className="text-white/50">Gestiona las voces generadas por IA y tus voces reales clonadas para usar en tus vídeos y personajes.</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
           <Upload className="w-4 h-4" /> Clonar Nueva Voz
        </Button>
      </header>

      <Tabs defaultValue="todas" className="w-full">
        <TabsList className="bg-black/50 border border-white/10 mb-6 h-12">
          <TabsTrigger value="todas" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6">Todas las Voces</TabsTrigger>
          <TabsTrigger value="personalizadas" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6">Voces Personalizadas (Clonadas)</TabsTrigger>
          <TabsTrigger value="ia" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-6">Voces IA (Catálogo)</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todas" className="mt-0">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {voces.map(voz => (
               <Card key={voz.id} className="bg-[#111322] border-white/5 p-6 hover:border-emerald-500/30 transition-all group">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="font-bold text-white text-lg flex items-center gap-2">
                         {voz.name}
                         {voz.type === 'personalizada' && <span className="w-2 h-2 rounded-full bg-emerald-500" title="Clonada/Propia" />}
                      </h3>
                      <p className="text-xs text-white/40 mt-1">{voz.date}</p>
                    </div>
                    <Button size="icon" className="rounded-full bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors">
                      <PlayCircle className="w-5 h-5" />
                    </Button>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="flex gap-2">
                      {voz.tags.map(tag => (
                        <span key={tag} className="text-[10px] px-2 py-1 rounded bg-black/50 border border-white/10 text-white/60 uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="h-10 w-full bg-black/40 rounded flex items-center px-4 overflow-hidden relative border border-white/5">
                       {/* Fake waveform */}
                       <div className="absolute inset-0 flex items-center justify-around px-2 opacity-50">
                          {Array.from({length: 20}).map((_, i) => (
                             <div key={i} className="w-1 bg-emerald-500/50 rounded-full" style={{ height: `${Math.random() * 80 + 10}%` }} />
                          ))}
                       </div>
                    </div>
                 </div>
               </Card>
             ))}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}