'use client';
import { useMemo } from 'react';
import { useGameData } from '@/hooks/useGameData';
import { calcPowerLevel, calcLevel, calcRank, xpProgress, RANK_COLOR, RADAR_MAX } from '@/utils/xp';
import XPBar from '@/components/XPBar';
import RadarChart from '@/components/charts/RadarChart';
import PowerLevelChart from '@/components/charts/PowerLevelChart';

export default function DashboardPage() {
  const { state, loading } = useGameData();

  const d = useMemo(() => {
    if (!state) return null;
    const powerLevel = calcPowerLevel(state.categoryXP);
    const level      = calcLevel(state.totalXP);
    const rank       = calcRank(level);
    const xp         = xpProgress(state.totalXP);
    const rColor     = RANK_COLOR[rank];
    return { powerLevel, level, rank, xp, rColor };
  }, [state]);

  if (loading || !state || !d) return null;

  const radar = {
    workout: Math.min((state.categoryXP.workout / RADAR_MAX.workout) * 100, 100),
    money:   Math.min((state.categoryXP.money   / RADAR_MAX.money)   * 100, 100),
    habits:  Math.min((state.categoryXP.habits  / RADAR_MAX.habits)  * 100, 100),
    mind:    Math.min((state.categoryXP.mind    / RADAR_MAX.mind)    * 100, 100),
  };

  return (
    <div className="min-h-screen bg-[#080810] text-white px-4 pt-10 pb-4 max-w-lg mx-auto animate-fade-in">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-0.5">HUNTER</p>
          <h1 className="text-xl font-bold tracking-[0.15em]">{state.username}</h1>
        </div>
        <div className="text-right">
          <div
            className="text-3xl font-black tracking-widest leading-none"
            style={{ color: d.rColor, textShadow: `0 0 16px ${d.rColor}` }}
          >
            {d.rank}
          </div>
          <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mt-0.5">RANK</p>
        </div>
      </div>

      {/* ── Power Level ── */}
      <div className="text-center mb-8">
        <p className="text-[9px] font-mono tracking-[0.6em] text-[#3a3a5a] mb-3">POWER LEVEL</p>
        <div
          className="text-[72px] leading-none font-black tabular-nums text-[#00d4ff] animate-glow-pulse"
          style={{ textShadow: '0 0 40px #00d4ff, 0 0 80px #3d6aff' }}
        >
          {d.powerLevel.toLocaleString()}
        </div>
        <p className="text-[10px] font-mono tracking-[0.4em] text-[#3a3a5a] mt-2">
          LEVEL {d.level}
        </p>
      </div>

      {/* ── XP Bar ── */}
      <div className="mb-6">
        <XPBar percent={d.xp.percent} current={d.xp.current} needed={d.xp.needed} />
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        {[
          { label: 'TOTAL XP',  value: state.totalXP },
          { label: 'STREAK',    value: state.streak },
          { label: 'LEVEL',     value: d.level },
        ].map(({ label, value }) => (
          <div key={label} className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-3 text-center">
            <div className="text-xl font-black text-[#00d4ff] tabular-nums leading-tight">{value}</div>
            <div className="text-[8px] font-mono tracking-[0.25em] text-[#3a3a5a] mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* ── Radar ── */}
      <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-4 mb-4">
        <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-4">STAT DISTRIBUTION</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <RadarChart {...radar} />
          </div>
          <div className="flex-1 space-y-2.5">
            {[
              { label: 'WORKOUT', val: state.categoryXP.workout, color: '#ef4444' },
              { label: 'MONEY',   val: state.categoryXP.money,   color: '#fbbf24' },
              { label: 'HABITS',  val: state.categoryXP.habits,  color: '#22c55e' },
              { label: 'MIND',    val: state.categoryXP.mind,    color: '#8b5cf6' },
            ].map(({ label, val, color }) => (
              <div key={label}>
                <div className="flex justify-between text-[9px] font-mono mb-1">
                  <span style={{ color }}>{label}</span>
                  <span className="text-[#3a3a5a]">{val} XP</span>
                </div>
                <div className="h-0.5 bg-[#1e1e3a] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{
                      width: `${Math.min((val / RADAR_MAX[label.toLowerCase() as keyof typeof RADAR_MAX]) * 100, 100)}%`,
                      background: color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Power History ── */}
      <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-4">
        <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-3">POWER HISTORY</p>
        <PowerLevelChart history={state.powerHistory} />
      </div>

    </div>
  );
}
