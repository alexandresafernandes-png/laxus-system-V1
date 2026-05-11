import type { CategoryXP, Grade, Rank, HunterStats, GameState, DayLog, WeeklyReport, BusinessDifficulty } from '@/types';

export const DAILY_TASKS = [
  { id: 'workout_1', label: 'Workout completed',  xp: 50, category: 'workout' as const },
  { id: 'money_1',   label: 'Worked on business', xp: 50, category: 'money'   as const },
  { id: 'money_2',   label: 'Deep work session',  xp: 30, category: 'money'   as const },
  { id: 'habits_1',  label: 'Slept well',         xp: 25, category: 'habits'  as const },
  { id: 'habits_2',  label: 'Diet clean',         xp: 25, category: 'habits'  as const },
  { id: 'habits_3',  label: 'No smoking',         xp: 40, category: 'habits'  as const },
  { id: 'habits_4',  label: 'No reels / TikTok', xp: 30, category: 'habits'  as const },
  { id: 'mind_1',    label: 'Mental check-in',    xp: 20, category: 'mind'    as const },
  { id: 'mind_2',    label: 'Planned tomorrow',   xp: 20, category: 'mind'    as const },
] as const;

export const RADAR_MAX: CategoryXP = {
  workout: 700,
  money:   1120,
  habits:  1680,
  mind:    560,
};

// ── Business tasks ───────────────────────────────────────
export const DIFFICULTY_XP: Record<BusinessDifficulty, number> = {
  tiny:   10,
  small:  20,
  medium: 40,
  big:    75,
  boss:   150,
};

export const DIFFICULTY_COLOR: Record<BusinessDifficulty, string> = {
  tiny:   '#6b7280',
  small:  '#22c55e',
  medium: '#3b82f6',
  big:    '#8b5cf6',
  boss:   '#f97316',
};

export const DIFFICULTY_LABEL: Record<BusinessDifficulty, string> = {
  tiny:   'TINY',
  small:  'SMALL',
  medium: 'MED',
  big:    'BIG',
  boss:   'BOSS',
};

export const BUSINESS_XP_DAILY_CAP = 200;

// ── Core formulas ────────────────────────────────────────
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

// ── Hunter Stats ─────────────────────────────────────────
export function calcHunterStats(state: Pick<GameState, 'categoryXP' | 'totalXP' | 'streak'>): HunterStats {
  const { categoryXP, totalXP, streak } = state;
  return {
    str:         Math.min(99, Math.floor(categoryXP.workout  / 18)),
    int:         Math.min(99, Math.floor(categoryXP.money    / 20)),
    discipline:  Math.min(99, streak * 2 + Math.floor(categoryXP.habits / 32)),
    consistency: Math.min(99, Math.floor(totalXP / 90)),
    focus:       Math.min(99, Math.floor(categoryXP.mind / 6) + Math.floor(categoryXP.habits / 42)),
  };
}

// ── Aura ─────────────────────────────────────────────────
export type AuraStage = 0 | 1 | 2 | 3;
export interface AuraConfig {
  stage:     AuraStage;
  primary:   string;
  secondary: string;
  glow:      string;
  label:     string;
}

export function getAura(powerLevel: number): AuraConfig {
  if (powerLevel >= 3000) return {
    stage: 3, primary: '#dc2626', secondary: '#8b5cf6',
    glow: '0 0 40px #dc2626, 0 0 80px #8b5cf6', label: 'MONARCH',
  };
  if (powerLevel >= 1500) return {
    stage: 2, primary: '#8b5cf6', secondary: '#3d6aff',
    glow: '0 0 30px #8b5cf6, 0 0 60px #3d6aff', label: 'SHADOW',
  };
  if (powerLevel >= 500) return {
    stage: 1, primary: '#00d4ff', secondary: '#3d6aff',
    glow: '0 0 25px #00d4ff, 0 0 50px #3d6aff', label: 'AWAKENED',
  };
  return {
    stage: 0, primary: '#00d4ff', secondary: '#1e3a5f',
    glow: '0 0 15px #00d4ff', label: 'HUNTER',
  };
}

// ── Weekly Report ────────────────────────────────────────
function toGrade(score: number): Grade {
  if (score >= 0.9)  return 'S';
  if (score >= 0.75) return 'A';
  if (score >= 0.6)  return 'B';
  if (score >= 0.42) return 'C';
  if (score >= 0.22) return 'D';
  return 'F';
}

export function generateWeeklyReport(dailyLog: DayLog[], weekEndDate: string): WeeklyReport {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(weekEndDate);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  const logs = days.map(date => dailyLog.find(l => l.date === date) ?? { date, completedTasks: [] });

  const daysActive  = logs.filter(l => l.completedTasks.length > 0).length;
  const workouts    = logs.filter(l => l.completedTasks.includes('workout_1')).length;
  const noSmoking   = logs.filter(l => l.completedTasks.includes('habits_3')).length;
  const noReels     = logs.filter(l => l.completedTasks.includes('habits_4')).length;
  const habitsTotal = logs.reduce((s, l) => s + l.completedTasks.filter(t => t.startsWith('habits_')).length, 0);

  const consistency = daysActive  / 7;
  const physical    = workouts    / 7;
  const focus       = (noSmoking + noReels) / 14;
  const discipline  = habitsTotal / 28;
  const avg         = (consistency + physical + focus + discipline) / 4;

  return {
    weekEnd: weekEndDate,
    grades: {
      consistency: toGrade(consistency),
      physical:    toGrade(physical),
      focus:       toGrade(focus),
      discipline:  toGrade(discipline),
      overall:     toGrade(avg),
    },
  };
}

export const GRADE_COLOR: Record<Grade, string> = {
  S: '#fbbf24',
  A: '#f97316',
  B: '#8b5cf6',
  C: '#3b82f6',
  D: '#22c55e',
  F: '#6b7280',
};
