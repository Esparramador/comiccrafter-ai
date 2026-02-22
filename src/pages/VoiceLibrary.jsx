import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import AuthGuard from "@/components/auth/AuthGuard";
import VoiceRecorder from "@/components/voices/VoiceRecorder";
import VoiceCard from "@/components/voices/VoiceCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

function VoiceLibraryContent() {
  const [predefinedVoices, setPredefinedVoices] = useState([]);
  const [customVoices, setCustomVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadVoices();
  }, []);

  const loadVoices = async () => {
    try {
      setIsLoading(true);
      const [predefined, custom] = await Promise.all([
        base44.entities.VoiceProfile.list(),
        base44.entities.CustomVoice.list()
      ]);
      setPredefinedVoices(predefined || []);
      setCustomVoices(custom || []);
    } catch (error) {
      console.error("Error loading voices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecorded = async (newVoice) => {
    await loadVoices();
  };

  const handleDeleteCustomVoice = async (voiceId) => {
    try {
      await base44.entities.CustomVoice.delete(voiceId);
      setCustomVoices(prev => prev.filter(v => v.id !== voiceId));
    } catch (error) {
      console.error("Error deleting voice:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Librería de Voces</h1>
          <p className="text-gray-400">Selecciona voces predefinidas o graba las tuyas propias para personalizar tus videos</p>
        </div>

        <Tabs defaultValue="predefined" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/5 border border-white/10">
            <TabsTrigger value="predefined">Voces Predefinidas</TabsTrigger>
            <TabsTrigger value="custom">Mis Voces</TabsTrigger>
          </TabsList>

          <TabsContent value="predefined" className="mt-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {predefinedVoices.length > 0 ? (
                predefinedVoices.map(voice => (
                  <VoiceCard key={voice.id} voice={voice} isCustom={false} />
                ))
              ) : (
                <p className="text-gray-500">No hay voces disponibles</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Grabador */}
              <div className="lg:col-span-1">
                <VoiceRecorder onVoiceRecorded={handleVoiceRecorded} />
              </div>

              {/* Voces grabadas */}
              <div className="lg:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Mis Voces Grabadas</h2>
                {customVoices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customVoices.map(voice => (
                      <VoiceCard
                        key={voice.id}
                        voice={voice}
                        isCustom={true}
                        onDelete={handleDeleteCustomVoice}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No has grabado ninguna voz aún. ¡Graba la primera!</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function VoiceLibrary() {
  return (
    <AuthGuard>
      <VoiceLibraryContent />
    </AuthGuard>
  );
}