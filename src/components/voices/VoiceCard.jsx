import React, { useState } from "react";
import { Play, Trash2, Copy, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function VoiceCard({ voice, isCustom = false, onDelete }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = React.useRef(null);

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(voice.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-gradient-to-br from-white/5 to-white/10 rounded-xl p-4 border border-white/10 hover:border-violet-500/30 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">{voice.avatar_emoji || "🎤"}</span>
            <div>
              <h4 className="font-semibold text-white truncate">{voice.name}</h4>
              {voice.category && (
                <p className="text-xs text-gray-500">
                  {voice.category === "ai_generated" ? "IA Generada" : "Famosos"}
                </p>
              )}
            </div>
          </div>
          {voice.personality && (
            <p className="text-xs text-gray-400 mt-2">{voice.personality}</p>
          )}
        </div>
        {isCustom && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(voice.id)}
            className="text-gray-400 hover:text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {voice.description && (
        <p className="text-xs text-gray-500 mb-3 line-clamp-2">
          {voice.description}
        </p>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handlePlay}
          size="sm"
          className="flex-1 gap-1 bg-violet-600 hover:bg-violet-500"
        >
          <Play className="w-3 h-3" />
          {isPlaying ? "Reproduciendo" : "Escuchar"}
        </Button>
        <Button
          onClick={handleCopy}
          size="sm"
          variant="outline"
          className="px-2"
        >
          {copied ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </Button>
      </div>

      <audio
        ref={audioRef}
        src={voice.audio_url || voice.sample_audio_url}
        onEnded={handleAudioEnd}
      />
    </motion.div>
  );
}