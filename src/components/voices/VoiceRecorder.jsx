import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Mic, Square, Play, Trash2, Upload } from "lucide-react";
import { motion } from "framer-motion";

export default function VoiceRecorder({ onVoiceRecorded }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [voiceDescription, setVoiceDescription] = useState("");
  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: "audio/mp3" });
        setRecordedBlob(blob);
      };

      mediaRecorder.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("No se pudo acceder al micrófono. Verifica los permisos.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  const playRecording = () => {
    if (recordedBlob) {
      const audio = new Audio(URL.createObjectURL(recordedBlob));
      audio.play();
    }
  };

  const discardRecording = () => {
    setRecordedBlob(null);
    setVoiceName("");
    setVoiceDescription("");
  };

  const saveVoice = async () => {
    if (!recordedBlob || !voiceName.trim()) {
      alert("Por favor, graba una voz y asigna un nombre");
      return;
    }

    try {
      setIsProcessing(true);
      const { file_url } = await base44.integrations.Core.UploadFile({
        file: recordedBlob
      });

      await base44.entities.CustomVoice.create({
        name: voiceName,
        description: voiceDescription,
        audio_url: file_url,
        duration_seconds: Math.round(recordedBlob.size / 16000),
        openai_voice: "alloy"
      });

      setRecordedBlob(null);
      setVoiceName("");
      setVoiceDescription("");
      onVoiceRecorded?.();
      alert("¡Voz guardada exitosamente!");
    } catch (error) {
      console.error("Error saving voice:", error);
      alert("Error al guardar la voz");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white/5 to-white/10 rounded-2xl p-6 border border-violet-500/20"
    >
      <h3 className="text-lg font-semibold mb-4">Grabar Nueva Voz</h3>

      {!recordedBlob ? (
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
              isRecording
                ? "bg-red-600 hover:bg-red-700"
                : "bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
            }`}
          >
            {isRecording ? (
              <>
                <Square className="w-5 h-5" />
                Detener Grabación
              </>
            ) : (
              <>
                <Mic className="w-5 h-5" />
                Comenzar Grabación
              </>
            )}
          </motion.button>

          {isRecording && (
            <motion.div
              animate={{ opacity: [0.5, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
              className="text-center text-red-500 font-semibold"
            >
              Grabando...
            </motion.div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-sm text-gray-400 mb-2">Vista previa:</p>
            <Button
              onClick={playRecording}
              variant="outline"
              className="w-full gap-2"
            >
              <Play className="w-4 h-4" />
              Reproducir
            </Button>
          </div>

          <input
            type="text"
            placeholder="Nombre de la voz (ej: Mi voz, Papá, Héroe)"
            value={voiceName}
            onChange={(e) => setVoiceName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />

          <textarea
            placeholder="Descripción (opcional)"
            value={voiceDescription}
            onChange={(e) => setVoiceDescription(e.target.value)}
            rows="2"
            className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
          />

          <div className="flex gap-2">
            <Button
              onClick={discardRecording}
              variant="outline"
              className="flex-1 gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Descartar
            </Button>
            <Button
              onClick={saveVoice}
              disabled={isProcessing || !voiceName.trim()}
              className="flex-1 gap-2 bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? "Guardando..." : "Guardar Voz"}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}