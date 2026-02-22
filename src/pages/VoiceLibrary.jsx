import { base44 } from "@/api/base44Client";
import AuthGuard from "@/components/auth/AuthGuard";
import VoiceLibraryTab from "@/components/voices/VoiceLibraryTab";

function VoiceLibraryContent() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Biblioteca de Voces</h1>
          <p className="text-gray-400">
            Accede a voces personalizadas, generadas por IA y de famosos para tus proyectos
          </p>
        </div>
        <VoiceLibraryTab />
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