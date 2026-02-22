import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Loader2 } from "lucide-react";
import ComicCard from "../components/comics/ComicCard";

export default function MyComics() {
  const queryClient = useQueryClient();

  const { data: comics, isLoading } = useQuery({
    queryKey: ["comics"],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.email) return [];
        return base44.entities.ComicProject.filter({ created_by: user.email }, "-created_date", 100);
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.ComicProject.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["comics"] }),
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Mis Cómics</h1>
            <p className="text-sm text-gray-500 mt-1">{comics.length} proyectos</p>
          </div>
          <Link to={createPageUrl("CreateComic")}>
            <Button className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl gap-2 shadow-lg shadow-violet-500/20">
              <PlusCircle className="w-4 h-4" /> Crear Nuevo
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && comics.length === 0 && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/5 flex items-center justify-center mb-6">
              <BookOpen className="w-10 h-10 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No tienes cómics aún</h2>
            <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
              Crea tu primer cómic con IA. Solo necesitas subir fotos y contar tu historia.
            </p>
            <Link to={createPageUrl("CreateComic")}>
              <Button className="bg-violet-600 hover:bg-violet-500 rounded-xl gap-2">
                <PlusCircle className="w-4 h-4" /> Crear mi primer Cómic
              </Button>
            </Link>
          </div>
        )}

        {/* Grid */}
        {!isLoading && comics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {comics.map((comic, i) => (
              <ComicCard
                key={comic.id}
                comic={comic}
                index={i}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}