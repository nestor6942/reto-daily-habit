import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Cookie, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("reto_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem("reto_cookie_consent", "all");
    setVisible(false);
  };

  const handleAcceptEssential = () => {
    localStorage.setItem("reto_cookie_consent", "essential");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.95 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          aria-label="Consentimiento de cookies y privacidad"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 rounded-3xl bg-card/95 backdrop-blur-xl border border-primary/20 p-5 shadow-2xl space-y-3"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
              <Cookie className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-foreground flex items-center gap-1.5">
                  <span>Tu privacidad y datos seguros</span>
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </h3>
                <button
                  onClick={handleAcceptEssential}
                  className="text-muted-foreground hover:text-foreground p-1"
                  aria-label="Cerrar banner de cookies"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Utilizamos cookies técnicas y almacenamiento local para guardar tus retos permanentemente, sincronizar tus rachas y ofrecerte una experiencia fluida sin conexión.
              </p>
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground flex flex-wrap gap-2 pt-1 border-t border-border/60">
            <Link to="/cookies" className="text-primary hover:underline font-medium">
              Política de Cookies
            </Link>
            <span>•</span>
            <Link to="/privacy" className="text-primary hover:underline font-medium">
              Privacidad RGPD
            </Link>
            <span>•</span>
            <Link to="/terms" className="text-primary hover:underline font-medium">
              Términos
            </Link>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Button
              size="sm"
              onClick={handleAcceptAll}
              className="flex-1 h-9 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-sm hover:opacity-90"
            >
              Aceptar todas
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAcceptEssential}
              className="h-9 rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground"
            >
              Solo esenciales
            </Button>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
