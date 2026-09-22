import { useNavigate } from "react-router-dom";
import { ArrowLeft, Cookie, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/PageMeta";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export default function Cookies() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Política de Cookies y Almacenamiento Local — Reto Diario"
        description="Información detallada sobre las cookies técnicas, almacenamiento local y tokens de sesión empleados por Reto Diario para guardar tus hábitos."
        path="/cookies"
      />

      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Reto Diario</span>
          </button>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 text-center sm:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Cookie className="w-3.5 h-3.5" />
            <span>Transparencia Digital • Directiva ePrivacy 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Política de Cookies y Almacenamiento
          </h1>
          <p className="text-sm text-muted-foreground">
            En Reto Diario utilizamos tecnologías de almacenamiento esenciales para asegurar que tu progreso y configuración se conserven permanentemente en tu dispositivo.
          </p>
        </motion.div>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" />
              1. ¿Qué son las Cookies y el Almacenamiento Local?
            </h2>
            <p>
              Una cookie o elemento de almacenamiento local (LocalStorage / IndexedDB) es un pequeño archivo de texto que un sitio web o aplicación almacena en tu navegador o dispositivo. Estas tecnologías permiten recordar tus hábitos del día, mantener tu sesión activa sin tener que introducir la contraseña cada vez, y hacer que la aplicación funcione incluso si te quedas sin conexión a internet.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              2. Categorías de Cookies y Almacenamiento que Utilizamos
            </h2>
            <div className="space-y-3 pt-1">
              <div>
                <h3 className="font-semibold text-foreground text-sm">A. Almacenamiento Estrictamente Necesario (Técnicas)</h3>
                <p className="text-xs mt-0.5">
                  Indispensables para el funcionamiento de la app. Sin ellas, no podrías iniciar sesión ni guardar tus retos diarios:
                </p>
                <ul className="list-disc list-inside text-xs pl-2 pt-1 space-y-1">
                  <li><code>sb-*-auth-token</code>: Token de autenticación cifrado para mantener tu sesión segura.</li>
                  <li><code>reto_cache_*</code>: Espejo de tus retos diarios para funcionamiento offline ultrarrápido.</li>
                  <li><code>reto_cookie_consent</code>: Almacena tu elección sobre el uso de cookies.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground text-sm">B. Almacenamiento de Preferencias y Funcionalidad</h3>
                <p className="text-xs mt-0.5">
                  Permiten recordar tus preferencias visuales y sonoras:
                </p>
                <ul className="list-disc list-inside text-xs pl-2 pt-1 space-y-1">
                  <li><code>theme</code>: Guarda tu preferencia entre modo claro o modo oscuro.</li>
                  <li><code>reto_sound_enabled</code>: Guarda si tienes activados o silenciados los efectos de sonido.</li>
                  <li><code>reto_reminders_enabled</code>: Guarda el estado de tus recordatorios diarios de entrenamiento.</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-foreground text-sm">C. Cookies Analíticas y Publicitarias de Terceros</h3>
                <p className="text-xs mt-0.5 text-foreground font-medium">
                  Reto Diario <u>NO</u> utiliza cookies de rastreo publicitario invasivo ni comparte tu actividad con redes sociales externas.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              3. ¿Cómo Gestionar o Eliminar las Cookies?
            </h2>
            <p>
              Puedes revocar tu consentimiento o borrar los datos almacenados en cualquier momento desde la configuración de tu navegador web (Google Chrome, Safari, Firefox, Edge) accediendo al menú de Configuración &gt; Privacidad y Seguridad &gt; Borrar datos de navegación.
            </p>
            <p className="text-xs italic text-muted-foreground">
              Ten en cuenta que si borras el almacenamiento local en modo invitado sin haberte registrado, los retos guardados únicamente en ese navegador podrían perderse. Por eso recomendamos registrarte con tu correo para tener respaldo permanente en la nube.
            </p>
          </div>
        </section>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Reto Diario. Transparencia total garantizada.
          </p>
          <Button onClick={() => navigate("/")} className="font-semibold text-xs h-9">
            Entendido, volver a la aplicación
          </Button>
        </div>
      </main>
    </div>
  );
}
