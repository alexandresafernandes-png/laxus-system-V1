import type { PowerPoint } from '@/types';

const W = 300;
const H = 90;
const PAD = { t: 8, r: 8, b: 20, l: 32 };
const IW = W - PAD.l - PAD.r;
const IH = H - PAD.t - PAD.b;

export default function PowerLevelChart({ history }: { history: PowerPoint[] }) {
  if (history.length < 2) {
    return (
      <div className="flex items-center justify-center h-[90px] text-[#2a2a4a] text-[10px] font-mono tracking-widest">
        NOT ENOUGH DATA YET
      </div>
    );
  }

  const maxV = Math.max(...history.map(h => h.powerLevel));
  const minV = Math.min(...history.map(h => h.powerLevel));
  const range = maxV - minV || 1;

  const pts = history.map((h, i) => ({
    x: PAD.l + (i / (history.length - 1)) * IW,
    y: PAD.t + IH - ((h.powerLevel - minV) / range) * IH,
  }));

  const line = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const area = `${line} L${pts[pts.length - 1].x},${PAD.t + IH} L${pts[0].x},${PAD.t + IH} Z`;

  const step = Math.max(1, Math.floor(history.length / 3));
  const xLabels = history
    .map((h, i) => ({ i, label: h.date.slice(5) }))
    .filter((_, i) => i % step === 0 || i === history.length - 1);

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#plGrad)" />
      <path d={line} fill="none" stroke="#00d4ff" strokeWidth="1.5"
        style={{ filter: 'drop-shadow(0 0 3px #00d4ff)' }} />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#00d4ff" />
      ))}
      {/* Y labels */}
      {[0, 0.5, 1].map(f => (
        <text key={f} x={PAD.l - 4} y={PAD.t + IH - f * IH}
          textAnchor="end" dominantBaseline="middle" fill="#3a3a5a" fontSize="7" fontFamily="monospace">
          {Math.round(minV + f * range)}
        </text>
      ))}
      {/* X labels */}
      {xLabels.map(({ i, label }) => (
        <text key={i} x={pts[i].x} y={H - 4}
          textAnchor="middle" fill="#3a3a5a" fontSize="7" fontFamily="monospace">
          {label}
        </text>
      ))}
    </svg>
  );
}
