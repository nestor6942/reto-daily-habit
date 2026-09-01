import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Smartphone, Share } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone ===
        true
    ) {
      return;
    }

    const dismissed = localStorage.getItem("reto_pwa_dismissed");
    if (dismissed) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    if (isIosDevice) {
      const timer = setTimeout(() => setShowPrompt(true), 3000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop Chrome
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosGuide(true);
      return;
    }

    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("reto_pwa_dismissed", "true");
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-40 rounded-2xl bg-card border border-primary/30 p-4 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center text-primary shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">
                  Instalar Reto Diario
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Úsala sin conexión y en pantalla completa como una App.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-muted-foreground hover:text-foreground p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="flex-1 bg-primary text-primary-foreground font-semibold h-9 text-xs gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Instalar App
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="h-9 text-xs text-muted-foreground"
            >
              Ahora no
            </Button>
          </div>

          {/* iOS Guide Modal */}
          {showIosGuide && (
            <div className="mt-3 pt-3 border-t text-xs space-y-2 text-muted-foreground bg-muted/50 p-2.5 rounded-xl">
              <p className="font-semibold text-foreground flex items-center gap-1">
                <Share className="w-3.5 h-3.5 text-primary" /> En iPhone / Safari:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px]">
                <li>Toca el botón <strong>Compartir</strong> en la barra inferior.</li>
                <li>Desplaza y selecciona <strong>"Agregar al inicio"</strong>.</li>
              </ol>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
