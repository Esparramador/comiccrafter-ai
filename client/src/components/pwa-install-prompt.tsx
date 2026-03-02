import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("cc_pwa_dismissed");
    if (dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000) return;

    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || (navigator as any).standalone === true;
    if (isStandalone) return;

    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
    setIsIOS(isiOS);

    if (isiOS) {
      setTimeout(() => setShowBanner(true), 3000);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowBanner(true), 2000);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setShowIOSGuide(false);
    localStorage.setItem("cc_pwa_dismissed", String(Date.now()));
  };

  if (!showBanner) return null;

  if (showIOSGuide) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom duration-500">
        <div className="max-w-md mx-auto bg-[#111322] border border-white/10 rounded-2xl p-5 shadow-2xl shadow-black/50">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-bold text-white">Instalar en iOS</h3>
            </div>
            <button onClick={handleDismiss} className="text-white/30 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2 text-xs text-white/60">
            <p>1. Pulsa el icono <span className="inline-block w-4 h-4 align-middle">⬆️</span> <strong className="text-white/80">Compartir</strong> en Safari</p>
            <p>2. Desplázate y pulsa <strong className="text-white/80">"Añadir a pantalla de inicio"</strong></p>
            <p>3. Pulsa <strong className="text-white/80">"Añadir"</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-md mx-auto bg-gradient-to-r from-[#111322] to-[#1a1d35] border border-purple-500/20 rounded-2xl p-4 shadow-2xl shadow-purple-900/20 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
          <Download className="w-6 h-6 text-purple-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-white">Instalar Comic Crafter</h3>
          <p className="text-[11px] text-white/40 mt-0.5">Accede más rápido desde tu pantalla de inicio</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleInstall}
            size="sm"
            className="bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs h-8 px-4 font-bold"
            data-testid="button-pwa-install"
          >
            Instalar
          </Button>
          <button onClick={handleDismiss} className="text-white/20 hover:text-white/60 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
