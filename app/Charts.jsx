// SVG-графики для дашборда: PBR line, three-min bars, GOU status.

// ============ PBR (24-hour multi-line chart) ============
function PBRChart({ pbr, height = 260 }) {
  const W = 900, H = height, PAD_L = 40, PAD_R = 20, PAD_T = 30, PAD_B = 30;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const yMin = 60, yMax = 220;
  const xOf = (h) => PAD_L + (h / 24) * plotW;
  const yOf = (v) => PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const buildLine = (values) => {
    let d = '';
    values.forEach((v, i) => {
      if (v == null) return;
      const h = pbr.hour[i];
      d += (d ? ' L' : 'M') + xOf(h) + ',' + yOf(v);
    });
    return d;
  };

  const gridY = [80, 100, 120, 140, 160, 180, 200];
  const gridX = [0, 3, 6, 9, 12, 15, 18, 21, 24];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="xMidYMid meet">
      {/* Y grid */}
      {gridY.map((v) => (
        <g key={v}>
          <line x1={PAD_L} y1={yOf(v)} x2={W - PAD_R} y2={yOf(v)} stroke="#EAEEF2" strokeWidth="1"/>
          <text x={PAD_L - 6} y={yOf(v) + 3} fontFamily="JetBrains Mono" fontSize="10" fill="#8A96A3" textAnchor="end">{v}</text>
        </g>
      ))}
      {/* X grid */}
      {gridX.map((h) => (
        <g key={h}>
          <line x1={xOf(h)} y1={PAD_T} x2={xOf(h)} y2={PAD_T + plotH} stroke="#F5F7FA" strokeWidth="1"/>
          <text x={xOf(h)} y={H - 10} fontFamily="JetBrains Mono" fontSize="10" fill="#8A96A3" textAnchor="middle">{String(h).padStart(2,'0')}:00</text>
        </g>
      ))}
      {/* baseline */}
      <line x1={PAD_L} y1={PAD_T + plotH} x2={W - PAD_R} y2={PAD_T + plotH} stroke="#455260" strokeWidth="1.2"/>

      {/* Limit lines (УДГКЭ / УДГ) */}
      <path d={buildLine(pbr.kztk)} fill="none" stroke="var(--line-kztk)"  strokeWidth="1.2" strokeDasharray="2 2" opacity=".7"/>
      <path d={buildLine(pbr.kzs)}  fill="none" stroke="var(--line-kzs)"   strokeWidth="1.2" strokeDasharray="2 2" opacity=".7"/>

      {/* Plan (ПБР) */}
      <path d={buildLine(pbr.plan)} fill="none" stroke="var(--line-plan)" strokeWidth="1.8" strokeDasharray="4 3"/>

      {/* Fact (bold) */}
      <path d={buildLine(pbr.fact)} fill="none" stroke="var(--line-fact)" strokeWidth="2.2"/>

      {/* «Сейчас» вертикаль (последняя точка факта) */}
      {(() => {
        const lastFactIdx = pbr.fact.map((v, i) => v == null ? -1 : i).filter(i => i >= 0).slice(-1)[0];
        if (lastFactIdx == null) return null;
        const h = pbr.hour[lastFactIdx];
        const x = xOf(h);
        return (
          <g>
            <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + plotH} stroke="#D8DEE5" strokeDasharray="3 3"/>
            <circle cx={x} cy={yOf(pbr.fact[lastFactIdx])} r="4" fill="var(--line-fact)"/>
            <text x={x + 6} y={PAD_T + 12} fontSize="10" fill="#455260" fontFamily="Inter">Сейчас</text>
          </g>
        );
      })()}
    </svg>
  );
}

// ============ THREE-MIN BAR CHART ============
function ThreeMinChart({ data, height = 140 }) {
  const W = 900, H = height, PAD_L = 40, PAD_R = 20, PAD_T = 10, PAD_B = 24;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const yMin = 125, yMax = 175;
  const yOf = (v) => PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const N = data.length;
  const barW = plotW / N * 0.7;
  const gap = plotW / N * 0.3;

  // границы допустимых значений
  const lo = 145, hi = 165;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="xMidYMid meet">
      {/* Зона допустимых значений */}
      <rect x={PAD_L} y={yOf(hi)} width={plotW} height={yOf(lo) - yOf(hi)} fill="#E7F3EA" opacity=".5"/>
      {/* Лимитные линии */}
      <line x1={PAD_L} y1={yOf(hi)} x2={W - PAD_R} y2={yOf(hi)} stroke="var(--danger)" strokeWidth="1" strokeDasharray="3 2"/>
      <line x1={PAD_L} y1={yOf(lo)} x2={W - PAD_R} y2={yOf(lo)} stroke="var(--danger)" strokeWidth="1" strokeDasharray="3 2"/>
      {/* Y labels */}
      {[130, 145, 155, 165, 175].map((v) => (
        <text key={v} x={PAD_L - 6} y={yOf(v) + 3} fontFamily="JetBrains Mono" fontSize="10" fill="#8A96A3" textAnchor="end">{v}</text>
      ))}
      {/* Bars */}
      {data.map((v, i) => {
        const x = PAD_L + i * (plotW / N) + gap / 2;
        const y = yOf(v);
        const barH = (PAD_T + plotH) - y;
        const outOfRange = v > hi || v < lo;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={barH}
            fill={outOfRange ? 'var(--danger)' : 'var(--ink-600)'}
            opacity={outOfRange ? 1 : .8}
          />
        );
      })}
      {/* X ticks (каждые 10 столбцов = 30 мин) */}
      {[0, 10, 20, 30, 40, 50, 60].map((i) => (
        <text key={i} x={PAD_L + i * (plotW / N)} y={H - 8} fontFamily="JetBrains Mono" fontSize="10" fill="#8A96A3" textAnchor="middle">
          {i * 3} мин
        </text>
      ))}
    </svg>
  );
}

// ============ GOU status chart ============
function GOUChart({ data, height = 140 }) {
  const W = 400, H = height, PAD_L = 30, PAD_R = 15, PAD_T = 10, PAD_B = 24;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;
  const N = data.length;
  const barW = plotW / N;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="xMidYMid meet">
      {data.map((d, i) => (
        <rect
          key={i}
          x={PAD_L + i * barW}
          y={PAD_T}
          width={barW - 0.4}
          height={plotH}
          fill={d.status === 'alarm' ? 'var(--danger)' : 'var(--success)'}
          opacity={d.status === 'alarm' ? 1 : .55}
        />
      ))}
      {/* Marker line current */}
      <line x1={PAD_L + (N - 1) * barW} y1={PAD_T - 2} x2={PAD_L + (N - 1) * barW} y2={PAD_T + plotH + 2} stroke="#1B2530" strokeWidth="1.5"/>
      {/* X ticks */}
      {[0, 15, 30, 45, 60].map((i) => (
        <text key={i} x={PAD_L + i * barW} y={H - 8} fontFamily="JetBrains Mono" fontSize="10" fill="#8A96A3" textAnchor="middle">
          {i}м
        </text>
      ))}
    </svg>
  );
}

// ============ KPI Sparkline ============
function Sparkline({ points, color = 'var(--info)', height = 24 }) {
  const W = 120, H = height;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = W / (points.length - 1);
  const d = points.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)},${(H - ((v - min) / range) * H).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ width: '100%', height, color, display: 'block' }}>
      <path d={d} fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

Object.assign(window, { PBRChart, ThreeMinChart, GOUChart, Sparkline });
