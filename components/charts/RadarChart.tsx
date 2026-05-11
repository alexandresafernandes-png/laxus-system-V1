interface Props {
  workout: number; // 0-100
  money: number;
  habits: number;
  mind: number;
}

const SIZE = 180;
const CX = SIZE / 2;
const CY = SIZE / 2;
const R = 62;
const LEVELS = 4;

// top, right, bottom, left (angles in degrees, 0 = right, -90 = up)
const AXES = [
  { label: 'WORKOUT', angle: -90 },
  { label: 'MONEY',   angle: 0 },
  { label: 'HABITS',  angle: 90 },
  { label: 'MIND',    angle: 180 },
];

function pt(angle: number, radius: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function poly(radius: number) {
  return AXES.map(a => pt(a.angle, radius))
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`)
    .join(' ') + ' Z';
}

export default function RadarChart({ workout, money, habits, mind }: Props) {
  const values = [workout, money, habits, mind];

  const dataPts = values.map((v, i) => pt(AXES[i].angle, (Math.min(v, 100) / 100) * R));
  const dataPath = dataPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

  return (
    <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
      {/* Grid rings */}
      {Array.from({ length: LEVELS }, (_, l) => (
        <path key={l} d={poly((R / LEVELS) * (l + 1))} fill="none" stroke="#1e1e3a" strokeWidth="1" />
      ))}
      {/* Axes */}
      {AXES.map((a, i) => {
        const end = pt(a.angle, R);
        return <line key={i} x1={CX} y1={CY} x2={end.x} y2={end.y} stroke="#1e1e3a" strokeWidth="1" />;
      })}
      {/* Data fill */}
      <path d={dataPath} fill="rgba(0,212,255,0.12)" stroke="#00d4ff" strokeWidth="1.5"
        style={{ filter: 'drop-shadow(0 0 4px #00d4ff)' }} />
      {/* Data points */}
      {dataPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="#00d4ff"
          style={{ filter: 'drop-shadow(0 0 3px #00d4ff)' }} />
      ))}
      {/* Labels */}
      {AXES.map((a, i) => {
        const lp = pt(a.angle, R + 20);
        const anchor = i === 1 ? 'start' : i === 3 ? 'end' : 'middle';
        return (
          <text key={i} x={lp.x} y={lp.y} textAnchor={anchor} dominantBaseline="middle"
            fill="#3a3a5a" fontSize="8" fontFamily="monospace" letterSpacing="1">
            {a.label}
          </text>
        );
      })}
    </svg>
  );
}
