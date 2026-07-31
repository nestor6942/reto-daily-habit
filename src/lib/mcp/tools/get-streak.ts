import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_streak",
  title: "Get streak",
  description: "Get the signed-in user's current daily streak count and last completed date.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_streaks")
      .select("streak_count, last_completed_date")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const streak = data ?? { streak_count: 0, last_completed_date: null };
    return {
      content: [{ type: "text", text: JSON.stringify(streak) }],
      structuredContent: { streak },
    };
  },
});
