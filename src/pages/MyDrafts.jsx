import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Film, Trash2, Edit, FileText, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function MyDrafts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState(null);

  const { data: drafts = [], isLoading } = useQuery({
    queryKey: ["drafts"],
    queryFn: () => base44.entities.Draft.list("-updated_date"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Draft.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drafts"] }),
  });

  const handleEdit = (draft) => {
    if (draft.type === "comic") {
      navigate(createPageUrl("CreateComic") + `?draftId=${draft.id}`);
    } else {
      navigate(createPageUrl("AnimatedShorts") + `?draftId=${draft.id}`);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await deleteMutation.mutateAsync(id);
    setDeletingId(null);
  };

  const comicDrafts = drafts.filter(d => d.type === "comic");
  const shortDrafts = drafts.filter(d => d.type === "short");

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Mis Borradores</h1>
          <p className="text-gray-400 text-sm">Retoma donde lo dejaste o elimina los que ya no necesites.</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : drafts.length === 0 ? (
          <div className="text-center py-24">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tienes borradores guardados</p>
            <p className="text-gray-600 text-sm mt-1">Al crear un cómic o corto, se guardará automáticamente como borrador.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {comicDrafts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-semibold text-violet-400 uppercase tracking-wider">Cómics</h2>
                  <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{comicDrafts.length}</span>
                </div>
                <div className="grid gap-3">
                  <AnimatePresence>
                    {comicDrafts.map(draft => (
                      <DraftCard
                        key={draft.id}
                        draft={draft}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={deletingId === draft.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            {shortDrafts.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Film className="w-4 h-4 text-pink-400" />
                  <h2 className="text-sm font-semibold text-pink-400 uppercase tracking-wider">Cortos Animados</h2>
                  <span className="text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">{shortDrafts.length}</span>
                </div>
                <div className="grid gap-3">
                  <AnimatePresence>
                    {shortDrafts.map(draft => (
                      <DraftCard
                        key={draft.id}
                        draft={draft}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        isDeleting={deletingId === draft.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function DraftCard({ draft, onEdit, onDelete, isDeleting }) {
  const isComic = draft.type === "comic";
  const data = draft.data || {};

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white/5 border border-white/8 hover:border-white/15 transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isComic ? "bg-violet-500/15 text-violet-400" : "bg-pink-500/15 text-pink-400"
        }`}>
          {isComic ? <BookOpen className="w-5 h-5" /> : <Film className="w-5 h-5" />}
        </div>
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{draft.title || "Sin título"}</p>
          <div className="flex items-center gap-3 mt-0.5">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              isComic ? "bg-violet-500/10 text-violet-400" : "bg-pink-500/10 text-pink-400"
            }`}>
              {isComic ? `${data.pageCount || "?"} páginas` : `${data.frameCount || "?"} fotogramas`}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              {draft.updated_date ? format(new Date(draft.updated_date), "d MMM, HH:mm", { locale: es }) : "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(draft)}
          className="text-gray-400 hover:text-white hover:bg-white/10 gap-1.5 text-xs"
        >
          <Edit className="w-3.5 h-3.5" /> Editar
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(draft.id)}
          disabled={isDeleting}
          className="text-gray-600 hover:text-red-400 hover:bg-red-500/10 gap-1.5 text-xs"
        >
          {isDeleting ? (
            <div className="w-3.5 h-3.5 border border-red-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}