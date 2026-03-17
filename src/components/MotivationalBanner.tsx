import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Flame, Zap, Heart, Mountain, Trophy } from "lucide-react";

const MOTIVATIONAL_QUOTES = [
  { text: "El dolor de hoy es la fuerza de mañana 💪", icon: Zap },
  { text: "No cuentes los días, haz que los días cuenten 🔥", icon: Flame },
  { text: "Tu único límite eres tú mismo 🚀", icon: Mountain },
  { text: "Cada repetición te acerca a tu mejor versión ⭐", icon: Sparkles },
  { text: "La disciplina supera a la motivación 🏆", icon: Trophy },
  { text: "Tu cuerpo puede, es tu mente la que necesita convencerse 🧠", icon: Heart },
  { text: "Un paso más, un día más, una victoria más 🎯", icon: Zap },
  { text: "Los campeones entrenan, los perdedores se quejan 💥", icon: Flame },
  { text: "Hoy es el día perfecto para superarte 🌟", icon: Sparkles },
  { text: "La constancia es el secreto del éxito 🔑", icon: Trophy },
  { text: "Sudar hoy, brillar mañana ✨", icon: Zap },
  { text: "No pares hasta estar orgulloso 🦁", icon: Mountain },
];

const STREAK_MESSAGES: Record<number, string> = {
  3: "🔥 ¡3 días seguidos! Estás en llamas",
  5: "⚡ ¡5 días! Eres imparable",
  7: "🏅 ¡Una semana completa! Increíble",
  10: "🌟 ¡10 días! Eres una máquina",
  14: "💎 ¡2 semanas! Nivel diamante",
  21: "🏆 ¡3 semanas! Leyenda viviente",
  30: "👑 ¡Un mes! Eres el GOAT",
};

interface Props {
  streakCount: number;
  challengesCount: number;
  completedCount: number;
}

export function MotivationalBanner({ streakCount, challengesCount, completedCount }: Props) {
  const quote = useMemo(() => {
    const today = new Date();
    const idx = (today.getDate() + today.getMonth()) % MOTIVATIONAL_QUOTES.length;
    return MOTIVATIONAL_QUOTES[idx];
  }, []);

  const streakMessage = STREAK_MESSAGES[streakCount];
  const allDone = challengesCount > 0 && completedCount === challengesCount;
  const Icon = quote.icon;

  if (allDone) return null;

  return (
    <motion.div
      className="rounded-2xl border border-primary/20 bg-primary/5 p-4 mb-4"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {streakMessage ? (
        <p className="text-sm font-semibold text-primary text-center">{streakMessage}</p>
      ) : (
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <Icon className="w-5 h-5 text-primary shrink-0" />
          </motion.div>
          <p className="text-sm font-medium text-card-foreground">{quote.text}</p>
        </div>
      )}
    </motion.div>
  );
}
