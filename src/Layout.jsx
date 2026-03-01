import MobileLayout from "./components/mobile/MobileLayout";
import { useEffect, useState } from "react";

export default function Layout({ children, currentPageName }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/service-worker.js").catch(err => {
        console.log("Service Worker registration failed:", err);
      });
    }

    // Detectar cuando se puede instalar la app
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`Usuario: ${outcome}`);
    setInstallPrompt(null);
    setShowInstallPrompt(false);
  };

  return (
    <>
      {showInstallPrompt && (
        <div className="fixed bottom-0 left-0 right-0 bg-primary text-primary-foreground p-4 z-50 flex gap-3 items-center justify-between md:max-w-md mx-auto rounded-t-lg">
          <div className="flex-1">
            <p className="font-semibold text-sm">Instala ComicCrafter</p>
            <p className="text-xs opacity-90">Acceso rápido desde tu pantalla de inicio</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="px-3 py-1 text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded"
            >
              Ahora no
            </button>
            <button
              onClick={handleInstall}
              className="px-3 py-1 text-xs bg-primary-foreground text-primary font-semibold rounded hover:bg-primary-foreground/90"
            >
              Instalar
            </button>
          </div>
        </div>
      )}
      <MobileLayout currentPageName={currentPageName}>
        {children}
      </MobileLayout>
    </>
  );
}