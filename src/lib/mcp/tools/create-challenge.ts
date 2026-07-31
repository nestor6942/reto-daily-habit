import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_challenge",
  title: "Create challenge",
  description: "Create a new daily challenge for the signed-in user.",
  inputSchema: {
    name: z.string().trim().min(1).describe("Name of the challenge, e.g. '50 flexiones'."),
    target_value: z.number().int().positive().optional().describe("Daily target amount. Defaults to 1."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ name, target_value }, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("challenges")
      .insert({ user_id: ctx.getUserId(), name, target_value: target_value ?? 1 })
      .select()
      .single();

    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data) }],
      structuredContent: { challenge: data },
    };
  },
});
