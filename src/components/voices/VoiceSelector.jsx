import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronDown, ChevronUp, Mic, Sparkles, Star, Search } from "lucide-react";
import VoiceCard from "./VoiceCard";
import VoiceRecorder from "./VoiceRecorder";
import { AI_VOICES, FAMOUS_VOICES } from "./VoiceLibraryData";

const TABS = [
  { id: "custom", label: "Personalizadas", icon: Mic, color: "text-violet-400" },
  { id: "ai", label: "IA", icon: Sparkles, color: "text-pink-400" },
  { id: "famous", label: "Famosos & Ficción", icon: Star, color: "text-amber-400" },
];

export default function VoiceSelector({ selectedVoice, onSelect, characterName }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("ai");
  const [search, setSearch] = useState("");
  const [showRecorder, setShowRecorder] = useState(false);

  const { data: customVoices = [], refetch } = useQuery({
    queryKey: ["custom_voices"],
    queryFn: () => base44.entities.CustomVoice.list("-created_date"),
  });

  const filter = (list) =>
    search.trim()
      ? list.filter(v =>
          v.name.toLowerCase().includes(search.toLowerCase()) ||
          v.description?.toLowerCase().includes(search.toLowerCase()) ||
          v.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()))
        )
      : list;

  const handleSelect = (voice) => {
    onSelect(voice);
    setOpen(false);
  };

  const selectedLabel = selectedVoice
    ? `${selectedVoice.avatar_emoji || "🎙️"} ${selectedVoice.name}`
    : "Seleccionar voz...";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-white/5 border border-white/10 hover:border-violet-500/40 rounded-xl text-sm text-white transition-all"
      >
        <span className={selectedVoice ? "text-white" : "text-gray-500"}>{selectedLabel}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-[#12121a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden" style={{ maxHeight: "520px" }}>
          {/* Tabs */}
          <div className="flex border-b border-white/10">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all ${
                  tab === t.id ? `${t.color} border-b-2 border-current bg-white/5` : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <t.icon className="w-3.5 h-3.5" />
                {t.label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "440px" }}>
            {/* Search */}
            {tab !== "custom" && (
              <div className="p-3 border-b border-white/5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar voces..."
                    className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>
            )}

            <div className="p-3 space-y-2">
              {/* Custom voices tab */}
              {tab === "custom" && (
                <>
                  <button
                    onClick={() => setShowRecorder(!showRecorder)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-violet-500/30 text-violet-400 text-sm hover:bg-violet-500/5 transition-all"
                  >
                    <Mic className="w-4 h-4" /> + Grabar nueva voz personalizada
                  </button>
                  {showRecorder && (
                    <VoiceRecorder onSaved={() => { refetch(); setShowRecorder(false); }} />
                  )}
                  {customVoices.length === 0 && !showRecorder && (
                    <div className="text-center text-gray-500 text-xs py-8">
                      <Mic className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>No tienes voces personalizadas aún.</p>
                      <p>¡Graba la voz de alguien especial!</p>
                    </div>
                  )}
                  {customVoices.map(v => (
                    <VoiceCard
                      key={v.id}
                      voice={{ ...v, category: "custom", openai_voice: v.openai_voice || "nova" }}
                      isSelected={selectedVoice?.id === v.id}
                      onSelect={handleSelect}
                      compact
                    />
                  ))}
                </>
              )}

              {/* AI voices tab */}
              {tab === "ai" && (
                filter(AI_VOICES).length === 0
                  ? <div className="text-center text-gray-500 text-xs py-8">Sin resultados</div>
                  : filter(AI_VOICES).map((v, i) => (
                    <VoiceCard
                      key={i}
                      voice={v}
                      isSelected={selectedVoice?.name === v.name}
                      onSelect={handleSelect}
                      compact
                    />
                  ))
              )}

              {/* Famous voices tab */}
              {tab === "famous" && (
                filter(FAMOUS_VOICES).length === 0
                  ? <div className="text-center text-gray-500 text-xs py-8">Sin resultados</div>
                  : filter(FAMOUS_VOICES).map((v, i) => (
                    <VoiceCard
                      key={i}
                      voice={v}
                      isSelected={selectedVoice?.name === v.name}
                      onSelect={handleSelect}
                      compact
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}