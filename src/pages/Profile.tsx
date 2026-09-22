import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  User,
  Save,
  LogOut,
  Download,
  Upload,
  Volume2,
  Bell,
  Crown,
  FileText,
  ShieldCheck,
  Cloud,
  Flame,
  Trash2,
  Lock,
  ExternalLink,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PageMeta } from "@/components/PageMeta";
import { soundManager } from "@/lib/soundEffects";
import { useAppData } from "@/hooks/useAppData";
import { subscriptionManager } from "@/lib/subscription";
import { PricingModal } from "@/components/PricingModal";
import { ProgressReportModal } from "@/components/ProgressReportModal";

const FITNESS_GOALS = [
  { value: "perder_peso", label: "🔥 Perder peso" },
  { value: "ganar_musculo", label: "💪 Ganar músculo" },
  { value: "mantener_forma", label: "⚡ Mantener la forma" },
  { value: "resistencia", label: "🏃 Mejorar resistencia" },
  { value: "flexibilidad", label: "🧘 Flexibilidad y movilidad" },
  { value: "salud_general", label: "❤️ Salud general" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const {
    challenges,
    history,
    streakCount,
    bestStreak,
    syncStatus,
    lastSyncedAt,
    streakFreezeAvailable,
    useStreakFreeze,
    deleteAccountData,
    exportData,
    importData,
  } = useAppData();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [pricingOpen, setPricingOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [subscription, setSubscription] = useState(subscriptionManager.getSubscription());

  const [remindersEnabled, setRemindersEnabled] = useState(
    typeof window !== "undefined" &&
      localStorage.getItem("reto_reminders_enabled") === "true"
  );

  useEffect(() => {
    if (!user) {
      // Guest profile
      const guestName = localStorage.getItem("reto_guest_name") || "Invitado";
      const guestWeight = localStorage.getItem("reto_guest_weight") || "";
      const guestHeight = localStorage.getItem("reto_guest_height") || "";
      const guestGoal = localStorage.getItem("reto_guest_goal") || "";
      setDisplayName(guestName === "Invitado" ? "" : guestName);
      setWeight(guestWeight);
      setHeight(guestHeight);
      setGoal(guestGoal);
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setDisplayName(data.display_name || "");
        setWeight(data.weight_kg != null ? String(data.weight_kg) : "");
        setHeight(data.height_cm != null ? String(data.height_cm) : "");
        setGoal(data.fitness_goal || "");
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const w = weight ? parseFloat(weight) : null;
    const h = height ? parseFloat(height) : null;

    if (w !== null && (w < 20 || w > 300)) {
      toast.error("Ingresa un peso válido (20-300 kg)");
      return;
    }
    if (h !== null && (h < 100 || h > 250)) {
      toast.error("Ingresa una altura válida (100-250 cm)");
      return;
    }
    if (displayName.length > 50) {
      toast.error("El nombre debe tener máximo 50 caracteres");
      return;
    }

    setSaving(true);

    if (user) {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        display_name: displayName.trim() || null,
        weight_kg: w,
        height_cm: h,
        fitness_goal: goal || null,
      });

      setSaving(false);
      if (error) {
        toast.error("Error al guardar el perfil en la nube");
        return;
      }
    } else {
      localStorage.setItem("reto_guest_name", displayName.trim() || "Invitado");
      if (w) localStorage.setItem("reto_guest_weight", String(w));
      if (h) localStorage.setItem("reto_guest_height", String(h));
      if (goal) localStorage.setItem("reto_guest_goal", goal);
      setSaving(false);
    }

    toast.success("¡Perfil guardado correctamente y respaldado!");
    soundManager.playPop();
    navigate("/");
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    soundManager.setEnabled(next);
    setSoundEnabled(next);
    toast.info(next ? "Efectos de sonido activados" : "Sonidos silenciados");
  };

  const toggleReminders = async () => {
    if (!remindersEnabled) {
      if ("Notification" in window) {
        const perm = await Notification.requestPermission();
        if (perm === "granted") {
          setRemindersEnabled(true);
          localStorage.setItem("reto_reminders_enabled", "true");
          toast.success("¡Notificaciones de recordatorio activadas!");
          return;
        }
      }
      toast.warning("Permiso de notificaciones no concedido");
    } else {
      setRemindersEnabled(false);
      localStorage.setItem("reto_reminders_enabled", "false");
      toast.info("Recordatorios desactivados");
    }
  };

  const handleExport = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reto-diario-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("¡Copia de seguridad descargada en formato JSON!");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importData(content);
        if (ok) {
          toast.success("¡Datos restaurados con éxito!");
          navigate("/");
        } else {
          toast.error("El archivo no tiene un formato válido de Reto Diario");
        }
      }
    };
    reader.readAsText(file);
  };

  const handleActivateStreakFreeze = async () => {
    const ok = await useStreakFreeze();
    if (ok) {
      toast.success("🛡️ ¡Salvavidas de Racha activado! Tu racha ha sido protegida.");
    } else {
      toast.error("Ya has utilizado tu salvavidas de racha este mes.");
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const ok = await deleteAccountData();
    setIsDeleting(false);
    setDeleteConfirmOpen(false);
    if (ok) {
      toast.success("Tus datos y cuenta han sido eliminados de forma definitiva (RGPD).");
      navigate("/");
    } else {
      toast.error("Hubo un problema al procesar la eliminación.");
    }
  };

  const bmi =
    weight && height
      ? (parseFloat(weight) / (parseFloat(height) / 100) ** 2).toFixed(1)
      : null;

  const bmiCategory = bmi
    ? parseFloat(bmi) < 18.5
      ? { label: "Bajo peso", color: "text-blue-500" }
      : parseFloat(bmi) < 25
      ? { label: "Peso saludable", color: "text-success" }
      : parseFloat(bmi) < 30
      ? { label: "Sobrepeso", color: "text-streak" }
      : { label: "Obesidad", color: "text-destructive" }
    : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          className="rounded-full h-8 w-8 border-b-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PageMeta
        title="Mi perfil — Reto Diario"
        description="Configura tu información física, membresía PRO, sonidos, copia de seguridad y gestión de privacidad RGPD en Reto Diario."
        path="/profile"
      />
      <div className="mx-auto max-w-lg px-4 pb-16">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between pt-6 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </button>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {user && (
              <Button
                size="icon"
                variant="ghost"
                onClick={signOut}
                className="w-9 h-9 text-muted-foreground hover:text-destructive"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </motion.header>

        {/* Avatar & User Header */}
        <motion.div
          className="flex flex-col items-center mb-5 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-2.5 border border-primary/25 shadow-sm">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            {displayName || (user ? "Atleta de Reto Diario" : "Usuario Invitado")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {user?.email || "Modo local (Crea una cuenta para guardar tus retos en la nube)"}
          </p>
        </motion.div>

        {/* Cloud Sync & Permanent Storage Card */}
        <motion.div
          className={`rounded-2xl border p-4 mb-4 shadow-sm transition-all ${
            user
              ? "bg-primary/5 border-primary/20"
              : "bg-amber-500/10 border-amber-500/30"
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  user
                    ? "bg-primary/20 text-primary"
                    : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                }`}
              >
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Almacenamiento de Datos
                </span>
                <p className="font-extrabold text-sm text-foreground">
                  {user ? "Respaldo Permanente en la Nube" : "Almacenamiento Local Temporal"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {user
                    ? `Sincronizado con Supabase • ${syncStatus === "synced" ? "Al día" : "Sincronizando..."}`
                    : "Tus retos se guardan en este navegador. Regístrate para que nunca se te borren."}
                </p>
              </div>
            </div>

            {!user && (
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="h-8 text-xs font-bold bg-primary text-primary-foreground rounded-xl shrink-0"
              >
                Crear cuenta
              </Button>
            )}
          </div>
        </motion.div>

        {/* Subscription Membership Card */}
        <motion.div
          className="rounded-2xl border bg-gradient-to-tr from-amber-500/10 via-card to-streak/10 p-4 mb-4 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Membresía
                </span>
                <p className="font-extrabold text-sm text-foreground">
                  {subscription.planName}
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setPricingOpen(true)}
              className="h-8 text-xs font-bold bg-amber-500 text-white rounded-xl shadow-sm hover:bg-amber-600"
            >
              {subscription.isPro ? "Gestionar" : "Mejorar a PRO"}
            </Button>
          </div>
        </motion.div>

        {/* Streak Rescue Shield Card */}
        <motion.div
          className="rounded-2xl border border-streak/20 bg-streak/5 p-4 mb-4 shadow-sm flex items-center justify-between gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-streak/20 text-streak flex items-center justify-center border border-streak/30 shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>Salvavidas de Racha</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-streak/20 text-streak font-extrabold">
                  1/mes
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {streakFreezeAvailable
                  ? "Disponible: Recupérate de un día perdido sin romper tu racha."
                  : "Ya has utilizado tu salvavidas de racha este mes."}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={!streakFreezeAvailable}
            onClick={handleActivateStreakFreeze}
            className="h-8 text-xs font-bold border-streak/40 text-streak hover:bg-streak/10 shrink-0 rounded-xl"
          >
            {streakFreezeAvailable ? "Proteger Racha" : "Usado"}
          </Button>
        </motion.div>

        {/* BMI Card */}
        {bmi && bmiCategory && (
          <motion.div
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-4 text-center shadow-sm"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">
              Tu Índice de Masa Corporal (IMC)
            </p>
            <p className="text-3xl font-black text-foreground mt-0.5">{bmi}</p>
            <p className={`text-sm font-bold ${bmiCategory.color}`}>
              {bmiCategory.label}
            </p>
          </motion.div>
        )}

        {/* Physical Profile Form */}
        <motion.form
          onSubmit={handleSave}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Nombre o Apodo
            </label>
            <Input
              type="text"
              placeholder="¿Cómo te llamas?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Peso (kg)
              </label>
              <Input
                type="number"
                placeholder="70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                min={20}
                max={300}
                step="0.1"
                className="h-11 rounded-xl"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                Altura (cm)
              </label>
              <Input
                type="number"
                placeholder="170"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                min={100}
                max={250}
                step="0.1"
                className="h-11 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Objetivo Principal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FITNESS_GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(goal === g.value ? "" : g.value)}
                  className={`p-2.5 rounded-xl border text-xs sm:text-sm font-semibold text-left transition-all ${
                    goal === g.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-bold text-xs sm:text-sm"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Perfil"}
          </Button>
        </motion.form>

        {/* Coach / Trainer Report Export */}
        <div className="mt-8 space-y-3 pt-6 border-t">
          <h3 className="text-sm font-extrabold text-foreground">
            Herramientas Profesionales
          </h3>

          <Button
            type="button"
            variant="outline"
            onClick={() => setReportOpen(true)}
            className="w-full h-12 rounded-2xl text-xs font-bold border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary gap-2 justify-start px-4 shadow-sm"
          >
            <FileText className="w-4 h-4 text-primary" />
            <span>Generar Ficha de Rendimiento (Imprimir / PDF)</span>
          </Button>
        </div>

        {/* Preferences & Sound */}
        <div className="mt-6 space-y-3 pt-4 border-t">
          <h3 className="text-sm font-extrabold text-foreground">
            Preferencias de la Aplicación
          </h3>

          {/* Sound toggle card */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-card">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Efectos de Sonido
                </p>
                <p className="text-xs text-muted-foreground">
                  Sonidos al sumar y completar retos
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={soundEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleSound}
              className="h-8 text-xs font-semibold rounded-xl"
            >
              {soundEnabled ? "Activado" : "Silencio"}
            </Button>
          </div>

          {/* Reminders toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl border bg-card">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-streak/10 flex items-center justify-center text-streak">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Recordatorios Diarios
                </p>
                <p className="text-xs text-muted-foreground">
                  Notificaciones en tu dispositivo
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={remindersEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleReminders}
              className="h-8 text-xs font-semibold rounded-xl"
            >
              {remindersEnabled ? "Activado" : "Activar"}
            </Button>
          </div>

          {/* Data Backup & Restore */}
          <h3 className="text-sm font-extrabold text-foreground pt-3">
            Copia de Seguridad y Portabilidad (RGPD Art. 20)
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              className="h-11 rounded-xl text-xs font-semibold gap-1.5"
            >
              <Download className="w-4 h-4 text-primary" />
              Exportar JSON
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 rounded-xl text-xs font-semibold gap-1.5"
            >
              <Upload className="w-4 h-4 text-primary" />
              Restaurar Copia
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </div>
        </div>

        {/* Legal & Privacy Compliance Center */}
        <div className="mt-8 space-y-3 pt-6 border-t">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-extrabold text-foreground">
              Centro Legal y Privacidad
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <Link
              to="/terms"
              className="p-2.5 rounded-xl border bg-card hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Términos de Uso</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>
            <Link
              to="/privacy"
              className="p-2.5 rounded-xl border bg-card hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Privacidad RGPD</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>
            <Link
              to="/cookies"
              className="p-2.5 rounded-xl border bg-card hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Política de Cookies</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>
            <Link
              to="/legal"
              className="p-2.5 rounded-xl border bg-card hover:bg-muted transition-colors flex items-center justify-between"
            >
              <span>Aviso Médico Legal</span>
              <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </Link>
          </div>

          {/* Right to Erasure / GDPR Art. 17 */}
          <div className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDeleteConfirmOpen(true)}
              className="w-full text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-10 gap-1.5 rounded-xl"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar mi cuenta y suprimir mis datos (Derecho al Olvido)</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="rounded-2xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              ¿Eliminar cuenta y todos tus datos?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
              <p>
                Esta acción es <strong>definitiva e irreversible</strong> bajo el Artículo 17 del RGPD (Derecho a la Supresión).
              </p>
              <p>
                Se borrarán permanentemente de nuestros servidores todos tus retos, marcas históricas de ejercicios, récords de racha y configuración de perfil.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="text-xs rounded-xl">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold rounded-xl"
            >
              {isDeleting ? "Eliminando..." : "Sí, eliminar permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pricing Modal */}
      <PricingModal
        open={pricingOpen}
        onOpenChange={setPricingOpen}
        onSubscriptionChange={() =>
          setSubscription(subscriptionManager.getSubscription())
        }
      />

      {/* Progress Report Modal */}
      <ProgressReportModal
        open={reportOpen}
        onOpenChange={setReportOpen}
        challenges={challenges}
        history={history}
        streakCount={streakCount}
        bestStreak={bestStreak}
        userName={displayName || "Atleta de Reto Diario"}
        userEmail={user?.email || "Modo local"}
        weight={weight}
        height={height}
        goal={goal}
      />
    </div>
  );
}
