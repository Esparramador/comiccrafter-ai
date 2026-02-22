import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, Plus, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    video_generations_per_month: 5,
    comic_generations_per_month: 10,
    max_video_scenes: 10,
    max_comic_pages: 20
  });

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => base44.entities.SubscriptionPlan.list()
  });

  const createPlanMutation = useMutation({
    mutationFn: (data) => base44.entities.SubscriptionPlan.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      setNewPlan({
        name: "",
        price: 0,
        video_generations_per_month: 5,
        comic_generations_per_month: 10,
        max_video_scenes: 10,
        max_comic_pages: 20
      });
    }
  });

  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.SubscriptionPlan.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      setEditingId(null);
    }
  });

  const deletePlanMutation = useMutation({
    mutationFn: (id) => base44.entities.SubscriptionPlan.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
    }
  });

  // Check if user is admin
  if (!user) {
    return (
      <div className="min-h-screen pt-20 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-20 p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-lg font-semibold">Acceso denegado</p>
          <p className="text-gray-400 text-sm mt-2">Solo administradores pueden acceder a este panel</p>
        </div>
      </div>
    );
  }

  const handleSaveEdit = () => {
    updatePlanMutation.mutate({ id: editingId, data: editingData });
  };

  return (
    <div className="min-h-screen pt-20 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
        <p className="text-gray-400 mb-8">Configura tus planes de suscripción y límites</p>

        {/* Crear nuevo plan */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Crear Nuevo Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Nombre del plan"
              value={newPlan.name}
              onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
              className="bg-white/5 border-white/10 text-white placeholder-gray-600"
            />
            <Input
              placeholder="Precio"
              type="number"
              value={newPlan.price}
              onChange={(e) => setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })}
              className="bg-white/5 border-white/10 text-white placeholder-gray-600"
            />
            <Input
              placeholder="Vídeos/mes"
              type="number"
              value={newPlan.video_generations_per_month}
              onChange={(e) => setNewPlan({ ...newPlan, video_generations_per_month: parseInt(e.target.value) })}
              className="bg-white/5 border-white/10 text-white placeholder-gray-600"
            />
            <Input
              placeholder="Cómics/mes"
              type="number"
              value={newPlan.comic_generations_per_month}
              onChange={(e) => setNewPlan({ ...newPlan, comic_generations_per_month: parseInt(e.target.value) })}
              className="bg-white/5 border-white/10 text-white placeholder-gray-600"
            />
            <Input
              placeholder="Máx escenas/vídeo"
              type="number"
              value={newPlan.max_video_scenes}
              onChange={(e) => setNewPlan({ ...newPlan, max_video_scenes: parseInt(e.target.value) })}
              className="bg-white/5 border-white/10 text-white placeholder-gray-600"
            />
            <Input
              placeholder="Máx páginas/cómic"
              type="number"
              value={newPlan.max_comic_pages}
              onChange={(e) => setNewPlan({ ...newPlan, max_comic_pages: parseInt(e.target.value) })}
              className="bg-white/5 border-white/10 text-white placeholder-gray-600"
            />
          </div>
          <Button
            onClick={() => createPlanMutation.mutate(newPlan)}
            disabled={!newPlan.name || createPlanMutation.isPending}
            className="mt-4 bg-violet-600 hover:bg-violet-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Crear Plan
          </Button>
        </div>

        {/* Lista de planes */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Planes Existentes</h2>
          <AnimatePresence>
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4"
              >
                {editingId === plan.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editingData.name}
                      onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <Input
                        type="number"
                        value={editingData.video_generations_per_month}
                        onChange={(e) => setEditingData({ ...editingData, video_generations_per_month: parseInt(e.target.value) })}
                        placeholder="Vídeos/mes"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                      <Input
                        type="number"
                        value={editingData.comic_generations_per_month}
                        onChange={(e) => setEditingData({ ...editingData, comic_generations_per_month: parseInt(e.target.value) })}
                        placeholder="Cómics/mes"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                      <Input
                        type="number"
                        value={editingData.max_video_scenes}
                        onChange={(e) => setEditingData({ ...editingData, max_video_scenes: parseInt(e.target.value) })}
                        placeholder="Máx escenas"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                      <Input
                        type="number"
                        value={editingData.max_comic_pages}
                        onChange={(e) => setEditingData({ ...editingData, max_comic_pages: parseInt(e.target.value) })}
                        placeholder="Máx páginas"
                        className="bg-white/5 border-white/10 text-white text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveEdit}
                        disabled={updatePlanMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="w-4 h-4 mr-2" /> Guardar
                      </Button>
                      <Button
                        onClick={() => setEditingId(null)}
                        variant="outline"
                        className="border-white/10"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{plan.name}</p>
                      <p className="text-gray-400 text-sm">
                        {plan.video_generations_per_month} vídeos/mes • {plan.comic_generations_per_month} cómics/mes
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setEditingId(plan.id);
                          setEditingData(plan);
                        }}
                        variant="ghost"
                        size="icon"
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => deletePlanMutation.mutate(plan.id)}
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}