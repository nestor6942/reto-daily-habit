import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { Challenge, DailyRecord } from "@/types/challenge";

const getToday = () => new Date().toISOString().split("T")[0];

export function useAppData() {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [history, setHistory] = useState<DailyRecord[]>([]);
  const [streakCount, setStreakCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load data from database
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const [challengesRes, historyRes, streakRes] = await Promise.all([
        supabase
          .from("challenges")
          .select("*")
          .eq("user_id", user.id),
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

      if (challengesRes.data) {
        setChallenges(
          challengesRes.data.map((c) => ({
            id: c.id,
            name: c.name,
            targetValue: c.target_value,
            currentValue: c.current_value,
          }))
        );
      }

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
        setStreakCount(streakRes.data.streak_count);
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const addChallenge = useCallback(
    async (name: string, targetValue: number) => {
      if (!user) return;

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
          },
        ]);
      }
    },
    [user]
  );

  const increment = useCallback(
    async (id: string) => {
      if (!user) return;

      const challenge = challenges.find((c) => c.id === id);
      if (!challenge || challenge.currentValue >= challenge.targetValue) return;

      const newValue = challenge.currentValue + 1;

      const { error } = await supabase
        .from("challenges")
        .update({ current_value: newValue })
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) return;

      const updated = challenges.map((c) =>
        c.id === id ? { ...c, currentValue: newValue } : c
      );
      setChallenges(updated);

      // Check if all done
      const allDone =
        updated.length > 0 &&
        updated.every((c) => c.currentValue >= c.targetValue);

      if (allDone) {
        const today = getToday();
        const alreadyRecorded = history.some((h) => h.date === today);

        if (!alreadyRecorded) {
          // Upsert daily record
          await supabase.from("daily_records").upsert(
            {
              user_id: user.id,
              date: today,
              challenges_completed: updated.map((c) => c.name),
              total_challenges: updated.length,
              all_completed: true,
            },
            { onConflict: "user_id,date" }
          );

          // Update streak
          const { data: streakData } = await supabase
            .from("user_streaks")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

          const lastDate = streakData?.last_completed_date;
          const isConsecutive =
            !lastDate || daysBetween(lastDate, today) <= 1;
          const newStreak = isConsecutive
            ? (streakData?.streak_count || 0) + 1
            : 1;

          await supabase.from("user_streaks").upsert(
            {
              user_id: user.id,
              streak_count: newStreak,
              last_completed_date: today,
            },
            { onConflict: "user_id" }
          );

          setStreakCount(newStreak);
          setHistory((prev) => [
            {
              date: today,
              challengesCompleted: updated.map((c) => c.name),
              totalChallenges: updated.length,
              allCompleted: true,
            },
            ...prev,
          ]);
        }
      }
    },
    [user, challenges, history]
  );

  const removeChallenge = useCallback(
    async (id: string) => {
      if (!user) return;

      const { error } = await supabase
        .from("challenges")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (!error) {
        setChallenges((prev) => prev.filter((c) => c.id !== id));
      }
    },
    [user]
  );

  return {
    challenges,
    history,
    streakCount,
    loading,
    addChallenge,
    increment,
    removeChallenge,
  };
}

function daysBetween(a: string, b: string): number {
  const da = new Date(a);
  const db = new Date(b);
  return Math.abs(Math.round((db.getTime() - da.getTime()) / 86400000));
}
