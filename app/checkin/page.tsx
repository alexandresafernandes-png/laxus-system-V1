'use client';
import { useState } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { DAILY_TASKS } from '@/utils/xp';
import type { Category } from '@/types';

const CATEGORIES: { key: Category; label: string; icon: string; color: string }[] = [
  { key: 'workout', label: 'WORKOUT', icon: '⚡', color: '#ef4444' },
  { key: 'money',   label: 'MONEY',   icon: '◈',  color: '#fbbf24' },
  { key: 'habits',  label: 'HABITS',  icon: '⬡',  color: '#22c55e' },
  { key: 'mind',    label: 'MIND',    icon: '✦',  color: '#8b5cf6' },
];

interface FloatXP { id: string; xp: number; key: number }

export default function CheckinPage() {
  const { state, loading, toggleTask } = useGameData();
  const [float, setFloat] = useState<FloatXP | null>(null);

  if (loading || !state) return null;

  const todayXP = DAILY_TASKS.reduce(
    (sum, t) => sum + (state.todayTasks[t.id] ? t.xp : 0), 0
  );
  const maxXP = DAILY_TASKS.reduce((s, t) => s + t.xp, 0);

  function handleToggle(taskId: string, xp: number, completed: boolean) {
    toggleTask(taskId);
    if (!completed) {
      setFloat({ id: taskId, xp, key: Date.now() });
      setTimeout(() => setFloat(null), 900);
    }
  }

  return (
    <div className="min-h-screen bg-[#080810] text-white px-4 pt-10 pb-4 max-w-lg mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="mb-6">
        <p className="text-[9px] font-mono tracking-[0.5em] text-[#3a3a5a] mb-1">DAILY</p>
        <h1 className="text-2xl font-black tracking-[0.15em]">CHECK-IN</h1>
      </div>

      {/* ── Today XP summary ── */}
      <div className="relative bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-4 mb-6 overflow-hidden">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-1">TODAY'S XP</p>
            <div
              className="text-4xl font-black text-[#00d4ff] tabular-nums leading-tight"
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
              width: `${(todayXP / maxXP) * 100}%`,
              boxShadow: todayXP > 0 ? '0 0 8px #00d4ff' : 'none',
            }}
          />
        </div>

        {/* Floating +XP */}
        {float && (
          <div
            key={float.key}
            className="absolute top-4 right-4 font-black text-lg text-[#00d4ff] pointer-events-none"
            style={{
              animation: 'floatUp 0.9s ease-out forwards',
              textShadow: '0 0 12px #00d4ff',
            }}
          >
            +{float.xp} XP
          </div>
        )}
      </div>

      {/* ── Tasks ── */}
      <div className="space-y-3">
        {CATEGORIES.map(({ key, label, icon, color }) => {
          const tasks = DAILY_TASKS.filter(t => t.category === key);
          const catDone = tasks.filter(t => state.todayTasks[t.id]).length;

          return (
            <div key={key} className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl overflow-hidden">
              {/* Category header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e1e3a]">
                <div className="flex items-center gap-2">
                  <span style={{ color, filter: `drop-shadow(0 0 4px ${color})` }}>{icon}</span>
                  <span className="text-[10px] font-bold font-mono tracking-[0.35em]" style={{ color }}>
                    {label}
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#3a3a5a]">
                  {catDone}/{tasks.length}
                </span>
              </div>

              {/* Task rows */}
              <div className="divide-y divide-[#1e1e3a]">
                {tasks.map(task => {
                  const done = state.todayTasks[task.id] ?? false;
                  return (
                    <button
                      key={task.id}
                      onClick={() => handleToggle(task.id, task.xp, done)}
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors duration-150 active:bg-[#131325]"
                      style={{ animation: done ? 'taskPop 0.25s ease-out' : undefined }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Checkbox */}
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200"
                          style={{
                            border: done ? '1.5px solid #00d4ff' : '1.5px solid #2a2a4a',
                            background: done ? 'rgba(0,212,255,0.15)' : 'transparent',
                            boxShadow: done ? '0 0 8px rgba(0,212,255,0.4)' : 'none',
                          }}
                        >
                          {done && (
                            <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                              <path d="M1 4L3.5 6.5L9 1" stroke="#00d4ff" strokeWidth="1.5"
                                strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>
                        {/* Label */}
                        <span
                          className={`text-sm font-mono tracking-wide transition-colors duration-200 ${
                            done ? 'text-[#3a3a5a] line-through' : 'text-white'
                          }`}
                        >
                          {task.label}
                        </span>
                      </div>
                      {/* XP badge */}
                      <span
                        className="text-[10px] font-bold font-mono ml-3 flex-shrink-0 transition-colors duration-200"
                        style={{ color: done ? '#00d4ff' : '#3a3a5a' }}
                      >
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
        <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-mono tracking-widest text-[#fbbf24]"
          style={{ textShadow: '0 0 8px #fbbf24' }}>
          <span>⚔</span>
          <span>{state.streak} DAY STREAK</span>
          <span>⚔</span>
        </div>
      )}
    </div>
  );
}
