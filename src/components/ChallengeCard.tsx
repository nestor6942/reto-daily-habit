import type { Challenge } from "@/types/challenge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus, Check, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  challenge: Challenge;
  onIncrement: () => void;
  onRemove: () => void;
}

export function ChallengeCard({ challenge, onIncrement, onRemove }: Props) {
  const { name, currentValue, targetValue } = challenge;
  const percent = Math.min(100, Math.round((currentValue / targetValue) * 100));
  const done = currentValue >= targetValue;

  return (
    <motion.div
      className={`rounded-2xl border p-4 transition-colors ${done ? "border-success bg-success/10" : "bg-card border-border"}`}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-card-foreground truncate text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground">
            <motion.span
              key={currentValue}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block"
            >
              {currentValue}
            </motion.span>
            {" / "}{targetValue}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-3">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="done"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-success"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <Check className="w-7 h-7 text-success-foreground" />
              </motion.div>
            ) : (
              <motion.div key="increment" whileTap={{ scale: 0.85 }}>
                <Button
                  size="icon"
                  onClick={onIncrement}
                  className="w-14 h-14 rounded-full text-2xl bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="w-7 h-7" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <Button
              size="icon"
              variant="ghost"
              onClick={onRemove}
              className="w-10 h-10 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </motion.div>
        </div>
      </div>
      <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
        />
      </div>
      <p className="text-right text-xs text-muted-foreground mt-1">{percent}%</p>
    </motion.div>
  );
}
