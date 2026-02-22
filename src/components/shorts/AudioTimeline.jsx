import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

export default function AudioTimeline({ frames, onAudioAssign, onAudioRemove }) {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const timelineRef = useRef(null);
  const frameDuration = 1; // 1 segundo por fotograma

  const handlePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleTimelineClick = (frameNum) => {
    setSelectedFrame(frameNum);
    setCurrentTime(frameNum * frameDuration);
    if (audioRef.current) {
      audioRef.current.currentTime = currentTime;
    }
  };

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };
    const handleEnded = () => {
      setPlaying(false);
    };

    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener("timeupdate", handleTimeUpdate);
      audio.addEventListener("ended", handleEnded);
      return () => {
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  const totalDuration = frames.length * frameDuration;
  const progress = (currentTime / totalDuration) * 100;

  return (
    <div className="space-y-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-violet-400" />
          Línea de Tiempo de Audio
        </h3>
        <div className="text-xs text-gray-500">
          {Math.floor(currentTime)}s / {Math.floor(totalDuration)}s
        </div>
      </div>

      {/* Timeline visualization */}
      <div ref={timelineRef} className="space-y-2">
        {/* Frame markers */}
        <div className="flex gap-0.5 h-20 bg-black/30 rounded-lg p-2 overflow-x-auto">
          {frames.map((frame, idx) => (
            <motion.button
              key={idx}
              onClick={() => handleTimelineClick(idx)}
              whileHover={{ scale: 1.05 }}
              className={`flex-shrink-0 w-12 rounded-md border-2 overflow-hidden transition-all cursor-pointer ${
                selectedFrame === idx
                  ? "border-violet-500 ring-2 ring-violet-500/50"
                  : "border-white/10 hover:border-white/20"
              }`}
              title={`Frame ${frame.frame_number}`}
            >
              <img
                src={frame.image_url}
                alt={`F${frame.frame_number}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[9px] text-white text-center py-0.5">
                F{frame.frame_number}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.05 }}
          />
        </div>
      </div>

      {/* Frame audio assignment */}
      {selectedFrame !== null && frames[selectedFrame] && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border border-violet-500/20 bg-violet-500/10"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-white">
              Frame {frames[selectedFrame].frame_number}
            </p>
            {frames[selectedFrame].dialogue && (
              <span className="text-xs text-violet-300">
                Diálogo: "{frames[selectedFrame].dialogue}"
              </span>
            )}
          </div>

          <div className="space-y-2">
            {frames[selectedFrame].voiceUrl && (
              <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                <span className="text-xs text-gray-300">Voz grabada</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAudioRemove(selectedFrame)}
                  className="w-6 h-6 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
            {frames[selectedFrame].soundEffectUrl && (
              <div className="flex items-center justify-between p-2 bg-black/30 rounded-lg">
                <span className="text-xs text-yellow-300">Efecto de sonido</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onAudioRemove(selectedFrame, "sfx")}
                  className="w-6 h-6 text-gray-400 hover:text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePlay}
          className="border-violet-500/20 text-violet-400 hover:bg-violet-500/10 gap-1.5"
        >
          {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {playing ? "Pausar" : "Reproducir"}
        </Button>
        <div className="text-xs text-gray-500">
          Sincronización de diálogos y efectos de sonido
        </div>
      </div>

      <audio ref={audioRef} className="hidden" />
    </div>
  );
}