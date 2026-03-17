import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus, Dumbbell, Footprints, Timer, Flame, Waves, Mountain, Bike,
  PersonStanding, Activity, StretchHorizontal, Zap, HeartPulse,
  Swords, Target, Skull, Crown, Rocket, Shield
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Category = "fuerza" | "cardio" | "flexibilidad" | "extremo";

const CATEGORIES: { key: Category; label: string; emoji: string }[] = [
  { key: "fuerza", label: "Fuerza", emoji: "💪" },
  { key: "cardio", label: "Cardio", emoji: "🏃" },
  { key: "flexibilidad", label: "Flex", emoji: "🧘" },
  { key: "extremo", label: "Extremo", emoji: "🔥" },
];

const PRESET_EXERCISES: { name: string; icon: typeof Dumbbell; defaultTarget: number; category: Category; difficulty: 1 | 2 | 3 }[] = [
  // Fuerza
  { name: "Flexiones", icon: Dumbbell, defaultTarget: 30, category: "fuerza", difficulty: 1 },
  { name: "Sentadillas", icon: PersonStanding, defaultTarget: 50, category: "fuerza", difficulty: 1 },
  { name: "Flexiones diamante", icon: Swords, defaultTarget: 15, category: "fuerza", difficulty: 2 },
  { name: "Dominadas", icon: Crown, defaultTarget: 10, category: "fuerza", difficulty: 3 },
  { name: "Plancha (seg)", icon: Mountain, defaultTarget: 60, category: "fuerza", difficulty: 2 },
  { name: "Fondos de tríceps", icon: Shield, defaultTarget: 20, category: "fuerza", difficulty: 2 },
  // Cardio
  { name: "Jumping Jacks", icon: Zap, defaultTarget: 50, category: "cardio", difficulty: 1 },
  { name: "Saltos de tijera", icon: Footprints, defaultTarget: 50, category: "cardio", difficulty: 1 },
  { name: "Burpees", icon: Timer, defaultTarget: 15, category: "cardio", difficulty: 2 },
  { name: "Correr (min)", icon: Activity, defaultTarget: 20, category: "cardio", difficulty: 1 },
  { name: "Ciclismo (min)", icon: Bike, defaultTarget: 30, category: "cardio", difficulty: 1 },
  { name: "Mountain climbers", icon: Rocket, defaultTarget: 40, category: "cardio", difficulty: 2 },
  // Flexibilidad
  { name: "Yoga (min)", icon: HeartPulse, defaultTarget: 15, category: "flexibilidad", difficulty: 1 },
  { name: "Estiramientos (min)", icon: StretchHorizontal, defaultTarget: 10, category: "flexibilidad", difficulty: 1 },
  { name: "Natación (min)", icon: Waves, defaultTarget: 30, category: "flexibilidad", difficulty: 2 },
  // Extremo
  { name: "100 Burpees", icon: Skull, defaultTarget: 100, category: "extremo", difficulty: 3 },
  { name: "Sentadillas con salto", icon: Flame, defaultTarget: 30, category: "extremo", difficulty: 3 },
  { name: "Zancadas", icon: Target, defaultTarget: 40, category: "extremo", difficulty: 2 },
  { name: "Sprints (seg)", icon: Zap, defaultTarget: 120, category: "extremo", difficulty: 3 },
  { name: "Saltos al cajón", icon: Rocket, defaultTarget: 20, category: "extremo", difficulty: 3 },
];

const DIFFICULTY_LABELS = ["", "Fácil", "Medio", "Bestia"];
const DIFFICULTY_COLORS = [
  "",
  "text-success bg-success/10 border-success/30",
  "text-streak bg-streak/10 border-streak/30",
  "text-destructive bg-destructive/10 border-destructive/30",
];

interface Props {
  onAdd: (name: string, target: number) => void;
}

export function AddChallengeForm({ onAdd }: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"select" | "custom">("select");
  const [category, setCategory] = useState<Category>("fuerza");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const filteredExercises = PRESET_EXERCISES.filter((p) => p.category === category);

  const handlePresetSelect = (preset: typeof PRESET_EXERCISES[0]) => {
    setSelectedPreset(preset.name);
    setName(preset.name);
    setTarget(String(preset.defaultTarget));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = parseInt(target, 10);
    if (name.trim() && t > 0) {
      onAdd(name.trim(), t);
      resetForm();
    }
  };

  const resetForm = () => {
    setName("");
    setTarget("");
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
            className="w-full h-14 border-dashed border-2 text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Añadir reto
          </Button>
        </motion.div>
      ) : (
        <motion.div
          key="form"
          className="rounded-2xl border bg-card p-4 space-y-3"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
        >
          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-muted">
            <button
              type="button"
              onClick={() => { setMode("select"); setSelectedPreset(null); setName(""); setTarget(""); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === "select"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Ejercicios
            </button>
            <button
              type="button"
              onClick={() => { setMode("custom"); setSelectedPreset(null); setName(""); setTarget(""); }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                mode === "custom"
                  ? "bg-background text-foreground shadow-sm"
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
                <div className="flex gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => { setCategory(cat.key); setSelectedPreset(null); setName(""); setTarget(""); }}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                        category === cat.key
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "bg-secondary text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {cat.emoji} {cat.label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {filteredExercises.map((preset) => {
                    const Icon = preset.icon;
                    const isSelected = selectedPreset === preset.name;
                    return (
                      <motion.button
                        key={preset.name}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetSelect(preset)}
                        className={`flex flex-col gap-1.5 p-3 rounded-xl border text-left text-sm transition-all ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Icon className="w-4 h-4 shrink-0" />
                            <span className="font-medium truncate">{preset.name}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border w-fit ${DIFFICULTY_COLORS[preset.difficulty]}`}>
                          {DIFFICULTY_LABELS[preset.difficulty]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>

                {selectedPreset && (
                  <motion.form
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-3 overflow-hidden"
                  >
                    <Input
                      type="number"
                      placeholder="Meta"
                      value={target}
                      onChange={(e) => setTarget(e.target.value)}
                      min={1}
                      className="h-12 text-base"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 h-12 bg-primary text-primary-foreground">
                        💪 ¡A por ello!
                      </Button>
                      <Button type="button" variant="ghost" onClick={resetForm} className="h-12">
                        Cancelar
                      </Button>
                    </div>
                  </motion.form>
                )}

                {!selectedPreset && (
                  <Button type="button" variant="ghost" onClick={resetForm} className="w-full h-10">
                    Cancelar
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
                  placeholder="Nombre del reto (ej: Flexiones)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  className="h-12 text-base"
                />
                <Input
                  type="number"
                  placeholder="Meta (ej: 30)"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  min={1}
                  className="h-12 text-base"
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1 h-12 bg-primary text-primary-foreground">
                    💪 ¡A por ello!
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetForm} className="h-12">
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
