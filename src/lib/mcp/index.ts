import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listChallengesTool from "./tools/list-challenges";
import createChallengeTool from "./tools/create-challenge";
import updateChallengeProgressTool from "./tools/update-challenge-progress";
import getStreakTool from "./tools/get-streak";
import listHistoryTool from "./tools/list-history";
import getProfileTool from "./tools/get-profile";
import completeTodayTool from "./tools/complete-today";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "daily-streak-tracker",
  title: "Daily Streak Tracker",
  version: "0.1.0",
  instructions:
    "Tools for Reto Diario, a daily challenge and streak tracker. Read and manage the signed-in user's challenges, daily progress, streaks and fitness profile.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listChallengesTool,
    createChallengeTool,
    updateChallengeProgressTool,
    completeTodayTool,
    getStreakTool,
    listHistoryTool,
    getProfileTool,
  ],
});
