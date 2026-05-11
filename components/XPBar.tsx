'use client';

interface Props {
  percent: number;
  current: number;
  needed: number;
}

export default function XPBar({ percent, current, needed }: Props) {
  return (
    <div className="w-full">
      <div
        className="flex justify-between text-[10px] font-mono tracking-widest mb-1.5"
        style={{ color: 'var(--muted)' }}
      >
        <span>XP TO NEXT LEVEL</span>
        <span className="text-[#00d4ff]">{current} / {needed}</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
        <div
          className="h-full bg-[#00d4ff] rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${percent}%`,
            boxShadow: percent > 0 ? '0 0 8px #00d4ff, 0 0 16px #3d6aff' : 'none',
          }}
        />
      </div>
    </div>
  );
}
