import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Evento de instalación PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      return;
    }

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Resultado de instalación: ${outcome}`);

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt && !isIOS) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-gradient-to-r from-violet-600 to-pink-600 rounded-xl shadow-lg p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-white mb-1">
              Instala ComicCrafter
            </h3>
            <p className="text-xs text-white/80">
              {isIOS
                ? "Toca Compartir y luego Añadir a pantalla de inicio"
                : "Accede a todas tus creaciones desde tu inicio"}
            </p>
          </div>
          <button
            onClick={() => setShowPrompt(false)}
            className="text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!isIOS && deferredPrompt && (
          <Button
            onClick={handleInstall}
            className="w-full bg-white text-violet-600 hover:bg-gray-100 text-sm font-medium gap-2"
          >
            <Download className="w-4 h-4" />
            Instalar
          </Button>
        )}
      </div>
    </div>
  );
}