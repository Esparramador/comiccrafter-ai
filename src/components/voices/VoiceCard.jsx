import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Play, Square, Loader2, Check } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function VoiceCard({ voice, isSelected, onSelect, compact = false }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef(null);

  const handlePreview = async (e) => {
    e.stopPropagation();
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    setIsLoading(true);
    try {
      const sampleText = voice.sample_text || `Hola, soy ${voice.name}. Esta es mi voz.`;
      const res = await base44.functions.invoke("generateSpeech", {
        text: sampleText,
        voice: voice.openai_voice || "nova",
        speed: voice.speed || 1.0
      });
      const url = res.data?.audio_url;
      if (!url) throw new Error("No audio URL");
      if (audioRef.current) { audioRef.current.pause(); }
      audioRef.current = new Audio(url);
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <div
        onClick={() => onSelect(voice)}
        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-all ${
          isSelected
            ? "border-violet-500 bg-violet-500/10"
            : "border-white/10 bg-white/5 hover:border-violet-500/40 hover:bg-white/8"
        }`}
      >
        <span className="text-2xl">{voice.avatar_emoji || "🎙️"}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-white truncate">{voice.name}</div>
          <div className="text-xs text-gray-500 truncate">{voice.description?.slice(0, 50)}...</div>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-400 hover:text-white" onClick={handlePreview}>
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </Button>
          {isSelected && <Check className="w-4 h-4 text-violet-400" />}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(voice)}
      className={`relative p-4 rounded-2xl border cursor-pointer transition-all group ${
        isSelected
          ? "border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10"
          : "border-white/10 bg-white/5 hover:border-violet-500/30 hover:bg-white/8"
      }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-violet-500 flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="flex items-start gap-3 mb-3">
        <span className="text-3xl">{voice.avatar_emoji || "🎙️"}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-white text-sm">{voice.name}</div>
          <div className="text-xs text-gray-400 mt-0.5">{voice.gender === "male" ? "♂" : voice.gender === "female" ? "♀" : "⚥"} · {voice.age_range?.replace("_", " ")} · {voice.nationality}</div>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-3 leading-relaxed line-clamp-2">{voice.description}</p>
      {voice.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {voice.tags.slice(0, 3).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500">{t}</span>
          ))}
        </div>
      )}
      <Button
        size="sm"
        variant="outline"
        className="w-full border-white/10 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg gap-2 h-8 text-xs"
        onClick={handlePreview}
      >
        {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isPlaying ? <><Square className="w-3.5 h-3.5" /> Detener</> : <><Play className="w-3.5 h-3.5" /> Escuchar muestra</>}
      </Button>
    </div>
  );
}