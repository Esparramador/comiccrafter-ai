import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { Film, Baby, Plus, Play, Clock, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import VideoViewer from "@/components/video/VideoViewer.jsx";
import ShortsViewer from "@/components/shorts/ShortsViewer";

const STATUS_COLORS = {
  completed: "bg-green-500/20 text-green-400",
  generating: "bg-yellow-500/20 text-yellow-400",
  draft: "bg-gray-500/20 text-gray-400",
  failed: "bg-red-500/20 text-red-400",
};

function MediaCard({ item, type, onView, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-white/10 transition-all"
    >
      {/* Cover */}
      <div className="relative aspect-video bg-black overflow-hidden">
        {item.cover_image_url ? (
          <img src={item.cover_image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {type === "short" ? <Film className="w-10 h-10 text-pink-400/30" /> : <Baby className="w-10 h-10 text-yellow-400/30" />}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="absolute top-2 right-2">
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[item.status] || STATUS_COLORS.draft}`}>
            {item.status}
          </span>
        </div>
        {item.status === "completed" && (
          <button
            onClick={() => onView(item)}
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all">
              <Play className="w-5 h-5 text-white ml-0.5" />
            </div>
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-sm font-semibold text-white mb-1 truncate">{item.title}</h3>
        <p className="text-xs text-gray-500 line-clamp-2 mb-3">{item.synopsis || item.story?.slice(0, 100)}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] text-gray-600">
            <Clock className="w-3 h-3" />
            {new Date(item.created_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
            {type === "short" ? (
              <span className="px-1.5 py-0.5 rounded bg-pink-500/10 text-pink-400">{item.style}</span>
            ) : (
              <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">{item.target_age} años</span>
            )}
          </div>
          <div className="flex gap-1">
            {item.status === "completed" && (
              <Button variant="ghost" size="icon" onClick={() => onView(item)} className="w-7 h-7 text-gray-500 hover:text-white">
                <Eye className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onDelete(item.id, type)} className="w-7 h-7 text-gray-500 hover:text-red-400">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function MyMedia() {
  const [tab, setTab] = useState("shorts");
  const [viewingShort, setViewingShort] = useState(null);
  const [viewingVideo, setViewingVideo] = useState(null);

  const { data: shorts = [], refetch: refetchShorts } = useQuery({
    queryKey: ["animated_shorts"],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.email) return [];
        return base44.entities.AnimatedShort.filter({ created_by: user.email }, "-created_date", 50);
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const { data: videos = [], refetch: refetchVideos } = useQuery({
    queryKey: ["video_projects"],
    queryFn: async () => {
      try {
        const user = await base44.auth.me();
        if (!user?.email) return [];
        return base44.entities.VideoProject.filter({ created_by: user.email }, "-created_date", 50);
      } catch {
        return [];
      }
    },
    initialData: [],
  });

  const handleDelete = async (id, type) => {
    if (!confirm("¿Eliminar este proyecto?")) return;
    if (type === "short") {
      await base44.entities.AnimatedShort.delete(id);
      refetchShorts();
    } else {
      await base44.entities.VideoProject.delete(id);
      refetchVideos();
    }
  };

  if (viewingShort) return <ShortsViewer short={viewingShort} onBack={() => setViewingShort(null)} />;
  if (viewingVideo) return <VideoViewer project={viewingVideo} onBack={() => setViewingVideo(null)} />;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Mis Vídeos & Cortos</h1>
            <p className="text-gray-500 text-sm mt-1">Todos tus proyectos animados generados con IA</p>
          </div>
          <div className="flex gap-2">
            <Link to={createPageUrl("AnimatedShorts")}>
              <Button className="bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 rounded-xl gap-2 text-sm">
                <Film className="w-4 h-4" /> Nuevo Corto
              </Button>
            </Link>
            <Link to={createPageUrl("VideoProjects")}>
              <Button className="bg-gradient-to-r from-yellow-600 to-pink-600 hover:from-yellow-500 hover:to-pink-500 rounded-xl gap-2 text-sm">
                <Baby className="w-4 h-4" /> Nuevo Vídeo
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-white/5 rounded-2xl mb-8 w-fit">
          <button
            onClick={() => setTab("shorts")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "shorts" ? "bg-gradient-to-r from-pink-600 to-violet-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            <Film className="w-4 h-4" />
            Cortos
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === "shorts" ? "bg-white/20" : "bg-white/10"}`}>
              {shorts.length}
            </span>
          </button>
          <button
            onClick={() => setTab("videos")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === "videos" ? "bg-gradient-to-r from-yellow-600 to-pink-600 text-white shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            <Baby className="w-4 h-4" />
            Vídeos
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === "videos" ? "bg-white/20" : "bg-white/10"}`}>
              {videos.length}
            </span>
          </button>
        </div>

        {/* Content */}
        {tab === "shorts" && (
          <div>
            {shorts.length === 0 ? (
              <EmptyState
                icon={<Film className="w-12 h-12 text-pink-400/30" />}
                title="No tienes cortos animados todavía"
                desc="Crea tu primer corto estilo anime con IA"
                link="AnimatedShorts"
                btnLabel="Crear Corto Animado"
                btnClass="from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {shorts.map(s => (
                  <MediaCard key={s.id} item={s} type="short" onView={setViewingShort} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "videos" && (
          <div>
            {videos.length === 0 ? (
              <EmptyState
                icon={<Baby className="w-12 h-12 text-yellow-400/30" />}
                title="No tienes vídeos todavía"
                desc="Crea tu primer cortometraje infantil o vídeo animado con voces ElevenLabs"
                link="VideoProjects"
                btnLabel="Crear Vídeo Animado"
                btnClass="from-yellow-600 to-pink-600 hover:from-yellow-500 hover:to-pink-500"
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map(v => (
                  <MediaCard key={v.id} item={v} type="video" onView={setViewingVideo} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, desc, link, btnLabel, btnClass }) {
  return (
    <div className="text-center py-20">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-white font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm mb-6">{desc}</p>
      <Link to={createPageUrl(link)}>
        <Button className={`bg-gradient-to-r ${btnClass} rounded-xl gap-2`}>
          <Plus className="w-4 h-4" /> {btnLabel}
        </Button>
      </Link>
    </div>
  );
}