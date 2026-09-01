import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, PartyPopper, Flame } from "lucide-react";
import { soundManager } from "@/lib/soundEffects";

interface Props {
  show: boolean;
  streakCount: number;
}

const CONFETTI_COLORS = [
  "hsl(145, 72%, 45%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 70%, 55%)",
  "hsl(200, 80%, 50%)",
  "hsl(350, 80%, 55%)",
  "hsl(50, 95%, 55%)",
];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = (index * 2.5) % 100;
  const delay = (index % 10) * 0.08;
  const size = 6 + (index % 8);
  const rotation = index * 45;

  return (
    <motion.div
      className="absolute rounded-sm"
      style={{
        left: `${left}%`,
        top: -10,
        width: size,
        height: size * 0.6,
        backgroundColor: color,
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{
        y: [0, 480 + (index % 5) * 60],
        rotate: [rotation, rotation + 360 * (index % 2 === 0 ? 1 : -1)],
        x: [0, (index % 2 === 0 ? 1 : -1) * 80],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 2.5 + (index % 4) * 0.3,
        delay,
        ease: "easeOut",
      }}
    />
  );
}

export function CelebrationOverlay({ show, streakCount }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      soundManager.playDailyVictory();
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-50 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Confetti particles */}
          {Array.from({ length: 45 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}

          {/* Center dialog message */}
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              className="bg-card/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-success/40 text-center pointer-events-auto max-w-sm w-full mx-auto"
              initial={{ scale: 0.6, rotate: -6, y: 30 }}
              animate={{ scale: 1, rotate: 0, y: 0 }}
              exit={{ scale: 0.7, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <motion.div
                animate={{ rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.15, 1] }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-streak/20 to-success/20 flex items-center justify-center mb-3 shadow-inner border border-streak/30"
              >
                <Trophy className="w-10 h-10 text-streak" />
              </motion.div>

              <h2 className="text-2xl font-black tracking-tight text-foreground mb-1">
                ¡DÍA COMPLETADO!
              </h2>

              <p className="text-xs text-muted-foreground mb-4">
                Has cumplido todos tus retos diarios con éxito
              </p>

              <div className="flex items-center justify-center gap-2 rounded-2xl bg-streak/10 border border-streak/30 py-2.5 px-4 mb-4">
                <Flame className="w-5 h-5 text-streak fill-streak" />
                <span className="text-base font-extrabold text-streak">
                  {streakCount} {streakCount === 1 ? "día" : "días"} de racha
                </span>
                <Star className="w-4 h-4 text-streak fill-streak" />
              </div>

              <div className="flex items-center justify-center gap-1.5 text-muted-foreground text-xs font-medium">
                <PartyPopper className="w-4 h-4 text-primary" />
                <span>+100 XP ganados hoy. ¡Sigue con esta fuerza!</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
