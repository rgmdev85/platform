// «График» — универсальный настраиваемый виджет.
// Строится по образцу PBR-графика Блока, но с настраиваемыми линиями (цвет+стиль),
// KPI-индикаторами (температура/давление) и панелью отклонений.

const { useState: uSCh } = React;

// Стили линий
const LINE_STYLES = {
  solid:   { dasharray: '',      width: 2.2 },
  dashed:  { dasharray: '4 3',   width: 1.8 },
  dotted:  { dasharray: '2 2',   width: 1.5 },
  dashdot: { dasharray: '6 3 2 3', width: 1.6 },
};

// Палитра линий (для выбора цвета в форме)
const LINE_COLORS = [
  '#C0392B', // красный — факт
  '#1F6FEB', // синий
  '#2E8540', // зелёный
  '#B26A00', // охра
  '#6F42C1', // фиолет
  '#17828A', // teal
  '#8A96A3', // серый — план
  '#0F1720', // почти чёрный
];

// ============ CustomChart — SVG multi-line ============
function CustomChart({ chart, visibleMap, height = 300 }) {
  const W = 900, H = height, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 40;
  const plotW = W - PAD_L - PAD_R;
  const plotH = H - PAD_T - PAD_B;

  const yMin = chart.yAxis?.min ?? 0;
  const yMax = chart.yAxis?.max ?? 100;
  const xMin = chart.xAxis?.min ?? 0;
  const xMax = chart.xAxis?.max ?? 24;

  const xOf = (x) => PAD_L + (x - xMin) / (xMax - xMin) * plotW;
  const yOf = (v) => PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;

  const buildLine = (values) => {
    let d = '';
    const hours = mockProdChart.hour;
    values.forEach((v, i) => {
      if (v == null) return;
      d += (d ? ' L' : 'M') + xOf(hours[i]).toFixed(1) + ',' + yOf(v).toFixed(1);
    });
    return d;
  };

  // Y-gridlines: 5 линий
  const yStep = (yMax - yMin) / 5;
  const yGrid = Array.from({ length: 6 }, (_, i) => yMin + yStep * i);
  const xStep = (xMax - xMin) / 8;
  const xGrid = Array.from({ length: 9 }, (_, i) => xMin + xStep * i);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height, display: 'block' }} preserveAspectRatio="xMidYMid meet">
      {/* Y grid */}
      {yGrid.map((v, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={yOf(v)} x2={W - PAD_R} y2={yOf(v)} stroke="#EAEEF2" strokeWidth="1"/>
          <text x={PAD_L - 8} y={yOf(v) + 3} fontFamily="JetBrains Mono" fontSize="10" fill="#8A96A3" textAnchor="end">
            {v.toFixed(v >= 100 ? 0 : 1)}
          </text>
        </g>
      ))}
      {/* X grid */}
      {xGrid.map((h, i) => (
        <g key={i}>
          <line x1={xOf(h)} y1={PAD_T} x2={xOf(h)} y2={PAD_T + plotH} stroke="#F5F7FA" strokeWidth="1"/>
          <text x={xOf(h)} y={H - 18} fontFamily="JetBrains Mono" fontSize="10" fill="#8A96A3" textAnchor="middle">
            {chart.xAxis?.unit === 'ч' ? `${String(Math.round(h)).padStart(2, '0')}:00` : h.toFixed(1)}
          </text>
        </g>
      ))}
      {/* Baseline */}
      <line x1={PAD_L} y1={PAD_T + plotH} x2={W - PAD_R} y2={PAD_T + plotH} stroke="#455260" strokeWidth="1.2"/>

      {/* Axis labels */}
      <text x={PAD_L - 40} y={PAD_T + plotH / 2} fontFamily="Inter" fontSize="11" fill="#5F6D7C" textAnchor="middle"
            transform={`rotate(-90 ${PAD_L - 40} ${PAD_T + plotH / 2})`}>
        {chart.yAxis?.label}{chart.yAxis?.unit ? `, ${chart.yAxis.unit}` : ''}
      </text>
      <text x={PAD_L + plotW / 2} y={H - 4} fontFamily="Inter" fontSize="11" fill="#5F6D7C" textAnchor="middle">
        {chart.xAxis?.label}{chart.xAxis?.unit ? `, ${chart.xAxis.unit}` : ''}
      </text>

      {/* Lines */}
      {chart.lines.map((ln) => {
        if (visibleMap && visibleMap[ln.id] === false) return null;
        const style = LINE_STYLES[ln.style] || LINE_STYLES.solid;
        const values = mockProdChart[ln.dataKey] || [];
        return (
          <path
            key={ln.id}
            d={buildLine(values)}
            fill="none"
            stroke={ln.color}
            strokeWidth={style.width}
            strokeDasharray={style.dasharray}
          />
        );
      })}

      {/* "Сейчас" вертикаль по последней fact-точке */}
      {(() => {
        const factLine = chart.lines.find(l => l.dataKey === 'fact');
        if (!factLine || visibleMap && visibleMap[factLine.id] === false) return null;
        const values = mockProdChart[factLine.dataKey];
        const lastIdx = values.map((v, i) => v == null ? -1 : i).filter(i => i >= 0).slice(-1)[0];
        if (lastIdx == null) return null;
        const h = mockProdChart.hour[lastIdx];
        const x = xOf(h);
        return (
          <g>
            <line x1={x} y1={PAD_T} x2={x} y2={PAD_T + plotH} stroke="#D8DEE5" strokeDasharray="3 3"/>
            <circle cx={x} cy={yOf(values[lastIdx])} r="4" fill={factLine.color}/>
            <text x={x + 6} y={PAD_T + 12} fontSize="10" fill="#455260" fontFamily="Inter">Сейчас</text>
          </g>
        );
      })()}
    </svg>
  );
}

