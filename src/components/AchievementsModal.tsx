import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Award, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";
import type { UserGamification } from "@/lib/achievements";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  gamification: UserGamification;
}

export function AchievementsModal({ open, onOpenChange, gamification }: Props) {
  const [filter, setFilter] = useState<string>("all");

  const filtered = gamification.achievements.filter((a) => {
    if (filter === "all") return true;
    if (filter === "unlocked") return a.unlocked;
    if (filter === "locked") return !a.unlocked;
    return a.category === filter;
  });

  const unlockedCount = gamification.achievements.filter(
    (a) => a.unlocked
  ).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[85vh] flex flex-col p-5">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-streak/20 flex items-center justify-center text-streak">
                <Award className="w-5 h-5" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Logros y Medallas
              </DialogTitle>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              {unlockedCount}/{gamification.achievements.length} Desbloqueados
            </span>
          </div>
        </DialogHeader>

        {/* Level and XP Header */}
        <div className="rounded-xl bg-gradient-to-r from-streak/15 to-primary/15 border border-streak/30 p-3.5 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted-foreground font-semibold uppercase">
              Tu Rango
            </span>
            <p className="font-bold text-base text-foreground">
              {gamification.levelTitle}
            </p>
          </div>
          <div className="flex items-center gap-1 font-extrabold text-primary text-base">
            <Zap className="w-4 h-4 fill-primary" />
            <span>{gamification.xp} XP</span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: "all", label: "Todos" },
            { id: "unlocked", label: "🏆 Desbloqueados" },
            { id: "locked", label: "🔒 Por conseguir" },
            { id: "streak", label: "🔥 Rachas" },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                filter === f.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 overflow-y-auto pr-1 flex-1 py-1">
          {filtered.map((badge) => (
            <motion.div
              key={badge.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`rounded-xl border p-3 flex gap-3 items-center transition-all ${
                badge.unlocked
                  ? "bg-card border-streak/40 shadow-sm shadow-streak/10"
                  : "bg-muted/40 border-border/60 opacity-70"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${
                  badge.unlocked
                    ? "bg-streak/15 border border-streak/30 shadow-inner"
                    : "bg-secondary/70 border border-border"
                }`}
              >
                {badge.unlocked ? (
                  <span>{badge.icon}</span>
                ) : (
                  <Lock className="w-5 h-5 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs sm:text-sm text-foreground truncate">
                    {badge.title}
                  </h4>
                  {badge.unlocked && (
                    <span className="text-[10px] text-emerald-600 font-extrabold uppercase">
                      ¡Listo!
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                  {badge.description}
                </p>

                {!badge.unlocked && (
                  <div className="mt-1.5 space-y-0.5">
                    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
