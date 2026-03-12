import type { DailyRecord } from "@/types/challenge";
import { CalendarCheck, CalendarX } from "lucide-react";

interface Props {
  history: DailyRecord[];
}

export function HistoryList({ history }: Props) {
  if (history.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8 text-sm">
        Aún no hay historial. ¡Completa tu primer día!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {history.map((record) => {
        const d = new Date(record.date + "T12:00:00");
        const label = d.toLocaleDateString("es-ES", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

        return (
          <div
            key={record.date}
            className={`flex items-center gap-3 rounded-xl p-3 ${
              record.allCompleted ? "bg-success/10" : "bg-muted"
            }`}
          >
            {record.allCompleted ? (
              <CalendarCheck className="w-5 h-5 text-success shrink-0" />
            ) : (
              <CalendarX className="w-5 h-5 text-muted-foreground shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm capitalize">{label}</p>
              <p className="text-xs text-muted-foreground truncate">
                {record.challengesCompleted.length}/{record.totalChallenges} completados
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