// ============ Легенда с toggle visibility ============
function ChartLegend({ lines, visibleMap, onToggle }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {lines.map(ln => {
        const active = visibleMap[ln.id] !== false;
        const style = LINE_STYLES[ln.style] || LINE_STYLES.solid;
        return (
          <button
            key={ln.id}
            onClick={() => onToggle(ln.id)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 8px',
              background: active ? 'var(--ink-000)' : 'transparent',
              border: `1px solid ${active ? 'var(--ink-200)' : 'transparent'}`,
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              color: active ? 'var(--ink-800)' : 'var(--ink-400)',
              opacity: active ? 1 : 0.55,
              transition: 'all 120ms',
              textDecoration: active ? 'none' : 'line-through',
            }}
          >
            <span style={{
              display: 'inline-block', width: 18, height: style.width,
              background: style.dasharray ? 'none' : ln.color,
              borderTop: style.dasharray ? `${style.width}px ${ln.style === 'dotted' ? 'dotted' : 'dashed'} ${ln.color}` : 'none',
            }}/>
            {ln.label}
          </button>
        );
      })}
    </div>
  );
}

// ============ Индикаторы (температура/давление/manual) в toolbar ============
function ChartIndicator({ indicator }) {
  const KIND_STYLE = {
    temp:     { color: 'var(--info)',    bg: 'var(--info-soft)',    border: 'rgba(31,111,235,.24)' },
    pressure: { color: 'var(--warning)', bg: 'var(--warning-soft)', border: 'rgba(178,106,0,.28)' },
    flow:     { color: 'var(--success)', bg: 'var(--success-soft)', border: 'rgba(46,133,64,.24)' },
    manual:   { color: 'var(--ink-700)', bg: 'var(--ink-100)',      border: 'var(--ink-200)' },
  };
  const s = KIND_STYLE[indicator.kind] || KIND_STYLE.manual;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '0 14px', height: 32,
      background: s.bg,
      border: `1px solid ${s.border}`,
      borderRadius: 'var(--r-sm)',
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }}
    title={indicator.label + (indicator.source ? ` · ${indicator.source.kind === 'telemetry' ? 'ТИ ' + indicator.source.ref : indicator.source.kind} ` : '')}
    >
      <span style={{ fontSize: 15, fontWeight: 700, color: s.color, lineHeight: 1 }}>{indicator.value}</span>
      <span style={{ fontSize: 11, color: s.color, fontWeight: 500, opacity: .85, lineHeight: 1 }}>{indicator.unit}</span>
    </div>
  );
}

