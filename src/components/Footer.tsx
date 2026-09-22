import { Link } from "react-router-dom";
import { Target, ShieldCheck, Lock, Heart, Smartphone } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-card/40 mt-16 text-muted-foreground transition-colors">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                <Target className="w-4 h-4" />
              </div>
              <span className="font-black text-lg text-foreground tracking-tight">
                Reto Diario
              </span>
            </div>
            <p className="text-xs sm:text-sm max-w-sm leading-relaxed">
              La plataforma integral para construir disciplina, superar retos físicos y alcanzar tu mejor versión un día a la vez. Tus datos se guardan permanentemente.
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-foreground/80 pt-1">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-primary" /> Cifrado Seguro SSL
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Cumplimiento RGPD
              </span>
            </div>
          </div>

          {/* Legal Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Legal y Privacidad
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/terms" className="hover:text-foreground transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-foreground transition-colors">
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="hover:text-foreground transition-colors">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-foreground transition-colors">
                  Aviso Legal y Descargo Médico
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources & Support */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
              Plataforma
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/auth" className="hover:text-foreground transition-colors">
                  Crear Cuenta / Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-foreground transition-colors">
                  Mi Perfil y Copia de Seguridad
                </Link>
              </li>
              <li>
                <span className="text-muted-foreground/80">Versión 2.5 • PWA Instalable</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>© 2026 Reto Diario. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1">
            Hecho para ayudarte a vencer tus límites cada día.
          </p>
        </div>
      </div>
    </footer>
  );
}
