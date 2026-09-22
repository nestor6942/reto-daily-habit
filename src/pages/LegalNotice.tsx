import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, HeartPulse, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageMeta } from "@/components/PageMeta";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export default function LegalNotice() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Aviso Legal y Descargo Médico — Reto Diario"
        description="Aviso legal oficial y descargo de responsabilidad sobre salud, ejercicio y acondicionamiento físico de Reto Diario."
        path="/legal"
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Salud y Seguridad del Usuario • Aviso Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Aviso Legal y Descargo Médico
          </h1>
          <p className="text-sm text-muted-foreground">
            Información indispensable sobre el ejercicio físico responsable y la naturaleza de las recomendaciones de Reto Diario.
          </p>
        </motion.div>

        <section className="space-y-6 text-sm leading-relaxed text-muted-foreground">
          <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-foreground space-y-2">
            <h2 className="text-base font-extrabold flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <HeartPulse className="w-5 h-5" />
              Descargo de Responsabilidad Médica y de Salud
            </h2>
            <p className="text-xs sm:text-sm">
              <strong>Reto Diario NO es un proveedor de atención médica, hospital ni clínica.</strong> El contenido de esta aplicación, incluyendo los planes de 21 días, las metas de repeticiones y las respuestas del Asesor de Inteligencia Artificial, se proporciona exclusivamente con fines recreativos, educativos y de motivación general.
            </p>
            <p className="text-xs sm:text-sm">
              En ningún caso sustituye el diagnóstico, tratamiento o consejo médico profesional. Consulta siempre a tu médico de cabecera o a un especialista antes de iniciar o modificar cualquier régimen de ejercicio de alta intensidad.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary" />
              1. Asunción Voluntaria de Riesgos
            </h2>
            <p>
              La práctica de actividades físicas tales como flexiones, sentadillas, carrera o levantamiento de pesas conlleva inherentemente riesgos de lesiones musculares, articulares o cardiovasculares. Al realizar los retos sugeridos en Reto Diario, reconoces y asumes de manera libre y voluntaria estos riesgos y te comprometes a escuchar a tu cuerpo, detener el ejercicio si sientes dolor o mareo y realizar un calentamiento adecuado.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              2. Limitación de Responsabilidad
            </h2>
            <p>
              Reto Diario, sus creadores, desarrolladores y colaboradores no asumen responsabilidad civil ni penal por cualquier lesión física, daño a la salud o perjuicio derivado de la ejecución indebida o sobreentrenamiento de los ejercicios o hábitos seguidos en la plataforma.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-card border space-y-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              3. Datos Identificativos de la Plataforma
            </h2>
            <p>
              En cumplimiento de los deberes de información general previstos en la legislación sobre servicios de la sociedad de la información y comercio electrónico:
            </p>
            <ul className="list-disc list-inside text-xs pl-2 pt-1 space-y-1">
              <li><strong>Nombre de la Plataforma:</strong> Reto Diario (retodiario.app).</li>
              <li><strong>Contacto oficial:</strong> soporte@retodiario.app | legal@retodiario.app.</li>
              <li><strong>Alojamiento seguro:</strong> Infraestructura en la nube con centros de datos certificados.</li>
            </ul>
          </div>
        </section>

        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 Reto Diario. Entrena con seguridad e inteligencia.
          </p>
          <Button onClick={() => navigate("/")} className="font-semibold text-xs h-9">
            Entendido, volver a la aplicación
          </Button>
        </div>
      </main>
    </div>
  );
}
