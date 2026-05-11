'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import type { GameState, CategoryXP, DayLog, StreakState, BusinessTask, BusinessDifficulty } from '@/types';
import { DAILY_TASKS, calcPowerLevel, generateWeeklyReport, DIFFICULTY_XP, BUSINESS_XP_DAILY_CAP } from '@/utils/xp';
import { getSession, saveProgress, clearSession, type SyncStatus } from '@/lib/sync';

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
    username:        'Alex',
    totalXP:         0,
    categoryXP:      { workout: 0, money: 0, habits: 0, mind: 0 },
    streak:          0,
    streakState:     'active',
    lastCheckinDate: '',
    powerHistory:    [],
    todayTasks:      {},
    todayDate:       todayStr(),
    dailyLog:        [],
    weeklyReport:    null,
    soundEnabled:    false,
    businessTasks:   [],
  };
}

function maybeResetDay(state: GameState): GameState {
  const today = todayStr();
  if (state.todayDate === today) return state;

  const completedYesterday = Object.keys(state.todayTasks).filter(k => state.todayTasks[k]);
  const prevEntry: DayLog = { date: state.todayDate, completedTasks: completedYesterday };
  const newLog = [...(state.dailyLog ?? []), prevEntry]
    .filter(e => e.completedTasks.length > 0)
    .slice(-21);

  const days = daysSince(state.lastCheckinDate);
  let newStreak     = state.streak;
  let newStreakState: StreakState = 'active';

  if (days <= 1)      { newStreakState = 'active'; }
  else if (days === 2){ newStreakState = 'cracked'; }
  else                { newStreak = 0; newStreakState = 'active'; }

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

function persist(next: GameState): GameState {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function bumpStreak(prev: GameState, today: string): Pick<GameState, 'streak' | 'lastCheckinDate' | 'streakState'> {
  if (prev.lastCheckinDate === today) return { streak: prev.streak, lastCheckinDate: prev.lastCheckinDate, streakState: prev.streakState };
  const days = daysSince(prev.lastCheckinDate);
  return {
    streak:          days <= 2 ? prev.streak + 1 : 1,
    lastCheckinDate: today,
    streakState:     'active',
  };
}

function bumpHistory(prev: GameState, newCategoryXP: CategoryXP, today: string): PowerPoint[] {
  const newPower = calcPowerLevel(newCategoryXP);
  const hist = [...prev.powerHistory];
  const idx  = hist.findIndex(h => h.date === today);
  if (idx >= 0) hist[idx] = { date: today, powerLevel: newPower };
  else          hist.push({ date: today, powerLevel: newPower });
  return hist.slice(-14);
}

type PowerPoint = { date: string; powerLevel: number };

export function useGameData() {
  const [state,      setState]      = useState<GameState | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('local');

  const usernameRef   = useRef<string | null>(null);
  const syncTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef    = useRef(true);
  const didMutateRef  = useRef(false); // skip sync on initial load

  // ── Init ─────────────────────────────────────────────
  useEffect(() => {
    mountedRef.current = true;
    const raw    = localStorage.getItem(STORAGE_KEY);
    const base   = raw ? (JSON.parse(raw) as GameState) : defaultState();
    const loaded = maybeResetDay({
      ...base,
      streakState:   base.streakState   ?? 'active',
      dailyLog:      base.dailyLog      ?? [],
      weeklyReport:  base.weeklyReport  ?? null,
      soundEnabled:  base.soundEnabled  ?? false,
      businessTasks: base.businessTasks ?? [],
    });
    const session = getSession();
    if (session) {
      usernameRef.current = session.username;
      setSyncStatus('synced');
    }
    setState(loaded);
    setLoading(false);
    return () => {
      mountedRef.current = false;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  // ── Auto-sync on mutations ────────────────────────────
  useEffect(() => {
    if (!state || !usernameRef.current) return;
    if (!didMutateRef.current) {
      didMutateRef.current = true; // skip initial load
      return;
    }
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    setSyncStatus('syncing');
    syncTimerRef.current = setTimeout(async () => {
      if (!mountedRef.current || !usernameRef.current) return;
      const ok = await saveProgress(usernameRef.current, state);
      if (mountedRef.current) setSyncStatus(ok ? 'synced' : 'offline');
    }, 1500);
  }, [state]);

  // ── Core task toggle ──────────────────────────────────
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
      const today      = todayStr();

      const streakFields = !wasCompleted ? bumpStreak(prev, today) : { streak: prev.streak, lastCheckinDate: prev.lastCheckinDate, streakState: prev.streakState };
      const history      = bumpHistory(prev, newCategoryXP, today);

      return persist({
        ...prev,
        totalXP:      newTotalXP,
        categoryXP:   newCategoryXP,
        todayTasks:   newTasks,
        powerHistory: history,
        ...streakFields,
      });
    });
  }, []);

  // ── Business task management ──────────────────────────
  const addBusinessTask = useCallback((label: string, difficulty: BusinessDifficulty) => {
    setState(prev => {
      if (!prev) return prev;
      const task: BusinessTask = {
        id:                `biz_${Date.now()}`,
        label:             label.trim(),
        difficulty,
        xp:                DIFFICULTY_XP[difficulty],
        lastCompletedDate: null,
      };
      return persist({ ...prev, businessTasks: [...prev.businessTasks, task] });
    });
  }, []);

  const toggleBusinessTask = useCallback((taskId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const task  = prev.businessTasks.find(t => t.id === taskId);
      if (!task) return prev;

      const today       = todayStr();
      const isCompleted = task.lastCompletedDate === today;

      if (isCompleted) {
        const newCategoryXP: CategoryXP = {
          ...prev.categoryXP,
          money: Math.max(0, prev.categoryXP.money - task.xp),
        };
        return persist({
          ...prev,
          businessTasks: prev.businessTasks.map(t => t.id === taskId ? { ...t, lastCompletedDate: null } : t),
          categoryXP:    newCategoryXP,
          totalXP:       Math.max(0, prev.totalXP - task.xp),
          powerHistory:  bumpHistory(prev, newCategoryXP, today),
        });
      }

      const todayBizXP = prev.businessTasks
        .filter(t => t.lastCompletedDate === today)
        .reduce((s, t) => s + t.xp, 0);
      if (todayBizXP + task.xp > BUSINESS_XP_DAILY_CAP) return prev;

      const newCategoryXP: CategoryXP = {
        ...prev.categoryXP,
        money: prev.categoryXP.money + task.xp,
      };
      const newTotalXP = prev.totalXP + task.xp;

      return persist({
        ...prev,
        businessTasks: prev.businessTasks.map(t => t.id === taskId ? { ...t, lastCompletedDate: today } : t),
        categoryXP:    newCategoryXP,
        totalXP:       newTotalXP,
        powerHistory:  bumpHistory(prev, newCategoryXP, today),
        ...bumpStreak(prev, today),
      });
    });
  }, []);

  const deleteBusinessTask = useCallback((taskId: string) => {
    setState(prev => {
      if (!prev) return prev;
      const task   = prev.businessTasks.find(t => t.id === taskId);
      const today  = todayStr();
      const refund = task?.lastCompletedDate === today ? task.xp : 0;

      const newCategoryXP: CategoryXP = {
        ...prev.categoryXP,
        money: Math.max(0, prev.categoryXP.money - refund),
      };
      return persist({
        ...prev,
        businessTasks: prev.businessTasks.filter(t => t.id !== taskId),
        categoryXP:    newCategoryXP,
        totalXP:       Math.max(0, prev.totalXP - refund),
        powerHistory:  refund > 0 ? bumpHistory(prev, newCategoryXP, today) : prev.powerHistory,
      });
    });
  }, []);

  const toggleSound = useCallback(() => {
    setState(prev => {
      if (!prev) return prev;
      return persist({ ...prev, soundEnabled: !prev.soundEnabled });
    });
  }, []);

  const logout = useCallback(() => {
    clearSession();
    usernameRef.current = null;
    setSyncStatus('local');
    window.location.reload();
  }, []);

  return {
    state, loading, syncStatus,
    toggleTask, toggleBusinessTask, addBusinessTask, deleteBusinessTask, toggleSound,
    logout,
  };
}
