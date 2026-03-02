import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Mic2, PlayCircle, BrainCircuit, UserPlus, Loader2, Music, Upload, Volume2, VolumeX, Settings2, PauseCircle, Wand2 } from "lucide-react";
import { Character } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AIProgress from "@/components/ai-progress";
import { CreditBadge, useCredits } from "@/lib/credits";

interface ElevenVoice {
  voice_id: string;
  name: string;
  category: string;
  preview_url: string;
}

export default function VoiceStudio() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { checkCredits, PaywallModal, refreshUser } = useCredits();
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [ttsText, setTtsText] = useState("");
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stability, setStability] = useState([0.5]);
  const [similarity, setSimilarity] = useState([0.75]);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);

  const { data: characters = [], isLoading: loadingChars } = useQuery<Character[]>({
    queryKey: ["/api/characters"],
  });

  const { data: voices = [], isLoading: loadingVoices } = useQuery<ElevenVoice[]>({
    queryKey: ["/api/voices"],
  });

  const selectedVoice = voices.find(v => v.voice_id === selectedVoiceId);

  useEffect(() => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.onplay = () => setIsPreviewPlaying(true);
      audioPreviewRef.current.onpause = () => setIsPreviewPlaying(false);
      audioPreviewRef.current.onended = () => setIsPreviewPlaying(false);
    }
  }, []);

  const handlePlayPreview = () => {
    if (!selectedVoice?.preview_url || !audioPreviewRef.current) return;
    if (isPreviewPlaying) {
      audioPreviewRef.current.pause();
    } else {
      audioPreviewRef.current.src = selectedVoice.preview_url;
      audioPreviewRef.current.play().catch(err => console.log("Audio preview failed:", err));
    }
  };

  const updateVoiceMutation = useMutation({
    mutationFn: async ({ charId, voiceId }: { charId: number; voiceId: string }) => {
      const token = localStorage.getItem("cc_token");
      const res = await fetch(`/api/characters/${charId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ voice: voiceId }),
      });
      if (!res.ok) throw new Error("Failed to update voice");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/characters"] });
      toast({ title: "Voz asignada", description: "El personaje ahora tiene una voz de ElevenLabs." });
    },
  });

  const handleGenerateTTS = async () => {
    if (!selectedVoiceId || !ttsText) {
      toast({ title: "Error", description: "Selecciona una voz y escribe un texto.", variant: "destructive" });
      return;
    }

    if (!checkCredits("generate-voice")) return;
    setIsGenerating(true);
    try {
      const token = localStorage.getItem("cc_token");
      const res = await fetch("/api/ai/generate-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          voiceId: selectedVoiceId,
          text: ttsText,
          stability: stability[0],
          similarity: similarity[0],
        }),
      });

      if (res.status === 402) {
        const errData = await res.json();
        throw new Error(errData.error || "Créditos insuficientes");
      }
      if (!res.ok) throw new Error("Error generando audio");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      refreshUser();
      toast({ title: "Audio generado", description: "Puedes escucharlo ahora." });
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full animate-in fade-in duration-500 bg-[#0B0D17]" data-testid="voice-studio-page">
      <audio ref={audioPreviewRef} className="hidden" />

      <div className="flex-1 flex flex-col border-r border-white/5 overflow-y-auto">
        <div className="p-6 border-b border-white/5 bg-[#111322]/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Mic2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{t("voice.title")}</h1>
              <p className="text-xs text-white/40">{t("voice.subtitle")}</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-400" /> {t("characters.title")}
            </h2>
            <span className="text-[10px] text-white/30 font-mono">{characters.length} {t("characters.title").toLowerCase()}</span>
          </div>

          {loadingChars ? (
            <div className="flex justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : characters.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                <UserPlus className="w-8 h-8 text-white/20" />
              </div>
              <p className="text-sm text-white/40">{t("characters.noCharacters")}</p>
              <p className="text-xs text-white/25">{t("voice.createCharactersFirst")}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {characters.map((char) => {
                const assignedVoice = voices.find(v => v.voice_id === char.voice);
                return (
                  <div
                    key={char.id}
                    className="p-4 bg-[#111322]/80 border border-white/5 rounded-xl backdrop-blur-sm hover:border-purple-500/30 transition-all group"
                    data-testid={`card-character-${char.id}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        {char.photoUrls && char.photoUrls.length > 0 ? (
                          <img src={char.photoUrls[0]} alt={char.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-sm">
                            {char.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="text-sm font-bold text-white">{char.name}</h3>
                          <p className="text-[10px] text-white/40">{char.role}</p>
                        </div>
                      </div>
                      {assignedVoice && (
                        <span className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">
                          {assignedVoice.name}
                        </span>
                      )}
                    </div>

                    <div className="space-y-3">
                      <Select
                        value={char.voice === "No asignada" ? "" : char.voice}
                        onValueChange={(val) => updateVoiceMutation.mutate({ charId: char.id, voiceId: val })}
                      >
                        <SelectTrigger className="w-full bg-black/50 border-white/10 text-white/80 text-xs h-9">
                          <SelectValue placeholder={t("voice.assignVoice")} />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111322] border-white/10 text-white/80">
                          {voices.map((v) => (
                            <SelectItem key={v.voice_id} value={v.voice_id} className="text-xs">
                              {v.name} ({v.category})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="bg-black/30 rounded-md p-2.5 border border-white/5">
                        <div className="flex items-center gap-1.5 mb-1 text-[10px] font-medium text-white/30 uppercase tracking-widest">
                          <BrainCircuit className="w-3 h-3 text-purple-400" /> {t("voice.memory")}
                        </div>
                        <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">{char.description || t("voice.noDescription")}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="w-[380px] bg-[#111322]/80 flex flex-col p-6 overflow-y-auto">
        <div className="space-y-6 flex-1">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-5 space-y-5">
            <h2 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-widest">
              <Music className="w-4 h-4 text-purple-500" /> {t("voice.testVoice")}
            </h2>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t("voice.selectVoice")}</label>
              <Select value={selectedVoiceId} onValueChange={setSelectedVoiceId}>
                <SelectTrigger className="bg-black/50 border-white/10 text-white/80 text-sm" data-testid="select-voice">
                  <SelectValue placeholder={t("voice.selectVoice")} />
                </SelectTrigger>
                <SelectContent className="bg-[#111322] border-white/10 text-white/80">
                  {voices.map((v) => (
                    <SelectItem key={v.voice_id} value={v.voice_id}>
                      {v.name} — <span className="text-white/40">{v.category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedVoice?.preview_url && (
                <button
                  onClick={handlePlayPreview}
                  className="flex items-center gap-2 text-xs text-purple-400 hover:text-purple-300 transition-colors mt-1 w-full bg-purple-500/5 rounded-lg px-3 py-2 border border-purple-500/10 hover:border-purple-500/30"
                  data-testid="button-play-preview"
                >
                  {isPreviewPlaying ? (
                    <>
                      <PauseCircle className="w-4 h-4" />
                      <span>{t("voice.pausePreview")}</span>
                      <div className="flex gap-0.5 ml-auto">
                        <div className="w-1 h-3 bg-purple-400 rounded-full animate-pulse" />
                        <div className="w-1 h-4 bg-purple-400 rounded-full animate-pulse delay-75" />
                        <div className="w-1 h-2 bg-purple-400 rounded-full animate-pulse delay-150" />
                        <div className="w-1 h-5 bg-purple-400 rounded-full animate-pulse delay-200" />
                      </div>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-4 h-4" />
                      <span>{t("voice.playPreview")}</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="space-y-4 py-3 border-y border-white/5">
              <div className="flex items-center gap-2 text-[10px] font-bold text-white/40 uppercase tracking-widest">
                <Settings2 className="w-3 h-3 text-purple-400" /> {t("voice.parameters")}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">{t("voice.stability")}</span>
                  <span className="text-purple-400 font-mono text-[11px]">{Math.round(stability[0] * 100)}%</span>
                </div>
                <Slider
                  value={stability}
                  onValueChange={setStability}
                  max={1}
                  step={0.01}
                  className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400"
                  data-testid="slider-stability"
                />
                <p className="text-[10px] text-white/25">{t("voice.stabilityDesc")}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">{t("voice.similarity")}</span>
                  <span className="text-purple-400 font-mono text-[11px]">{Math.round(similarity[0] * 100)}%</span>
                </div>
                <Slider
                  value={similarity}
                  onValueChange={setSimilarity}
                  max={1}
                  step={0.01}
                  className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400"
                  data-testid="slider-similarity"
                />
                <p className="text-[10px] text-white/25">{t("voice.similarityDesc")}</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t("voice.textToVoice")}</label>
              <Textarea
                placeholder={t("voice.textPlaceholder")}
                className="min-h-[100px] bg-black/50 border-white/10 text-white placeholder:text-white/20 text-sm focus-visible:ring-purple-500 resize-none"
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                data-testid="input-tts-text"
              />
              <div className="flex justify-between text-[10px] text-white/25">
                <span>{ttsText.length} {t("voice.characters")}</span>
                <span>{ttsText.split(/\s+/).filter(Boolean).length} {t("voice.words")}</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                className="w-full gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.3)] h-12 font-bold tracking-wide"
                onClick={handleGenerateTTS}
                disabled={isGenerating || !selectedVoiceId || !ttsText}
                data-testid="button-generate-voice"
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                {isGenerating ? t("voice.synthesizing") : t("voice.generateVoice")}
              </Button>
              <div className="flex justify-center mt-2">
                <CreditBadge service="generate-voice" />
              </div>

              <AIProgress isActive={isGenerating} type="voice" estimatedSeconds={15} />
            </div>

            {audioUrl && (
              <div className="pt-3 border-t border-white/5 space-y-2">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{t("voice.result")}</label>
                <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                  <audio controls className="w-full h-10" data-testid="audio-result">
                    <source src={audioUrl} type="audio/mpeg" />
                  </audio>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5 space-y-3 opacity-40">
            <h2 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-widest">
              <Upload className="w-4 h-4 text-purple-400" /> {t("voice.cloning")}
            </h2>
            <p className="text-xs text-white/40 leading-relaxed">
              {t("voice.cloningDesc")}
            </p>
            <Button variant="outline" className="w-full gap-2 border-white/10 text-white/30 bg-transparent" disabled data-testid="button-upload-samples">
              {t("common.comingSoon")}
            </Button>
          </div>
        </div>
      </div>
    <PaywallModal />
    </div>
  );
}
