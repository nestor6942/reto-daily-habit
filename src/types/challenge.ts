export interface Challenge {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  challengesCompleted: string[]; // challenge names
  totalChallenges: number;
  allCompleted: boolean;
}

export interface AppData {
  challenges: Challenge[];
  history: DailyRecord[];
  streakCount: number;
  lastCompletedDate: string | null; // YYYY-MM-DD
}
