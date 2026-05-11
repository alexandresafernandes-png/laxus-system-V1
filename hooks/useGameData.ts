'use client';
import { useState, useEffect, useCallback } from 'react';
import type { GameState, CategoryXP, DayLog, StreakState } from '@/types';
import { DAILY_TASKS, calcPowerLevel, generateWeeklyReport } from '@/utils/xp';

const STORAGE_KEY = 'laxus_v1';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function daysSince(dateStr: string): number {
  if (!dateStr) return 999;
  const today = new Date(todayStr());
  const last  = new Date(dateStr);
  return Math.round((today.getTime() - last.getTime()) / 86_400_000);
}

function isSunday(dateStr: string): boolean {
  return new Date(dateStr).getDay() === 0;
}

function defaultState(): GameState {
  return {
    username:       'Alex',
    totalXP:        0,
    categoryXP:     { workout: 0, money: 0, habits: 0, mind: 0 },
    streak:         0,
    streakState:    'active',
    lastCheckinDate:'',
    powerHistory:   [],
    todayTasks:     {},
    todayDate:      todayStr(),
    dailyLog:       [],
    weeklyReport:   null,
    soundEnabled:   false,
  };
}

function maybeResetDay(state: GameState): GameState {
  const today = todayStr();
  if (state.todayDate === today) return state;

  // Archive previous day into dailyLog
  const completedYesterday = Object.keys(state.todayTasks).filter(k => state.todayTasks[k]);
  const prevEntry: DayLog = { date: state.todayDate, completedTasks: completedYesterday };
  const newLog = [...(state.dailyLog ?? []), prevEntry]
    .filter(e => e.completedTasks.length > 0)
    .slice(-21);

  // Streak protection
  const days = daysSince(state.lastCheckinDate);
  let newStreak     = state.streak;
  let newStreakState: StreakState = 'active';

  if (days <= 1) {
    newStreakState = 'active';
  } else if (days === 2) {
    newStreakState = 'cracked';          // missed 1 day — streak survives
  } else {
    newStreak     = 0;                  // missed 2+ days — reset
    newStreakState = 'active';
  }

  // Weekly report on Sundays
  const weeklyReport = isSunday(today)
    ? generateWeeklyReport(newLog, today)
    : (state.weeklyReport ?? null);

  return {
    ...state,
    todayDate:    today,
    todayTasks:   {},
    streak:       newStreak,
    streakState:  newStreakState,
    dailyLog:     newLog,
    weeklyReport,
  };
}

export function useGameData() {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw  = localStorage.getItem(STORAGE_KEY);
    const base = raw ? (JSON.parse(raw) as GameState) : defaultState();
    // Back-fill missing fields for saved states from before this version
    const loaded = maybeResetDay({
      ...base,
      streakState:  base.streakState  ?? 'active',
      dailyLog:     base.dailyLog     ?? [],
      weeklyReport: base.weeklyReport ?? null,
      soundEnabled: base.soundEnabled ?? false,
    });
    setState(loaded);
    setLoading(false);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setState(prev => {
      if (!prev) return prev;

      const task = DAILY_TASKS.find(t => t.id === taskId);
      if (!task) return prev;

      const wasCompleted = prev.todayTasks[taskId] ?? false;
      const delta        = wasCompleted ? -task.xp : task.xp;

      const newCategoryXP: CategoryXP = {
        ...prev.categoryXP,
        [task.category]: Math.max(0, prev.categoryXP[task.category] + delta),
      };
      const newTotalXP = Math.max(0, prev.totalXP + delta);
      const newTasks   = { ...prev.todayTasks, [taskId]: !wasCompleted };

      const today = todayStr();
      let newStreak     = prev.streak;
      let newLastCheckin = prev.lastCheckinDate;
      let newStreakState = prev.streakState;

      if (!wasCompleted && prev.lastCheckinDate !== today) {
        // First task completed today — heal cracked streak or continue
        const days = daysSince(prev.lastCheckinDate);
        newStreak      = days <= 2 ? prev.streak + 1 : 1;
        newLastCheckin = today;
        newStreakState = 'active';
      }

      const newPower = calcPowerLevel(newCategoryXP);
      const hist     = [...prev.powerHistory];
      const idx      = hist.findIndex(h => h.date === today);
      if (idx >= 0) hist[idx] = { date: today, powerLevel: newPower };
      else          hist.push({ date: today, powerLevel: newPower });

      const next: GameState = {
        ...prev,
        totalXP:         newTotalXP,
        categoryXP:      newCategoryXP,
        todayTasks:      newTasks,
        streak:          newStreak,
        streakState:     newStreakState,
        lastCheckinDate: newLastCheckin,
        powerHistory:    hist.slice(-14),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleSound = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      const next = { ...prev, soundEnabled: !prev.soundEnabled };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { state, loading, toggleTask, toggleSound };
}
