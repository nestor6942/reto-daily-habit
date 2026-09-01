import { useMemo } from "react";
import type { Challenge, DailyRecord } from "@/types/challenge";
import { HeatmapCalendar } from "./HeatmapCalendar";
import { Flame, Trophy, CheckCircle, TrendingUp, Zap } from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { calculateGamification } from "@/lib/achievements";
import { getLocalDateStr } from "@/hooks/useAppData";

interface Props {
  challenges: Challenge[];
  history: DailyRecord[];
  streakCount: number;
  bestStreak: number;
}

export function AnalyticsDashboard({
  challenges,
  history,
  streakCount,
  bestStreak,
}: Props) {
  const today = getLocalDateStr();
  const gamification = useMemo(
    () => calculateGamification(challenges, history, streakCount, bestStreak),
    [challenges, history, streakCount, bestStreak]
  );

  // Total challenges completed all time
  const totalCompletedChallenges = useMemo(() => {
    const fromHistory = history.reduce(
      (acc, curr) => acc + (curr.challengesCompleted?.length || 0),
      0
    );
    const fromToday = challenges.filter(
      (c) => c.currentValue >= c.targetValue
    ).length;
    return fromHistory + fromToday;
  }, [history, challenges]);

  // Last 7 days data for chart
  const weeklyData = useMemo(() => {
    const result = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const dayLabel = d.toLocaleDateString("es-ES", { weekday: "short" });

      if (dateStr === today) {
        const completed = challenges.filter(
          (c) => c.currentValue >= c.targetValue
        ).length;
        const total = challenges.length || 1;
        const pct = Math.round((completed / total) * 100);
        result.push({
          day: dayLabel.toUpperCase(),
          date: dateStr,
          percentage: pct,
          completed,
          total,
        });
      } else {
        const record = history.find((h) => h.date === dateStr);
        const completed = record?.challengesCompleted?.length || 0;
        const total = record?.totalChallenges || 1;
        const pct = record?.allCompleted
          ? 100
          : record
          ? Math.round((completed / total) * 100)
          : 0;
        result.push({
          day: dayLabel.toUpperCase(),
          date: dateStr,
          percentage: pct,
          completed,
          total: record?.totalChallenges || 0,
        });
      }
    }
    return result;
  }, [history, challenges, today]);

  // Success rate
  const successRate = useMemo(() => {
    if (history.length === 0) return 0;
    const completedDays = history.filter((h) => h.allCompleted).length;
    return Math.round((completedDays / history.length) * 100);
  }, [history]);

  return (
    <div className="space-y-4">
      {/* Gamification Level Banner */}
      <motion.div
        className="rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-streak/20 border border-primary/30 p-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-2">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Nivel {gamification.level}
            </span>
            <h3 className="text-lg font-bold text-foreground">
              {gamification.levelTitle}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary font-bold text-sm">
            <Zap className="w-4 h-4 fill-primary" />
            <span>{gamification.xp} XP</span>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div className="space-y-1">
          <div className="h-2 rounded-full bg-background/60 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.max(
                    0,
                    ((gamification.xp - gamification.currentLevelXp) /
                      (gamification.nextLevelXp - gamification.currentLevelXp)) *
                      100
                  )
                )}%`,
              }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground text-right">
            {gamification.xp} / {gamification.nextLevelXp} XP para el siguiente
            nivel
          </p>
        </div>
      </motion.div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border bg-card p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-streak">
            <Flame className="w-4 h-4" />
            <span className="text-xs font-medium text-muted-foreground">
              Racha Actual
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {streakCount} {streakCount === 1 ? "día" : "días"}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-500">
            <Trophy className="w-4 h-4" />
            <span className="text-xs font-medium text-muted-foreground">
              Mejor Racha
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {bestStreak} {bestStreak === 1 ? "día" : "días"}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-success">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-medium text-muted-foreground">
              Retos Cumplidos
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {totalCompletedChallenges}
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-3.5 space-y-1 shadow-sm">
          <div className="flex items-center gap-1.5 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium text-muted-foreground">
              Efectividad
            </span>
          </div>
          <p className="text-2xl font-bold text-foreground">{successRate}%</p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="rounded-2xl border bg-card p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm text-card-foreground">
            Rendimiento de los últimos 7 días
          </h3>
          <span className="text-xs text-muted-foreground">% Completado</span>
        </div>

        <div className="h-40 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 5, right: 5, left: -25, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                ticks={[0, 50, 100]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border bg-popover px-3 py-2 text-xs shadow-md">
                        <p className="font-semibold text-popover-foreground">
                          {data.date}
                        </p>
                        <p className="text-primary font-bold">
                          {data.percentage}% cumplido
                        </p>
                        {data.total > 0 && (
                          <p className="text-muted-foreground">
                            {data.completed}/{data.total} retos
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="percentage" radius={[6, 6, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.percentage === 100
                        ? "hsl(var(--success))"
                        : entry.percentage > 0
                        ? "hsl(var(--primary))"
                        : "hsl(var(--muted))"
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Calendar Matrix */}
      <HeatmapCalendar history={history} />
    </div>
  );
}
