import { useState, useEffect, useCallback } from "react";
import type { AppData, Challenge, DailyRecord } from "@/types/challenge";

const STORAGE_KEY = "reto-diario-data";

const getToday = () => new Date().toISOString().split("T")[0];

const getDefaultData = (): AppData => ({
  challenges: [],
  history: [],
  streakCount: 0,
  lastCompletedDate: null,
});

const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return JSON.parse(raw) as AppData;
  } catch {
    return getDefaultData();
  }
};

export function useAppData() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Reset current values if it's a new day
  useEffect(() => {
    const today = getToday();
    const lastDate = data.lastCompletedDate;
    // Check if we need to snapshot yesterday and reset
    const stored = loadData();
    if (stored.challenges.some((c) => c.currentValue > 0)) {
      // If there's progress from a previous session, check date
      const sessionDate = localStorage.getItem("reto-diario-session-date");
      if (sessionDate && sessionDate !== today) {
        // Save yesterday's record, reset values
        const completed = stored.challenges.filter(
          (c) => c.currentValue >= c.targetValue
        );
        const allDone =
          stored.challenges.length > 0 &&
          completed.length === stored.challenges.length;

        const record: DailyRecord = {
          date: sessionDate,
          challengesCompleted: completed.map((c) => c.name),
          totalChallenges: stored.challenges.length,
          allCompleted: allDone,
        };

        const newStreak = allDone
          ? stored.streakCount + 1
          : 0;

        setData({
          ...stored,
          challenges: stored.challenges.map((c) => ({
            ...c,
            currentValue: 0,
          })),
          history: [record, ...stored.history].slice(0, 90),
          streakCount: newStreak,
          lastCompletedDate: allDone ? sessionDate : stored.lastCompletedDate,
        });
      }
    }
    localStorage.setItem("reto-diario-session-date", today);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addChallenge = useCallback((name: string, targetValue: number) => {
    setData((prev) => ({
      ...prev,
      challenges: [
        ...prev.challenges,
        {
          id: crypto.randomUUID(),
          name,
          targetValue,
          currentValue: 0,
        },
      ],
    }));
  }, []);

  const increment = useCallback((id: string) => {
    setData((prev) => {
      const challenges = prev.challenges.map((c) =>
        c.id === id && c.currentValue < c.targetValue
          ? { ...c, currentValue: c.currentValue + 1 }
          : c
      );

      const allDone =
        challenges.length > 0 &&
        challenges.every((c) => c.currentValue >= c.targetValue);

      // Auto-record completion
      if (allDone && !prev.challenges.every((c) => c.currentValue >= c.targetValue)) {
        const today = getToday();
        const alreadyRecorded = prev.history.some((h) => h.date === today);
        if (!alreadyRecorded) {
          const record: DailyRecord = {
            date: today,
            challengesCompleted: challenges.map((c) => c.name),
            totalChallenges: challenges.length,
            allCompleted: true,
          };

          const isConsecutive =
            prev.lastCompletedDate === null ||
            daysBetween(prev.lastCompletedDate, today) <= 1;

          return {
            ...prev,
            challenges,
            history: [record, ...prev.history].slice(0, 90),
            streakCount: isConsecutive ? prev.streakCount + 1 : 1,
            lastCompletedDate: today,
          };
        }
      }

      return { ...prev, challenges };
    });
  }, []);

  const removeChallenge = useCallback((id: string) => {
    setData((prev) => ({
      ...prev,
      challenges: prev.challenges.filter((c) => c.id !== id),
    }));
  }, []);

  const resetToday = useCallback(() => {
    setData((prev) => ({
      ...prev,
      challenges: prev.challenges.map((c) => ({ ...c, currentValue: 0 })),
    }));
  }, []);

  return {
    challenges: data.challenges,
    history: data.history,
    streakCount: data.streakCount,
    addChallenge,
    increment,
    removeChallenge,
    resetToday,
  };
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.abs(Math.round((db.getTime() - da.getTime()) / 86400000));
}
