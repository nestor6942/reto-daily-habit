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

export const DEFAULT_GUEST_CHALLENGES: Challenge[] = [
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

export type SyncStatus = "synced" | "syncing" | "offline";

interface ChallengeMeta {
  unit?: string;
  category?: HabitCategory;
  icon?: string;
}

export function useAppData() {
  const { user, signOut } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastCompletedDate, setLastCompletedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [streakFreezeAvailable, setStreakFreezeAvailable] = useState(true);

  // Helper to get challenge metadata map from storage
  const getMetaMap = useCallback((userId?: string): Record<string, ChallengeMeta> => {
    const key = userId ? `reto_meta_${userId}` : "reto_guest_meta";
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }, []);

  const saveMetaMap = useCallback(
    (map: Record<string, ChallengeMeta>, userId?: string) => {
      const key = userId ? `reto_meta_${userId}` : "reto_guest_meta";
      localStorage.setItem(key, JSON.stringify(map));
    },
    []
  );

  // Check if streak freeze was used this month
  const checkStreakFreezeStatus = useCallback(() => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const usedMonth = localStorage.getItem("reto_streak_freeze_month");
    setStreakFreezeAvailable(usedMonth !== currentMonth);
  }, []);

  // Main data loader and sync
  useEffect(() => {
    let isMounted = true;
    checkStreakFreezeStatus();

    const load = async () => {
      const today = getLocalDateStr();
      const lastActiveDate = localStorage.getItem("reto_last_active_date");
      const isNewDay = lastActiveDate !== today;
      localStorage.setItem("reto_last_active_date", today);

      if (user) {
        setIsGuest(false);
        setSyncStatus("syncing");

        // 1. Instant hydration from offline cache if available
        const cacheKey = `reto_cache_${user.id}`;
        const cachedRaw = localStorage.getItem(cacheKey);
        if (cachedRaw) {
          try {
            const cached = JSON.parse(cachedRaw);
            if (cached.challenges && Array.isArray(cached.challenges)) {
              const hydrated = isNewDay
                ? cached.challenges.map((c: Challenge) => ({ ...c, currentValue: 0 }))
                : cached.challenges;
              setChallenges(hydrated);
            }
            if (cached.history && Array.isArray(cached.history)) {
              setHistory(cached.history);
            }
            if (typeof cached.streakCount === "number") {
              setStreakCount(cached.streakCount);
            }
            if (typeof cached.bestStreak === "number") {
              setBestStreak(cached.bestStreak);
            }
            if (cached.lastCompletedDate) {
              setLastCompletedDate(cached.lastCompletedDate);
            }
          } catch (e) {
            console.warn("Failed to parse local cache:", e);
          }
        }

        // 2. Fetch live data from Supabase with resilient migration & fallback
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
              .limit(120),
            supabase
              .from("user_streaks")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle(),
          ]);

          let remoteChallenges = challengesRes.data || [];
          const metaMap = getMetaMap(user.id);

          // If user has NO challenges in Supabase, check for guest data to migrate, or auto-provision starter habits
          if (remoteChallenges.length === 0) {
            const storedGuestChallenges = localStorage.getItem("reto_guest_challenges");
            const guestChallenges: Challenge[] = storedGuestChallenges
              ? JSON.parse(storedGuestChallenges)
              : DEFAULT_GUEST_CHALLENGES;

            const guestMeta = getMetaMap();

            // Insert into Supabase so newly registered user never has empty data
            const inserts = guestChallenges.map((gc) => ({
              user_id: user.id,
              name: gc.name,
              target_value: gc.targetValue,
              current_value: isNewDay ? 0 : gc.currentValue,
            }));

            const { data: insertedData, error: insertErr } = await supabase
              .from("challenges")
              .insert(inserts)
              .select();

            if (!insertErr && insertedData) {
              remoteChallenges = insertedData;
              // Migrate metadata
              insertedData.forEach((row, idx) => {
                const original = guestChallenges[idx];
                metaMap[row.id] = {
                  unit: original?.unit || guestMeta[original?.id]?.unit || "reps",
                  category: original?.category || guestMeta[original?.id]?.category || "fuerza",
                };
              });
              saveMetaMap(metaMap, user.id);
            }

            // Migrate guest history if present
            const storedGuestHistory = localStorage.getItem("reto_guest_history");
            if (storedGuestHistory) {
              try {
                const parsedHistory: DailyRecord[] = JSON.parse(storedGuestHistory);
                if (parsedHistory.length > 0) {
                  const historyInserts = parsedHistory.map((h) => ({
                    user_id: user.id,
                    date: h.date,
                    challenges_completed: h.challengesCompleted,
                    total_challenges: h.totalChallenges,
                    all_completed: h.allCompleted,
                  }));
                  await supabase.from("daily_records").upsert(historyInserts, { onConflict: "user_id,date" });
                }
              } catch (err) {
                console.warn("Could not migrate guest history:", err);
              }
            }

            // Migrate guest streak if present
            const storedGuestStreak = parseInt(localStorage.getItem("reto_guest_streak") || "0", 10);
            const storedGuestLastDate = localStorage.getItem("reto_guest_last_date");
            if (storedGuestStreak > 0 && storedGuestLastDate) {
              await supabase.from("user_streaks").upsert(
                {
                  user_id: user.id,
                  streak_count: storedGuestStreak,
                  last_completed_date: storedGuestLastDate,
                },
                { onConflict: "user_id" }
              );
            }

            // Clear guest-specific keys after successful account migration
            localStorage.removeItem("reto_guest_challenges");
            localStorage.removeItem("reto_guest_history");
            localStorage.removeItem("reto_guest_streak");
            localStorage.removeItem("reto_guest_last_date");
          }

          if (!isMounted) return;

          // Format loaded challenges with persistent metadata
          const loadedChallenges: Challenge[] = remoteChallenges.map((c) => {
            const meta = metaMap[c.id];
            const lowerName = c.name.toLowerCase();
            let defCategory: HabitCategory = "fuerza";
            let defUnit = "reps";

            if (lowerName.includes("agua") || lowerName.includes("comer") || lowerName.includes("fruta")) {
              defCategory = "nutricion";
              defUnit = "vasos";
            } else if (lowerName.includes("cardio") || lowerName.includes("caminar") || lowerName.includes("correr") || lowerName.includes("bici")) {
              defCategory = "cardio";
              defUnit = "min";
            } else if (lowerName.includes("yoga") || lowerName.includes("estiramiento")) {
              defCategory = "flexibilidad";
              defUnit = "min";
            } else if (lowerName.includes("meditar") || lowerName.includes("leer") || lowerName.includes("dormir")) {
              defCategory = "mente";
              defUnit = lowerName.includes("leer") ? "páginas" : "min";
            }

            return {
              id: c.id,
              name: c.name,
              targetValue: c.target_value,
              currentValue: isNewDay ? 0 : c.current_value,
              unit: meta?.unit || defUnit,
              category: meta?.category || defCategory,
              icon: meta?.icon,
              lastUpdatedDate: today,
            };
          });

          // Reset remote DB current_value if new day
          if (isNewDay && remoteChallenges.length > 0) {
            await supabase
              .from("challenges")
              .update({ current_value: 0 })
              .eq("user_id", user.id);
          }

          setChallenges(loadedChallenges);

          // Process history
          let loadedHistory: DailyRecord[] = [];
          if (historyRes.data) {
            loadedHistory = historyRes.data.map((r) => ({
              date: r.date,
              challengesCompleted: r.challenges_completed || [],
              totalChallenges: r.total_challenges,
              allCompleted: r.all_completed,
            }));
            setHistory(loadedHistory);
          }

          // Process streak
          let currentStreakCount = 0;
          let currentBestStreak = 0;
          let remoteLastDate: string | null = null;

          if (streakRes.data) {
            remoteLastDate = streakRes.data.last_completed_date;
            setLastCompletedDate(remoteLastDate);
            const recordedCount = streakRes.data.streak_count || 0;

            if (remoteLastDate) {
              const diff = daysBetweenDates(remoteLastDate, today);
              if (diff <= 1) {
                currentStreakCount = recordedCount;
              } else {
                currentStreakCount = 0;
              }
            }
            const storedBest = parseInt(
              localStorage.getItem(`reto_best_streak_${user.id}`) || "0",
              10
            );
            currentBestStreak = Math.max(storedBest, recordedCount);
            setStreakCount(currentStreakCount);
            setBestStreak(currentBestStreak);
          }

          // Save mirrored local cache for offline reliability
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              challenges: loadedChallenges,
              history: loadedHistory,
              streakCount: currentStreakCount,
              bestStreak: currentBestStreak,
              lastCompletedDate: remoteLastDate,
              savedAt: new Date().toISOString(),
            })
          );

          setSyncStatus("synced");
          setLastSyncedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
        } catch (e) {
          console.error("Error connecting to Supabase cloud:", e);
          setSyncStatus("offline");
        }
      } else {
        // Guest mode (offline/localStorage)
        setIsGuest(true);
        setSyncStatus("synced");
        const storedChallenges = localStorage.getItem("reto_guest_challenges");
        let initialChallenges: Challenge[] = storedChallenges
          ? JSON.parse(storedChallenges)
          : DEFAULT_GUEST_CHALLENGES;

        if (isNewDay) {
          initialChallenges = initialChallenges.map((c) => ({
            ...c,
            currentValue: 0,
          }));
          localStorage.setItem("reto_guest_challenges", JSON.stringify(initialChallenges));
        }
        setChallenges(initialChallenges);

        const storedHistory = localStorage.getItem("reto_guest_history");
        const loadedHistory: DailyRecord[] = storedHistory ? JSON.parse(storedHistory) : [];
        setHistory(loadedHistory);

        const storedLastDate = localStorage.getItem("reto_guest_last_date");
        const storedStreak = parseInt(localStorage.getItem("reto_guest_streak") || "0", 10);
        const storedBest = parseInt(localStorage.getItem("reto_guest_best_streak") || "0", 10);

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
        setLastSyncedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
      }

      if (isMounted) setLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [user, checkStreakFreezeStatus, getMetaMap, saveMetaMap]);

  // Helper to persist mirror cache
  const updateOfflineCache = useCallback(
    (
      updatedChallenges: Challenge[],
      updatedHistory?: DailyRecord[],
      streak?: number,
      best?: number,
      lastDate?: string | null
    ) => {
      if (user) {
        const cacheKey = `reto_cache_${user.id}`;
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            challenges: updatedChallenges,
            history: updatedHistory !== undefined ? updatedHistory : history,
            streakCount: streak !== undefined ? streak : streakCount,
            bestStreak: best !== undefined ? best : bestStreak,
            lastCompletedDate: lastDate !== undefined ? lastDate : lastCompletedDate,
            savedAt: new Date().toISOString(),
          })
        );
      } else {
        localStorage.setItem("reto_guest_challenges", JSON.stringify(updatedChallenges));
      }
    },
    [user, history, streakCount, bestStreak, lastCompletedDate]
  );

  // Add challenge
  const addChallenge = useCallback(
    async (
      name: string,
      targetValue: number,
      unit: string = "reps",
      category: HabitCategory = "general"
    ) => {
      const today = getLocalDateStr();
      const tempId = "ch-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6);
      const newChallenge: Challenge = {
        id: tempId,
        name,
        targetValue,
        currentValue: 0,
        unit,
        category,
        lastUpdatedDate: today,
      };

      if (user) {
        setSyncStatus("syncing");
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
            const finalChallenge: Challenge = {
              id: data.id,
              name: data.name,
              targetValue: data.target_value,
              currentValue: data.current_value,
              unit,
              category,
            };

            // Save persistent metadata
            const metaMap = getMetaMap(user.id);
            metaMap[data.id] = { unit, category };
            saveMetaMap(metaMap, user.id);

            setChallenges((prev) => {
              const updated = [...prev, finalChallenge];
              updateOfflineCache(updated);
              return updated;
            });
            setSyncStatus("synced");
            setLastSyncedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
          }
        } catch (e) {
          console.error("Error adding challenge to cloud:", e);
          setSyncStatus("offline");
          setChallenges((prev) => {
            const updated = [...prev, newChallenge];
            updateOfflineCache(updated);
            return updated;
          });
        }
      } else {
        setChallenges((prev) => {
          const updated = [...prev, newChallenge];
          updateOfflineCache(updated);
          return updated;
        });
      }
      soundManager.playPop();
    },
    [user, getMetaMap, saveMetaMap, updateOfflineCache]
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
        updateOfflineCache(next);
        return next;
      });

      if (user) {
        setSyncStatus("syncing");
        try {
          if (updates.unit || updates.category) {
            const metaMap = getMetaMap(user.id);
            metaMap[id] = {
              ...metaMap[id],
              ...(updates.unit ? { unit: updates.unit } : {}),
              ...(updates.category ? { category: updates.category } : {}),
            };
            saveMetaMap(metaMap, user.id);
          }

          if (updates.name || updates.targetValue) {
            await supabase
              .from("challenges")
              .update({
                ...(updates.name ? { name: updates.name } : {}),
                ...(updates.targetValue ? { target_value: updates.targetValue } : {}),
              })
              .eq("id", id)
              .eq("user_id", user.id);
          }
          setSyncStatus("synced");
          setLastSyncedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
        } catch (e) {
          console.error("Error updating challenge:", e);
          setSyncStatus("offline");
        }
      }
    },
    [user, getMetaMap, saveMetaMap, updateOfflineCache]
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

      const updatedHistory = [newRecord, ...history.filter((h) => h.date !== today)];
      setHistory(updatedHistory);

      updateOfflineCache(
        updatedChallenges,
        updatedHistory,
        newStreak,
        updatedBest,
        today
      );

      if (user) {
        setSyncStatus("syncing");
        try {
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

          await supabase.from("user_streaks").upsert(
            {
              user_id: user.id,
              streak_count: newStreak,
              last_completed_date: today,
            },
            { onConflict: "user_id" }
          );

          localStorage.setItem(`reto_best_streak_${user.id}`, String(updatedBest));
          setSyncStatus("synced");
          setLastSyncedAt(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" }));
        } catch (e) {
          console.error("Error saving record to cloud:", e);
          setSyncStatus("offline");
        }
      } else {
        localStorage.setItem("reto_guest_history", JSON.stringify(updatedHistory));
        localStorage.setItem("reto_guest_streak", String(newStreak));
        localStorage.setItem("reto_guest_best_streak", String(updatedBest));
        localStorage.setItem("reto_guest_last_date", today);
      }
    },
    [user, history, lastCompletedDate, streakCount, bestStreak, updateOfflineCache]
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
      updateOfflineCache(updated);

      if (user) {
        try {
          await supabase
            .from("challenges")
            .update({ current_value: newValue })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.warn("Cloud update pending:", e);
        }
      }

      await checkCompletionAndStreak(updated);
    },
    [user, challenges, checkCompletionAndStreak, updateOfflineCache]
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
      updateOfflineCache(updated);

      if (user) {
        try {
          await supabase
            .from("challenges")
            .update({ current_value: newValue })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.warn("Cloud update pending:", e);
        }
      }
    },
    [user, challenges, updateOfflineCache]
  );

  // Toggle complete
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
      updateOfflineCache(updated);

      if (user) {
        try {
          await supabase
            .from("challenges")
            .update({ current_value: newValue })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.warn("Cloud update pending:", e);
        }
      }

      if (!isDone) {
        await checkCompletionAndStreak(updated);
      }
    },
    [user, challenges, checkCompletionAndStreak, updateOfflineCache]
  );

  // Reset challenge
  const resetChallenge = useCallback(
    async (id: string) => {
      const updated = challenges.map((c) =>
        c.id === id ? { ...c, currentValue: 0 } : c
      );
      setChallenges(updated);
      updateOfflineCache(updated);
      soundManager.playPop();

      if (user) {
        try {
          await supabase
            .from("challenges")
            .update({ current_value: 0 })
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.warn("Cloud update pending:", e);
        }
      }
    },
    [user, challenges, updateOfflineCache]
  );

  // Remove challenge
  const removeChallenge = useCallback(
    async (id: string) => {
      soundManager.playPop();
      const updated = challenges.filter((c) => c.id !== id);
      setChallenges(updated);
      updateOfflineCache(updated);

      if (user) {
        try {
          await supabase
            .from("challenges")
            .delete()
            .eq("id", id)
            .eq("user_id", user.id);
        } catch (e) {
          console.error("Error removing challenge from cloud:", e);
        }
      }
    },
    [user, challenges, updateOfflineCache]
  );

  // Use Streak Freeze ("Salvavidas de Racha")
  const useStreakFreeze = useCallback(async (): Promise<boolean> => {
    if (!streakFreezeAvailable) return false;
    const currentMonth = new Date().toISOString().slice(0, 7);
    const recoveredStreak = Math.max(1, streakCount + 1);
    const today = getLocalDateStr();

    setStreakCount(recoveredStreak);
    setLastCompletedDate(today);
    localStorage.setItem("reto_streak_freeze_month", currentMonth);
    setStreakFreezeAvailable(false);

    if (user) {
      try {
        await supabase.from("user_streaks").upsert(
          {
            user_id: user.id,
            streak_count: recoveredStreak,
            last_completed_date: today,
          },
          { onConflict: "user_id" }
        );
      } catch (e) {
        console.warn("Streak freeze sync error:", e);
      }
    } else {
      localStorage.setItem("reto_guest_streak", String(recoveredStreak));
      localStorage.setItem("reto_guest_last_date", today);
    }
    soundManager.playAchievement();
    return true;
  }, [streakFreezeAvailable, streakCount, user]);

  // GDPR Account & Data Erasure (Right to be Forgotten - Art. 17 GDPR)
  const deleteAccountData = useCallback(async (): Promise<boolean> => {
    try {
      if (user) {
        // Cascade delete user data
        await Promise.allSettled([
          supabase.from("challenges").delete().eq("user_id", user.id),
          supabase.from("daily_records").delete().eq("user_id", user.id),
          supabase.from("user_streaks").delete().eq("user_id", user.id),
          supabase.from("profiles").delete().eq("id", user.id),
        ]);
        // Clear all local cached data for this user
        localStorage.removeItem(`reto_cache_${user.id}`);
        localStorage.removeItem(`reto_meta_${user.id}`);
        localStorage.removeItem(`reto_best_streak_${user.id}`);
        await signOut();
      } else {
        // Clear all guest storage
        localStorage.removeItem("reto_guest_challenges");
        localStorage.removeItem("reto_guest_history");
        localStorage.removeItem("reto_guest_streak");
        localStorage.removeItem("reto_guest_best_streak");
        localStorage.removeItem("reto_guest_last_date");
        localStorage.removeItem("reto_guest_meta");
        localStorage.removeItem("reto_guest_name");
        localStorage.removeItem("reto_guest_weight");
        localStorage.removeItem("reto_guest_height");
        localStorage.removeItem("reto_guest_goal");
        setChallenges(DEFAULT_GUEST_CHALLENGES);
        setHistory([]);
        setStreakCount(0);
        setBestStreak(0);
      }
      return true;
    } catch (e) {
      console.error("Failed to delete account data:", e);
      return false;
    }
  }, [user, signOut]);

  // Export full JSON backup
  const exportData = useCallback(() => {
    const data = {
      version: 2,
      platform: "Reto Diario",
      user: user ? { id: user.id, email: user.email } : "guest",
      exportedAt: new Date().toISOString(),
      challenges,
      history,
      streakCount,
      bestStreak,
      lastCompletedDate,
    };
    return JSON.stringify(data, null, 2);
  }, [user, challenges, history, streakCount, bestStreak, lastCompletedDate]);

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

        updateOfflineCache(
          parsed.challenges,
          parsed.history,
          parsed.streakCount,
          parsed.bestStreak,
          parsed.lastCompletedDate
        );
        return true;
      } catch (e) {
        console.error("Failed to import data:", e);
        return false;
      }
    },
    [updateOfflineCache]
  );

  return {
    challenges,
    history,
    streakCount,
    bestStreak,
    lastCompletedDate,
    loading,
    isGuest,
    syncStatus,
    lastSyncedAt,
    streakFreezeAvailable,
    addChallenge,
    updateChallenge,
    increment,
    decrement,
    toggleComplete,
    resetChallenge,
    removeChallenge,
    useStreakFreeze,
    deleteAccountData,
    exportData,
    importData,
  };
}
