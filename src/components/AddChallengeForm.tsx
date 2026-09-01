import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Dumbbell,
  Footprints,
  Timer,
  Flame,
  Waves,
  Mountain,
  Bike,
  PersonStanding,
  Activity,
  StretchHorizontal,
  Zap,
  HeartPulse,
  Swords,
  Target,
  Skull,
  Crown,
  Rocket,
  Shield,
  BookOpen,
  GlassWater,
  Smile,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { HabitCategory } from "@/types/challenge";

const CATEGORIES: { key: HabitCategory; label: string; emoji: string }[] = [
  { key: "fuerza", label: "Fuerza", emoji: "💪" },
  { key: "cardio", label: "Cardio", emoji: "🏃" },
  { key: "flexibilidad", label: "Flex", emoji: "🧘" },
  { key: "mente", label: "Mente", emoji: "🧠" },
  { key: "nutricion", label: "Nutrición", emoji: "🥗" },
];

const PRESET_EXERCISES: {
  name: string;
  icon: typeof Dumbbell;
  defaultTarget: number;
  unit: string;
  category: HabitCategory;
  difficulty: 1 | 2 | 3;
}[] = [
  // Fuerza
  { name: "Flexiones", icon: Dumbbell, defaultTarget: 30, unit: "reps", category: "fuerza", difficulty: 1 },
  { name: "Sentadillas", icon: PersonStanding, defaultTarget: 50, unit: "reps", category: "fuerza", difficulty: 1 },
  { name: "Flexiones diamante", icon: Swords, defaultTarget: 15, unit: "reps", category: "fuerza", difficulty: 2 },
  { name: "Dominadas", icon: Crown, defaultTarget: 10, unit: "reps", category: "fuerza", difficulty: 3 },
  { name: "Plancha abdominal", icon: Mountain, defaultTarget: 60, unit: "seg", category: "fuerza", difficulty: 2 },
  { name: "Fondos de tríceps", icon: Shield, defaultTarget: 20, unit: "reps", category: "fuerza", difficulty: 2 },
  // Cardio
  { name: "Jumping Jacks", icon: Zap, defaultTarget: 50, unit: "reps", category: "cardio", difficulty: 1 },
  { name: "Saltos de tijera", icon: Footprints, defaultTarget: 50, unit: "reps", category: "cardio", difficulty: 1 },
  { name: "Burpees", icon: Timer, defaultTarget: 15, unit: "reps", category: "cardio", difficulty: 2 },
  { name: "Correr", icon: Activity, defaultTarget: 20, unit: "min", category: "cardio", difficulty: 1 },
  { name: "Ciclismo", icon: Bike, defaultTarget: 30, unit: "min", category: "cardio", difficulty: 1 },
  { name: "Mountain Climbers", icon: Rocket, defaultTarget: 40, unit: "reps", category: "cardio", difficulty: 2 },
  // Flexibilidad
  { name: "Yoga", icon: HeartPulse, defaultTarget: 15, unit: "min", category: "flexibilidad", difficulty: 1 },
  { name: "Estiramientos", icon: StretchHorizontal, defaultTarget: 10, unit: "min", category: "flexibilidad", difficulty: 1 },
  { name: "Natación", icon: Waves, defaultTarget: 30, unit: "min", category: "flexibilidad", difficulty: 2 },
  // Mente
  { name: "Meditar", icon: Smile, defaultTarget: 10, unit: "min", category: "mente", difficulty: 1 },
  { name: "Lectura activa", icon: BookOpen, defaultTarget: 15, unit: "páginas", category: "mente", difficulty: 1 },
  // Nutrición & Hábitos
  { name: "Beber agua", icon: GlassWater, defaultTarget: 8, unit: "vasos", category: "nutricion", difficulty: 1 },
  { name: "Sin azúcar añadido", icon: Target, defaultTarget: 1, unit: "veces", category: "nutricion", difficulty: 2 },
];

const DIFFICULTY_LABELS = ["", "Fácil", "Medio", "Bestia"];
const DIFFICULTY_COLORS = [
  "",
  "text-emerald-600 bg-emerald-500/10 border-emerald-500/30",
  "text-amber-600 bg-amber-500/10 border-amber-500/30",
  "text-destructive bg-destructive/10 border-destructive/30",
];

const UNITS = ["reps", "min", "seg", "km", "vasos", "páginas", "veces"];

