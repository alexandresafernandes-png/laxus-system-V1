'use client';
import { useMemo } from 'react';
import Link from 'next/link';
import { useGameData } from '@/hooks/useGameData';
import { getAura, calcPowerLevel, GRADE_COLOR, generateWeeklyReport } from '@/utils/xp';
import type { Grade } from '@/types';

const GRADE_LABELS: Record<Grade, string> = {
  S: 'EXCEPTIONAL',
  A: 'EXCELLENT',
  B: 'SOLID',
  C: 'AVERAGE',
  D: 'WEAK',
  F: 'FAILED',
};

type ReportKey = 'physical' | 'discipline' | 'focus' | 'consistency';
const REPORT_ROWS: { key: ReportKey; label: string }[] = [
  { key: 'physical',    label: 'PHYSICAL'    },
  { key: 'discipline',  label: 'DISCIPLINE'  },
  { key: 'focus',       label: 'FOCUS'       },
  { key: 'consistency', label: 'CONSISTENCY' },
];

export default function ReportPage() {
  const { state, loading } = useGameData();

  const d = useMemo(() => {
    if (!state) return null;
    const powerLevel = calcPowerLevel(state.categoryXP);
    const aura       = getAura(powerLevel);

    const report = state.weeklyReport
      ?? generateWeeklyReport(state.dailyLog, state.todayDate);

    return { aura, report };
  }, [state]);

  if (loading || !state || !d) return null;

  const { report, aura } = d;
  const overall = report.grades.overall;
  const overallColor = GRADE_COLOR[overall];

  return (
    <div
      className="min-h-screen text-white px-4 pt-10 pb-4 max-w-lg mx-auto animate-fade-in"
      style={{ background: 'var(--bg)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[9px] font-mono tracking-[0.5em] mb-1" style={{ color: 'var(--muted)' }}>WEEKLY</p>
          <h1 className="text-2xl font-black tracking-[0.15em]">HUNTER REPORT</h1>
        </div>
        <Link
          href="/"
          className="font-mono text-xs tracking-widest active:text-[#00d4ff] transition-colors"
          style={{ color: 'var(--muted)' }}
        >
          ← BACK
        </Link>
      </div>

      {/* ── Overall grade card ── */}
      <div
        className="relative border rounded-xl p-6 mb-5 overflow-hidden text-center"
        style={{ background: 'var(--surface)', borderColor: `${overallColor}50` }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 50% 50%, ${overallColor}0f 0%, transparent 65%)` }}
        />
        <p className="text-[9px] font-mono tracking-[0.5em] mb-3 relative z-10" style={{ color: 'var(--muted)' }}>
          OVERALL RANK
        </p>
        <div
          className="text-8xl font-black relative z-10 leading-none"
          style={{
            color:      overallColor,
            textShadow: `0 0 30px ${overallColor}, 0 0 60px ${overallColor}80`,
          }}
        >
          {overall}
        </div>
        <p
          className="text-xs font-mono tracking-widest mt-3 relative z-10"
          style={{ color: overallColor }}
        >
          {GRADE_LABELS[overall]}
        </p>
        <p className="text-[9px] font-mono mt-1 relative z-10" style={{ color: 'var(--muted)' }}>
          WEEK OF {report.weekEnd}
        </p>
      </div>

      {/* ── Category grades ── */}
      <div
        className="border rounded-xl overflow-hidden mb-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-[9px] font-mono tracking-[0.4em]" style={{ color: 'var(--muted)' }}>BREAKDOWN</p>
        </div>
        {REPORT_ROWS.map(({ key, label }, idx) => {
          const grade = report.grades[key] as Grade;
          const color = GRADE_COLOR[grade];
          return (
            <div
              key={key}
              className="flex items-center justify-between px-4 py-4 border-b last:border-0"
              style={{ borderColor: 'var(--border)', animationDelay: `${idx * 0.08}s` }}
            >
              <div>
                <p className="text-xs font-mono font-bold tracking-widest text-white">{label}</p>
                <p className="text-[9px] font-mono mt-0.5" style={{ color: 'var(--muted)' }}>{GRADE_LABELS[grade]}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-20 h-1 rounded overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded transition-all duration-700"
                    style={{
                      width:      `${{ S: 100, A: 85, B: 70, C: 55, D: 35, F: 10 }[grade]}%`,
                      background: color,
                      boxShadow:  `0 0 4px ${color}`,
                    }}
                  />
                </div>
                <span
                  className="text-2xl font-black font-mono w-8 text-center"
                  style={{ color, textShadow: `0 0 10px ${color}` }}
                >
                  {grade}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Motivational footer ── */}
      <div className="text-center py-4">
        {overall === 'S' || overall === 'A' ? (
          <p className="text-xs font-mono tracking-widest" style={{ color: aura.primary }}>
            EXCEPTIONAL PERFORMANCE. KEEP ASCENDING.
          </p>
        ) : overall === 'B' ? (
          <p className="text-xs font-mono tracking-widest" style={{ color: 'var(--muted)' }}>
            SOLID WEEK. PUSH HARDER NEXT TIME.
          </p>
        ) : overall === 'F' ? (
          <p className="text-xs font-mono tracking-widest text-[#6b7280]">
            THE WEAK ARE CULLED. RISE. NOW.
          </p>
        ) : (
          <p className="text-xs font-mono tracking-widest" style={{ color: 'var(--muted)' }}>
            MORE CONSISTENCY UNLOCKS HIGHER RANKS.
          </p>
        )}
      </div>
    </div>
  );
}
