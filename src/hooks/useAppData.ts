import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Challenge, DailyRecord, HabitCategory } from "@/types/challenge";
import { soundManager } from "@/lib/soundEffects";

// Accurate local date in YYYY-MM-DD
export const getLocalDateStr = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getYesterdayStr = (todayStr: string = getLocalDateStr()): string => {
  const [y, m, d] = todayStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  return getLocalDateStr(date);
};

export const daysBetweenDates = (dateA: string, dateB: string): number => {
  const [y1, m1, d1] = dateA.split("-").map(Number);
  const [y2, m2, d2] = dateB.split("-").map(Number);
  const da = new Date(y1, m1 - 1, d1).getTime();
  const db = new Date(y2, m2 - 1, d2).getTime();
  return Math.abs(Math.round((db - da) / (1000 * 60 * 60 * 24)));
};

const DEFAULT_GUEST_CHALLENGES: Challenge[] = [
  {
    id: "default-1",
    name: "Flexiones de brazos",
    targetValue: 30,
    currentValue: 0,
    unit: "reps",
    category: "fuerza",
  },
  {
    id: "default-2",
    name: "Sentadillas",
    targetValue: 40,
    currentValue: 0,
    unit: "reps",
    category: "fuerza",
  },
  {
    id: "default-3",
    name: "Caminar / Cardio",
    targetValue: 20,
    currentValue: 0,
    unit: "min",
    category: "cardio",
  },
  {
    id: "default-4",
    name: "Beber agua",
    targetValue: 8,
    currentValue: 0,
    unit: "vasos",
    category: "nutricion",
  },
];

