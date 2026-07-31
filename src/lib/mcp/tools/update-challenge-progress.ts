import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "update_challenge_progress",
  title: "Update challenge progress",
  description: "Set the current progress value of one of the signed-in user's challenges.",
  inputSchema: {
    challenge_id: z.string().uuid().describe("The challenge id, from list_challenges."),
    current_value: z.number().int().min(0).describe("New current progress value."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ challenge_id, current_value }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("challenges")
      .update({ current_value })
      .eq("id", challenge_id)
      .select()
      .maybeSingle();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    if (!data) throw new ToolError("Challenge not found for this user.");
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { challenge: data },
    };
  },
});