// ============ ChartWidget — законченный виджет ============
function ChartWidget({ content, isEditing, onRemove, w = 12 }) {
  const [visibleMap, setVisibleMap] = uSCh({});
  const [date, setDate] = uSCh('2026-08-25');
  const toast = useToast();

  const toggleLine = (id) => setVisibleMap(m => ({ ...m, [id]: m[id] === false ? true : false }));

  const dev = content.deviations;
  const baseLineName = dev ? content.lines.find(l => l.id === dev.baseLineId)?.label : null;

  return (
    <section className="card" style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: '1px solid var(--ink-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span className="badge badge--brand" style={{ fontFamily: 'var(--font-mono)' }}>График</span>
          <div style={{ minWidth: 0 }}>
            <div className="h-3" style={{ fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{content.title}</div>
            {content.description && <div className="caption mono" style={{ marginTop: 2 }}>{content.description}</div>}
          </div>
        </div>
        {isEditing && (
          <button className="btn btn--ghost btn--icon btn--sm" onClick={onRemove} style={{ color: 'var(--danger)' }}>
            <IconClose size={14}/>
          </button>
        )}
      </div>

      {/* Toolbar: дата + KPI индикаторы + отклонения */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', gap: 12, flexWrap: 'wrap',
        borderBottom: '1px solid var(--ink-100)', background: 'var(--ink-050)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Дата</label>
          <div className="input-wrap" style={{ width: 180 }}>
            <IconCalendar size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}/>
            <input className="input" value={date} onChange={e => setDate(e.target.value)} style={{ paddingLeft: 32, height: 32 }}/>
          </div>
          <button className="btn btn--success btn--sm" onClick={() => toast.success('Данные обновлены', content.title)}>
            <IconPlay size={12}/> Показать данные
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'stretch', height: 32 }}>
          {content.indicators?.map(ind => <ChartIndicator key={ind.id} indicator={ind}/>)}
          {dev && (
            <Dropdown
              align="right"
              trigger={
                <button className="btn btn--sm" style={{
                  height: 32, padding: '0 12px',
                  border: '1px solid var(--danger)', color: 'var(--danger)', background: 'var(--danger-soft)',
                  borderRadius: 'var(--r-sm)', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 13, fontWeight: 500,
                }}>
                  Отклонения · {dev.count} <IconChevronDown size={12}/>
                </button>
              }
              items={[
                { header: `Отклонения от «${baseLineName}» (порог ±${dev.thresholdPos}${dev.unit})` },
                { icon: <IconAlert size={14}/>, label: '10:00 · факт превышает план на +5.1%', shortcut: '+8.2' },
                { icon: <IconWarning size={14}/>, label: '11:30 · недобор −4.6%',              shortcut: '−7.2' },
                { icon: <IconAlert size={14}/>, label: '12:15 · факт превышает план на +3.4%', shortcut: '+5.6' },
                { divider: true },
                { icon: <IconDownload size={14}/>, label: 'Экспорт отклонений', onClick: () => toast.info('Формируется отчёт…') },
              ]}
            />
          )}
        </div>
      </div>

      {/* Легенда + сам график */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <ChartLegend lines={content.lines} visibleMap={visibleMap} onToggle={toggleLine}/>
        </div>
        <CustomChart chart={content} visibleMap={visibleMap} height={w >= 8 ? 320 : 260}/>
      </div>
    </section>
  );
}

Object.assign(window, { ChartWidget, CustomChart, ChartLegend, ChartIndicator, LINE_STYLES, LINE_COLORS });
