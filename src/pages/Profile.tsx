import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Sparkles,
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
  const { challenges, history, streakCount, bestStreak, exportData, importData } =
    useAppData();
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
        toast.error("Error al guardar el perfil");
        return;
      }
    } else {
      localStorage.setItem("reto_guest_name", displayName.trim() || "Invitado");
      if (w) localStorage.setItem("reto_guest_weight", String(w));
      if (h) localStorage.setItem("reto_guest_height", String(h));
      if (goal) localStorage.setItem("reto_guest_goal", goal);
      setSaving(false);
    }

    toast.success("¡Perfil guardado correctamente!");
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
    toast.success("¡Copia de seguridad descargada!");
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
          toast.error("El archivo no tiene un formato válido");
        }
      }
    };
    reader.readAsText(file);
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
    <div className="min-h-screen bg-background">
      <PageMeta
        title="Mi perfil — Reto Diario"
        description="Configura tu información física, membresía PRO, sonidos y copias de seguridad de Reto Diario."
        path="/profile"
      />
      <div className="mx-auto max-w-md px-4 pb-16">
        {/* Header */}
        <motion.header
          className="flex items-center justify-between pt-6 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            {user && (
              <Button
                size="icon"
                variant="ghost"
                onClick={signOut}
                className="w-10 h-10 text-muted-foreground hover:text-destructive"
                title="Cerrar sesión"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            )}
          </div>
        </motion.header>

        {/* Avatar */}
        <motion.div
          className="flex flex-col items-center mb-5"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3 border border-primary/20">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {displayName || (user ? "Mi Perfil" : "Usuario Invitado")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {user?.email || "Modo almacenamiento local"}
          </p>
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
            <p className="text-3xl font-extrabold text-foreground">{bmi}</p>
            <p className={`text-sm font-bold ${bmiCategory.color}`}>
              {bmiCategory.label}
            </p>
          </motion.div>
        )}

        {/* Form */}
        <motion.form
          onSubmit={handleSave}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Nombre
            </label>
            <Input
              type="text"
              placeholder="¿Cómo te llamas?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="h-11"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
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
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-foreground">
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
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-foreground">
              Objetivo Principal
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FITNESS_GOALS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setGoal(goal === g.value ? "" : g.value)}
                  className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold text-left transition-all ${
                    goal === g.value
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground font-semibold"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar Perfil"}
          </Button>
        </motion.form>

        {/* Coach / Trainer Report Export */}
        <div className="mt-8 space-y-3 pt-6 border-t">
          <h3 className="text-sm font-bold text-foreground">
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

        {/* Preferences & Backup Settings */}
        <div className="mt-6 space-y-3 pt-4 border-t">
          <h3 className="text-sm font-bold text-foreground">
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
              className="h-8 text-xs font-semibold"
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
                  Notificaciones del navegador
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant={remindersEnabled ? "default" : "outline"}
              size="sm"
              onClick={toggleReminders}
              className="h-8 text-xs font-semibold"
            >
              {remindersEnabled ? "Activado" : "Activar"}
            </Button>
          </div>

          {/* Data Backup & Restore */}
          <h3 className="text-sm font-bold text-foreground pt-3">
            Copia de Seguridad y Datos
          </h3>

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleExport}
              className="h-11 rounded-xl text-xs font-semibold gap-1.5"
            >
              <Download className="w-4 h-4" />
              Exportar JSON
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="h-11 rounded-xl text-xs font-semibold gap-1.5"
            >
              <Upload className="w-4 h-4" />
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
      </div>

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
