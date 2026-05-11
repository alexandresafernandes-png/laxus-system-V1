'use client';
import { useState, useEffect, useCallback } from 'react';
import type { GameState, CategoryXP } from '@/types';
import { DAILY_TASKS, calcPowerLevel } from '@/utils/xp';

const STORAGE_KEY = 'laxus_v1';

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

function defaultState(): GameState {
  return {
    username: 'Alex',
    totalXP: 0,
    categoryXP: { workout: 0, money: 0, habits: 0, mind: 0 },
    streak: 0,
    lastCheckinDate: '',
    powerHistory: [],
    todayTasks: {},
    todayDate: todayStr(),
  };
}

function maybeResetDay(state: GameState): GameState {
  const today = todayStr();
  if (state.todayDate === today) return state;

  const preserved = state.lastCheckinDate === yesterdayStr() ? state.streak : 0;
  return { ...state, todayDate: today, todayTasks: {}, streak: preserved };
}

export function useGameData() {
  const [state, setState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const loaded = raw ? maybeResetDay(JSON.parse(raw) as GameState) : defaultState();
    setState(loaded);
    setLoading(false);
  }, []);

  const toggleTask = useCallback((taskId: string) => {
    setState(prev => {
      if (!prev) return prev;

      const task = DAILY_TASKS.find(t => t.id === taskId);
      if (!task) return prev;

      const wasCompleted = prev.todayTasks[taskId] ?? false;
      const delta = wasCompleted ? -task.xp : task.xp;

      const newCategoryXP: CategoryXP = {
        ...prev.categoryXP,
        [task.category]: Math.max(0, prev.categoryXP[task.category] + delta),
      };
      const newTotalXP = Math.max(0, prev.totalXP + delta);
      const newTasks = { ...prev.todayTasks, [taskId]: !wasCompleted };

      const today = todayStr();
      let newStreak = prev.streak;
      let newLastCheckin = prev.lastCheckinDate;

      if (!wasCompleted && prev.lastCheckinDate !== today) {
        newStreak = prev.lastCheckinDate === yesterdayStr() ? prev.streak + 1 : 1;
        newLastCheckin = today;
      }

      const newPower = calcPowerLevel(newCategoryXP);
      const hist = [...prev.powerHistory];
      const idx = hist.findIndex(h => h.date === today);
      if (idx >= 0) hist[idx] = { date: today, powerLevel: newPower };
      else hist.push({ date: today, powerLevel: newPower });

      const next: GameState = {
        ...prev,
        totalXP: newTotalXP,
        categoryXP: newCategoryXP,
        todayTasks: newTasks,
        streak: newStreak,
        lastCheckinDate: newLastCheckin,
        powerHistory: hist.slice(-14),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { state, loading, toggleTask };
}
