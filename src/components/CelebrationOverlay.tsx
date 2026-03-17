import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, PartyPopper } from "lucide-react";

interface Props {
  show: boolean;
  streakCount: number;
}

const CONFETTI_COLORS = [
  "hsl(145, 72%, 40%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 70%, 55%)",
  "hsl(200, 80%, 50%)",
  "hsl(350, 80%, 55%)",
  "hsl(50, 95%, 55%)",
];

function ConfettiPiece({ index }: { index: number }) {
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const left = Math.random() * 100;
  const delay = Math.random() * 0.5;
  const size = 6 + Math.random() * 8;
  const rotation = Math.random() * 360;

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
        y: [0, 400 + Math.random() * 300],
        rotate: [rotation, rotation + 360 * (Math.random() > 0.5 ? 1 : -1)],
        x: [0, (Math.random() - 0.5) * 150],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: 2 + Math.random(),
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
      const timer = setTimeout(() => setVisible(false), 4000);
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
          {/* Confetti */}
          {Array.from({ length: 40 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}

          {/* Center message */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="bg-card/95 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-success/30 text-center pointer-events-auto"
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
            >
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Trophy className="w-16 h-16 text-streak mx-auto mb-3" />
              </motion.div>
              <h2 className="text-2xl font-bold text-card-foreground mb-1">
                ¡RETOS COMPLETADOS!
              </h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-streak fill-streak" />
                <span className="text-lg font-semibold text-streak">
                  {streakCount} {streakCount === 1 ? "día" : "días"} de racha
                </span>
                <Star className="w-5 h-5 text-streak fill-streak" />
              </div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <PartyPopper className="w-4 h-4" />
                <span className="text-sm">¡Sigue así, campeón!</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
