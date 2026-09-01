import type { Challenge, DailyRecord } from "@/types/challenge";

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "streak" | "challenges" | "mastery" | "special";
  unlocked: boolean;
  progress: number; // 0 to 100
  unlockedAt?: string;
}

export interface UserGamification {
  xp: number;
  level: number;
  levelTitle: string;
  nextLevelXp: number;
  currentLevelXp: number;
  achievements: Achievement[];
}

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: "🌱 Principiante" },
  { level: 2, xp: 200, title: "⚡ En Progreso" },
  { level: 3, xp: 500, title: "🔥 Constante" },
  { level: 4, xp: 1000, title: "🛡️ Imparable" },
  { level: 5, xp: 2000, title: "💎 Titán de Hábitos" },
  { level: 6, xp: 4000, title: "👑 Leyenda Diaria" },
];

export function calculateGamification(
  challenges: Challenge[],
  history: DailyRecord[],
  streakCount: number,
  bestStreak: number
): UserGamification {
  // Calculate total completed challenges in today and history
  const historyCompletedCount = history.reduce(
    (sum, record) => sum + (record.challengesCompleted?.length || 0),
    0
  );
  const historyPerfectDays = history.filter((r) => r.allCompleted).length;
  const todayDoneChallenges = challenges.filter(
    (c) => c.currentValue >= c.targetValue
  ).length;

  // XP: 25 XP per challenge completed + 100 XP per perfect day + 50 XP * streak
  const totalCompletedChallenges = historyCompletedCount + todayDoneChallenges;
  const xp =
    totalCompletedChallenges * 25 +
    historyPerfectDays * 100 +
    streakCount * 50;

  // Level determination
  let level = 1;
  let levelTitle = LEVEL_THRESHOLDS[0].title;
  let currentLevelXp = 0;
  let nextLevelXp = LEVEL_THRESHOLDS[1].xp;

  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      level = LEVEL_THRESHOLDS[i].level;
      levelTitle = LEVEL_THRESHOLDS[i].title;
      currentLevelXp = LEVEL_THRESHOLDS[i].xp;
      nextLevelXp =
        i < LEVEL_THRESHOLDS.length - 1
          ? LEVEL_THRESHOLDS[i + 1].xp
          : LEVEL_THRESHOLDS[i].xp + 2000;
      break;
    }
  }

  // Count categories
  const strengthCount = challenges.filter(
    (c) => c.category === "fuerza" && c.currentValue >= c.targetValue
  ).length;
  const cardioCount = challenges.filter(
    (c) => c.category === "cardio" && c.currentValue >= c.targetValue
  ).length;
  const zenCount = challenges.filter(
    (c) =>
      (c.category === "flexibilidad" || c.category === "mente") &&
      c.currentValue >= c.targetValue
  ).length;
  const hasCentury = challenges.some((c) => c.targetValue >= 100);

  const effectiveStreak = Math.max(streakCount, bestStreak);

  const achievements: Achievement[] = [
    {
      id: "first_step",
      title: "Primer Paso",
      description: "Completa tu primer reto de hábito",
      icon: "🚀",
      category: "challenges",
      unlocked: totalCompletedChallenges >= 1,
      progress: Math.min(100, (totalCompletedChallenges / 1) * 100),
    },
    {
      id: "streak_3",
      title: "Fuego Naciente",
      description: "Alcanza una racha de 3 días seguidos",
      icon: "🔥",
      category: "streak",
      unlocked: effectiveStreak >= 3,
      progress: Math.min(100, (effectiveStreak / 3) * 100),
    },
    {
      id: "streak_7",
      title: "Semana de Hierro",
      description: "Mantén una racha de 7 días consecutivos",
      icon: "⭐",
      category: "streak",
      unlocked: effectiveStreak >= 7,
      progress: Math.min(100, (effectiveStreak / 7) * 100),
    },
    {
      id: "streak_14",
      title: "Hábito Inquebrantable",
      description: "Alcanza una racha de 14 días",
      icon: "💎",
      category: "streak",
      unlocked: effectiveStreak >= 14,
      progress: Math.min(100, (effectiveStreak / 14) * 100),
    },
    {
      id: "streak_30",
      title: "Mes Legendario",
      description: "30 días seguidos superando tus metas",
      icon: "👑",
      category: "streak",
      unlocked: effectiveStreak >= 30,
      progress: Math.min(100, (effectiveStreak / 30) * 100),
    },
    {
      id: "perfect_day",
      title: "Día Perfecto",
      description: "Completa el 100% de los retos en un día",
      icon: "🎯",
      category: "mastery",
      unlocked:
        historyPerfectDays > 0 ||
        (challenges.length > 0 &&
          challenges.every((c) => c.currentValue >= c.targetValue)),
      progress:
        historyPerfectDays > 0 ||
        (challenges.length > 0 &&
          challenges.every((c) => c.currentValue >= c.targetValue))
          ? 100
          : 0,
    },
    {
      id: "veteran_10",
      title: "Constancia de Acero",
      description: "Completa 10 días perfectos en tu historial",
      icon: "🛡️",
      category: "mastery",
      unlocked: historyPerfectDays >= 10,
      progress: Math.min(100, (historyPerfectDays / 10) * 100),
    },
    {
      id: "strength_master",
      title: "Fuerza Titánica",
      description: "Completa retos en la categoría Fuerza",
      icon: "💪",
      category: "special",
      unlocked: strengthCount >= 1,
      progress: Math.min(100, strengthCount > 0 ? 100 : 0),
    },
    {
      id: "cardio_pro",
      title: "Máquina de Cardio",
      description: "Completa retos en la categoría Cardio",
      icon: "🏃",
      category: "special",
      unlocked: cardioCount >= 1,
      progress: Math.min(100, cardioCount > 0 ? 100 : 0),
    },
    {
      id: "mind_zen",
      title: "Mente & Zen",
      description: "Completa retos de flexibilidad, mente o yoga",
      icon: "🧘",
      category: "special",
      unlocked: zenCount >= 1,
      progress: Math.min(100, zenCount > 0 ? 100 : 0),
    },
    {
      id: "century",
      title: "Centurión",
      description: "Configura un reto con una meta de 100 o más",
      icon: "💯",
      category: "special",
      unlocked: hasCentury,
      progress: hasCentury ? 100 : 0,
    },
    {
      id: "total_50",
      title: "Maestro de la Disciplina",
      description: "Supera 50 retos completados en total",
      icon: "🏆",
      category: "challenges",
      unlocked: totalCompletedChallenges >= 50,
      progress: Math.min(100, (totalCompletedChallenges / 50) * 100),
    },
  ];

  return {
    xp,
    level,
    levelTitle,
    nextLevelXp,
    currentLevelXp,
    achievements,
  };
}
