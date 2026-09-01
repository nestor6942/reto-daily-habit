import { Flame, Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  count: number;
  bestStreak?: number;
}

export function StreakBadge({ count, bestStreak = 0 }: Props) {
  return (
    <div className="flex items-center justify-between gap-2">
      {/* Current Active Streak */}
      <div className="flex items-center gap-2 rounded-2xl bg-streak/15 border border-streak/30 px-3.5 py-2">
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            rotate: [0, -8, 8, 0],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            repeatDelay: 1.5,
          }}
        >
          <Flame className="w-5 h-5 text-streak fill-streak" />
        </motion.div>
        <div className="flex items-baseline gap-1">
          <motion.span
            key={count}
            className="font-extrabold text-streak text-lg leading-none"
            initial={{ scale: 1.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {count}
          </motion.span>
          <span className="text-xs font-semibold text-foreground">
            {count === 1 ? "día de racha" : "días seguidos"}
          </span>
        </div>
      </div>

      {/* Best Streak Badge */}
      {bestStreak > 0 && (
        <div className="flex items-center gap-1.5 rounded-2xl bg-muted/80 border border-border px-3 py-2 text-xs font-medium text-muted-foreground">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>
            Récord: <strong className="text-foreground">{bestStreak}</strong> d
          </span>
        </div>
      )}
    </div>
  );
}
