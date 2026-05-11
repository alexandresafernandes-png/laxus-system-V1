'use client';
import { useState, useCallback, useRef } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { DAILY_TASKS, DIFFICULTY_XP, DIFFICULTY_COLOR, DIFFICULTY_LABEL, BUSINESS_XP_DAILY_CAP } from '@/utils/xp';
import type { Category, BusinessDifficulty } from '@/types';

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: 'workout', label: 'WORKOUT', icon: '⚡', color: '#ef4444' },
  { key: 'money',   label: 'MONEY',   icon: '◈',  color: '#fbbf24' },
  { key: 'habits',  label: 'HABITS',  icon: '⬡',  color: '#22c55e' },
  { key: 'mind',    label: 'MIND',    icon: '✦',  color: '#8b5cf6' },
];

const CAT_COMPLETE: Record<Category, string> = {
  workout: 'WORKOUT COMPLETE',
  money:   'GRIND COMPLETE',
  habits:  'DISCIPLINE +',
  mind:    'MIND SHARPENED',
};

const DIFFICULTIES: BusinessDifficulty[] = ['tiny', 'small', 'medium', 'big', 'boss'];

interface FloatItem { id: string; xp: number; label: string; key: number }

function playXpSound() {
  try {
    const ctx  = new AudioContext();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.06);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch { /* blocked */ }
}

function todayStr() { return new Date().toISOString().split('T')[0]; }

