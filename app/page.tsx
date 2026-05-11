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
import SyncBadge from '@/components/SyncBadge';

export default function DashboardPage() {
  const { state, loading, syncStatus, logout } = useGameData();

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
      className="min-h-screen text-white px-4 pt-10 pb-4 max-w-lg mx-auto animate-fade-in"
      style={{
        background: 'var(--bg)',
        '--aura-primary':   d.aura.primary,
        '--aura-secondary': d.aura.secondary,
      } as React.CSSProperties}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[9px] font-mono tracking-[0.4em] mb-0.5" style={{ color: 'var(--muted)' }}>HUNTER</p>
          <h1 className="text-xl font-bold tracking-[0.15em]">{state.username}</h1>
          <div className="mt-1"><SyncBadge status={syncStatus} /></div>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div>
            <div
              className="text-3xl font-black tracking-widest leading-none"
              style={{ color: d.rColor, textShadow: `0 0 16px ${d.rColor}` }}
            >
              {d.rank}
            </div>
            <p className="text-[9px] font-mono tracking-[0.4em] mt-0.5" style={{ color: 'var(--muted)' }}>RANK</p>
          </div>
          <button
            onClick={logout}
            className="text-[8px] font-mono tracking-widest active:opacity-60 transition-opacity"
            style={{ color: 'var(--dim)' }}
          >
            LOGOUT
          </button>
        </div>
      </div>

      {/* ── Power Level ── */}
      <div className="relative text-center mb-8 py-4 overflow-hidden rounded-xl">
        <AuraEffect aura={d.aura} />
        <p className="text-[9px] font-mono tracking-[0.6em] mb-3 relative z-10" style={{ color: 'var(--muted)' }}>
          POWER LEVEL
        </p>
        <AnimatedNumber
          value={d.powerLevel}
          duration={700}
          className="text-[72px] leading-none font-black tabular-nums animate-glow-pulse relative z-10"
          style={{ color: d.aura.primary, textShadow: d.aura.glow }}
        />
        <div className="flex items-center justify-center gap-3 mt-2 relative z-10">
          <p className="text-[10px] font-mono tracking-[0.4em]" style={{ color: 'var(--muted)' }}>
            LEVEL {d.level}
          </p>
          {d.aura.stage > 0 && (
            <span
              className="text-[8px] font-mono tracking-widest px-2 py-0.5 rounded border"
              style={{
                color:       d.aura.primary,
                borderColor: `${d.aura.primary}40`,
                background:  `${d.aura.primary}12`,
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
        <div className="rounded-xl p-3 text-center border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-xl font-black tabular-nums leading-tight" style={{ color: d.aura.primary }}>
            {state.totalXP}
          </div>
          <div className="text-[8px] font-mono tracking-[0.25em] mt-0.5" style={{ color: 'var(--muted)' }}>TOTAL XP</div>
        </div>

        {/* Streak card */}
        <div
          className="rounded-xl p-3 text-center relative overflow-hidden border"
          style={{
            background:  'var(--surface)',
            borderColor: isCracked ? 'rgba(249,115,22,0.45)' : 'var(--border)',
          }}
        >
          {isCracked && (
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, rgba(249,115,22,0.07) 0%, transparent 70%)' }} />
          )}
          <div
            className={`text-xl font-black tabular-nums leading-tight relative ${isCracked ? 'glitch' : ''}`}
            data-text={state.streak}
            style={{ color: isCracked ? '#f97316' : d.aura.primary }}
          >
            {state.streak}
          </div>
          <div className="text-[8px] font-mono tracking-[0.2em] mt-0.5 relative"
            style={{ color: isCracked ? 'rgba(249,115,22,0.7)' : 'var(--muted)' }}>
            {isCracked ? '⚠ CRACKED' : 'STREAK'}
          </div>
        </div>

        <div className="rounded-xl p-3 text-center border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <div className="text-xl font-black tabular-nums leading-tight" style={{ color: d.aura.primary }}>
            {d.level}
          </div>
          <div className="text-[8px] font-mono tracking-[0.25em] mt-0.5" style={{ color: 'var(--muted)' }}>LEVEL</div>
        </div>
      </div>

      {/* ── Radar ── */}
      <div className="rounded-xl p-4 mb-4 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-[9px] font-mono tracking-[0.4em] mb-4" style={{ color: 'var(--muted)' }}>STAT DISTRIBUTION</p>
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
                  <span style={{ color: 'var(--muted)' }}>{val} XP</span>
                </div>
                <div className="h-0.5 rounded overflow-hidden" style={{ background: 'var(--border)' }}>
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
      <div className="rounded-xl p-4 mb-4 border" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-[9px] font-mono tracking-[0.4em] mb-3" style={{ color: 'var(--muted)' }}>POWER HISTORY</p>
        <PowerLevelChart history={state.powerHistory} />
      </div>

      {/* ── Weekly Report link ── */}
      {state.weeklyReport && (
        <Link
          href="/report"
          className="flex items-center justify-between w-full rounded-xl p-4 border transition-colors"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <div>
            <p className="text-[9px] font-mono tracking-[0.4em] mb-1" style={{ color: 'var(--muted)' }}>WEEKLY REPORT</p>
            <p className="text-sm font-bold tracking-widest">
              OVERALL:{' '}
              <span style={{ color: '#8b5cf6', textShadow: '0 0 8px #8b5cf6' }}>
                {state.weeklyReport.grades.overall}
              </span>
            </p>
          </div>
          <span className="text-lg" style={{ color: 'var(--muted)' }}>›</span>
        </Link>
      )}
    </div>
  );
}
