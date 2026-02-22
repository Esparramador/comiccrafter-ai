import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2, Volume2, VolumeX } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function FrameAudioPlayer({ frame, voiceProfile }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState(frame?.audio_url || null);
  const audioRef = useRef(null);

  if (!frame?.dialogue && !frame?.sound_effect) return null;

  const handlePlay = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    // If we already have a generated URL, just play it
    if (audioUrl) {
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // Generate speech
    setIsLoading(true);
    const text = [frame.dialogue, frame.sound_effect].filter(Boolean).join(" — ");
    const voice = voiceProfile?.openai_voice || "nova";
    const speed = voiceProfile?.speed || 1.0;
    try {
      const res = await base44.functions.invoke("generateSpeech", { text, voice, speed });
      const url = res.data?.audio_url;
      if (!url) throw new Error("No audio");
      setAudioUrl(url);
      if (audioRef.current) audioRef.current.pause();
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handlePlay}
      className="border-white/10 text-gray-300 hover:text-white gap-1.5 text-xs rounded-lg h-7 px-2.5"
      title={voiceProfile ? `Voz: ${voiceProfile.name}` : "Reproducir diálogo"}
    >
      {isLoading
        ? <Loader2 className="w-3 h-3 animate-spin" />
        : isPlaying
          ? <><Square className="w-3 h-3" /> Parar</>
          : <><Volume2 className="w-3 h-3" /> Escuchar</>
      }
    </Button>
  );
}