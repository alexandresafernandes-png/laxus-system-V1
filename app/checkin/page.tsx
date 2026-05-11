'use client';
import { useState, useCallback } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { DAILY_TASKS } from '@/utils/xp';
import type { Category } from '@/types';

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: 'workout', label: 'WORKOUT', icon: '⚡', color: '#ef4444' },
  { key: 'money',   label: 'MONEY',   icon: '◈',  color: '#fbbf24' },
  { key: 'habits',  label: 'HABITS',  icon: '⬡',  color: '#22c55e' },
  { key: 'mind',    label: 'MIND',    icon: '✦',  color: '#8b5cf6' },
];

const CAT_COMPLETE_LABEL: Record<Category, string> = {
  workout: 'WORKOUT COMPLETE',
  money:   'GRIND COMPLETE',
  habits:  'DISCIPLINE +',
  mind:    'MIND SHARPENED',
};

interface FloatItem { id: string; xp: number; label: string; key: number }

function playXpSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
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
  } catch { /* AudioContext blocked */ }
}

export default function CheckinPage() {
  const { state, loading, toggleTask, toggleSound } = useGameData();
  const [floats, setFloats] = useState<FloatItem[]>([]);

  const handleToggle = useCallback((taskId: string, xp: number, category: Category, completed: boolean) => {
    toggleTask(taskId);
    if (!completed) {
      if (state?.soundEnabled) playXpSound();
      const item: FloatItem = { id: taskId, xp, label: CAT_COMPLETE_LABEL[category], key: Date.now() };
      setFloats(prev => [...prev, item]);
      setTimeout(() => setFloats(prev => prev.filter(f => f.key !== item.key)), 1100);
    }
  }, [toggleTask, state?.soundEnabled]);

  if (loading || !state) return null;

  const todayXP = DAILY_TASKS.reduce((s, t) => s + (state.todayTasks[t.id] ? t.xp : 0), 0);
  const maxXP   = DAILY_TASKS.reduce((s, t) => s + t.xp, 0);

  return (
    <div className="min-h-screen bg-[#080810] text-white px-4 pt-10 pb-4 max-w-lg mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-[9px] font-mono tracking-[0.5em] text-[#3a3a5a] mb-1">DAILY</p>
          <h1 className="text-2xl font-black tracking-[0.15em]">CHECK-IN</h1>
        </div>
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg border border-[#1e1e3a] active:bg-[#131325] transition-colors"
        >
          <span className="text-base leading-none" style={state.soundEnabled ? { filter: 'drop-shadow(0 0 5px #00d4ff)' } : { opacity: 0.35 }}>
            {state.soundEnabled ? '🔊' : '🔇'}
          </span>
          <span className="text-[8px] font-mono tracking-widest" style={{ color: state.soundEnabled ? '#00d4ff' : '#3a3a5a' }}>
            {state.soundEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* ── Today XP ── */}
      <div className="relative bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-4 mb-6 overflow-hidden">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-1">TODAY'S XP</p>
            <div
              className="text-4xl font-black text-[#00d4ff] tabular-nums leading-tight transition-all duration-300"
              style={{ textShadow: todayXP > 0 ? '0 0 20px #00d4ff' : 'none' }}
            >
              +{todayXP}
            </div>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-mono tracking-[0.3em] text-[#3a3a5a] mb-1">MAX</p>
            <div className="text-xl font-bold text-[#2a2a4a]">{maxXP}</div>
          </div>
        </div>
        <div className="h-px bg-[#1e1e3a] mt-3 rounded overflow-hidden">
          <div
            className="h-full bg-[#00d4ff] rounded transition-all duration-500"
            style={{
              width:     `${(todayXP / maxXP) * 100}%`,
              boxShadow: todayXP > 0 ? '0 0 8px #00d4ff' : 'none',
            }}
          />
        </div>

        {/* Floating XP notifications */}
        {floats.map(f => (
          <div
            key={f.key}
            className="absolute right-4 top-3 pointer-events-none flex flex-col items-end gap-0.5"
            style={{ animation: 'floatUp 1.05s ease-out forwards' }}
          >
            <span className="text-lg font-black text-[#00d4ff]" style={{ textShadow: '0 0 12px #00d4ff' }}>
              +{f.xp} XP
            </span>
            <span className="text-[9px] font-mono tracking-widest text-[#00d4ff] opacity-80">
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Tasks ── */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label, icon, color }) => {
          const tasks   = DAILY_TASKS.filter(t => t.category === key);
          const catDone = tasks.filter(t => state.todayTasks[t.id]).length;

          return (
            <div key={key} className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e3a]">
                <div className="flex items-center gap-2">
                  <span style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}>{icon}</span>
                  <span className="text-[10px] font-bold font-mono tracking-[0.35em]" style={{ color }}>
                    {label}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#3a3a5a]">{catDone}/{tasks.length}</span>
              </div>

              <div className="divide-y divide-[#1e1e3a]">
                {tasks.map(task => {
                  const done = state.todayTasks[task.id] ?? false;
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleToggle(task.id, task.xp, task.category, done)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-150 active:bg-[#131325]"
                      style={{ animation: done ? 'taskPop 0.25s ease-out' : undefined }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{
                            border:     done ? '1.5px solid #00d4ff' : '1.5px solid #2a2a4a',
                            background: done ? 'rgba(0,212,255,0.15)' : 'transparent',
                            boxShadow:  done ? '0 0 8px rgba(0,212,255,0.35)' : 'none',
                          }}
                        >
                          {done && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="#00d4ff" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        <span className={`text-sm font-mono tracking-wide transition-colors duration-200 ${done ? 'text-[#3a3a5a] line-through' : 'text-white'}`}>
                          {task.label}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold font-mono ml-3 flex-shrink-0 transition-colors duration-200"
                        style={{ color: done ? '#00d4ff' : '#3a3a5a' }}>
                        +{task.xp}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Streak banner */}
      {state.streak > 0 && (
        <div
          className="mt-5 flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest"
          style={{
            color:      state.streakState === 'cracked' ? '#f97316' : '#fbbf24',
            textShadow: state.streakState === 'cracked' ? '0 0 8px #f97316' : '0 0 8px #fbbf24',
          }}
        >
          <span>⚔</span>
          <span>{state.streak} DAY STREAK {state.streakState === 'cracked' ? '— CRACKED' : ''}</span>
          <span>⚔</span>
        </div>
      )}
    </div>
  );
}
