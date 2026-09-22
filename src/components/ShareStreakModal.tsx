import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Copy, Check, Share2, Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { soundManager } from "@/lib/soundEffects";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  streakCount: number;
  bestStreak: number;
  completedCount: number;
}

export function ShareStreakModal({
  open,
  onOpenChange,
  streakCount,
  bestStreak,
  completedCount,
}: Props) {
  const [copied, setCopied] = useState(false);

  const shareText = `🔥 ¡Llevo una racha de ${streakCount} días imparables en Reto Diario! Superando mis límites cada día 💪🎯 #RetoDiario #Disciplina`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    soundManager.playPop();
    toast.success("¡Texto copiado al portapapeles para compartir!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Mi racha en Reto Diario",
          text: shareText,
          url: window.location.origin,
        });
        soundManager.playAchievement();
      } catch {
        // cancelled by user
      }
    } else {
      handleCopy();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-streak/20 flex items-center justify-center text-streak mb-2 border border-streak/30">
            <Flame className="w-8 h-8 fill-streak" />
          </div>
          <DialogTitle className="text-2xl font-black text-foreground">
            ¡Comparte tu Logro!
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Inspira a tus amigos y demuestra tu disciplina acumulada.
          </p>
        </DialogHeader>

        {/* Visual Share Card */}
        <div className="rounded-2xl border bg-gradient-to-br from-card via-background to-streak/10 p-5 shadow-inner text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-streak/10 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-streak/15 text-streak text-xs font-black">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Racha Oficial de Reto Diario</span>
          </div>

          <div className="py-2">
            <span className="text-5xl font-black text-foreground tracking-tight">
              {streakCount}
            </span>
            <span className="text-lg font-bold text-muted-foreground ml-1.5">
              {streakCount === 1 ? "Día" : "Días"}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
            <div className="p-2 rounded-xl bg-card border">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Mejor Racha</span>
              <p className="font-black text-foreground text-sm">{bestStreak} días</p>
            </div>
            <div className="p-2 rounded-xl bg-card border">
              <span className="text-muted-foreground text-[10px] uppercase font-bold">Retos de Hoy</span>
              <p className="font-black text-primary text-sm">{completedCount} listos</p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleNativeShare}
            className="flex-1 h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground gap-1.5 shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartir</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleCopy}
            className="h-11 px-4 rounded-xl text-xs font-semibold gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-success" />
                <span>Copiado</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
