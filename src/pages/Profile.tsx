import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, User, Save, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { PageMeta } from "@/components/PageMeta";


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
  const [displayName, setDisplayName] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [goal, setGoal] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
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
    if (!user) return;

    // Validation
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
    const { error } = await supabase
      .from("profiles")
      .upsert({
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
    toast.success("¡Perfil guardado!");
    navigate("/");
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
        description="Guarda tu peso, altura y objetivo fitness para recibir recomendaciones personalizadas del asistente de Reto Diario."
        path="/profile"
      />
      <div className="mx-auto max-w-md px-4 pb-8">

        {/* Header */}
        <motion.header
          className="flex items-center justify-between pt-6 pb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button
              size="icon"
              variant="ghost"
              onClick={signOut}
              className="w-10 h-10 text-muted-foreground"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </motion.header>

        {/* Avatar */}
        <motion.div
          className="flex flex-col items-center mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <User className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Mi Perfil
          </h1>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
        </motion.div>

        {/* BMI Card */}
        {bmi && bmiCategory && (
          <motion.div
            className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Tu IMC
            </p>
            <p className="text-3xl font-bold text-foreground">{bmi}</p>
            <p className={`text-sm font-medium ${bmiCategory.color}`}>
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Nombre
            </label>
            <Input
              type="text"
              placeholder="¿Cómo te llamas?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={50}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
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
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
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
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Objetivo de fitness
            </label>
            <div className="grid grid-cols-2 gap-2">
              {FITNESS_GOALS.map((g) => (
                <motion.button
                  key={g.value}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setGoal(goal === g.value ? "" : g.value)}
                  className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                    goal === g.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  }`}
                >
                  {g.label}
                </motion.button>
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary text-primary-foreground"
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Guardando..." : "Guardar perfil"}
          </Button>
        </motion.form>
      </div>
    </div>
  );
}
