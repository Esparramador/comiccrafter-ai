import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, Play, Pause, Volume2, Loader2 } from "lucide-react";

// Curated pre-set voices for children's content and general use
const PRESET_VOICES = [
  // Children & soft voices
  { voice_id: "AZnzlk1XvdvUeBnXmlld", name: "Domi", gender: "female", age: "young", use_case: "narration", accent: "american", description: "Voz joven y clara, ideal para niños" },
  { voice_id: "MF3mGyEYCl7XYWbV9V6O", name: "Elli", gender: "female", age: "young", use_case: "narration", accent: "american", description: "Voz suave y tierna, perfecta para cuentos" },
  { voice_id: "jsCqWAovK2LkecY7zXl4", name: "Freya", gender: "female", age: "young", use_case: "characters", accent: "american", description: "Voz expresiva y jovial" },
  // Narrators
  { voice_id: "21m00Tcm4TlvDq8ikWAM", name: "Rachel", gender: "female", age: "young", use_case: "narration", accent: "american", description: "Narradora cálida y profesional" },
  { voice_id: "ThT5KcBeYPX3keUQqHPh", name: "Dorothy", gender: "female", age: "middle-aged", use_case: "narration", accent: "british", description: "Narradora clásica, estilo cuento" },
  // Male characters
  { voice_id: "pNInz6obpgDQGcFmaJgB", name: "Adam", gender: "male", age: "middle-aged", use_case: "narration", accent: "american", description: "Voz masculina profunda y cálida" },
  { voice_id: "ErXwobaYiN019PkySvjV", name: "Antoni", gender: "male", age: "young", use_case: "characters", accent: "american", description: "Voz joven masculina, entusiasta" },
  { voice_id: "VR6AewLTigWG4xSOukaG", name: "Arnold", gender: "male", age: "middle-aged", use_case: "characters", accent: "american", description: "Voz dramática y expresiva" },
  { voice_id: "D38z5RcWu1voky8WS1ja", name: "Fin", gender: "male", age: "old", use_case: "narration", accent: "irish", description: "Sabio abuelo narrador" },
  // Villains / dramatic
  { voice_id: "oWAxZDx7w5VEj9dCyTzz", name: "Grace", gender: "female", age: "young", use_case: "characters", accent: "southern-us", description: "Dramática y expressiva, perfecta para antagonistas" },
];

function AudioPreview({ previewUrl }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = React.useRef(null);

  const toggle = (e) => {
    e.stopPropagation();
    if (!previewUrl) return;
    if (!audioRef.current) audioRef.current = new Audio(previewUrl);
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
      audioRef.current.onended = () => setPlaying(false);
    }
  };

  if (!previewUrl) return null;
  return (
    <button onClick={toggle} className="w-6 h-6 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all flex-shrink-0">
      {playing ? <Pause className="w-3 h-3 text-white" /> : <Play className="w-3 h-3 text-white" />}
    </button>
  );
}

export default function ElevenLabsVoicePicker({ selectedVoiceId, onSelect, placeholder = "Seleccionar voz ElevenLabs..." }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const selectedVoice = PRESET_VOICES.find(v => v.voice_id === selectedVoiceId);

  const filtered = filter === "all" ? PRESET_VOICES : PRESET_VOICES.filter(v => v.use_case === filter || v.gender === filter);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-white/5 border border-white/10 hover:border-blue-500/40 rounded-xl text-sm text-white transition-all"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <span className={selectedVoice ? "text-white" : "text-gray-500"}>
            {selectedVoice ? `${selectedVoice.name} – ${selectedVoice.description}` : placeholder}
          </span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          {/* Filter tabs */}
          <div className="flex border-b border-white/10 text-xs">
            {[
              { id: "all", label: "Todas" },
              { id: "narration", label: "Narradores" },
              { id: "characters", label: "Personajes" },
              { id: "female", label: "Femeninas" },
              { id: "male", label: "Masculinas" },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-1 py-2.5 font-medium transition-all ${filter === f.id ? "text-blue-400 border-b-2 border-blue-400 bg-white/5" : "text-gray-500 hover:text-gray-300"}`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="max-h-72 overflow-y-auto p-2 space-y-1">
            {filtered.map(v => (
              <button
                key={v.voice_id}
                onClick={() => { onSelect(v.voice_id); setOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  selectedVoiceId === v.voice_id ? "bg-blue-500/20 border border-blue-500/30" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm ${
                  v.gender === "female" ? "bg-pink-500/20 text-pink-300" : "bg-blue-500/20 text-blue-300"
                }`}>
                  {v.gender === "female" ? "♀" : "♂"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-white font-medium">{v.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">{v.use_case}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{v.description}</p>
                </div>
                <AudioPreview previewUrl={null} />
              </button>
            ))}
          </div>

          <div className="p-2 border-t border-white/5">
            <p className="text-[10px] text-gray-600 text-center">Powered by ElevenLabs • Multilingüe v2</p>
          </div>
        </div>
      )}
    </div>
  );
}