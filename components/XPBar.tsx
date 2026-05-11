'use client';

interface Props {
  percent: number;
  current: number;
  needed: number;
}

export default function XPBar({ percent, current, needed }: Props) {
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] font-mono tracking-widest text-[#3a3a5a] mb-1.5">
        <span>XP TO NEXT LEVEL</span>
        <span className="text-[#00d4ff]">{current} / {needed}</span>
      </div>
      <div className="h-1 bg-[#1e1e3a] rounded-full overflow-hidden">
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
