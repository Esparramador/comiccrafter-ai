import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Plus, Loader2 } from "lucide-react";

export default function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const [newPlan, setNewPlan] = useState({
    name: "",
    price: 0,
    video_generations_per_month: 5,
    comic_generations_per_month: 10,
    max_video_scenes: 10,
    max_comic_pages: 20,
  });

  const { data: plans, isLoading } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: () => base44.entities.SubscriptionPlan.list(),
    initialData: [],
  });

  const createPlanMutation = useMutation({
    mutationFn: (planData) => base44.entities.SubscriptionPlan.create(planData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
      setNewPlan({
        name: "",
        price: 0,
        video_generations_per_month: 5,
        comic_generations_per_month: 10,
        max_video_scenes: 10,
        max_comic_pages: 20,
      });
    },
  });

  const deletePlanMutation = useMutation({
    mutationFn: (planId) => base44.entities.SubscriptionPlan.delete(planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptionPlans"] });
    },
  });

  const handleCreatePlan = (e) => {
    e.preventDefault();
    if (newPlan.name && newPlan.price >= 0) {
      createPlanMutation.mutate({
        ...newPlan,
        is_active: true,
        features: [],
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Crear Plan */}
      <div className="bg-[#1a1a2e] border border-violet-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Crear Nuevo Plan
        </h2>

        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre del Plan
              </label>
              <Input
                type="text"
                placeholder="ej: Plan Pro"
                value={newPlan.name}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, name: e.target.value })
                }
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Precio ($)
              </label>
              <Input
                type="number"
                placeholder="0"
                value={newPlan.price}
                onChange={(e) =>
                  setNewPlan({ ...newPlan, price: parseFloat(e.target.value) })
                }
                className="bg-white/5 border-white/10"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vídeos/Mes
              </label>
              <Input
                type="number"
                value={newPlan.video_generations_per_month}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    video_generations_per_month: parseInt(e.target.value),
                  })
                }
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cómics/Mes
              </label>
              <Input
                type="number"
                value={newPlan.comic_generations_per_month}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    comic_generations_per_month: parseInt(e.target.value),
                  })
                }
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Máx. Escenas/Vídeo
              </label>
              <Input
                type="number"
                value={newPlan.max_video_scenes}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    max_video_scenes: parseInt(e.target.value),
                  })
                }
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Máx. Páginas/Cómic
              </label>
              <Input
                type="number"
                value={newPlan.max_comic_pages}
                onChange={(e) =>
                  setNewPlan({
                    ...newPlan,
                    max_comic_pages: parseInt(e.target.value),
                  })
                }
                className="bg-white/5 border-white/10"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={createPlanMutation.isPending}
            className="bg-violet-600 hover:bg-violet-700"
          >
            {createPlanMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Creando...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Crear Plan
              </>
            )}
          </Button>
        </form>
      </div>

      {/* Lista de Planes */}
      <div className="bg-[#1a1a2e] border border-violet-500/20 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-6">Planes Activos</h2>

        <div className="space-y-4">
          {Array.isArray(plans) && plans.length > 0 ? (
            (plans || []).map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/[0.07] transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-white">{plan.name}</h3>
                  <p className="text-sm text-gray-400">
                    ${plan.price} - {plan.video_generations_per_month} vídeos,{" "}
                    {plan.comic_generations_per_month} cómics
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePlanMutation.mutate(plan.id)}
                  disabled={deletePlanMutation.isPending}
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                >
                  {deletePlanMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))
          ) : (
            <p className="text-gray-400 text-center py-8">
              No hay planes creados
            </p>
          )}
        </div>
      </div>
    </div>
  );
}