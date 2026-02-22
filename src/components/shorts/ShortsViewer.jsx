import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, Pause, SkipBack, SkipForward, Maximize2, Minimize2,
  Film, Download, ArrowLeft, ChevronLeft, ChevronRight,
  Grid3X3, FileText, Zap, Pencil, Volume2
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import FrameEditor from "@/components/editor/FrameEditor";
import FrameAudioPlayer from "@/components/voices/FrameAudioPlayer";

const emotionColors = {
  tense: "text-red-400", excited: "text-yellow-400", sad: "text-blue-400",
  triumphant: "text-emerald-400", mysterious: "text-violet-400", romantic: "text-pink-400",
  default: "text-gray-400"
};

export default function ShortsViewer({ short: initialShort, onBack }) {
  const [short, setShort] = useState(initialShort);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [showScript, setShowScript] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [fps, setFps] = useState(2); // frames per second for autoplay
  const intervalRef = useRef(null);

  const handleFrameSave = async (updatedFrame) => {
    const newFrames = short.generated_frames.map(f =>
      f.frame_number === updatedFrame.frame_number ? updatedFrame : f
    );
    const updatedShort = { ...short, generated_frames: newFrames };
    await base44.entities.AnimatedShort.update(short.id, updatedShort);
    setShort(updatedShort);
    setShowEditor(false);
  };

  const frames = short.generated_frames || [];
  const total = frames.length;
  const frame = frames[current];

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        setCurrent(prev => {
          if (prev >= total - 1) { setPlaying(false); return prev; }
          return prev + 1;
        });
      }, 1000 / fps);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [playing, fps, total]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") setCurrent(p => Math.min(p + 1, total - 1));
      if (e.key === "ArrowLeft") setCurrent(p => Math.max(p - 1, 0));
      if (e.key === " ") { e.preventDefault(); setPlaying(p => !p); }
      if (e.key === "Escape") setFullscreen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [total]);

  const downloadScript = () => {
    let text = `${short.title}\n${"=".repeat(short.title?.length || 10)}\n`;
    text += `\nGénero: ${short.genre || ""}\nSinopsis: ${short.synopsis || ""}\n\n${"─".repeat(50)}\n\n`;
    frames.forEach(f => {
      text += `FOTOGRAMA ${f.frame_number}\n${"─".repeat(30)}\n`;
      text += `Cámara: ${f.camera_angle || ""}\nAcción: ${f.action || ""}\n`;
      text += `Escena: ${f.scene_description || ""}\n`;
      if (f.dialogue) text += `Diálogo: ${f.dialogue}\n`;
      if (f.sound_effect) text += `SFX: ${f.sound_effect}\n`;
      text += `Transición: ${f.transition || ""} | Emoción: ${f.emotional_beat || ""}\n\n`;
    });
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${short.title || "corto"}_guion.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFrames = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    const folder = zip.folder(short.title || "corto");
    if (short.cover_image_url) {
      const res = await fetch(short.cover_image_url);
      folder.file("00_Portada.png", await res.blob());
    }
    for (const f of frames) {
      const res = await fetch(f.image_url);
      folder.file(`Frame_${String(f.frame_number).padStart(2, "0")}.png`, await res.blob());
    }
    let scriptText = `${short.title}\n\n`;
    frames.forEach(f => { scriptText += `FRAME ${f.frame_number}\n${f.action || ""}\n${f.dialogue || ""}\n\n`; });
    folder.file("guion.txt", scriptText);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${short.title || "corto"}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const emotionColor = frame ? (emotionColors[frame.emotional_beat] || emotionColors.default) : emotionColors.default;

  return (
    <div className={`min-h-screen ${fullscreen ? "fixed inset-0 z-50 bg-black" : "pb-20"}`}>
      <div className={`${fullscreen ? "h-screen flex flex-col" : "max-w-5xl mx-auto px-4 sm:px-6 py-6"}`}>

        {/* Header */}
        {!fullscreen && (
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={onBack} className="text-gray-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-white truncate">{short.title}</h1>
              <p className="text-xs text-gray-500">{short.genre} · {total} fotogramas · {short.style}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowScript(!showScript)} className="border-white/10 text-gray-300 hover:text-white gap-1.5 text-xs rounded-xl">
                <FileText className="w-3.5 h-3.5" /> Guion
              </Button>
              <Button variant="outline" size="sm" onClick={downloadFrames} className="border-white/10 text-gray-300 hover:text-white gap-1.5 text-xs rounded-xl">
                <Download className="w-3.5 h-3.5" /> ZIP
              </Button>
              <Button variant="outline" size="sm" onClick={downloadScript} className="border-white/10 text-gray-300 hover:text-white gap-1.5 text-xs rounded-xl">
                <FileText className="w-3.5 h-3.5" /> .txt
              </Button>
            </div>
          </div>
        )}

        {/* Script overlay */}
        <AnimatePresence>
          {showScript && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-2xl border border-white/5 bg-white/[0.03] max-h-64 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-white">Guion del Corto</h3>
                <button onClick={() => setShowScript(false)} className="text-gray-500 hover:text-gray-300 text-xs">✕</button>
              </div>
              <p className="text-xs text-gray-500 mb-3 italic">{short.synopsis}</p>
              <div className="space-y-3">
                {frames.map(f => (
                  <div key={f.frame_number} onClick={() => { setCurrent(f.frame_number - 1); setShowScript(false); }}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${current === f.frame_number - 1 ? "border-pink-500/40 bg-pink-500/10" : "border-white/5 hover:border-white/10"}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-pink-400">F{f.frame_number}</span>
                      <span className="text-[10px] text-gray-600">{f.camera_angle}</span>
                      <span className={`text-[10px] ml-auto ${emotionColors[f.emotional_beat] || emotionColors.default}`}>{f.emotional_beat}</span>
                    </div>
                    {f.action && <p className="text-xs text-gray-400">{f.action}</p>}
                    {f.dialogue && <p className="text-xs text-white/70 italic mt-1">"{f.dialogue}"</p>}
                    {f.sound_effect && <p className="text-xs text-yellow-400/70 font-bold mt-1">{f.sound_effect}</p>}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid view */}
        <AnimatePresence>
          {showGrid && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02]"
            >
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {short.cover_image_url && (
                  <button onClick={() => { setCurrent(-1); setShowGrid(false); }}
                    className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 ${current === -1 ? "border-pink-500" : "border-white/5"}`}
                  >
                    <img src={short.cover_image_url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white bg-black/50 py-0.5">Cover</span>
                  </button>
                )}
                {frames.map((f, i) => (
                  <button key={i} onClick={() => { setCurrent(i); setShowGrid(false); }}
                    className={`relative aspect-[9/16] rounded-lg overflow-hidden border-2 ${current === i ? "border-pink-500" : "border-white/5"}`}
                  >
                    <img src={f.image_url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-0 right-0 text-center text-[9px] text-white bg-black/50 py-0.5">F{f.frame_number}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main viewer */}
        <div className={`flex flex-col lg:flex-row gap-4 ${fullscreen ? "flex-1 px-4 pb-4" : ""}`}>
          {/* Frame display */}
          <div className="flex-1 min-w-0">
            <div className="relative rounded-2xl overflow-hidden bg-black border border-white/5">
              {/* Progress bar */}
              <div className="h-1 bg-white/5">
                <motion.div className="h-full bg-gradient-to-r from-pink-500 to-violet-500"
                  animate={{ width: `${total > 0 ? ((current + 1) / total) * 100 : 0}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={current}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  <img
                    src={current === -1 ? short.cover_image_url : frame?.image_url}
                    alt=""
                    className="w-full object-contain max-h-[70vh]"
                  />

                  {/* Overlay info */}
                  {frame && current >= 0 && (
                    <>
                      {/* Top tags */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-gray-300 backdrop-blur-sm">
                          {frame.camera_angle}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md bg-black/60 text-[10px] backdrop-blur-sm ${emotionColor}`}>
                          {frame.emotional_beat}
                        </span>
                      </div>

                      {/* Frame counter */}
                      <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white backdrop-blur-sm">
                        {current + 1} / {total}
                      </div>

                      {/* Dialogue */}
                      {frame.dialogue && (
                        <div className="absolute bottom-16 left-4 right-4">
                          <div className="bg-black/75 backdrop-blur-sm border border-white/10 rounded-xl px-4 py-2.5 text-center">
                            <p className="text-sm text-white font-medium leading-snug">"{frame.dialogue}"</p>
                          </div>
                        </div>
                      )}

                      {/* SFX */}
                      {frame.sound_effect && (
                        <div className="absolute top-12 right-3">
                          <span className="text-yellow-400 font-black text-sm" style={{ textShadow: "0 0 10px rgba(250,204,21,0.6)" }}>
                            {frame.sound_effect}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Controls overlay */}
              <div className="p-3 bg-black/60 backdrop-blur-sm flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => setCurrent(0)} className="text-gray-400 hover:text-white w-8 h-8">
                  <SkipBack className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrent(p => Math.max(p - 1, 0))} className="text-gray-400 hover:text-white w-8 h-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setPlaying(p => !p)}
                  className="w-10 h-10 bg-pink-500/20 hover:bg-pink-500/40 text-pink-400 rounded-full"
                >
                  {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrent(p => Math.min(p + 1, total - 1))} className="text-gray-400 hover:text-white w-8 h-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setCurrent(total - 1)} className="text-gray-400 hover:text-white w-8 h-8">
                  <SkipForward className="w-4 h-4" />
                </Button>

                <div className="flex items-center gap-1.5 ml-1">
                  <Zap className="w-3 h-3 text-gray-600" />
                  {[1, 2, 4].map(s => (
                    <button key={s} onClick={() => setFps(s)}
                      className={`text-[10px] px-1.5 py-0.5 rounded ${fps === s ? "bg-pink-500/30 text-pink-400" : "text-gray-600 hover:text-gray-400"}`}
                    >{s}fps</button>
                  ))}
                </div>

                <div className="ml-auto flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setShowEditor(true)} className="text-gray-400 hover:text-pink-300 w-8 h-8" title="Editar fotograma">
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setShowGrid(!showGrid)} className="text-gray-400 hover:text-white w-8 h-8">
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setFullscreen(!fullscreen)} className="text-gray-400 hover:text-white w-8 h-8">
                    {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>

            {/* Filmstrip */}
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {frames.map((f, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`flex-shrink-0 w-14 aspect-video rounded-lg overflow-hidden border-2 transition-all ${current === i ? "border-pink-500" : "border-white/5 hover:border-white/20"}`}
                >
                  <img src={f.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Frame Editor Modal */}
      <AnimatePresence>
        {showEditor && frame && (
          <FrameEditor
            frame={frame}
            onSave={handleFrameSave}
            onClose={() => setShowEditor(false)}
          />
        )}
      </AnimatePresence>

      {/* Info panel */}
          {!fullscreen && frame && (
            <div className="lg:w-64 space-y-3 flex-shrink-0">
              {/* Current frame info */}
              <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-2 mb-3">
                  <Film className="w-4 h-4 text-pink-400" />
                  <span className="text-xs font-semibold text-white">Fotograma {frame.frame_number}</span>
                  <span className={`text-[10px] ml-auto ${emotionColor}`}>{frame.emotional_beat}</span>
                </div>
                <div className="space-y-2">
                  {frame.action && (
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Acción</p>
                      <p className="text-xs text-gray-300 leading-relaxed">{frame.action}</p>
                    </div>
                  )}
                  {frame.dialogue && (
                      <div>
                        <div className="flex items-center justify-between mb-0.5">
                          <p className="text-[10px] text-gray-600 uppercase tracking-wider">Diálogo</p>
                          <FrameAudioPlayer
                            frame={frame}
                            voiceProfile={short.character_descriptions?.find(c =>
                              frame.dialogue?.toLowerCase().includes(c.name?.toLowerCase())
                            )?.voice_profile || (short.character_descriptions?.[0]?.voice_profile)}
                          />
                        </div>
                        <p className="text-xs text-white italic">"{frame.dialogue}"</p>
                      </div>
                    )}
                  {frame.sound_effect && (
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">SFX</p>
                      <p className="text-xs text-yellow-400 font-bold">{frame.sound_effect}</p>
                    </div>
                  )}
                  {frame.transition && (
                    <div>
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-0.5">Transición</p>
                      <p className="text-xs text-gray-500">{frame.transition}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Characters */}
              {short.character_descriptions?.filter(c => c.name).length > 0 && (
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <p className="text-xs font-semibold text-white mb-2">Personajes</p>
                  {short.character_descriptions.filter(c => c.name).map((c, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5">
                      {c.photo_url
                        ? <img src={c.photo_url} className="w-8 h-8 rounded-full object-cover border border-white/10" alt="" />
                        : <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-300 text-xs font-bold">{c.name[0]}</div>
                      }
                      <div>
                        <p className="text-xs font-medium text-white">{c.name}</p>
                        <p className="text-[10px] text-gray-600 line-clamp-1">{c.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {short.synopsis && (
                <div className="p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                  <p className="text-xs font-semibold text-white mb-2">Sinopsis</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{short.synopsis}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}