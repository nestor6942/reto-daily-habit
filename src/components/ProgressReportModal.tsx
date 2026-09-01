import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, FileText, CheckCircle2, Flame, Trophy, Activity } from "lucide-react";
import type { Challenge, DailyRecord } from "@/types/challenge";
import { getLocalDateStr } from "@/hooks/useAppData";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenges: Challenge[];
  history: DailyRecord[];
  streakCount: number;
  bestStreak: number;
  userName?: string;
  userEmail?: string;
  weight?: string;
  height?: string;
  goal?: string;
}

export function ProgressReportModal({
  open,
  onOpenChange,
  challenges,
  history,
  streakCount,
  bestStreak,
  userName = "Atleta de Reto Diario",
  userEmail = "Usuario",
  weight,
  height,
  goal,
}: Props) {
  const today = getLocalDateStr();
  const completedDays = history.filter((h) => h.allCompleted).length;
  const successRate = history.length > 0
    ? Math.round((completedDays / history.length) * 100)
    : 0;

  const bmi = weight && height
    ? (parseFloat(weight) / (parseFloat(height) / 100) ** 2).toFixed(1)
    : null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center text-primary">
              <FileText className="w-5 h-5" />
            </div>
            <DialogTitle className="text-lg font-bold">
              Informe de Rendimiento
            </DialogTitle>
          </div>
          <Button
            size="sm"
            onClick={handlePrint}
            className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir / PDF
          </Button>
        </DialogHeader>

        {/* Printable Report Sheet */}
        <div id="printable-report" className="space-y-4 pt-2 text-xs">
          {/* Header */}
          <div className="border-b pb-3 flex items-start justify-between">
            <div>
              <h3 className="font-extrabold text-base text-foreground">
                {userName}
              </h3>
              <p className="text-muted-foreground">{userEmail}</p>
              {goal && (
                <p className="text-primary font-semibold mt-0.5 capitalize">
                  Objetivo: {goal.replace("_", " ")}
                </p>
              )}
            </div>
            <div className="text-right text-muted-foreground">
              <span className="font-bold text-foreground block">Reto Diario Report</span>
              <span>{today}</span>
            </div>
          </div>

          {/* Physical Stats if available */}
          {(weight || height || bmi) && (
            <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-muted/60">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Peso</span>
                <p className="font-bold text-foreground text-sm">{weight ? `${weight} kg` : "—"}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Altura</span>
                <p className="font-bold text-foreground text-sm">{height ? `${height} cm` : "—"}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">IMC</span>
                <p className="font-bold text-primary text-sm">{bmi || "—"}</p>
              </div>
            </div>
          )}

          {/* Metrics KPIs */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl border bg-card flex items-center gap-2.5">
              <Flame className="w-5 h-5 text-streak" />
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold">Racha Actual</span>
                <span className="font-bold text-sm text-foreground">{streakCount} días</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border bg-card flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold">Mejor Racha</span>
                <span className="font-bold text-sm text-foreground">{bestStreak} días</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border bg-card flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold">Días Perfectos</span>
                <span className="font-bold text-sm text-foreground">{completedDays} días</span>
              </div>
            </div>
            <div className="p-3 rounded-xl border bg-card flex items-center gap-2.5">
              <Activity className="w-5 h-5 text-primary" />
              <div>
                <span className="text-[10px] text-muted-foreground block font-semibold">Tasa de Éxito</span>
                <span className="font-bold text-sm text-foreground">{successRate}%</span>
              </div>
            </div>
          </div>

          {/* Current Active Challenges */}
          <div className="space-y-1.5 pt-1">
            <span className="font-bold text-xs text-foreground uppercase tracking-wider block">
              Retos y Hábitos del Programa ({challenges.length})
            </span>
            <div className="rounded-xl border divide-y overflow-hidden">
              {challenges.map((c) => (
                <div key={c.id} className="p-2.5 flex items-center justify-between">
                  <span className="font-medium text-foreground">{c.name}</span>
                  <span className="font-bold text-muted-foreground">
                    {c.currentValue} / {c.targetValue} {c.unit || "reps"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
