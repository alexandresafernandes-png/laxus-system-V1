'use client';
import type { AuraConfig } from '@/utils/xp';

const PARTICLES = [
  { left: '20%',  size: 3, dur: '3.2s', delay: '0s',    drift: '-8px',  opacity: 0.6 },
  { left: '40%',  size: 2, dur: '4.1s', delay: '1.1s',  drift: '6px',   opacity: 0.5 },
  { left: '60%',  size: 3, dur: '3.7s', delay: '0.5s',  drift: '-5px',  opacity: 0.6 },
  { left: '75%',  size: 2, dur: '4.5s', delay: '2.0s',  drift: '9px',   opacity: 0.4 },
  { left: '50%',  size: 2, dur: '3.4s', delay: '1.6s',  drift: '-7px',  opacity: 0.5 },
];

interface Props {
  aura: AuraConfig;
}

export default function AuraEffect({ aura }: Props) {
  if (aura.stage === 0) return null;

  const opacity = [0, 0.55, 0.8, 1][aura.stage];

  return (
    <>
      {/* Radial glow behind power level */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          background: `radial-gradient(ellipse at 50% 60%, ${aura.primary}${Math.round(opacity * 22).toString(16).padStart(2,'0')} 0%, transparent 70%)`,
        }}
      />
      {/* Particles */}
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="aura-particle"
          style={{
            left: p.left,
            bottom: '12%',
            width:  p.size,
            height: p.size,
            background: aura.primary,
            boxShadow: `0 0 ${p.size * 2}px ${aura.primary}`,
            '--p-opacity': (p.opacity * opacity).toString(),
            '--p-dur':     p.dur,
            '--p-delay':   p.delay,
            '--p-drift':   p.drift,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
