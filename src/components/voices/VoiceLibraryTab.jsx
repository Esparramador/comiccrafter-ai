import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Loader2 } from "lucide-react";
import VoiceCard from "./VoiceCard";
import VoiceRecorder from "./VoiceRecorder";
import VoiceGeneratorForm from "./VoiceGeneratorForm";
import { motion } from "framer-motion";

export default function VoiceLibraryTab() {
  const [customVoices, setCustomVoices] = useState([]);
  const [aiVoices, setAiVoices] = useState([]);
  const [famousVoices, setFamousVoices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadAllVoices();
  }, [refreshTrigger]);

  const loadAllVoices = async () => {
    try {
      setIsLoading(true);
      const [custom, ai, famous] = await Promise.all([
        base44.entities.CustomVoice.list(),
        base44.entities.VoiceProfile.filter({ category: "ai_generated" }),
        base44.entities.FamousVoice.list()
      ]);

      setCustomVoices(custom || []);
      setAiVoices(ai || []);
      setFamousVoices(famous || []);
    } catch (error) {
      console.error("Error loading voices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVoice = async (voiceId, type) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta voz?")) {
      return;
    }

    try {
      if (type === "custom") {
        await base44.entities.CustomVoice.delete(voiceId);
      }
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error("Error deleting voice:", error);
    }
  };

  const filterVoices = (voices) => {
    if (!searchTerm) return voices;
    return voices.filter(v =>
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderVoiceSection = (voices, isCustom = false) => {
    const filtered = filterVoices(voices);
    if (filtered.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No se encontraron voces con ese término" : "No hay voces disponibles"}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(voice => (
          <VoiceCard
            key={voice.id}
            voice={voice}
            isCustom={isCustom}
            onDelete={() => deleteVoice(voice.id, isCustom ? "custom" : "ai")}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar voces..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : (
        <Tabs defaultValue="custom" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 border border-white/10">
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <span>🎤 Personalizadas</span>
              <span className="text-xs bg-violet-600 px-2 py-0.5 rounded">
                {customVoices.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <span>🤖 IA Generadas</span>
              <span className="text-xs bg-purple-600 px-2 py-0.5 rounded">
                {aiVoices.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="famous" className="flex items-center gap-2">
              <span>⭐ Famosos</span>
              <span className="text-xs bg-pink-600 px-2 py-0.5 rounded">
                {famousVoices.length}
              </span>
            </TabsTrigger>
          </TabsList>

          {/* Custom Voices */}
          <TabsContent value="custom" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <VoiceRecorder onVoiceRecorded={() => setRefreshTrigger(prev => prev + 1)} />
            </motion.div>

            {customVoices.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Mis Voces Grabadas</h3>
                {renderVoiceSection(customVoices, true)}
              </div>
            )}
          </TabsContent>

          {/* AI Generated Voices */}
          <TabsContent value="ai" className="space-y-6">
            <VoiceGeneratorForm onVoiceGenerated={() => setRefreshTrigger(prev => prev + 1)} />

            {aiVoices.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Voces Generadas por IA</h3>
                {renderVoiceSection(aiVoices)}
              </div>
            )}
          </TabsContent>

          {/* Famous Voices */}
          <TabsContent value="famous" className="space-y-6">
            {famousVoices.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Voces de Famosos y Personajes</h3>
                {renderVoiceSection(famousVoices)}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-gray-500"
              >
                <p className="mb-4">No hay voces famosas disponibles aún</p>
                <button
                  onClick={() => loadAllVoices()}
                  className="text-violet-400 hover:text-violet-300 text-sm font-semibold"
                >
                  Cargar voces predeterminadas
                </button>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}