import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const DAILY_CHALLENGES = [
  { name: "🔥 Reto Infernal", exercises: [{ name: "Burpees", target: 20 }, { name: "Sentadillas", target: 50 }, { name: "Flexiones", target: 30 }] },
  { name: "⚡ Velocidad Extrema", exercises: [{ name: "Jumping Jacks", target: 100 }, { name: "Saltos de tijera", target: 60 }, { name: "Sprints (seg)", target: 120 }] },
  { name: "💪 Guerrero de Hierro", exercises: [{ name: "Flexiones", target: 50 }, { name: "Plancha (seg)", target: 90 }, { name: "Abdominales", target: 60 }] },
  { name: "🧘 Zen & Power", exercises: [{ name: "Yoga (min)", target: 20 }, { name: "Plancha (seg)", target: 60 }, { name: "Estiramientos (min)", target: 15 }] },
  { name: "🦵 Piernas de Acero", exercises: [{ name: "Sentadillas", target: 80 }, { name: "Zancadas", target: 40 }, { name: "Saltos al cajón", target: 20 }] },
  { name: "🏃 Cardio Demoledor", exercises: [{ name: "Correr (min)", target: 25 }, { name: "Jumping Jacks", target: 80 }, { name: "Burpees", target: 15 }] },
  { name: "🎯 Desafío del Día", exercises: [{ name: "Flexiones diamante", target: 20 }, { name: "Sentadillas con salto", target: 30 }, { name: "Mountain climbers", target: 40 }] },
];

interface Props {
  onAccept: (exercises: { name: string; target: number }[]) => void;
  hasChallenges: boolean;
}

export function DailyChallengeSuggestion({ onAccept, hasChallenges }: Props) {
  const challenge = useMemo(() => {
    const today = new Date();
    const idx = (today.getDate() + today.getMonth() * 31) % DAILY_CHALLENGES.length;
    return DAILY_CHALLENGES[idx];
  }, []);

  if (hasChallenges) return null;

  return (
    <motion.div
      className="rounded-2xl border-2 border-dashed border-streak/40 bg-streak/5 p-5 mb-4"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
        >
          <Sparkles className="w-5 h-5 text-streak" />
        </motion.div>
        <h3 className="font-bold text-card-foreground">Reto Sugerido del Día</h3>
      </div>
      <p className="text-lg font-bold text-streak mb-3">{challenge.name}</p>
      <div className="space-y-1.5 mb-4">
        {challenge.exercises.map((ex) => (
          <div key={ex.name} className="flex justify-between text-sm">
            <span className="text-card-foreground">{ex.name}</span>
            <span className="font-semibold text-muted-foreground">x{ex.target}</span>
          </div>
        ))}
      </div>
      <Button
        onClick={() => onAccept(challenge.exercises)}
        className="w-full h-12 bg-streak text-streak-foreground hover:bg-streak/90 font-bold text-base"
      >
        ¡Acepto el reto!
        <ChevronRight className="w-5 h-5 ml-1" />
      </Button>
    </motion.div>
  );
}
