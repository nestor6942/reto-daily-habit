import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_history",
  title: "List history",
  description: "List the signed-in user's recent daily completion records, newest first.",
  inputSchema: {
    limit: z.number().int().positive().optional().describe("How many days to return. Defaults to 30."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const take = Math.min(limit ?? 30, 365);
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("daily_records")
      .select("date, all_completed, total_challenges, challenges_completed")
      .order("date", { ascending: false })
      .limit(take);

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data ?? []) }],
      structuredContent: { records: data ?? [] },
    };
  },
});
