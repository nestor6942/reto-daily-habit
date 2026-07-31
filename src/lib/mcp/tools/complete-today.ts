import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

function daysBetween(a: string, b: string): number {
  return Math.abs(Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}

export default defineTool({
  name: "complete_today",
  title: "Complete today's challenges",
  description:
    "Mark the signed-in user's challenges as completed for today: sets progress to the target, records the day in the history and updates the streak.",
  inputSchema: {
    challenge_ids: z
      .array(z.string().uuid())
      .optional()
      .describe("Optional ids of specific challenges to complete. Omit to complete all of them."),
    date: z
      .string()
      .optional()
      .describe("Optional day in YYYY-MM-DD format. Defaults to today."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ challenge_ids, date }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const userId = ctx.getUserId()!;
    const supabase = supabaseForUser(ctx);

    const day = date?.trim() || new Date().toISOString().split("T")[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      throw new ToolError("date must be in YYYY-MM-DD format");
    }

    const { data: challenges, error: loadError } = await supabase
      .from("challenges")
      .select("id, name, current_value, target_value");
    if (loadError) return { content: [{ type: "text", text: loadError.message }], isError: true };
    if (!challenges || challenges.length === 0) {
      throw new ToolError("This user has no challenges to complete.");
    }

    let targets = challenges;
    if (challenge_ids && challenge_ids.length > 0) {
      const wanted = new Set(challenge_ids);
      targets = challenges.filter((c) => wanted.has(c.id));
      const missing = challenge_ids.filter((id) => !challenges.some((c) => c.id === id));
      if (missing.length > 0) {
        throw new ToolError(`Challenge(s) not found for this user: ${missing.join(", ")}`);
      }
    }

    const toUpdate = targets.filter((c) => c.current_value < c.target_value);
    for (const c of toUpdate) {
      const { error } = await supabase
        .from("challenges")
        .update({ current_value: c.target_value })
        .eq("id", c.id);
      if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    }

    const updated = challenges.map((c) =>
      targets.some((t) => t.id === c.id) ? { ...c, current_value: c.target_value } : c,
    );
    const completed = updated.filter((c) => c.current_value >= c.target_value);
    const allCompleted = completed.length === updated.length;

    const { error: recordError } = await supabase.from("daily_records").upsert(
      {
        user_id: userId,
        date: day,
        challenges_completed: completed.map((c) => c.name),
        total_challenges: updated.length,
        all_completed: allCompleted,
      },
      { onConflict: "user_id,date" },
    );
    if (recordError) {
      return { content: [{ type: "text", text: recordError.message }], isError: true };
    }

    // Streak only advances when every challenge is done for that day.
    const { data: streakRow } = await supabase
      .from("user_streaks")
      .select("streak_count, last_completed_date")
      .eq("user_id", userId)
      .maybeSingle();

    let streakCount = streakRow?.streak_count ?? 0;
    const lastDate = streakRow?.last_completed_date ?? null;

    if (allCompleted && lastDate !== day) {
      streakCount = !lastDate || daysBetween(lastDate, day) > 1 ? 1 : streakCount + 1;
      const { error: streakError } = await supabase.from("user_streaks").upsert(
        { user_id: userId, streak_count: streakCount, last_completed_date: day },
        { onConflict: "user_id" },
      );
      if (streakError) {
        return { content: [{ type: "text", text: streakError.message }], isError: true };
      }
    }

    const summary = {
      date: day,
      completed: completed.map((c) => c.name),
      total_challenges: updated.length,
      all_completed: allCompleted,
      streak_count: streakCount,
    };

    return {
      content: [
        {
          type: "text",
          text: allCompleted
            ? `Todos los retos de ${day} completados. Racha: ${streakCount} día(s).`
            : `Retos marcados para ${day} (${completed.length}/${updated.length}). La racha avanza al completarlos todos.`,
        },
      ],
      structuredContent: summary,
    };
  },
});