export function useAppData() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  // Load and sync data
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const today = getLocalDateStr();
      const lastActiveDate = localStorage.getItem("reto_last_active_date");
      const isNewDay = lastActiveDate !== today;
      localStorage.setItem("reto_last_active_date", today);

      if (user) {
        setIsGuest(false);
        try {
          const [challengesRes, historyRes, streakRes] = await Promise.all([
            supabase
              .from("challenges")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: true }),
            supabase
              .from("daily_records")
              .select("*")
              .eq("user_id", user.id)
              .order("date", { ascending: false })
              .limit(90),
            supabase
              .from("user_streaks")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle(),
          ]);

          let loadedChallenges: Challenge[] = [];
          if (challengesRes.data) {
            loadedChallenges = challengesRes.data.map((c) => ({
              id: c.id,
              name: c.name,
              targetValue: c.target_value,
              currentValue: isNewDay ? 0 : c.current_value,
              unit: "reps",
              category: "fuerza",
              lastUpdatedDate: today,
            }));

            // If it's a new day, reset DB current_value to 0
            if (isNewDay && challengesRes.data.length > 0) {
              await supabase
                .from("challenges")
                .update({ current_value: 0 })
                .eq("user_id", user.id);
            }
          }
          setChallenges(loadedChallenges);

          if (historyRes.data) {
            setHistory(
              historyRes.data.map((r) => ({
                date: r.date,
                challengesCompleted: r.challenges_completed || [],
                totalChallenges: r.total_challenges,
                allCompleted: r.all_completed,
              }))
            );
          }

          if (streakRes.data) {
            const lastDate = streakRes.data.last_completed_date;
            setLastCompletedDate(lastDate);
            const recordedCount = streakRes.data.streak_count || 0;

            // Check if streak is still active (completed today or yesterday)
            if (lastDate) {
              const diff = daysBetweenDates(lastDate, today);
              if (diff <= 1) {
                setStreakCount(recordedCount);
              } else {
                // Streak broken
                setStreakCount(0);
              }
            } else {
              setStreakCount(0);
            }

            const storedBest = parseInt(
              localStorage.getItem(`reto_best_streak_${user.id}`) || "0",
              10
            );
            setBestStreak(Math.max(storedBest, recordedCount));
          }
        } catch (e) {
          console.error("Error loading user data:", e);
        }
      } else {
        // Guest mode - LocalStorage
        setIsGuest(true);
        const storedChallenges = localStorage.getItem("reto_guest_challenges");
        let initialChallenges: Challenge[] = storedChallenges
          ? JSON.parse(storedChallenges)
          : DEFAULT_GUEST_CHALLENGES;

        if (isNewDay) {
          initialChallenges = initialChallenges.map((c) => ({
            ...c,
            currentValue: 0,
          }));
          localStorage.setItem(
            "reto_guest_challenges",
            JSON.stringify(initialChallenges)
          );
        }
        setChallenges(initialChallenges);

        const storedHistory = localStorage.getItem("reto_guest_history");
        const loadedHistory: DailyRecord[] = storedHistory
          ? JSON.parse(storedHistory)
          : [];
        setHistory(loadedHistory);

        const storedLastDate = localStorage.getItem("reto_guest_last_date");
        const storedStreak = parseInt(
          localStorage.getItem("reto_guest_streak") || "0",
          10
        );
        const storedBest = parseInt(
          localStorage.getItem("reto_guest_best_streak") || "0",
          10
        );

        setLastCompletedDate(storedLastDate);
        if (storedLastDate) {
          const diff = daysBetweenDates(storedLastDate, today);
          if (diff <= 1) {
            setStreakCount(storedStreak);
          } else {
            setStreakCount(0);
          }
        } else {
          setStreakCount(0);
        }
        setBestStreak(Math.max(storedBest, storedStreak));
      }

      setLoading(false);
    };

    load();
  }, [user]);

  // Helper to persist guest challenges
  const saveGuestChallenges = (updated: Challenge[]) => {
    localStorage.setItem("reto_guest_challenges", JSON.stringify(updated));
  };

  // Add challenge
  const addChallenge = useCallback(
    async (
      name: string,
      targetValue: number,
      unit: string = "reps",
      category: HabitCategory = "general"
    ) => {
      const today = getLocalDateStr();
      const newChallenge: Challenge = {
        id: "ch-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
        name,
        targetValue,
        currentValue: 0,
        unit,
        category,
        lastUpdatedDate: today,
      };

      if (user) {
        try {
          const { data, error } = await supabase
            .from("challenges")
            .insert({
              user_id: user.id,
              name,
              target_value: targetValue,
              current_value: 0,
            })
            .select()
            .single();

          if (data && !error) {
            setChallenges((prev) => [
              ...prev,
              {
                id: data.id,
                name: data.name,
                targetValue: data.target_value,
                currentValue: data.current_value,
                unit,
                category,
              },
            ]);
          }
        } catch (e) {
          console.error("Error adding challenge:", e);
        }
      } else {
        setChallenges((prev) => {
          const next = [...prev, newChallenge];
          saveGuestChallenges(next);
          return next;
        });
      }
      soundManager.playPop();
    },
    [user]
  );

  // Update existing challenge
  const updateChallenge = useCallback(
    async (
      id: string,
      updates: {
        name?: string;
        targetValue?: number;
        unit?: string;
        category?: HabitCategory;
      }
    ) => {
      setChallenges((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, ...updates } : c));
        if (!user) saveGuestChallenges(next);
        return next;
      });

      if (user) {
        try {
          await supabase
            .from("challenges")
            .update({
              ...(updates.name ? { name: updates.name } : {}),
              ...(updates.targetValue ? { target_value: updates.targetValue } : {}),
            })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.error("Error updating challenge:", e);
        }
      }
    },
    [user]
  );

  // Check and process day completion
  const checkCompletionAndStreak = useCallback(
    async (updatedChallenges: Challenge[]) => {
      const allDone =
        updatedChallenges.length > 0 &&
        updatedChallenges.every((c) => c.currentValue >= c.targetValue);

      if (!allDone) return;

      const today = getLocalDateStr();
      const alreadyRecorded = history.some(
        (h) => h.date === today && h.allCompleted
      );

      if (alreadyRecorded) return;

      soundManager.playDailyVictory();

      // Calculate streak
      let newStreak = 1;
      const yesterday = getYesterdayStr(today);

      if (lastCompletedDate === yesterday) {
        newStreak = streakCount + 1;
      } else if (lastCompletedDate === today) {
        newStreak = streakCount;
      } else {
        newStreak = 1;
      }

      const updatedBest = Math.max(bestStreak, newStreak);
      setStreakCount(newStreak);
      setBestStreak(updatedBest);
      setLastCompletedDate(today);

      const newRecord: DailyRecord = {
        date: today,
        challengesCompleted: updatedChallenges.map((c) => c.name),
        totalChallenges: updatedChallenges.length,
        allCompleted: true,
      };

      setHistory((prev) => [
        newRecord,
        ...prev.filter((h) => h.date !== today),
      ]);

      if (user) {
        try {
          // Save daily record
          await supabase.from("daily_records").upsert(
            {
              user_id: user.id,
              date: today,
              challenges_completed: updatedChallenges.map((c) => c.name),
              total_challenges: updatedChallenges.length,
              all_completed: true,
            },
            { onConflict: "user_id,date" }
          );

          // Save streak
          await supabase.from("user_streaks").upsert(
            {
              user_id: user.id,
              streak_count: newStreak,
              last_completed_date: today,
            },
            { onConflict: "user_id" }
          );

          localStorage.setItem(`reto_best_streak_${user.id}`, String(updatedBest));
        } catch (e) {
          console.error("Error saving record to Supabase:", e);
        }
      } else {
        // Save guest state
        const updatedHistory = [
          newRecord,
          ...history.filter((h) => h.date !== today),
        ];
        localStorage.setItem("reto_guest_history", JSON.stringify(updatedHistory));
        localStorage.setItem("reto_guest_streak", String(newStreak));
        localStorage.setItem("reto_guest_best_streak", String(updatedBest));
        localStorage.setItem("reto_guest_last_date", today);
      }
    },
    [user, history, lastCompletedDate, streakCount, bestStreak]
  );

  // Increment progress
  const increment = useCallback(
    async (id: string, step: number = 1) => {
      const challenge = challenges.find((c) => c.id === id);
      if (!challenge) return;

      const newValue = Math.min(
        challenge.targetValue,
        challenge.currentValue + step
      );
      if (newValue === challenge.currentValue) return;

      const justCompleted =
        newValue >= challenge.targetValue &&
        challenge.currentValue < challenge.targetValue;

      if (justCompleted) {
        soundManager.playChallengeComplete();
      } else {
        soundManager.playProgress();
      }

      const updated = challenges.map((c) =>
        c.id === id ? { ...c, currentValue: newValue } : c
      );
      setChallenges(updated);

      if (!user) {
        saveGuestChallenges(updated);
      } else {
        try {
          await supabase
            .from("challenges")
            .update({ current_value: newValue })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.error("Error updating progress:", e);
        }
      }

      await checkCompletionAndStreak(updated);
    },
    [user, challenges, checkCompletionAndStreak]
  );

  // Decrement progress
  const decrement = useCallback(
    async (id: string, step: number = 1) => {
      const challenge = challenges.find((c) => c.id === id);
      if (!challenge || challenge.currentValue <= 0) return;

      const newValue = Math.max(0, challenge.currentValue - step);
      soundManager.playPop();

      const updated = challenges.map((c) =>
        c.id === id ? { ...c, currentValue: newValue } : c
      );
      setChallenges(updated);

      if (!user) {
        saveGuestChallenges(updated);
      } else {
        try {
          await supabase
            .from("challenges")
            .update({ current_value: newValue })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.error("Error decrementing progress:", e);
        }
      }
    },
    [user, challenges]
  );

  // Quick toggle completed
  const toggleComplete = useCallback(
    async (id: string) => {
      const challenge = challenges.find((c) => c.id === id);
      if (!challenge) return;

      const isDone = challenge.currentValue >= challenge.targetValue;
      const newValue = isDone ? 0 : challenge.targetValue;

      if (!isDone) {
        soundManager.playChallengeComplete();
      } else {
        soundManager.playPop();
      }

      const updated = challenges.map((c) =>
        c.id === id ? { ...c, currentValue: newValue } : c
      );
      setChallenges(updated);

      if (!user) {
        saveGuestChallenges(updated);
      } else {
        try {
          await supabase
            .from("challenges")
            .update({ current_value: newValue })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.error("Error toggling completion:", e);
        }
      }

      if (!isDone) {
        await checkCompletionAndStreak(updated);
      }
    },
    [user, challenges, checkCompletionAndStreak]
  );

  // Reset single challenge
  const resetChallenge = useCallback(
    async (id: string) => {
      const updated = challenges.map((c) =>
        c.id === id ? { ...c, currentValue: 0 } : c
      );
      setChallenges(updated);
      soundManager.playPop();

      if (!user) {
        saveGuestChallenges(updated);
      } else {
        try {
          await supabase
            .from("challenges")
            .update({ current_value: 0 })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.error("Error resetting challenge:", e);
        }
      }
    },
    [user, challenges]
  );

  // Remove challenge
  const removeChallenge = useCallback(
    async (id: string) => {
      soundManager.playPop();
      setChallenges((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (!user) saveGuestChallenges(next);
        return next;
      });

      if (user) {
        try {
          await supabase
            .from("challenges")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.error("Error removing challenge:", e);
        }
      }
    },
    [user]
  );

  // Export full JSON backup
  const exportData = useCallback(() => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      challenges,
      history,
      streakCount,
      bestStreak,
      lastCompletedDate,
    };
    return JSON.stringify(data, null, 2);
  }, [challenges, history, streakCount, bestStreak, lastCompletedDate]);

  // Import JSON backup
  const importData = useCallback(
    (jsonData: string): boolean => {
      try {
        const parsed = JSON.parse(jsonData);
        if (!parsed.challenges || !Array.isArray(parsed.challenges)) return false;

        setChallenges(parsed.challenges);
        if (parsed.history && Array.isArray(parsed.history)) {
          setHistory(parsed.history);
        }
        if (typeof parsed.streakCount === "number") {
          setStreakCount(parsed.streakCount);
        }
        if (typeof parsed.bestStreak === "number") {
          setBestStreak(parsed.bestStreak);
        }
        if (parsed.lastCompletedDate) {
          setLastCompletedDate(parsed.lastCompletedDate);
        }

        if (!user) {
          localStorage.setItem(
            "reto_guest_challenges",
            JSON.stringify(parsed.challenges)
          );
          if (parsed.history) {
            localStorage.setItem(
              "reto_guest_history",
              JSON.stringify(parsed.history)
            );
          }
          localStorage.setItem(
            "reto_guest_streak",
            String(parsed.streakCount || 0)
          );
          localStorage.setItem(
            "reto_guest_best_streak",
            String(parsed.bestStreak || 0)
          );
          if (parsed.lastCompletedDate) {
            localStorage.setItem(
              "reto_guest_last_date",
              parsed.lastCompletedDate
            );
          }
        }
        return true;
      } catch (e) {
        console.error("Failed to import data:", e);
        return false;
      }
    },
    [user]
  );

  return {
    challenges,
    history,
    streakCount,
    bestStreak,
    lastCompletedDate,
    loading,
    isGuest,
    addChallenge,
    updateChallenge,
    increment,
    decrement,
    toggleComplete,
    resetChallenge,
    removeChallenge,
    exportData,
    importData,
  };
}
