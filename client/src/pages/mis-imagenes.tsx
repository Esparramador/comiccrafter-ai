import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Image as ImageIcon, Download, Eye, Trash2, Loader2, Sparkles, RefreshCw, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AIProgress from "@/components/ai-progress";
import type { GeneratedImage } from "@shared/schema";

export default function MisImagenes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("todos");
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewImage, setViewImage] = useState<GeneratedImage | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: images = [], isLoading } = useQuery<GeneratedImage[]>({
    queryKey: ["/api/images"],
    refetchInterval: isGenerating ? 8000 : false,
  });

  useEffect(() => {
    fetch("/api/ai/gallery-status").then(r => r.json()).then(d => {
      if (d.running) setIsGenerating(true);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (isGenerating) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch("/api/ai/gallery-status");
          const data = await res.json();
          if (!data.running) {
            setIsGenerating(false);
            queryClient.invalidateQueries({ queryKey: ["/api/images"] });
            toast({ title: "Galería completa", description: "Todas las imágenes han sido generadas con DALL-E 3 HD." });
          }
        } catch {}
      }, 10000);
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [isGenerating]);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/images/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/images"] });
      toast({ title: "Imagen eliminada" });
    },
  });

  const handleGenerateGallery = async () => {
    setIsGenerating(true);
    try {
      const res = await apiRequest("POST", "/api/ai/generate-gallery-batch", {});
      const data = await res.json();
      toast({
        title: data.started ? "Generación iniciada" : "En proceso",
        description: data.message,
      });
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
      setIsGenerating(false);
    }
  };

  const handleDownload = async (img: GeneratedImage) => {
    try {
      const response = await fetch(img.imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const ext = img.imageUrl.startsWith("data:image/png") ? "png" : "png";
      a.download = `comiccrafter-${img.category}-${img.id}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Descargando imagen..." });
    } catch {
      window.open(img.imageUrl, "_blank");
    }
  };

  const filteredImages = activeTab === "todos"
    ? images
    : activeTab === "portadas"
    ? images.filter(i => i.category === "cover")
    : activeTab === "ilustraciones"
    ? images.filter(i => i.category === "illustration")
    : activeTab === "personajes"
    ? images.filter(i => i.category === "character")
    : images.filter(i => !["cover", "illustration", "character"].includes(i.category));

  const counts = {
    todos: images.length,
    portadas: images.filter(i => i.category === "cover").length,
    ilustraciones: images.filter(i => i.category === "illustration").length,
    personajes: images.filter(i => i.category === "character").length,
    otros: images.filter(i => !["cover", "illustration", "character"].includes(i.category)).length,
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = {
      cover: "Portada",
      illustration: "Ilustración",
      character: "Personaje",
      general: "General",
    };
    return labels[cat] || cat;
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      cover: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      illustration: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      character: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
      general: "bg-gray-500/20 text-gray-300 border-gray-500/30",
    };
    return colors[cat] || colors.general;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col animate-in fade-in duration-500">
      <header className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-white flex items-center gap-3" data-testid="text-page-title">
            <ImageIcon className="w-8 h-8 text-purple-500" /> Mis Imágenes
          </h1>
          <p className="text-white/50">Tu galería de portadas, ilustraciones, personajes y concept art generados con IA.</p>
          <p className="text-xs text-white/30 mt-1">{images.length} imágenes en total</p>
        </div>
        <Button
          onClick={handleGenerateGallery}
          disabled={isGenerating}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-lg shadow-purple-500/20 h-12 px-6 font-bold"
          data-testid="button-generate-gallery"
        >
          {isGenerating ? (
            <span className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" /> Generando Galería...</span>
          ) : (
            <span className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Generar Galería IA (20 imágenes)</span>
          )}
        </Button>
      </header>

      <AIProgress isActive={isGenerating} type="gallery" estimatedSeconds={300} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <TabsList className="bg-black/50 border border-white/10 mb-6 h-12 w-fit">
          <TabsTrigger value="todos" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-4" data-testid="tab-all">
            Todas ({counts.todos})
          </TabsTrigger>
          <TabsTrigger value="portadas" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white px-4" data-testid="tab-covers">
            Portadas ({counts.portadas})
          </TabsTrigger>
          <TabsTrigger value="ilustraciones" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white px-4" data-testid="tab-illustrations">
            Ilustraciones ({counts.ilustraciones})
          </TabsTrigger>
          <TabsTrigger value="personajes" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white px-4" data-testid="tab-characters">
            Personajes ({counts.personajes})
          </TabsTrigger>
          {counts.otros > 0 && (
            <TabsTrigger value="otros" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white px-4" data-testid="tab-other">
              Otros ({counts.otros})
            </TabsTrigger>
          )}
        </TabsList>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-white/30">
            <ImageIcon className="w-16 h-16" />
            <p className="text-lg">No hay imágenes en esta categoría</p>
            <p className="text-sm">Genera portadas e ilustraciones con el botón de arriba</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 overflow-y-auto flex-1 pb-8">
            {filteredImages.map(img => (
              <Card key={img.id} className="bg-[#111322] border-white/5 overflow-hidden hover:border-white/20 transition-all group relative" data-testid={`card-image-${img.id}`}>
                <div className={`${img.category === 'cover' ? 'aspect-[3/4]' : 'aspect-square'} bg-gradient-to-br from-gray-800 to-gray-900 relative flex items-center justify-center cursor-pointer overflow-hidden`}>
                  <img
                    src={img.imageUrl}
                    alt={img.prompt.substring(0, 50)}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />

                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full w-10 h-10 bg-white/20 hover:bg-white/40 text-white border-0"
                      onClick={() => setViewImage(img)}
                      data-testid={`button-view-${img.id}`}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full w-10 h-10 bg-blue-500/30 hover:bg-blue-500/50 text-white border-0"
                      onClick={() => handleDownload(img)}
                      data-testid={`button-download-${img.id}`}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full w-10 h-10 bg-red-500/20 hover:bg-red-500/40 text-white border-0"
                      onClick={() => deleteMutation.mutate(img.id)}
                      data-testid={`button-delete-${img.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 relative z-10 bg-[#111322]">
                  <p className="text-xs text-white/70 line-clamp-2 mb-2 leading-relaxed">{img.prompt.substring(0, 80)}...</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className={`text-[10px] rounded-sm ${getCategoryColor(img.category)}`}>
                      {getCategoryLabel(img.category)}
                    </Badge>
                    <span className="text-[10px] text-white/30">
                      {new Date(img.createdAt).toLocaleDateString("es-ES")}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Tabs>

      <Dialog open={!!viewImage} onOpenChange={() => setViewImage(null)}>
        <DialogContent className="bg-[#0a0c14] border-white/10 max-w-4xl max-h-[90vh] p-0 overflow-hidden">
          {viewImage && (
            <div className="flex flex-col">
              <div className="relative">
                <img
                  src={viewImage.imageUrl}
                  alt={viewImage.prompt.substring(0, 50)}
                  className="w-full max-h-[70vh] object-contain bg-black"
                />
                <button
                  onClick={() => setViewImage(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`${getCategoryColor(viewImage.category)}`}>
                    {getCategoryLabel(viewImage.category)}
                  </Badge>
                  <span className="text-xs text-white/40">
                    {new Date(viewImage.createdAt).toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed">{viewImage.prompt}</p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => handleDownload(viewImage)}
                    className="bg-blue-600 hover:bg-blue-500 text-white gap-2"
                    data-testid="button-download-full"
                  >
                    <Download className="w-4 h-4" /> Descargar Imagen
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open(viewImage.imageUrl, "_blank")}
                    className="border-white/10 text-white/70 hover:text-white gap-2"
                  >
                    <Eye className="w-4 h-4" /> Abrir en Nueva Pestaña
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
