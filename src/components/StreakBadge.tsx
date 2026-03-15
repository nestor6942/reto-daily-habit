import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface Props {
  count: number;
}

export function StreakBadge({ count }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-streak/15 px-4 py-2">
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, -5, 5, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 2,
        }}
      >
        <Flame className="w-5 h-5 text-streak" />
      </motion.div>
      <motion.span
        key={count}
        className="font-bold text-streak text-lg"
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {count}
      </motion.span>
      <span className="text-sm text-muted-foreground">
        {count === 1 ? "día" : "días"} seguidos
      </span>
    </div>
  );
}
