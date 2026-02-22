import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Save, Trash2, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

const OPENAI_VOICES = [
  { value: "alloy", label: "Alloy – Neutral" },
  { value: "echo", label: "Echo – Masculino" },
  { value: "fable", label: "Fable – Dramático" },
  { value: "onyx", label: "Onyx – Grave" },
  { value: "nova", label: "Nova – Femenino cálido" },
  { value: "shimmer", label: "Shimmer – Femenino suave" },
];

export default function VoiceRecorder({ onSaved }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedVoice, setSelectedVoice] = useState("nova");
  const [emoji, setEmoji] = useState("🎙️");
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunksRef.current = [];
    const mr = new MediaRecorder(stream);
    mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioBlob(blob);
      setAudioUrl(url);
      setDuration(elapsed);
      stream.getTracks().forEach(t => t.stop());
    };
    mr.start();
    mediaRecorderRef.current = mr;
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 500);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) mediaRecorderRef.current.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const playAudio = () => {
    if (!audioUrl) return;
    if (isPlaying && audioRef.current) { audioRef.current.pause(); setIsPlaying(false); return; }
    audioRef.current = new Audio(audioUrl);
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.play();
    setIsPlaying(true);
  };

  const discard = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsed(0);
    setDuration(0);
  };

  const save = async () => {
    if (!audioBlob || !name.trim()) return;
    setIsSaving(true);
    const file = new File([audioBlob], `voice_${Date.now()}.webm`, { type: "audio/webm" });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    const voice = await base44.entities.CustomVoice.create({
      name: name.trim(),
      description,
      audio_url: file_url,
      duration_seconds: duration,
      openai_voice: selectedVoice,
      avatar_emoji: emoji
    });
    setIsSaving(false);
    discard();
    setName("");
    setDescription("");
    if (onSaved) onSaved(voice);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white flex items-center gap-2">
        <Mic className="w-4 h-4 text-violet-400" /> Grabar nueva voz personalizada
      </h3>

      {/* Recording area */}
      <div className="flex flex-col items-center gap-4 py-4">
        {isRecording ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center animate-pulse">
              <Mic className="w-7 h-7 text-red-400" />
            </div>
            <div className="text-red-400 font-mono text-xl">{String(Math.floor(elapsed / 60)).padStart(2, "0")}:{String(elapsed % 60).padStart(2, "0")}</div>
            <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-500 gap-2 rounded-xl">
              <Square className="w-4 h-4" /> Detener grabación
            </Button>
          </div>
        ) : audioBlob ? (
          <div className="w-full space-y-3">
            <div className="flex items-center gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={playAudio} className="border-white/10 text-gray-300 hover:text-white gap-2">
                {isPlaying ? <><Square className="w-3.5 h-3.5" /> Parar</> : <><Play className="w-3.5 h-3.5" /> Reproducir</>}
              </Button>
              <Button variant="ghost" size="sm" onClick={discard} className="text-red-400 hover:text-red-300 gap-2">
                <Trash2 className="w-3.5 h-3.5" /> Descartar
              </Button>
              <span className="text-xs text-gray-500">{duration}s</span>
            </div>
          </div>
        ) : (
          <Button onClick={startRecording} className="bg-violet-600 hover:bg-violet-500 gap-2 rounded-xl px-6">
            <Mic className="w-4 h-4" /> Iniciar grabación
          </Button>
        )}
      </div>

      {/* Form to save */}
      {audioBlob && (
        <div className="space-y-3 pt-2 border-t border-white/10">
          <div className="flex gap-2">
            <input
              value={emoji}
              onChange={e => setEmoji(e.target.value)}
              className="w-14 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-center text-xl"
              placeholder="🎙️"
            />
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Nombre de la voz (ej: Voz de Papá)"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
            />
          </div>
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Descripción opcional"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
          />
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Voz TTS más similar (para generar diálogos)</label>
            <select
              value={selectedVoice}
              onChange={e => setSelectedVoice(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              {OPENAI_VOICES.map(v => <option key={v.value} value={v.value} className="bg-gray-900">{v.label}</option>)}
            </select>
          </div>
          <Button
            onClick={save}
            disabled={!name.trim() || isSaving}
            className="w-full bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 rounded-xl gap-2 disabled:opacity-40"
          >
            {isSaving ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : <><Save className="w-4 h-4" /> Guardar voz personalizada</>}
          </Button>
        </div>
      )}
    </div>
  );
}