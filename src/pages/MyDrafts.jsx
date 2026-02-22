import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Button } from "@/components/ui/button";
import { BookOpen, Film, Trash2, Edit, FileText, Sparkles, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AssetCard from "@/components/assets/AssetCard";
import AssetPreview from "@/components/assets/AssetPreview";

const tabs = [
  { id: "covers", label: "Portadas", icon: Sparkles },
  { id: "models", label: "Modelo 3D", icon: Box },
  { id: "comics", label: "Cómics", icon: BookOpen },
  { id: "shorts", label: "Cortos", icon: Film },
  { id: "videos", label: "Vídeos", icon: Film }
];

const assetTypeMap = {
  covers: "cover",
  models: "model_3d",
  comics: "comic",
  shorts: "short",
  videos: "video"
};

export default function MyDrafts() {
  const [activeTab, setActiveTab] = useState("covers");
  const [previewAsset, setPreviewAsset] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: drafts = [], isLoading: draftsLoading } = useQuery({
    queryKey: ["drafts"],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.email) return [];
        return base44.entities.Draft.filter({ created_by: user.email }, "-updated_date", 100);
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const { data: assets = [], isLoading: assetsLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.email) return [];
        return base44.entities.GeneratedAsset.filter({ created_by: user.email }, "-created_date", 100);
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const deleteDraftMutation = useMutation({
    mutationFn: (id) => base44.entities.Draft.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["drafts"] }),
  });

  const deleteAssetMutation = useMutation({
    mutationFn: (id) => base44.entities.GeneratedAsset.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["assets"] }),
  });

  const handleEditDraft = (draft) => {
    if (draft.type === "comic") {
      navigate(createPageUrl("CreateComic") + `?draftId=${draft.id}`);
    } else {
      navigate(createPageUrl("AnimatedShorts") + `?draftId=${draft.id}`);
    }
  };

  const handleDeleteDraft = async (id) => {
    setDeletingId(id);
    await deleteDraftMutation.mutateAsync(id);
    setDeletingId(null);
  };

  const handleDeleteAsset = async (id) => {
    setDeletingId(id);
    await deleteAssetMutation.mutateAsync(id);
    setDeletingId(null);
  };

  const activeTabConfig = tabs.find(t => t.id === activeTab);
  const assetType = assetTypeMap[activeTab];
  const tabAssets = (Array.isArray(assets) ? assets : [])
    .filter(a => a?.type === assetType)
    .filter(a => a?.id);

  const isLoading = draftsLoading || assetsLoading;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-1">Mis Borradores y Creaciones</h1>
          <p className="text-gray-400 text-sm">Organiza tus trabajos por tipo. Descarga tus archivos finales cuando los necesites.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-violet-600 to-pink-600 text-white"
                    : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tabAssets.length === 0 ? (
          <div className="text-center py-24">
            <activeTabConfig.icon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tienes {activeTabConfig.label.toLowerCase()} aún</p>
            <p className="text-gray-600 text-sm mt-1">Crea uno con nuestras herramientas y aparecerá aquí.</p>
          </div>
        ) : (
           <div className="space-y-3">
             <AnimatePresence mode="popLayout">
               {Array.isArray(tabAssets) && tabAssets
                 .filter(asset => asset?.id)
                 .map(asset => (
                   <AssetCard
                     key={asset.id}
                     asset={asset}
                     onPreview={setPreviewAsset}
                     onDelete={handleDeleteAsset}
                     isDeleting={deletingId === asset.id}
                   />
                 ))}
             </AnimatePresence>
           </div>
         )}

        {/* Preview Modal */}
        {previewAsset && (
          <AssetPreview asset={previewAsset} onClose={() => setPreviewAsset(null)} />
        )}
      </div>
    </div>
  );
}