interface Props {
  onAdd: (
    name: string,
    target: number,
    unit?: string,
    category?: HabitCategory
  ) => void;
}

export function AddChallengeForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"select" | "custom">("select");
  const [category, setCategory] = useState<HabitCategory>("fuerza");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [unit, setUnit] = useState("reps");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const filteredExercises = PRESET_EXERCISES.filter((p) => p.category === category);

  const handlePresetSelect = (preset: (typeof PRESET_EXERCISES)[0]) => {
    setSelectedPreset(preset.name);
    setName(preset.name);
    setTarget(String(preset.defaultTarget));
    setUnit(preset.unit);
    setCategory(preset.category);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseInt(target, 10);
    if (name.trim() && t > 0) {
      onAdd(name.trim(), t, unit, category);
      resetForm();
    }
  };

  const resetForm = () => {
    setName("");
    setTarget("");
    setUnit("reps");
    setSelectedPreset(null);
    setMode("select");
    setCategory("fuerza");
    setOpen(false);
  };

  return (
    <AnimatePresence mode="wait">
      {!open ? (
        <motion.div
          key="button"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <Button
            onClick={() => setOpen(true)}
            variant="outline"
            className="w-full h-14 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary transition-all duration-200 rounded-2xl gap-2 font-medium"
          >
            <Plus className="w-5 h-5 text-primary" />
            Añadir nuevo reto
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          className="rounded-2xl border bg-card p-4 space-y-3 shadow-md"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted">
            <button
              type="button"
              onClick={() => {
                setMode("select");
                setSelectedPreset(null);
                setName("");
                setTarget("");
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === "select"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Catálogo de Hábitos
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("custom");
                setSelectedPreset(null);
                setName("");
                setTarget("");
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === "custom"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Personalizado
            </button>
          </div>

          <AnimatePresence mode="wait">
            {mode === "select" ? (
              <motion.div
                key="presets"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                {/* Category filter */}
                <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setCategory(cat.key);
                        setSelectedPreset(null);
                        setName("");
                        setTarget("");
                      }}
                      className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                        category === cat.key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredExercises.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = selectedPreset === preset.name;
                    return (
                      <motion.button
                        key={preset.name}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetSelect(preset)}
                        className={`flex flex-col gap-1 p-2.5 rounded-xl border text-left text-xs sm:text-sm transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary shadow-sm"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon className="w-4 h-4 shrink-0 text-primary" />
                          <span className="font-semibold truncate">
                            {preset.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between w-full mt-1">
                          <span className="text-[10px] text-muted-foreground">
                            {preset.defaultTarget} {preset.unit}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                              DIFFICULTY_COLORS[preset.difficulty]
                            }`}
                          >
                            {DIFFICULTY_LABELS[preset.difficulty]}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {selectedPreset && (
                  <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3 overflow-hidden pt-2 border-t"
                  >
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Meta diaria
                        </label>
                        <Input
                          type="number"
                          placeholder="Meta"
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          min={1}
                          className="h-11 text-base"
                          autoFocus
                          required
                        />
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground block mb-1">
                          Unidad
                        </label>
                        <select
                          value={unit}
                          onChange={(e) => setUnit(e.target.value)}
                          className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 h-11 bg-primary text-primary-foreground font-semibold"
                      >
                        💪 ¡Añadir Reto!
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={resetForm}
                        className="h-11"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </motion.form>
                )}

                {!selectedPreset && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    className="w-full h-9 text-xs text-muted-foreground"
                  >
                    Cerrar
                  </Button>
                )}
              </motion.div>
            ) : (
              <motion.form
                key="custom"
                onSubmit={handleSubmit}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
                className="space-y-3"
              >
                <Input
                  placeholder="Nombre del hábito (ej: Leer 15 min)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="h-11 text-sm"
                  required
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Meta diaria (ej: 15)"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    min={1}
                    className="h-11 text-sm"
                    required
                  />
                  <select
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground block mb-1">
                    Categoría
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all border ${
                          category === cat.key
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-secondary text-muted-foreground border-border hover:text-foreground"
                        }`}
                      >
                        {cat.emoji} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="submit"
                    className="flex-1 h-11 bg-primary text-primary-foreground font-semibold"
                  >
                    💪 ¡Crear Reto!
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={resetForm}
                    className="h-11"
                  >
                    Cancelar
                  </Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
