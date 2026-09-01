import { useState } from "react";
import type { Challenge, HabitCategory } from "@/types/challenge";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Check, Trash2, Edit3, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EditChallengeDialog } from "./EditChallengeDialog";

interface Props {
  challenge: Challenge;
  onIncrement: () => void;
  onDecrement: () => void;
  onToggleComplete: () => void;
  onReset: () => void;
  onRemove: () => void;
  onUpdate: (
    id: string,
    data: {
      name: string;
      targetValue: number;
      unit: string;
      category: HabitCategory;
    }
  ) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  fuerza: "bg-red-500/10 text-red-500 border-red-500/20",
  cardio: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  flexibilidad: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  mente: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  nutricion: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  general: "bg-primary/10 text-primary border-primary/20",
};

const CATEGORY_LABELS: Record<string, string> = {
  fuerza: "💪 Fuerza",
  cardio: "🏃 Cardio",
  flexibilidad: "🧘 Flex",
  mente: "🧠 Mente",
  nutricion: "🥗 Nutrición",
  general: "🎯 General",
};

export function ChallengeCard({
  challenge,
  onIncrement,
  onDecrement,
  onToggleComplete,
  onReset,
  onRemove,
  onUpdate,
}: Props) {
  const [editOpen, setEditOpen] = useState(false);
  const { name, currentValue, targetValue, unit = "reps", category = "general" } =
    challenge;
  const percent = Math.min(100, Math.round((currentValue / targetValue) * 100));
  const done = currentValue >= targetValue;

  const categoryStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS.general;
  const categoryLabel = CATEGORY_LABELS[category] || CATEGORY_LABELS.general;

  return (
    <>
      <motion.div
        className={`relative overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${
          done
            ? "border-success/40 bg-success/5 shadow-sm shadow-success/10"
            : "bg-card border-border/70 hover:border-primary/40 shadow-sm"
        }`}
        whileHover={{ y: -2 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Glow accent when finished */}
        {done && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10" />
        )}

        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${categoryStyle}`}
              >
                {categoryLabel}
              </span>
              {done && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success text-success-foreground">
                  ¡Cumplido!
                </span>
              )}
            </div>
            <h3 className="font-semibold text-card-foreground truncate text-base sm:text-lg">
              {name}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
              <motion.span
                key={currentValue}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-bold text-foreground inline-block"
              >
                {currentValue}
              </motion.span>
              <span>/ {targetValue} {unit}</span>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Decrement Button */}
            {currentValue > 0 && !done && (
              <motion.div whileTap={{ scale: 0.85 }}>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={onDecrement}
                  className="w-10 h-10 rounded-full border-border hover:bg-muted text-muted-foreground"
                  aria-label={`Restar progreso al reto ${name}`}
                  title="Restar 1"
                >
                  <Minus className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {/* Main Action Button (Plus or Check) */}
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="done"
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleComplete}
                  className="cursor-pointer"
                  title="Clic para desmarcar"
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-success shadow-md shadow-success/20 text-success-foreground">
                    <Check className="w-6 h-6 stroke-[3]" />
                  </div>
                </motion.div>
              ) : (
                <motion.div key="increment" whileTap={{ scale: 0.85 }}>
                  <Button
                    size="icon"
                    onClick={onIncrement}
                    className="w-12 h-12 rounded-full text-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                    aria-label={`Sumar progreso al reto ${name}`}
                    title="Sumar 1"
                  >
                    <Plus className="w-6 h-6 stroke-[2.5]" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Secondary actions dropdown / buttons */}
            <div className="flex flex-col gap-1 ml-0.5">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setEditOpen(true)}
                className="w-7 h-7 text-muted-foreground hover:text-foreground"
                aria-label={`Editar reto ${name}`}
                title="Editar"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={onRemove}
                className="w-7 h-7 text-muted-foreground hover:text-destructive"
                aria-label={`Eliminar reto ${name}`}
                title="Eliminar"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-1">
          <div className="relative h-2.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className={`absolute inset-y-0 left-0 rounded-full transition-all duration-300 ${
                done
                  ? "bg-gradient-to-r from-success to-emerald-400"
                  : "bg-gradient-to-r from-primary to-primary/80"
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <button
              onClick={onReset}
              className="hover:underline flex items-center gap-0.5 text-muted-foreground hover:text-foreground transition-colors"
              title="Reiniciar progreso de hoy"
            >
              <RotateCcw className="w-3 h-3" />
              Reiniciar
            </button>
            <span className="font-semibold text-foreground">{percent}%</span>
          </div>
        </div>
      </motion.div>

      <EditChallengeDialog
        challenge={challenge}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={onUpdate}
      />
    </>
  );
}