export default function CheckinPage() {
  const { state, loading, toggleTask, toggleBusinessTask, addBusinessTask, deleteBusinessTask, toggleSound } = useGameData();

  const [floats, setFloats] = useState<FloatItem[]>([]);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [newLabel, setNewLabel]         = useState('');
  const [newDiff, setNewDiff]           = useState<BusinessDifficulty>('medium');
  const inputRef = useRef<HTMLInputElement>(null);

  const pushFloat = useCallback((id: string, xp: number, label: string) => {
    const item: FloatItem = { id, xp, label, key: Date.now() };
    setFloats(prev => [...prev, item]);
    setTimeout(() => setFloats(prev => prev.filter(f => f.key !== item.key)), 1100);
  }, []);

  const handleToggle = useCallback((taskId: string, xp: number, category: Category, done: boolean) => {
    toggleTask(taskId);
    if (!done) {
      if (state?.soundEnabled) playXpSound();
      pushFloat(taskId, xp, CAT_COMPLETE[category]);
    }
  }, [toggleTask, state?.soundEnabled, pushFloat]);

  const handleBizToggle = useCallback((taskId: string, xp: number, done: boolean) => {
    toggleBusinessTask(taskId);
    if (!done) {
      if (state?.soundEnabled) playXpSound();
      pushFloat(taskId, xp, 'MISSION COMPLETE');
    }
  }, [toggleBusinessTask, state?.soundEnabled, pushFloat]);

  const handleAddTask = useCallback(() => {
    if (!newLabel.trim()) return;
    addBusinessTask(newLabel, newDiff);
    setNewLabel('');
    setNewDiff('medium');
    setShowAddForm(false);
  }, [addBusinessTask, newLabel, newDiff]);

  const openForm = useCallback(() => {
    setShowAddForm(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  if (loading || !state) return null;

  const today     = todayStr();
  const todayXP   = DAILY_TASKS.reduce((s, t) => s + (state.todayTasks[t.id] ? t.xp : 0), 0);
  const maxXP     = DAILY_TASKS.reduce((s, t) => s + t.xp, 0);
  const todayBizXP = state.businessTasks
    .filter(t => t.lastCompletedDate === today)
    .reduce((s, t) => s + t.xp, 0);
  const allTodayXP = todayXP + todayBizXP;
  const capPct    = Math.min((todayBizXP / BUSINESS_XP_DAILY_CAP) * 100, 100);
  const capFull   = todayBizXP >= BUSINESS_XP_DAILY_CAP;

  return (
    <div className="min-h-screen text-white px-4 pt-10 pb-4 max-w-lg mx-auto animate-fade-in"
      style={{ background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[9px] font-mono tracking-[0.5em] mb-1" style={{ color: 'var(--muted)' }}>DAILY</p>
          <h1 className="text-2xl font-black tracking-[0.15em]">CHECK-IN</h1>
        </div>
        <button
          onClick={toggleSound}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border transition-colors"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
        >
          <span className="text-base leading-none"
            style={state.soundEnabled ? { filter: 'drop-shadow(0 0 5px #00d4ff)' } : { opacity: 0.3 }}>
            {state.soundEnabled ? '🔊' : '🔇'}
          </span>
          <span className="text-[8px] font-mono tracking-widest"
            style={{ color: state.soundEnabled ? '#00d4ff' : 'var(--dim)' }}>
            {state.soundEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* ── Today XP ── */}
      <div className="relative rounded-xl p-4 mb-6 overflow-hidden border"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-mono tracking-[0.4em] mb-1" style={{ color: 'var(--muted)' }}>TODAY'S XP</p>
            <div className="text-4xl font-black text-[#00d4ff] tabular-nums leading-tight transition-all duration-300"
              style={{ textShadow: allTodayXP > 0 ? '0 0 20px #00d4ff' : 'none' }}>
              +{allTodayXP}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono tracking-[0.3em] mb-1" style={{ color: 'var(--muted)' }}>MAX</p>
            <div className="text-xl font-bold" style={{ color: 'var(--dim)' }}>{maxXP + BUSINESS_XP_DAILY_CAP}</div>
          </div>
        </div>
        <div className="h-px mt-3 rounded overflow-hidden" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded transition-all duration-500 bg-[#00d4ff]"
            style={{
              width:     `${(allTodayXP / (maxXP + BUSINESS_XP_DAILY_CAP)) * 100}%`,
              boxShadow: allTodayXP > 0 ? '0 0 8px #00d4ff' : 'none',
            }}
          />
        </div>

        {/* Floating XP */}
        {floats.map(f => (
          <div key={f.key}
            className="absolute right-4 top-3 pointer-events-none flex flex-col items-end gap-0.5"
            style={{ animation: 'floatUp 1.05s ease-out forwards' }}>
            <span className="text-lg font-black text-[#00d4ff]" style={{ textShadow: '0 0 12px #00d4ff' }}>
              +{f.xp} XP
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#00d4ff] opacity-80">{f.label}</span>
          </div>
        ))}
      </div>

      {/* ── Task categories ── */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label, icon, color }) => {
          const tasks   = DAILY_TASKS.filter(t => t.category === key);
          const catDone = tasks.filter(t => state.todayTasks[t.id]).length;

          return (
            <div key={key} className="rounded-xl overflow-hidden border"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>

              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3 border-b"
                style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}>{icon}</span>
                  <span className="text-[10px] font-bold font-mono tracking-[0.35em]" style={{ color }}>{label}</span>
                </div>
                <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>{catDone}/{tasks.length}</span>
              </div>

              {/* Standard tasks */}
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {tasks.map(task => {
                  const done = state.todayTasks[task.id] ?? false;
                  return (
                    <button key={task.id}
                      onClick={() => handleToggle(task.id, task.xp, task.category, done)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-150"
                      style={{ animation: done ? 'taskPop 0.25s ease-out' : undefined }}>
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{
                            border:     done ? '1.5px solid #00d4ff' : `1.5px solid var(--dim)`,
                            background: done ? 'rgba(0,212,255,0.15)' : 'transparent',
                            boxShadow:  done ? '0 0 8px rgba(0,212,255,0.3)' : 'none',
                          }}>
                          {done && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="#00d4ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-mono tracking-wide transition-colors duration-200"
                          style={{ color: done ? 'var(--muted)' : '#f0f4ff', textDecoration: done ? 'line-through' : 'none' }}>
                          {task.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold font-mono ml-3 flex-shrink-0"
                        style={{ color: done ? '#00d4ff' : 'var(--muted)' }}>
                        +{task.xp}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* ── Business Missions (Money card only) ── */}
              {key === 'money' && (
                <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                  {/* Missions header */}
                  <div className="flex items-center justify-between px-4 py-2.5"
                    style={{ background: 'rgba(15,20,35,0.6)' }}>
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] font-mono font-bold tracking-widest text-[#fbbf24]">
                        MISSIONS
                      </span>
                      <span className="text-[9px] font-mono" style={{ color: 'var(--muted)' }}>
                        {todayBizXP}/{BUSINESS_XP_DAILY_CAP} XP
                        {capFull && <span className="text-[#fbbf24] ml-1">· CAP</span>}
                      </span>
                    </div>
                  </div>

                  {/* Daily XP cap bar */}
                  <div className="px-4 pb-1.5 pt-0.5">
                    <div className="h-0.5 rounded overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded transition-all duration-500"
                        style={{
                          width:     `${capPct}%`,
                          background: capFull ? '#f97316' : '#fbbf24',
                          boxShadow:  capPct > 0 ? `0 0 6px ${capFull ? '#f97316' : '#fbbf24'}` : 'none',
                        }}
                      />
                    </div>
                  </div>

                  {/* Business tasks */}
                  {state.businessTasks.length === 0 && !showAddForm && (
                    <div className="px-4 py-3 text-center">
                      <p className="text-[10px] font-mono" style={{ color: 'var(--dim)' }}>No missions yet</p>
                    </div>
                  )}

                  {state.businessTasks.map(task => {
                    const done     = task.lastCompletedDate === today;
                    const diffColor = DIFFICULTY_COLOR[task.difficulty];
                    const blocked  = !done && capFull;
                    return (
                      <div key={task.id}
                        className="flex items-center gap-2 px-4 py-3 border-t"
                        style={{ borderColor: 'var(--border)' }}>
                        {/* Complete toggle */}
                        <button
                          onClick={() => !blocked && handleBizToggle(task.id, task.xp, done)}
                          className="flex items-center gap-3 flex-1 text-left"
                          style={{ opacity: blocked ? 0.45 : 1 }}>
                          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                            style={{
                              border:     done ? `1.5px solid ${diffColor}` : `1.5px solid var(--dim)`,
                              background: done ? `${diffColor}22` : 'transparent',
                              boxShadow:  done ? `0 0 6px ${diffColor}60` : 'none',
                            }}>
                            {done && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke={diffColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span className="text-sm font-mono tracking-wide flex-1"
                            style={{
                              color:           done ? 'var(--muted)' : '#f0f4ff',
                              textDecoration:  done ? 'line-through' : 'none',
                            }}>
                            {task.label}
                          </span>
                        </button>
                        {/* Difficulty + XP */}
                        <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded"
                          style={{
                            color:      diffColor,
                            background: `${diffColor}18`,
                            border:     `1px solid ${diffColor}30`,
                          }}>
                          {DIFFICULTY_LABEL[task.difficulty]}
                        </span>
                        <span className="text-[10px] font-bold font-mono w-9 text-right"
                          style={{ color: done ? diffColor : 'var(--muted)' }}>
                          +{task.xp}
                        </span>
                        {/* Delete */}
                        <button onClick={() => deleteBusinessTask(task.id)}
                          className="text-[12px] leading-none transition-colors duration-150 w-5 text-center"
                          style={{ color: 'var(--dim)' }}>
                          ×
                        </button>
                      </div>
                    );
                  })}

                  {/* Add form */}
                  {showAddForm ? (
                    <div className="px-4 py-3 border-t space-y-3"
                      style={{ borderColor: 'var(--border)', background: 'rgba(10,14,26,0.5)' }}>
                      <input
                        ref={inputRef}
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); if (e.key === 'Escape') setShowAddForm(false); }}
                        placeholder="Mission name..."
                        className="w-full bg-transparent text-sm font-mono outline-none placeholder:opacity-30"
                        style={{
                          color:       '#f0f4ff',
                          borderBottom: '1px solid var(--border)',
                          paddingBottom: '6px',
                        }}
                      />
                      {/* Difficulty pills */}
                      <div className="flex gap-1.5 flex-wrap">
                        {DIFFICULTIES.map(d => {
                          const col     = DIFFICULTY_COLOR[d];
                          const active  = newDiff === d;
                          return (
                            <button key={d}
                              onClick={() => setNewDiff(d)}
                              className="text-[9px] font-mono font-bold px-2 py-1 rounded transition-all duration-150"
                              style={{
                                color:      col,
                                background: active ? `${col}25` : `${col}0a`,
                                border:     `1px solid ${active ? col : `${col}30`}`,
                                boxShadow:  active ? `0 0 6px ${col}40` : 'none',
                              }}>
                              {DIFFICULTY_LABEL[d]} +{DIFFICULTY_XP[d]}
                            </button>
                          );
                        })}
                      </div>
                      {/* Actions */}
                      <div className="flex gap-2">
                        <button onClick={handleAddTask}
                          disabled={!newLabel.trim()}
                          className="flex-1 py-1.5 rounded text-[10px] font-mono font-bold tracking-widest transition-all duration-150"
                          style={{
                            background: newLabel.trim() ? '#fbbf24' : 'var(--border)',
                            color:      newLabel.trim() ? '#080810' : 'var(--dim)',
                          }}>
                          SAVE
                        </button>
                        <button onClick={() => { setShowAddForm(false); setNewLabel(''); }}
                          className="px-4 py-1.5 rounded text-[10px] font-mono tracking-widest"
                          style={{ color: 'var(--muted)', border: '1px solid var(--border)' }}>
                          CANCEL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={openForm}
                      className="w-full flex items-center gap-2 px-4 py-3 border-t transition-colors duration-150"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                      <span className="text-base leading-none text-[#fbbf24]">+</span>
                      <span className="text-[10px] font-mono tracking-widest">ADD MISSION</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Streak banner */}
      {state.streak > 0 && (
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest"
          style={{
            color:      state.streakState === 'cracked' ? '#f97316' : '#fbbf24',
            textShadow: state.streakState === 'cracked' ? '0 0 8px #f97316' : '0 0 8px #fbbf24',
          }}>
          <span>⚔</span>
          <span>{state.streak} DAY STREAK{state.streakState === 'cracked' ? ' — CRACKED' : ''}</span>
          <span>⚔</span>
        </div>
      )}
    </div>
  );
}
