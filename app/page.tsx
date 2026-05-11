'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { useGameData } from '@/hooks/useGameData';
import { calcPowerLevel, calcLevel, calcRank, xpProgress, RANK_COLOR, RADAR_MAX, getAura } from '@/utils/xp';
import XPBar from '@/components/XPBar';
import RadarChart from '@/components/charts/RadarChart';
import PowerLevelChart from '@/components/charts/PowerLevelChart';
import AnimatedNumber from '@/components/AnimatedNumber';
import AuraEffect from '@/components/AuraEffect';

export default function DashboardPage() {
  const { state, loading } = useGameData();

  const d = useMemo(() => {
    if (!state) return null;
    const powerLevel = calcPowerLevel(state.categoryXP);
    const level      = calcLevel(state.totalXP);
    const rank       = calcRank(level);
    const xp         = xpProgress(state.totalXP);
    const rColor     = RANK_COLOR[rank];
    const aura       = getAura(powerLevel);
    return { powerLevel, level, rank, xp, rColor, aura };
  }, [state]);

  if (loading || !state || !d) return null;

  const radar = {
    workout: Math.min((state.categoryXP.workout / RADAR_MAX.workout) * 100, 100),
    money:   Math.min((state.categoryXP.money   / RADAR_MAX.money)   * 100, 100),
    habits:  Math.min((state.categoryXP.habits  / RADAR_MAX.habits)  * 100, 100),
    mind:    Math.min((state.categoryXP.mind    / RADAR_MAX.mind)    * 100, 100),
  };

  const isCracked = state.streakState === 'cracked';

  return (
    <div
      className="min-h-screen bg-[#080810] text-white px-4 pt-10 pb-4 max-w-lg mx-auto animate-fade-in"
      style={{
        '--aura-primary':   d.aura.primary,
        '--aura-secondary': d.aura.secondary,
      } as React.CSSProperties}
    >
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
      <div className="relative text-center mb-8 py-4 overflow-hidden rounded-xl">
        <AuraEffect aura={d.aura} />
        <p className="text-[9px] font-mono tracking-[0.6em] text-[#3a3a5a] mb-3 relative z-10">
          POWER LEVEL
        </p>
        <AnimatedNumber
          value={d.powerLevel}
          duration={700}
          className="text-[72px] leading-none font-black tabular-nums animate-glow-pulse relative z-10"
          style={{ color: d.aura.primary, textShadow: d.aura.glow }}
        />
        <div className="flex items-center justify-center gap-3 mt-2 relative z-10">
          <p className="text-[10px] font-mono tracking-[0.4em] text-[#3a3a5a]">
            LEVEL {d.level}
          </p>
          {d.aura.stage > 0 && (
            <span
              className="text-[8px] font-mono tracking-widest px-2 py-0.5 rounded border"
              style={{
                color:        d.aura.primary,
                borderColor:  `${d.aura.primary}40`,
                background:   `${d.aura.primary}12`,
                textShadow:   `0 0 6px ${d.aura.primary}`,
              }}
            >
              {d.aura.label}
            </span>
          )}
        </div>
      </div>

      {/* ── XP Bar ── */}
      <div className="mb-6">
        <XPBar percent={d.xp.percent} current={d.xp.current} needed={d.xp.needed} />
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-3 text-center">
          <div className="text-xl font-black tabular-nums leading-tight" style={{ color: d.aura.primary }}>
            {state.totalXP}
          </div>
          <div className="text-[8px] font-mono tracking-[0.25em] text-[#3a3a5a] mt-0.5">TOTAL XP</div>
        </div>

        {/* Streak card — cracked variant */}
        <div
          className={`bg-[#0f0f1a] border rounded-xl p-3 text-center relative overflow-hidden ${
            isCracked ? 'border-[#f97316]/40' : 'border-[#1e1e3a]'
          }`}
        >
          {isCracked && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.06) 0%, transparent 70%)' }}
            />
          )}
          <div
            className={`text-xl font-black tabular-nums leading-tight relative ${isCracked ? 'glitch' : ''}`}
            data-text={state.streak}
            style={{ color: isCracked ? '#f97316' : d.aura.primary, textShadow: isCracked ? '0 0 10px #f97316' : undefined }}
          >
            {state.streak}
          </div>
          <div className="text-[8px] font-mono tracking-[0.25em] mt-0.5 relative" style={{ color: isCracked ? '#f9731680' : '#3a3a5a' }}>
            {isCracked ? '⚠ CRACKED' : 'STREAK'}
          </div>
        </div>

        <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-3 text-center">
          <div className="text-xl font-black tabular-nums leading-tight" style={{ color: d.aura.primary }}>
            {d.level}
          </div>
          <div className="text-[8px] font-mono tracking-[0.25em] text-[#3a3a5a] mt-0.5">LEVEL</div>
        </div>
      </div>

      {/* ── Radar ── */}
      <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-4 mb-4">
        <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-4">STAT DISTRIBUTION</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex-shrink-0">
            <RadarChart {...radar} />
          </div>
          <div className="flex-1 space-y-2.5">
            {([
              { label: 'WORKOUT', val: state.categoryXP.workout, max: RADAR_MAX.workout, color: '#ef4444' },
              { label: 'MONEY',   val: state.categoryXP.money,   max: RADAR_MAX.money,   color: '#fbbf24' },
              { label: 'HABITS',  val: state.categoryXP.habits,  max: RADAR_MAX.habits,  color: '#22c55e' },
              { label: 'MIND',    val: state.categoryXP.mind,    max: RADAR_MAX.mind,    color: '#8b5cf6' },
            ] as const).map(({ label, val, max, color }) => (
              <div key={label}>
                <div className="flex justify-between text-[9px] font-mono mb-1">
                  <span style={{ color }}>{label}</span>
                  <span className="text-[#3a3a5a]">{val} XP</span>
                </div>
                <div className="h-0.5 bg-[#1e1e3a] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{ width: `${Math.min((val / max) * 100, 100)}%`, background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Power History ── */}
      <div className="bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-4 mb-4">
        <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-3">POWER HISTORY</p>
        <PowerLevelChart history={state.powerHistory} />
      </div>

      {/* ── Weekly Report link ── */}
      {state.weeklyReport && (
        <Link
          href="/report"
          className="flex items-center justify-between w-full bg-[#0f0f1a] border border-[#1e1e3a] rounded-xl p-4 active:bg-[#131325] transition-colors"
        >
          <div>
            <p className="text-[9px] font-mono tracking-[0.4em] text-[#3a3a5a] mb-1">WEEKLY REPORT</p>
            <p className="text-sm font-bold tracking-widest text-white">
              OVERALL: <span style={{ color: '#8b5cf6', textShadow: '0 0 8px #8b5cf6' }}>
                {state.weeklyReport.grades.overall}
              </span>
            </p>
          </div>
          <span className="text-[#3a3a5a] text-lg">›</span>
        </Link>
      )}
    </div>
  );
}
