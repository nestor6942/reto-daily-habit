import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Dumbbell, Sparkles, Sun, CheckCircle2, ChevronRight, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { soundManager } from "@/lib/soundEffects";
import type { HabitCategory } from "@/types/challenge";

export interface Program {
  id: string;
  title: string;
  duration: string;
  category: HabitCategory;
  description: string;
  level: string;
  icon: typeof Flame;
  color: string;
  challenges: { name: string; target: number; unit: string; category: HabitCategory }[];
}

const PROGRAMS: Program[] = [
  {
    id: "fat-burn-21",
    title: "Reto 21 Días: Quema de Grasa",
    duration: "21 Días",
    category: "cardio",
    description: "Rutina intensiva de cardio en casa para acelerar el metabolismo y quemar calorías.",
    level: "Intermedio",
    icon: Flame,
    color: "from-amber-500/20 to-red-500/20 text-amber-500 border-amber-500/30",
    challenges: [
      { name: "Jumping Jacks", target: 60, unit: "reps", category: "cardio" },
      { name: "Burpees de potencia", target: 15, unit: "reps", category: "cardio" },
      { name: "Mountain Climbers", target: 40, unit: "reps", category: "cardio" },
      { name: "Tomar agua pura", target: 8, unit: "vasos", category: "nutricion" },
    ],
  },
  {
    id: "strength-30",
    title: "Reto 30 Días: Fuerza Titánica",
    duration: "30 Días",
    category: "fuerza",
    description: "Desarrolla pectorales, piernas y core con calistenia y sobrecarga progresiva.",
    level: "Avanzado",
    icon: Dumbbell,
    color: "from-red-500/20 to-purple-500/20 text-red-500 border-red-500/30",
    challenges: [
      { name: "Flexiones diamante", target: 25, unit: "reps", category: "fuerza" },
      { name: "Sentadillas profundas", target: 60, unit: "reps", category: "fuerza" },
      { name: "Plancha estricta", target: 90, unit: "seg", category: "fuerza" },
      { name: "Fondos de tríceps", target: 20, unit: "reps", category: "fuerza" },
    ],
  },
  {
    id: "zen-14",
    title: "Reto 14 Días: Mente & Cero Estrés",
    duration: "14 Días",
    category: "mente",
    description: "Disminuye la ansiedad, mejora el sueño y conecta con tu paz interior.",
    level: "Todos los niveles",
    icon: Sparkles,
    color: "from-emerald-500/20 to-teal-500/20 text-emerald-500 border-emerald-500/30",
    challenges: [
      { name: "Meditación diaria", target: 10, unit: "min", category: "mente" },
      { name: "Yoga y estiramientos", target: 15, unit: "min", category: "flexibilidad" },
      { name: "Lectura consciente", target: 15, unit: "páginas", category: "mente" },
    ],
  },
  {
    id: "morning-21",
    title: "Reto 21 Días: Madrugador Imparable",
    duration: "21 Días",
    category: "general",
    description: "Construye una rutina matutina de alto impacto antes de empezar tu jornada.",
    level: "Principiante",
    icon: Sun,
    color: "from-blue-500/20 to-amber-500/20 text-blue-500 border-blue-500/30",
    challenges: [
      { name: "Despertar temprano", target: 1, unit: "veces", category: "general" },
      { name: "Caminar / Trote matutino", target: 20, unit: "min", category: "cardio" },
      { name: "Sin azúcar añadido", target: 1, unit: "veces", category: "nutricion" },
    ],
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPro: boolean;
  onEnroll: (challenges: { name: string; target: number; unit: string; category: HabitCategory }[]) => void;
  onUpgradeClick: () => void;
}

export function PremiumProgramsModal({
  open,
  onOpenChange,
  isPro,
  onEnroll,
  onUpgradeClick,
}: Props) {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  const handleEnrollClick = (prog: Program) => {
    if (!isPro) {
      toast.info("Los programas guiados son exclusivos para miembros PRO.");
      onUpgradeClick();
      return;
    }

    soundManager.playAchievement();
    onEnroll(prog.challenges);
    toast.success(`¡Te has inscrito al "${prog.title}"! Los hábitos fueron añadidos.`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-5 max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
              <Sparkles className="w-5 h-5" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Programas Guiados de Hábitos
            </DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Estructuras probadas de 14, 21 y 30 días para transformar tu disciplina.
          </p>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {PROGRAMS.map((prog) => {
            const Icon = prog.icon;
            return (
              <motion.div
                key={prog.id}
                whileHover={{ scale: 1.01 }}
                className={`rounded-2xl border bg-card p-4 space-y-2 transition-all shadow-sm ${
                  !isPro ? "opacity-90" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr flex items-center justify-center border ${prog.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-foreground">
                        {prog.title}
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="font-semibold text-primary">
                          {prog.duration}
                        </span>
                        <span>•</span>
                        <span>{prog.level}</span>
                      </div>
                    </div>
                  </div>

                  {!isPro && (
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> PRO
                    </span>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {prog.description}
                </p>

                {/* Challenges included */}
                <div className="rounded-xl bg-muted/50 p-2.5 space-y-1 text-xs">
                  <span className="text-[10px] font-bold uppercase text-muted-foreground">
                    Hábitos diarios incluidos:
                  </span>
                  <div className="grid grid-cols-2 gap-1 pt-0.5">
                    {prog.challenges.map((c) => (
                      <span key={c.name} className="text-foreground text-[11px] flex items-center gap-1 truncate">
                        <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
                        {c.name} ({c.target} {c.unit})
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => handleEnrollClick(prog)}
                  className="w-full h-10 text-xs font-semibold bg-primary text-primary-foreground gap-1 rounded-xl"
                >
                  {isPro ? "¡Inscribirme a este Reto!" : "Desbloquear con PRO"}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </motion.div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
