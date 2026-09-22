import { useNavigate } from "react-router-dom";
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/PageMeta";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Términos y Condiciones de Uso — Reto Diario"
        description="Lee los términos y condiciones de servicio que regulan el uso de la plataforma Reto Diario, suscripciones y derechos de usuario."
        path="/terms"
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
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vigencia: 2026 • Documento Legal Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm text-muted-foreground">
            Última actualización: Septiembre de 2026. Por favor lee atentamente estos términos antes de utilizar los servicios de Reto Diario.
          </p>
        </motion.div>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              1. Aceptación de los Términos
            </h2>
            <p>
              Al acceder, navegar, registrarte o utilizar la plataforma web y aplicación móvil <strong>Reto Diario</strong> ("el Servicio"), aceptas quedar legalmente vinculado por los presentes Términos y Condiciones, así como por nuestra Política de Privacidad y Política de Cookies. Si no estás de acuerdo con cualquiera de estas cláusulas, te rogamos abstenerte de utilizar el Servicio.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              2. Descripción del Servicio y Registro Permanente
            </h2>
            <p>
              Reto Diario es una plataforma de bienestar, acondicionamiento físico personal y seguimiento de hábitos diarios. El Servicio permite crear retos, llevar un registro de rachas consecutivas, analizar estadísticas de constancia, recibir recomendaciones de inteligencia artificial y desbloquear insignias de gamificación.
            </p>
            <p>
              Para disfrutar de la persistencia permanente y sincronización multidispositivo en la nube, el usuario puede registrarse mediante correo electrónico o autenticación segura (OAuth Google). Reto Diario garantiza que los registros de retos, marcas y rachas del usuario registrado se conservan de forma permanente e indefinida en nuestros servidores protegidos, salvo que el propio usuario solicite expresamente su eliminación.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              3. Cuentas de Usuario y Seguridad
            </h2>
            <p>
              Eres responsable de mantener la confidencialidad de tus credenciales de acceso y de toda la actividad que ocurra bajo tu cuenta. Te comprometes a notificar inmediatamente a Reto Diario ante cualquier sospecha de uso no autorizado o vulneración de seguridad. Reto Diario implementa protocolos de cifrado de contraseñas de nivel bancario y políticas de seguridad a nivel de filas (RLS) en base de datos.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              4. Planes Gratuitos y Membresías PRO
            </h2>
            <p>
              Reto Diario ofrece una modalidad gratuita que incluye hasta 3 hábitos simultáneos y funciones básicas. Asimismo, ofrece membresías <strong>Reto Diario PRO</strong> (mensual, anual o vitalicia) que desbloquean retos ilimitados, programas guiados de 21 días, consultas avanzadas al asesor de IA y fichas profesionales de rendimiento.
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Los pagos se procesan de forma cifrada a través de pasarelas certificadas PCI-DSS (Stripe).</li>
              <li>El usuario tiene derecho a desistir de su compra y solicitar reembolso completo dentro de los primeros 14 días naturales posteriores a la suscripción si no ha hecho un uso abusivo del servicio.</li>
              <li>Puedes cancelar la renovación automática de tu suscripción en cualquier momento desde tu perfil o panel de facturación.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              5. Asesor de Ejercicios IA y Responsabilidad sobre la Salud
            </h2>
            <p>
              Las sugerencias emitidas por el Asesor de Ejercicios con IA o los programas predeterminados son meramente de carácter informativo, educativo y motivacional. <strong>Reto Diario no es un centro médico ni proporciona asesoramiento médico, diagnóstico o tratamiento.</strong> Consulta a un médico antes de iniciar cualquier programa de ejercicio de alta intensidad, especialmente si tienes antecedentes de lesiones o condiciones cardiovasculares.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              6. Propiedad Intelectual
            </h2>
            <p>
              Todo el diseño, código, logotipos, gráficos, interfaces y contenidos de Reto Diario están protegidos por leyes de propiedad intelectual e industrial. Queda prohibida la reproducción, descompilación o distribución sin autorización previa por escrito.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              7. Modificaciones y Contacto
            </h2>
            <p>
              Nos reservamos el derecho de actualizar estos términos para reflejar cambios legales o funcionales. Cualquier cambio sustancial se notificará a través de la aplicación o por correo electrónico.
            </p>
            <p className="pt-1">
              Para consultas legales o soporte técnico, contáctanos en: <span className="text-foreground font-semibold">legal@retodiario.app</span>
            </p>
          </div>
        </section>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Reto Diario. Todos los derechos reservados.
          </p>
          <Button onClick={() => navigate("/")} className="font-semibold text-xs h-9">
            Entendido, volver a la aplicación
          </Button>
        </div>
      </main>
    </div>
  );
}
