'use client';
import { useMemo } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { calcHunterStats, calcRank, calcLevel, getAura, calcPowerLevel } from '@/utils/xp';

const STATS = [
  { key: 'str'         as const, label: 'STR',         full: 'STRENGTH',    color: '#ef4444', desc: 'Physical power' },
  { key: 'int'         as const, label: 'INT',         full: 'INTELLIGENCE', color: '#3b82f6', desc: 'Mental output'   },
  { key: 'discipline'  as const, label: 'DISC',        full: 'DISCIPLINE',   color: '#fbbf24', desc: 'Habit mastery'  },
  { key: 'consistency' as const, label: 'CON',         full: 'CONSISTENCY',  color: '#22c55e', desc: 'Daily effort'   },
  { key: 'focus'       as const, label: 'FOC',         full: 'FOCUS',        color: '#8b5cf6', desc: 'Mental clarity' },
];

export default function StatusPage() {
  const { state, loading } = useGameData();

  const d = useMemo(() => {
    if (!state) return null;
    const stats      = calcHunterStats(state);
    const powerLevel = calcPowerLevel(state.categoryXP);
    const level      = calcLevel(state.totalXP);
    const rank       = calcRank(level);
    const aura       = getAura(powerLevel);
    return { stats, powerLevel, level, rank, aura };
  }, [state]);

  if (loading || !state || !d) return null;

  const total = Object.values(d.stats).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-[#080810] text-white px-4 pt-10 pb-4 max-w-lg mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="mb-8">
        <p className="text-[9px] font-mono tracking-[0.5em] text-[#3a3a5a] mb-1">HUNTER</p>
        <h1 className="text-2xl font-black tracking-[0.15em]">STATUS</h1>
      </div>

      {/* ── Identity card ── */}
      <div
        className="relative bg-[#0f0f1a] border rounded-xl p-5 mb-6 overflow-hidden"
        style={{ borderColor: `${d.aura.primary}40` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 80% 20%, ${d.aura.primary}10 0%, transparent 60%)` }}
        />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <div className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-1">NAME</div>
            <div className="text-2xl font-black tracking-widest">{state.username.toUpperCase()}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-1">CLASS</div>
            <div
              className="text-lg font-black tracking-widest"
              style={{ color: d.aura.primary, textShadow: `0 0 10px ${d.aura.primary}` }}
            >
              {d.aura.label}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#1e1e3a] relative z-10">
          {[
            { label: 'RANK',  value: d.rank,  color: '#fbbf24' },
            { label: 'LV',    value: d.level, color: d.aura.primary },
            { label: 'POWER', value: d.powerLevel.toLocaleString(), color: d.aura.primary },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center">
              <div className="text-[9px] font-mono text-[#3a3a5a] tracking-widest mb-0.5">{label}</div>
              <div className="text-lg font-black tabular-nums" style={{ color, textShadow: `0 0 8px ${color}` }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-5">
          <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a]">COMBAT STATS</p>
          <p className="text-[9px] font-mono text-[#3a3a5a]">TOTAL <span style={{ color: d.aura.primary }}>{total}</span></p>
        </div>

        <div className="space-y-5">
          {STATS.map(({ key, label, full, color, desc }, idx) => {
            const val = d.stats[key];
            const pct = val; // val is already 0-99
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-black font-mono w-10"
                      style={{ color, textShadow: `0 0 6px ${color}` }}
                    >
                      {label}
                    </span>
                    <span className="text-[9px] font-mono text-[#3a3a5a] tracking-wider">{full}</span>
                  </div>
                  <span
                    className="text-lg font-black tabular-nums font-mono"
                    style={{ color, textShadow: `0 0 8px ${color}` }}
                  >
                    {val}
                  </span>
                </div>
                <div className="h-1.5 bg-[#1e1e3a] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width:      `${pct}%`,
                      background: color,
                      boxShadow:  `0 0 6px ${color}`,
                      animation:  `statFill 1.${idx}s ease-out forwards`,
                      '--stat-w': `${pct}%`,
                    } as React.CSSProperties}
                  />
                </div>
                <p className="text-[8px] font-mono text-[#2a2a4a] mt-0.5">{desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Streak info ── */}
      <div
        className={`bg-[#0f0f1a] border rounded-xl p-4 ${
          state.streakState === 'cracked' ? 'border-[#f97316]/40' : 'border-[#1e1e3a]'
        }`}
      >
        <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-3">STREAK STATUS</p>
        <div className="flex items-center gap-4">
          <div
            className={`text-4xl font-black tabular-nums ${state.streakState === 'cracked' ? 'glitch' : ''}`}
            data-text={state.streak}
            style={{
              color:      state.streakState === 'cracked' ? '#f97316' : d.aura.primary,
              textShadow: state.streakState === 'cracked' ? '0 0 12px #f97316' : `0 0 12px ${d.aura.primary}`,
            }}
          >
            {state.streak}
          </div>
          <div>
            <p className="text-sm font-bold font-mono tracking-wider">
              {state.streakState === 'cracked' ? (
                <span className="text-[#f97316]">STREAK CRACKED</span>
              ) : (
                <span style={{ color: d.aura.primary }}>STREAK ACTIVE</span>
              )}
            </p>
            <p className="text-[9px] font-mono text-[#3a3a5a] mt-0.5">
              {state.streakState === 'cracked'
                ? 'Check in today to heal your streak'
                : state.streak === 0
                  ? 'Start your streak today'
                  : `${state.streak} days without breaking`}
            </p>
          </div>
        </div>
        {state.streakState === 'cracked' && (
          <div className="mt-3 pt-3 border-t border-[#1e1e3a]">
            <p className="text-[9px] font-mono text-[#f97316] opacity-75 tracking-wider">
              ⚠ MISS ONE MORE DAY AND STREAK RESETS
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
