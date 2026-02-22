import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function AudioPreviewPanel({ short, frames }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [audioTracks, setAudioTracks] = useState([]);
  const audioRef = useRef(null);
  const frameIntervalRef = useRef(null);

  useEffect(() => {
    // Cargar pistas de audio de los fotogramas
    const tracks = frames.map((frame, idx) => ({
      frame: idx,
      voice: frame.voiceUrl,
      sfx: frame.soundEffectUrl,
      duration: 1 // 1 segundo por fotograma
    }));
    setAudioTracks(tracks);
  }, [frames]);

  const handlePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      clearInterval(frameIntervalRef.current);
    } else {
      setIsPlaying(true);
      setCurrentFrame(0);
      // Simular reproducción de fotogramas
      frameIntervalRef.current = setInterval(() => {
        setCurrentFrame((prev) => {
          if (prev >= frames.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000); // 1 fotograma por segundo
    }
  };

  const downloadMix = async () => {
    // Aquí iría la lógica para descargar el mix de audio
    console.log("Descargando mix de audio...");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/5"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Volume2 className="w-5 h-5 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">
            Previsualizar con Audio
          </h3>
        </div>
        <div className="text-xs text-gray-500">
          Frame {currentFrame + 1} / {frames.length}
        </div>
      </div>

      {/* Current frame with audio info */}
      <div className="mb-4 p-3 bg-black/30 rounded-lg">
        <div className="text-xs text-gray-400 mb-2">
          Fotograma {frames[currentFrame]?.frame_number}
        </div>
        <div className="space-y-1">
          {frames[currentFrame]?.voiceUrl && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-green-300">Voz: Presente</span>
            </div>
          )}
          {frames[currentFrame]?.soundEffectUrl && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-yellow-500" />
              <span className="text-xs text-yellow-300">SFX: Presente</span>
            </div>
          )}
          {!frames[currentFrame]?.voiceUrl && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gray-600" />
              <span className="text-xs text-gray-500">Sin voz grabada</span>
            </div>
          )}
        </div>
      </div>

      {/* Playback controls */}
      <div className="flex items-center gap-2">
        <Button
          onClick={handlePlay}
          className="bg-violet-600 hover:bg-violet-500 text-white gap-2 rounded-lg"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pausar reproducción
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Previsualizar con Audio
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={downloadMix}
          className="border-violet-500/20 text-violet-300 hover:bg-violet-500/10 gap-1.5"
        >
          <Download className="w-3.5 h-3.5" />
          Descargar Mix
        </Button>
      </div>

      {/* Audio tracks info */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <p className="text-xs text-gray-600 mb-2">Pistas de audio:</p>
        <div className="text-xs text-gray-500 space-y-1">
          <div>✓ {audioTracks.filter(t => t.voice).length} fotogramas con voz</div>
          <div>✓ {audioTracks.filter(t => t.sfx).length} fotogramas con efectos</div>
        </div>
      </div>
    </motion.div>
  );
}