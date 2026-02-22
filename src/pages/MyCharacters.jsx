import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Users, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import CharacterCard from "../components/characters/CharacterCard";
import CharacterForm from "../components/characters/CharacterForm";

export default function MyCharacters() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null); // null = closed, {} = new, char = edit
  const [deleting, setDeleting] = useState(null);

  const { data: characters = [], isLoading } = useQuery({
    queryKey: ["characters"],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.email) return [];
        return base44.entities.Character.filter({ created_by: user.email }, "-created_date", 100);
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Character.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["characters"] }),
  });

  const handleSaved = () => {
    qc.invalidateQueries({ queryKey: ["characters"] });
    setEditing(null);
  };

  const filtered = (Array.isArray(characters) ? characters : []).filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pb-20 pt-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Mis Personajes</h1>
            <p className="text-gray-400 text-sm mt-1">{(characters || []).length} personaje{(characters || []).length !== 1 ? "s" : ""} guardado{(characters || []).length !== 1 ? "s" : ""}</p>
          </div>
          <Button
            onClick={() => setEditing({})}
            className="bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl gap-2 shadow-lg shadow-violet-500/20"
          >
            <Plus className="w-4 h-4" /> Nuevo Personaje
          </Button>
        </div>

        {/* Search */}
        {(characters || []).length > 0 && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              placeholder="Buscar personaje..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-gray-600 focus:border-violet-500/50"
            />
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && (characters || []).length === 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center mx-auto mb-4">
              <Users className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Aún no tienes personajes</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Crea tus personajes una vez y úsalos en todos tus cómics. Añade varias fotos para mayor realismo.
            </p>
            <Button onClick={() => setEditing({})} className="bg-violet-600 hover:bg-violet-500">
              <Plus className="w-4 h-4 mr-2" /> Crear primer personaje
            </Button>
          </motion.div>
        )}

        {/* Grid */}
        {!isLoading && filtered.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <AnimatePresence>
              {filtered.map(char => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onEdit={c => setEditing(c)}
                  onDelete={c => setDeleting(c)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {!isLoading && filtered.length === 0 && (characters || []).length > 0 && (
          <p className="text-center text-gray-500 py-12">No se encontraron personajes con ese nombre.</p>
        )}
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={editing !== null} onOpenChange={open => !open && setEditing(null)}>
        <DialogContent className="bg-[#0f0f1a] border-white/10 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar personaje" : "Nuevo personaje"}</DialogTitle>
          </DialogHeader>
          {editing !== null && (
            <CharacterForm
              character={editing?.id ? editing : null}
              onSave={handleSaved}
              onCancel={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <Dialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
        <DialogContent className="bg-[#0f0f1a] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle>¿Eliminar personaje?</DialogTitle>
          </DialogHeader>
          <p className="text-gray-400 text-sm">
            Se eliminará <span className="text-white font-semibold">{deleting?.name}</span> de forma permanente.
          </p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setDeleting(null)} className="flex-1 border-white/10 text-gray-400 hover:text-white hover:bg-white/5">Cancelar</Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-500"
              onClick={() => { deleteMutation.mutate(deleting.id); setDeleting(null); }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}