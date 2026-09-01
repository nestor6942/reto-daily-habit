import { useMemo, useState } from "react";
import type { DailyRecord } from "@/types/challenge";
import { motion, AnimatePresence } from "framer-motion";
import { getLocalDateStr } from "@/hooks/useAppData";
import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";

interface Props {
  history: DailyRecord[];
  daysToShow?: number;
}

export function HeatmapCalendar({ history, daysToShow = 35 }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = getLocalDateStr();

  // Generate date range backwards from today
  const days = useMemo(() => {
    const list: {
      date: string;
      dayOfWeek: number;
      dayNum: number;
      monthName: string;
      record?: DailyRecord;
      status: "completed" | "partial" | "empty" | "today";
    }[] = [];

    const now = new Date();
    // Align to Sunday/Monday block or standard daysToShow
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const rec = history.find((h) => h.date === dateStr);

      let status: "completed" | "partial" | "empty" | "today" = "empty";
      if (dateStr === today) {
        status = rec?.allCompleted ? "completed" : "today";
      } else if (rec?.allCompleted) {
        status = "completed";
      } else if (rec && rec.challengesCompleted && rec.challengesCompleted.length > 0) {
        status = "partial";
      }

      list.push({
        date: dateStr,
        dayOfWeek: d.getDay(),
        dayNum: d.getDate(),
        monthName: d.toLocaleDateString("es-ES", { month: "short" }),
        record: rec,
        status,
      });
    }
    return list;
  }, [history, today, daysToShow]);

  const completedDaysCount = history.filter((h) => h.allCompleted).length;
  const consistencyRate = Math.min(
    100,
    Math.round((completedDaysCount / Math.max(1, history.length)) * 100)
  );

  const selectedRecord = selectedDate
    ? history.find((h) => h.date === selectedDate)
    : null;

  return (
    <div className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-card-foreground">
            Matriz de Consistencia
          </h3>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
          {consistencyRate}% Éxito
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-1.5 pt-1">
        {["D", "L", "M", "M", "J", "V", "S"].map((day, idx) => (
          <div
            key={idx}
            className="text-[10px] text-center font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}

        {days.map((item) => {
          const isSelected = selectedDate === item.date;
          let bgClass = "bg-muted/60 border-border/40 text-muted-foreground";

          if (item.status === "completed") {
            bgClass =
              "bg-emerald-500 text-white font-bold border-emerald-600 shadow-sm shadow-emerald-500/20";
          } else if (item.status === "partial") {
            bgClass =
              "bg-amber-500/30 border-amber-500/50 text-amber-700 dark:text-amber-300 font-semibold";
          } else if (item.status === "today") {
            bgClass =
              "bg-primary/20 border-primary border-2 text-primary font-bold animate-pulse";
          }

          return (
            <motion.button
              key={item.date}
              type="button"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.08 }}
              onClick={() =>
                setSelectedDate(selectedDate === item.date ? null : item.date)
              }
              className={`aspect-square rounded-lg border text-[11px] flex flex-col items-center justify-center transition-all relative ${bgClass} ${
                isSelected ? "ring-2 ring-foreground" : ""
              }`}
              title={`${item.date}: ${
                item.status === "completed"
                  ? "¡Completado!"
                  : item.status === "partial"
                  ? "Parcial"
                  : "Sin registro"
              }`}
            >
              <span>{item.dayNum}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-muted/60 border" />
          <span>Sin registro</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-amber-500/40 border border-amber-500/50" />
          <span>Parcial</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded bg-emerald-500" />
          <span>Completado</span>
        </div>
      </div>

      {/* Selected Day Tooltip Card */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-xl bg-muted/70 p-3 text-xs space-y-1 overflow-hidden"
          >
            <div className="flex items-center justify-between font-semibold">
              <span>{selectedDate}</span>
              {selectedRecord?.allCompleted ? (
                <span className="text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Día perfecto
                </span>
              ) : selectedRecord ? (
                <span className="text-amber-500 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Parcial (
                  {selectedRecord.challengesCompleted.length}/
                  {selectedRecord.totalChallenges})
                </span>
              ) : (
                <span className="text-muted-foreground">Sin actividad</span>
              )}
            </div>
            {selectedRecord &&
              selectedRecord.challengesCompleted.length > 0 && (
                <p className="text-muted-foreground">
                  Retos: {selectedRecord.challengesCompleted.join(", ")}
                </p>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
