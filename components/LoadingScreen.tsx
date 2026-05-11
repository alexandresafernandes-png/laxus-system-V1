'use client';
import { useEffect, useState } from 'react';

const STEPS = [
  'INITIALIZING HUNTER SYSTEM...',
  'SYNCHRONIZING HUNTER STATUS...',
  'LOADING DAILY QUEST DATA...',
  'CALIBRATING POWER METRICS...',
  'SYSTEM READY.',
];

export default function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep(prev => {
        const next = prev + 1;
        if (next >= STEPS.length) {
          clearInterval(timer);
          setTimeout(() => {
            setFading(true);
            setTimeout(onComplete, 500);
          }, 300);
          return prev;
        }
        return next;
      });
    }, 260);
    return () => clearInterval(timer);
  }, [onComplete]);

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500 ${
        fading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{ backgroundColor: 'var(--bg)' }}
    >
      {/* Logo */}
      <div className="text-center mb-14">
        <div
          className="text-5xl font-black tracking-[0.35em] text-[#00d4ff]"
          style={{ textShadow: '0 0 30px #00d4ff, 0 0 60px #3d6aff' }}
        >
          LAXUS
        </div>
        <div className="text-[10px] tracking-[0.9em] text-[#3d6aff] mt-1 font-mono">
          SYSTEM
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-52 mb-5">
        <div className="h-px w-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
          <div
            className="h-full bg-[#00d4ff] transition-all duration-300 ease-out"
            style={{ width: `${progress}%`, boxShadow: '0 0 6px #00d4ff' }}
          />
        </div>
      </div>

      {/* Status line */}
      <p className="font-mono text-[11px] tracking-widest text-[#00d4ff] opacity-70 min-h-[18px]">
        {STEPS[step]}
      </p>
    </div>
  );
}
