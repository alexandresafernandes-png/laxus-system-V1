import type { CategoryXP, Rank } from '@/types';

export const DAILY_TASKS = [
  { id: 'workout_1', label: 'Workout completed', xp: 50, category: 'workout' as const },
  { id: 'money_1', label: 'Worked on business', xp: 50, category: 'money' as const },
  { id: 'money_2', label: 'Deep work session', xp: 30, category: 'money' as const },
  { id: 'habits_1', label: 'Slept well', xp: 25, category: 'habits' as const },
  { id: 'habits_2', label: 'Diet clean', xp: 25, category: 'habits' as const },
  { id: 'habits_3', label: 'No smoking', xp: 40, category: 'habits' as const },
  { id: 'habits_4', label: 'No reels / TikTok', xp: 30, category: 'habits' as const },
  { id: 'mind_1', label: 'Mental check-in', xp: 20, category: 'mind' as const },
  { id: 'mind_2', label: 'Planned tomorrow', xp: 20, category: 'mind' as const },
] as const;

// Max raw XP per day per category (used for radar normalization target: 14 days)
export const RADAR_MAX: CategoryXP = {
  workout: 700,   // 50 * 14
  money: 1120,    // 80 * 14
  habits: 1680,   // 120 * 14
  mind: 560,      // 40 * 14
};

export function calcPowerLevel(xp: CategoryXP): number {
  return Math.round(
    xp.workout * 1.2 +
    xp.money   * 1.3 +
    xp.habits  * 1.1 +
    xp.mind    * 1.0,
  );
}

export function calcLevel(totalXP: number): number {
  return Math.floor(totalXP / 150) + 1;
}

export function calcRank(level: number): Rank {
  if (level <= 10) return 'E';
  if (level <= 20) return 'D';
  if (level <= 35) return 'C';
  if (level <= 50) return 'B';
  if (level <= 75) return 'A';
  return 'S';
}

export function xpProgress(totalXP: number): { current: number; needed: number; percent: number } {
  const xpPerLevel = 150;
  const current = totalXP % xpPerLevel;
  return { current, needed: xpPerLevel, percent: (current / xpPerLevel) * 100 };
}

export const RANK_COLOR: Record<Rank, string> = {
  E: '#9ca3af',
  D: '#22c55e',
  C: '#3b82f6',
  B: '#8b5cf6',
  A: '#f97316',
  S: '#fbbf24',
};
