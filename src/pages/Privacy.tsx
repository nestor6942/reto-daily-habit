import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Shield, CheckCircle2, UserCheck, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/PageMeta";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Política de Privacidad y Protección de Datos — Reto Diario"
        description="Conoce cómo protegemos tus datos personales, hábitos y registros bajo el Reglamento General de Protección de Datos (RGPD) y normativas vigentes."
        path="/privacy"
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
            <Lock className="w-3.5 h-3.5" />
            <span>Cumplimiento Estricto RGPD / LOPDGDD 2026</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Política de Privacidad y Seguridad
          </h1>
          <p className="text-sm text-muted-foreground">
            En Reto Diario, tu privacidad y la seguridad de tus datos son nuestra máxima prioridad. Esta política detalla de forma transparente cómo tratamos tu información.
          </p>
        </motion.div>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              1. Responsable del Tratamiento
            </h2>
            <p>
              El responsable del tratamiento de los datos recabados a través de Reto Diario es el equipo de desarrollo y operaciones de <strong>Reto Diario</strong>. Puedes contactar con nuestro Delegado de Protección de Datos (DPO) en cualquier momento escribiendo a: <span className="text-foreground font-semibold">privacidad@retodiario.app</span>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              2. Datos Personales que Recopilamos
            </h2>
            <p>Tratamos únicamente los datos necesarios para brindarte la mejor experiencia de seguimiento:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Datos de Cuenta:</strong> Dirección de correo electrónico y nombre visible (para usuarios registrados).</li>
              <li><strong>Datos de Hábitos y Progreso:</strong> Retos creados, repeticiones completadas, fechas de cumplimiento, historial de rachas y medallas alcanzadas.</li>
              <li><strong>Datos Físicos Opcionales:</strong> Peso corporal, altura y objetivos de entrenamiento (para cálculo de IMC y personalización del asesor IA). Estos datos jamás se comparten con terceros.</li>
              <li><strong>Datos Técnicos:</strong> Preferencias de sonido, tema (claro/oscuro) y estado de instalación PWA (almacenados localmente en tu dispositivo).</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              3. Finalidad y Base Jurídica del Tratamiento
            </h2>
            <p>Los datos son tratados para las siguientes finalidades legítimas:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Ejecución del servicio (Art. 6.1.b RGPD):</strong> Guardar tus retos permanentemente, sincronizarlos entre tus dispositivos y calcular tus rachas y logros.</li>
              <li><strong>Consentimiento explícito (Art. 6.1.a RGPD):</strong> Para el procesamiento de tus consultas opcionales al asistente de ejercicios con IA.</li>
              <li><strong>Interés legítimo (Art. 6.1.f RGPD):</strong> Garantizar la seguridad de la plataforma y prevenir accesos no autorizados.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              4. Garantía de Conservación Permanente y Almacenamiento Seguro
            </h2>
            <p>
              Tus datos se almacenan en servidores con certificación ISO 27001 y SOC 2 alojados con cifrado en reposo (AES-256) y en tránsito (TLS 1.3). Reto Diario implementa políticas de seguridad RLS (Row Level Security), lo que significa que <strong>únicamente tú puedes leer y modificar tus propios retos e historial</strong>.
            </p>
            <p>
              Tus registros se conservan de forma permanente e ininterrumpida mientras mantengas activa tu cuenta, de modo que nunca pierdas tu historial deportivo ni tus rachas de esfuerzo acumuladas.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              5. Tus Derechos ARCO / RGPD (Acceso, Supresión, Portabilidad)
            </h2>
            <p>De acuerdo con la normativa internacional y europea, tienes pleno derecho a:</p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li><strong>Acceso y Rectificación:</strong> Consultar y modificar tus datos en cualquier momento desde tu Perfil.</li>
              <li><strong>Portabilidad de Datos (Art. 20 RGPD):</strong> Descargar una copia completa de todos tus retos e historial en formato estándar JSON desde la sección de copia de seguridad.</li>
              <li><strong>Derecho al Olvido / Supresión (Art. 17 RGPD):</strong> Solicitar la eliminación total y permanente de tu cuenta y todos sus registros asociados con un solo clic desde tu perfil.</li>
              <li><strong>Revocación de Consentimiento:</strong> Retirar tus consentimientos en cualquier momento sin efectos retroactivos.</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              6. No Venta de Datos Personales
            </h2>
            <p>
              <strong>Reto Diario jamás vende, alquila ni comercializa tus datos personales o biométricos con terceros anunciantes ni intermediarios.</strong> Tu progreso es tuyo y solo tuyo.
            </p>
          </div>
        </section>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Reto Diario. Comprometidos con tu privacidad.
          </p>
          <Button onClick={() => navigate("/")} className="font-semibold text-xs h-9">
            Entendido, volver a la aplicación
          </Button>
        </div>
      </main>
    </div>
  );
}
