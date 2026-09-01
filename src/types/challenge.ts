export type HabitCategory =
  | "fuerza"
  | "cardio"
  | "flexibilidad"
  | "mente"
  | "nutricion"
  | "general";

export interface Challenge {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit?: string;
  category?: HabitCategory;
  icon?: string;
  lastUpdatedDate?: string;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD (local)
  challengesCompleted: string[]; // challenge names
  totalChallenges: number;
  allCompleted: boolean;
  note?: string;
}

export interface StreakInfo {
  currentStreak: number;
  bestStreak: number;
  lastCompletedDate: string | null;
  totalDaysCompleted: number;
}

export interface AppData {
  challenges: Challenge[];
  history: DailyRecord[];
  streakCount: number;
  bestStreak: number;
  lastCompletedDate: string | null;
}

