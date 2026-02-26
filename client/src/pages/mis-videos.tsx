import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileVideo, PlayCircle, Download, Share2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MisVideos() {
  const videos = [
    { id: 1, title: "El Despertar de Jax - Acto 1", duration: "12:05", type: "capitulo", date: "Hace 2 días", img: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=600" },
    { id: 2, title: "Promocional Escuela de Magia", duration: "0:45", type: "corto", date: "Hace 5 horas", img: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600" },
    { id: 3, title: "Explicación Sistema Solar Infantil", duration: "3:20", type: "educativo", date: "Ayer", img: "https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?auto=format&fit=crop&q=80&w=600" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2 text-white flex items-center gap-3">
          <FileVideo className="w-8 h-8 text-blue-500" /> Mis Vídeos
        </h1>
        <p className="text-white/50">Todos tus cortos, vídeos educativos y capítulos de serie generados, sincronizados con tu cuenta.</p>
      </header>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="bg-black/50 border border-white/10 mb-6 h-12">
          <TabsTrigger value="todos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">Todos</TabsTrigger>
          <TabsTrigger value="cortos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">Cortos & Reels</TabsTrigger>
          <TabsTrigger value="series" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">Capítulos de Serie</TabsTrigger>
          <TabsTrigger value="educativos" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-6">Vídeos Educativos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="todos" className="mt-0">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {videos.map(vid => (
               <Card key={vid.id} className="bg-[#111322] border-white/5 overflow-hidden hover:border-white/20 transition-all group">
                 <div className="aspect-video relative flex items-center justify-center cursor-pointer overflow-hidden">
                    <img src={vid.img} alt={vid.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-500" />
                    <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white relative z-10 transition-colors drop-shadow-lg group-hover:scale-110 duration-300" onClick={() => alert(`Reproduciendo: ${vid.title}`)} />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-mono z-10">
                      {vid.duration}
                    </div>
                 </div>
                 <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                       <h3 className="font-bold text-white text-base line-clamp-1">{vid.title}</h3>
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/50 mb-4">
                       <span className="capitalize px-2 py-0.5 rounded-full border border-white/10 bg-white/5">{vid.type}</span>
                       <span>{vid.date}</span>
                    </div>
                    <div className="flex gap-2">
                       <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-white/80 h-8 text-xs" onClick={() => alert("Iniciando descarga...")}>
                          <Download className="w-3 h-3 mr-2" /> Descargar
                       </Button>
                       <Button variant="outline" className="flex-1 bg-transparent border-white/10 hover:bg-white/5 text-white/80 h-8 text-xs" onClick={() => alert("Link copiado al portapapeles")}>
                          <Share2 className="w-3 h-3 mr-2" /> Compartir
                       </Button>
                    </div>
                 </div>
               </Card>
             ))}
           </div>
        </TabsContent>
        {/* En un entorno real, las demas tabs filtrarían el array 'videos' */}
        <TabsContent value="cortos">
           <div className="text-center py-20 text-white/40">Mostrando solo Cortos...</div>
        </TabsContent>
      </Tabs>
    </div>
  );
}