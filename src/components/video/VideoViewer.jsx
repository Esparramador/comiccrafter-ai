import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Download, ChevronLeft, ChevronRight, Grid3X3, X
} from "lucide-react";

const emotionColors = {
  happy: "text-yellow-400", triumphant: "text-orange-400", magical: "text-violet-400",
  calm: "text-blue-400", funny: "text-green-400", tense: "text-red-400",
  sad: "text-blue-300", mysterious: "text-purple-400", educational: "text-cyan-400"
};

function SceneAudio({ audioUrl, play }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!audioUrl || !ref.current) return;
    if (play) ref.current.play().catch(() => {});
    else ref.current.pause();
  }, [play, audioUrl]);
  if (!audioUrl) return null;
  return <audio ref={ref} src={audioUrl} className="hidden" />;
}

export default function VideoViewer({ project, onBack }) {
  const [currentScene, setCurrentScene] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [view, setView] = useState("player");
  const [fps, setFps] = useState(2);

  const scenes = project.generated_scenes || [];
  const scene = scenes[currentScene];

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setCurrentScene(prev => {
        if (prev >= scenes.length - 1) { setPlaying(false); return prev; }
        return prev + 1;
      });
    }, fps * 1000);
    return () => clearInterval(t);
  }, [playing, scenes.length, fps]);

  const prev = () => { setPlaying(false); setCurrentScene(Math.max(0, currentScene - 1)); };
  const next = () => { setPlaying(false); setCurrentScene(Math.min(scenes.length - 1, currentScene + 1)); };

  const downloadAsZip = async () => {
    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      const folder = zip.folder(project.title || "video");
      
      const images = [
        ...(project.cover_image_url ? [{ url: project.cover_image_url, name: "00_Portada.png" }] : []),
        ...(Array.isArray(scenes) ? scenes.map(s => ({ url: s.image_url, name: `Escena_${String(s.scene_number).padStart(2, "0")}.png` })) : [])
      ];
      
      for (const img of images) {
        if (img?.url) {
          const res = await fetch(img.url);
          const blob = await res.blob();
          folder.file(img.name, blob);
        }
      }
      
      downloadScript();
      
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const zipUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = zipUrl;
      a.download = `${project.title || "video"}.zip`;
      a.click();
      URL.revokeObjectURL(zipUrl);
    } catch (e) {
      console.error("Error downloading ZIP:", e);
    }
  };

  const downloadScript = () => {
    let text = `${project.title}\n${"=".repeat(project.title?.length || 10)}\n\n`;
    if (project.synopsis) text += `Sinopsis: ${project.synopsis}\n`;
    if (project.moral_lesson) text += `Moraleja: ${project.moral_lesson}\n\n`;
    scenes.forEach(s => {
      text += `--- Escena ${s.scene_number} ---\n`;
      if (s.narrator_text) text += `NARRADOR: ${s.narrator_text}\n`;
      if (s.dialogue) text += `DIÁLOGO: ${s.dialogue}\n`;
      if (s.action) text += `ACCIÓN: ${s.action}\n`;
      text += "\n";
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `${project.title || "guion"}.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="sticky top-0 z-40 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-sm font-bold text-white">{project.title}</h1>
              <p className="text-[10px] text-gray-500">{project.genre} · {project.target_age} años · ElevenLabs Audio</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setView(view === "grid" ? "player" : "grid")} className="text-gray-400 hover:text-white" title="Vista de grilla">
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={downloadAsZip} className="text-gray-400 hover:text-white" title="Descargar ZIP">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white hover:bg-white/10">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {scene && !muted && (
        <>
          <SceneAudio audioUrl={scene.narrator_audio_url} play={playing} />
          <SceneAudio audioUrl={scene.audio_url} play={playing && !scene.narrator_audio_url} />
        </>
      )}

      {view === "grid" && (
        <div className="max-w-5xl mx-auto p-4 pt-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {scenes.map((s, i) => (
              <button
                key={i}
                onClick={() => { setCurrentScene(i); setView("player"); setPlaying(false); }}
                className={`relative rounded-xl overflow-hidden border-2 transition-all ${i === currentScene ? "border-yellow-500" : "border-transparent hover:border-white/20"}`}
              >
                <img src={s.image_url} className="w-full aspect-video object-cover" alt={`Escena ${s.scene_number}`} />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-2">
                  <p className="text-xs text-white text-left">Escena {s.scene_number}</p>
                </div>
                {(s.audio_url || s.narrator_audio_url) && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-yellow-500/80 rounded-full flex items-center justify-center">
                    <Volume2 className="w-3 h-3 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {view === "player" && scene && (
        <div className="max-w-3xl mx-auto px-4 pt-6 pb-8 space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="relative rounded-2xl overflow-hidden bg-black aspect-video"
            >
              <img src={scene.image_url} className="w-full h-full object-cover" alt={`Escena ${currentScene + 1}`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              {scene.narrator_text && (
                <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
                  <div className="bg-black/60 backdrop-blur-sm rounded-xl px-4 py-2 flex items-start gap-2">
                    <Volume2 className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-white italic leading-snug">{scene.narrator_text}</p>
                  </div>
                </div>
              )}
              <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 rounded-lg text-xs text-white">
                {currentScene + 1} / {scenes.length}
              </div>
              {scene.emotional_beat && (
                <div className="absolute top-3 right-3">
                  <span className={`text-xs font-medium capitalize ${emotionColors[scene.emotional_beat] || "text-gray-400"}`}>
                    ● {scene.emotional_beat}
                  </span>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between px-2">
            <Button variant="ghost" size="icon" onClick={prev} disabled={currentScene === 0} className="text-gray-400">
              <SkipBack className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={prev} disabled={currentScene === 0} className="text-gray-400">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <button
              onClick={() => setPlaying(!playing)}
              className="w-12 h-12 rounded-full bg-gradient-to-r from-yellow-500 to-pink-500 flex items-center justify-center shadow-lg hover:shadow-yellow-500/30 transition-all"
            >
              {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
            </button>
            <Button variant="ghost" size="icon" onClick={next} disabled={currentScene >= scenes.length - 1} className="text-gray-400">
              <ChevronRight className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={next} disabled={currentScene >= scenes.length - 1} className="text-gray-400">
              <SkipForward className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMuted(!muted)} className="text-gray-400">
              {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </Button>
          </div>

          <div className="flex gap-1">
            {scenes.map((_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentScene(i); setPlaying(false); }}
                className={`h-1 rounded-full transition-all flex-1 ${i === currentScene ? "bg-yellow-500" : i < currentScene ? "bg-white/30" : "bg-white/10"}`}
              />
            ))}
          </div>

          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
            {scene.dialogue && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase mb-1">Diálogo</p>
                <p className="text-sm text-white italic">"{scene.dialogue}"</p>
                {scene.audio_url && (
                  <button onClick={() => new Audio(scene.audio_url).play()} className="mt-1 flex items-center gap-1 text-xs text-yellow-400 hover:text-yellow-300">
                    <Play className="w-3 h-3" /> Reproducir voz
                  </button>
                )}
              </div>
            )}
            {scene.action && (
              <div>
                <p className="text-[10px] text-gray-600 uppercase mb-1">Acción</p>
                <p className="text-xs text-gray-300">{scene.action}</p>
              </div>
            )}
          </div>

          {(project.synopsis || project.moral_lesson) && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-pink-500/10 border border-yellow-500/20">
              {project.synopsis && <p className="text-xs text-gray-400 mb-1">{project.synopsis}</p>}
              {project.moral_lesson && (
                <p className="text-sm text-yellow-300 font-medium">✨ {project.moral_lesson}</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}