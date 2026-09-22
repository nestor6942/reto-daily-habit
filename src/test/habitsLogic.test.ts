import { describe, it, expect } from "vitest";
import {
  getLocalDateStr,
  getYesterdayStr,
  daysBetweenDates,
  DEFAULT_GUEST_CHALLENGES,
} from "@/hooks/useAppData";
import { calculateGamification } from "@/lib/achievements";
import type { Challenge, DailyRecord } from "@/types/challenge";

describe("Habit Tracker Date & Streak Logic", () => {
  it("should format local date correctly in YYYY-MM-DD", () => {
    const fixedDate = new Date(2026, 8, 1); // Sept 1, 2026
    const str = getLocalDateStr(fixedDate);
    expect(str).toBe("2026-09-01");
  });

  it("should calculate yesterday date accurately across month boundary", () => {
    const yesterday = getYesterdayStr("2026-09-01");
    expect(yesterday).toBe("2026-08-31");
  });

  it("should calculate days between consecutive dates accurately", () => {
    expect(daysBetweenDates("2026-08-31", "2026-09-01")).toBe(1);
    expect(daysBetweenDates("2026-09-01", "2026-09-01")).toBe(0);
    expect(daysBetweenDates("2026-08-20", "2026-09-01")).toBe(12);
  });

  it("should provide well-structured starter default challenges", () => {
    expect(DEFAULT_GUEST_CHALLENGES.length).toBeGreaterThanOrEqual(4);
    DEFAULT_GUEST_CHALLENGES.forEach((c) => {
      expect(c.name).toBeDefined();
      expect(c.targetValue).toBeGreaterThan(0);
      expect(c.currentValue).toBe(0);
      expect(c.unit).toBeDefined();
      expect(c.category).toBeDefined();
    });
  });
});

describe("Gamification & Achievements Engine", () => {
  const sampleChallenges: Challenge[] = [
    {
      id: "1",
      name: "Flexiones",
      targetValue: 30,
      currentValue: 30,
      category: "fuerza",
    },
    {
      id: "2",
      name: "Correr",
      targetValue: 20,
      currentValue: 20,
      category: "cardio",
    },
  ];

  const sampleHistory: DailyRecord[] = [
    {
      date: "2026-08-30",
      challengesCompleted: ["Flexiones", "Correr"],
      totalChallenges: 2,
      allCompleted: true,
    },
    {
      date: "2026-08-31",
      challengesCompleted: ["Flexiones", "Correr"],
      totalChallenges: 2,
      allCompleted: true,
    },
  ];

  it("should calculate user XP and Level correctly", () => {
    const res = calculateGamification(sampleChallenges, sampleHistory, 2, 2);
    expect(res.xp).toBe(450);
    expect(res.level).toBe(2);
    expect(res.levelTitle).toBe("⚡ En Progreso");
  });

  it("should unlock first step and streak badges accurately", () => {
    const res = calculateGamification(sampleChallenges, sampleHistory, 3, 3);
    const firstStep = res.achievements.find((a) => a.id === "first_step");
    const streak3 = res.achievements.find((a) => a.id === "streak_3");
    const streak30 = res.achievements.find((a) => a.id === "streak_30");

    expect(firstStep?.unlocked).toBe(true);
    expect(streak3?.unlocked).toBe(true);
    expect(streak30?.unlocked).toBe(false);
  });

  it("should identify category mastery achievements", () => {
    const res = calculateGamification(sampleChallenges, sampleHistory, 1, 1);
    const strengthBadge = res.achievements.find((a) => a.id === "strength_master");
    const cardioBadge = res.achievements.find((a) => a.id === "cardio_pro");

    expect(strengthBadge?.unlocked).toBe(true);
    expect(cardioBadge?.unlocked).toBe(true);
  });
});
