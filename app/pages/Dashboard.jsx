// «Блоки» (бывшая Страница 1) — дашборд с виджетами блоков.
// - виджеты имеют w (12-колоночная сетка), resize в режиме edit
// - KPI строка выровнена по высоте
// - легенда графика кликабельная (toggle visibility)
// - легенда графика кликабельная (toggle visibility)

const { useState: uSD, useMemo: uMD } = React;

// ============ Универсальная сетка виджетов 12 колонок с resize ============
function WidgetGrid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(12, 1fr)',
      gap: 16,
    }}>
      {children}
    </div>
  );
}

// Обёртка виджета с resize handle в режиме edit
function WidgetShell({ w = 12, isEditing, onResize, onRemove, dragHandle, children }) {
  const [dragging, setDragging] = uSD(false);
  const startRef = React.useRef(null);

  const onMouseDown = (e) => {
    startRef.current = { x: e.clientX, w };
    setDragging(true);
    e.preventDefault();
  };
  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const parent = e.target.closest ? null : null;
      const grid = document.querySelector('[data-widget-grid]');
      if (!grid) return;
      const gridRect = grid.getBoundingClientRect();
      const colW = gridRect.width / 12;
      const deltaCols = Math.round((e.clientX - startRef.current.x) / colW);
      const newW = Math.max(3, Math.min(12, startRef.current.w + deltaCols));
      onResize?.(newW);
    };
    const onUp = () => setDragging(false);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, [dragging, onResize]);

  return (
    <div style={{
      gridColumn: `span ${w}`,
      position: 'relative',
      minWidth: 0,
    }}>
      {children}
      {isEditing && (
        <>
          {onResize && (
            <button
              onMouseDown={onMouseDown}
              title={`Изменить размер · сейчас ${w}/12`}
              aria-label="Изменить размер"
              style={{
                position: 'absolute',
                right: -4, top: '50%', transform: 'translateY(-50%)',
                width: 20, height: 40,
                background: dragging ? 'var(--info)' : 'var(--ink-000)',
                border: '1px solid var(--ink-300)',
                borderRadius: 4,
                cursor: 'ew-resize',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: dragging ? '#fff' : 'var(--ink-500)',
                zIndex: 2,
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="8 6 3 12 8 18"/><polyline points="16 6 21 12 16 18"/>
              </svg>
            </button>
          )}
          <div style={{
            position: 'absolute', top: 8, right: 40, zIndex: 2,
            display: 'flex', gap: 4, alignItems: 'center',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-500)',
              background: 'var(--ink-000)', border: '1px solid var(--ink-200)',
              padding: '2px 6px', borderRadius: 4,
            }}>{w}/12</span>
          </div>
        </>
      )}
    </div>
  );
}


// (BlockCard и LegendChip удалены — функциональность перенесена в ChartWidget)


// ============ Values widget ============
// Заголовок + описание + N числовых полей, каждое с единицей и источником данных
function SourceBadge({ source }) {
  if (!source) return null;
  const config = {
    telemetry:  { label: 'ТИ',  icon: <IconActivity size={11}/>, color: 'var(--info)',    bg: 'var(--info-soft)',    ref: source.ref },
    telesignal: { label: 'ТС',  icon: <IconZap size={11}/>,      color: 'var(--warning)', bg: 'var(--warning-soft)', ref: source.ref },
    dwh:        { label: 'DWH', icon: <IconDatabase size={11}/>, color: 'var(--success)', bg: 'var(--success-soft)', ref: source.query ? source.query.slice(0, 32) + '…' : 'запрос' },
    manual:     { label: 'ручное', icon: <IconEdit size={11}/>,  color: 'var(--ink-500)', bg: 'var(--ink-100)',      ref: null },
  }[source.kind];
  if (!config) return null;
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 6px',
      background: config.bg, color: config.color,
      borderRadius: 'var(--r-sm)',
      fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '.04em',
      fontFamily: 'var(--font-mono)',
    }}
    title={config.ref || source.kind}
    >
      {config.icon}
      <span>{config.label}</span>
      {config.ref && (
        <span style={{
          textTransform: 'none', letterSpacing: 0, fontWeight: 400,
          maxWidth: 120, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          opacity: .85,
        }}>· {config.ref}</span>
      )}
    </div>
  );
}

function ValuesWidget({ content, isEditing, onRemove, onEdit, w = 6 }) {
  const { title, description, fields = [] } = content;
  // адаптивная сетка: 1 колонка если полей 1, 2 если 2-3, 4 если w >= 8
  const cols = fields.length === 1 ? 1 : w >= 8 ? Math.min(4, fields.length) : Math.min(2, fields.length);

  return (
    <section className="card" style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', gap: 12,
      }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span className="badge badge--brand" style={{ fontFamily: 'var(--font-mono)' }}>Значения</span>
            <div className="h-3" style={{ fontSize: 15, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</div>
          </div>
          {description && <div className="caption" style={{ marginTop: 2 }}>{description}</div>}
        </div>
        {isEditing && (
          <div style={{ display: 'flex', gap: 4 }}>
            <button className="btn btn--ghost btn--icon btn--sm" onClick={onEdit} title="Редактировать"><IconEdit size={14}/></button>
            <button className="btn btn--ghost btn--icon btn--sm" onClick={onRemove} style={{ color: 'var(--danger)' }}><IconClose size={14}/></button>
          </div>
        )}
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 0,
      }}>
        {fields.map((f, i) => {
          const isLastRow = i >= fields.length - cols;
          const isLastCol = (i + 1) % cols === 0;
          return (
            <div key={f.id || i} style={{
              padding: '16px 20px',
              borderBottom: isLastRow ? 'none' : '1px solid var(--ink-100)',
              borderRight: isLastCol ? 'none' : '1px solid var(--ink-100)',
              minWidth: 0,
            }}>
              <div style={{ fontSize: 12, color: 'var(--ink-500)', fontWeight: 500, marginBottom: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                <div style={{
                  fontSize: 28, fontWeight: 700, color: 'var(--ink-900)',
                  fontVariantNumeric: 'tabular-nums', lineHeight: 1,
                  letterSpacing: '-0.01em',
                }}>{typeof f.value === 'number' ? f.value.toLocaleString('ru-RU') : f.value}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-500)', fontWeight: 500 }}>{f.unit}</div>
                {f.trend && (
                  <div style={{
                    fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
                    color: f.trend.startsWith('+') ? 'var(--success)' : f.trend.startsWith('−') || f.trend.startsWith('-') ? 'var(--danger)' : 'var(--ink-500)',
                  }}>{f.trend}</div>
                )}
              </div>
              <SourceBadge source={f.source}/>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ============ Superset widget ============
function SupersetWidget({ chartId, isEditing, onRemove, w, onChangeChart }) {
  const chart = supersetCharts[chartId];
  const toast = useToast();
  if (!chart) return <div className="card" style={{ padding: 20 }}>Chart {chartId} не найден</div>;

  return (
    <section className="card" style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        padding: '14px 20px', borderBottom: '1px solid var(--ink-100)', gap: 12,
      }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span className="badge badge--info" style={{ fontFamily: 'var(--font-mono)' }}>Superset</span>
            <div className="h-3" style={{ fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chart.title}</div>
          </div>
          <div className="caption mono">{chart.subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {isEditing && onChangeChart && (
            <Dropdown
              align="right"
              trigger={<button className="btn btn--ghost btn--icon btn--sm" title="Сменить график"><IconEdit size={14}/></button>}
              items={Object.values(supersetCharts).map(c => ({
                icon: c.type === 'line' ? <IconLineChart size={14}/> : c.type === 'bar' ? <IconBarChart size={14}/> : <IconPieChart size={14}/>,
                label: c.title,
                onClick: () => onChangeChart(c.id),
              }))}
            />
          )}
          <a href={chart.url} target="_blank" rel="noreferrer" onClick={(e) => { e.preventDefault(); toast.info('Открывается Superset…', chart.url); }} className="btn btn--ghost btn--icon btn--sm" title="Открыть в Superset">
            <IconExternal size={14}/>
          </a>
          {isEditing && (
            <button className="btn btn--ghost btn--icon btn--sm" onClick={onRemove} style={{ color: 'var(--danger)' }}>
              <IconClose size={14}/>
            </button>
          )}
        </div>
      </div>
      <div style={{ padding: 20 }}>
        <SupersetChart chart={chart} height={w >= 8 ? 240 : 200}/>
      </div>
    </section>
  );
}

// ============ Text widget ============
function TextWidget({ content, isEditing, onRemove, onEdit }) {
  return (
    <section className="card" style={{ padding: '18px 20px', position: 'relative' }}>
      {isEditing && (
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
          <button className="btn btn--ghost btn--icon btn--sm" onClick={onEdit}><IconEdit size={14}/></button>
          <button className="btn btn--ghost btn--icon btn--sm" onClick={onRemove} style={{ color: 'var(--danger)' }}><IconClose size={14}/></button>
        </div>
      )}
      {content.title && <div className="h-3" style={{ fontSize: 16, marginBottom: 6 }}>{content.title}</div>}
      <div className="body" style={{ color: 'var(--ink-700)' }}>{content.body}</div>
    </section>
  );
}

// ============ Link widget (internal / external) ============
function LinkWidget({ type, content, isEditing, onRemove }) {
  const isExternal = type === 'link-ext';
  const toast = useToast();
  const handleClick = (e) => {
    if (isEditing) { e.preventDefault(); return; }
    if (isExternal) {
      e.preventDefault();
      toast.info('Открывается в новой вкладке…', content.href);
    } else {
      e.preventDefault();
      location.hash = content.href;
    }
  };
  return (
    <a
      href={content.href}
      onClick={handleClick}
      className="card"
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '18px 20px',
        textDecoration: 'none',
        color: 'var(--ink-800)',
        transition: 'all 120ms',
        borderColor: 'var(--ink-200)',
        position: 'relative',
        minHeight: 90,
      }}
      onMouseEnter={(e) => { if (!isEditing) { e.currentTarget.style.borderColor = 'var(--info)'; e.currentTarget.style.background = 'var(--info-soft)'; } }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ink-200)'; e.currentTarget.style.background = 'var(--ink-000)'; }}
    >
      <div style={{
        width: 44, height: 44,
        background: isExternal ? 'var(--warning-soft)' : 'var(--info-soft)',
        color: isExternal ? 'var(--warning)' : 'var(--info)',
        borderRadius: 'var(--r-md)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        {isExternal
          ? <IconExternal size={20}/>
          : content.icon === 'grid' ? <IconGrid size={20}/>
            : content.icon === 'map' ? <IconMap size={20}/>
            : content.icon === 'activity' ? <IconActivity size={20}/>
            : <IconLink size={20}/>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--ink-900)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {content.label}
          {isExternal && <span className="badge badge--warning" style={{ fontSize: 10 }}>ext</span>}
        </div>
        <div className="caption" style={{ marginTop: 2 }}>{content.desc}</div>
      </div>
      {!isEditing && <IconChevronRight size={16} style={{ color: 'var(--ink-400)' }}/>}
      {isEditing && (
        <button className="btn btn--ghost btn--icon btn--sm" onClick={(e) => { e.preventDefault(); onRemove(); }} style={{ color: 'var(--danger)' }}>
          <IconClose size={14}/>
        </button>
      )}
    </a>
  );
}

// ============ Scheme widget — мнемосхема АСУТП (тёмный фон, жёлтые линии) ============
function SchemeWidget({ content, isEditing, onRemove }) {
  const toast = useToast();
  return (
    <section className="card" style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: '1px solid var(--ink-100)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <span className="badge badge--neutral" style={{ fontFamily: 'var(--font-mono)' }}>Мнемосхема ТП</span>
            <div className="h-3" style={{ fontSize: 15 }}>{content.schemeName}</div>
          </div>
          <div className="caption mono">SVG · интерактивная · live-теги · обновление 09:56</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn btn--ghost btn--icon btn--sm" onClick={() => toast.info('Открывается редактор мнемосхем…')}><IconEdit size={14}/></button>
          <button className="btn btn--ghost btn--icon btn--sm" onClick={() => toast.info('Открытие в полноэкранном режиме…')}><IconMaximize size={14}/></button>
          {isEditing && <button className="btn btn--ghost btn--icon btn--sm" onClick={onRemove} style={{ color: 'var(--danger)' }}><IconClose size={14}/></button>}
        </div>
      </div>
      <div style={{ background: '#4A4E52', overflow: 'hidden' }}>
        <SubstationScheme/>
      </div>
      <div style={{
        padding: '8px 20px', borderTop: '1px solid var(--ink-100)',
        background: 'var(--ink-050)', display: 'flex', gap: 16, alignItems: 'center',
        fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)',
        flexWrap: 'wrap',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 10, height: 2, background: '#E4C64A' }}/> в работе
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: '#FFFFFF', border: '1px solid #E4C64A' }}/> ВВ включен
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: 'transparent', border: '1px solid #E4C64A' }}/> ВВ отключен
        </span>
        <span style={{ marginLeft: 'auto' }}>2 системы шин · 10 ячеек · 47 живых тегов</span>
      </div>
    </section>
  );
}

// ============ SubstationScheme — SVG-схема (жёлтая на тёмном фоне, АСУТП-стиль) ============
function SubstationScheme() {
  // Общая схема: две системы шин (1 С 6 и 2 С 6), по 5 ячеек с каждой стороны + секционник по центру.
  // Слева-направо ячейки: 105 · 104 · 103 · 102 · 101  ||  201 · 202 · 203 · 204 · 205
  const cells = [
    { x:  95, num: '105', param: { I: '210.2 A', P: '93 МВт', Q: '43 Мвар' }, type: 'trans-line', label: 'В6\nТ-1',   arrowLabel: null,      transLabel: 'ТН-6 Т-1', bottomLabel: 'ОПН-6 Т-1' },
    { x: 195, num: '104', param: null,                                       type: 'to-trans',   label: null,        arrowLabel: 'К Т-1',   transLabel: 'ТН-6 Т-1', bottomLabel: 'ТН-6 Т-1' },
    { x: 295, num: '103', param: { Ua: '452 кВ', Ub: '56 кВ', Uc: '3434 кВ', Uab: '638 кВ', Ubc: '66 кВ', Uca: '654 кВ', f: '4.1 Гц' }, type: 'trans-line', label: 'Ун 14-6', transLabel: 'ЗНЛП-14-6', bottomLabel: 'ТН-1-8' },
    { x: 395, num: '102', param: { I: '64 A', P: '3 МВт', Q: '848 Мвар' },  type: 'line',       label: 'В6\nЛ-13', transLabel: null,      bottomLabel: 'ОПН-6 Л-13' },
    { x: 495, num: '101', param: { I: '365 A', P: '4 МВт', Q: '7 Мвар' }, type: 'section',    label: 'СВ 6',      transLabel: null,      bottomLabel: null },
    // Правая шина
    { x: 595, num: '201', param: null,                                       type: 'section-r',  label: 'СР 6',      transLabel: null,      bottomLabel: null },
    { x: 695, num: '202', param: { I: '345 A', P: '74 МВт', Q: '2455 Мвар' }, type: 'line',    label: 'В6\nЛ-8',  transLabel: null,      bottomLabel: 'ОПН-6 Л-8' },
    { x: 795, num: '203', param: { Ua: '878 кВ', Ub: '78 кВ', Uc: '2 кВ', Uab: '584 кВ', Ubc: '6 кВ', Uca: '612 кВ', f: '13 Гц' }, type: 'trans-line', label: 'Ун ТН-6', transLabel: 'ЗНЛП-6', bottomLabel: 'ТН-2-8' },
    { x: 895, num: '204', param: null,                                       type: 'to-trans',   label: null,        arrowLabel: 'К Т-2',   transLabel: null,      bottomLabel: 'ТН-6 Т-2' },
    { x: 995, num: '205', param: { I: '48 A', P: '10 МВт', Q: '25 Мвар' }, type: 'trans-line', label: 'В6\nТ-2',   transLabel: null,      bottomLabel: 'ОПН-6 Т-2' },
  ];

  const YELLOW = '#E4C64A';
  const WHITE = '#FFFFFF';

  return (
    <svg viewBox="0 0 1100 420" style={{ width: '100%', display: 'block', background: '#4A4E52' }} preserveAspectRatio="xMidYMid meet">
      {/* Параметры сверху по ячейкам */}
      {cells.map((c, i) => c.param && (
        <g key={`param-${i}`} fontFamily="JetBrains Mono" fontSize="9" fill={YELLOW}>
          {Object.entries(c.param).map(([key, val], j) => (
            <text key={key} x={c.x - 30} y={20 + j * 11} textAnchor="start">
              <tspan fontWeight="bold">{key}</tspan> {val}
            </text>
          ))}
        </g>
      ))}

      {/* Стрелки "К Т-1" / "К Т-2" (вверх) */}
      {cells.map((c, i) => c.arrowLabel && (
        <g key={`arrow-${i}`}>
          <line x1={c.x} y1="120" x2={c.x} y2="90" stroke={YELLOW} strokeWidth="1.5"/>
          <polygon points={`${c.x-4},96 ${c.x+4},96 ${c.x},88`} fill={YELLOW}/>
          <text x={c.x + 8} y="98" fontFamily="JetBrains Mono" fontSize="10" fill={YELLOW}>{c.arrowLabel}</text>
        </g>
      ))}

      {/* ШИНЫ (две системы, соединены секционником) */}
      <line x1="60" y1="128" x2="550" y2="128" stroke={YELLOW} strokeWidth="4"/>
      <line x1="565" y1="128" x2="1040" y2="128" stroke={YELLOW} strokeWidth="4"/>

      {/* Номера ячеек на шине */}
      {cells.map((c, i) => (
        <text key={`num-${i}`} x={c.x} y="123" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={YELLOW} fontWeight="bold">{c.num}</text>
      ))}

      {/* Подписи "1 С 6" / "2 С 6" — метки систем шин */}
      <text x="555" y="123" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={YELLOW} fontWeight="bold">1 С 6</text>
      <text x="565" y="140" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={YELLOW} fontWeight="bold">2 С 6</text>

      {/* Секционник в центре (СВ 6 / СР 6) — двойные стрелки */}
      <g>
        <line x1="548" y1="145" x2="548" y2="170" stroke={YELLOW} strokeWidth="1.5"/>
        <line x1="568" y1="145" x2="568" y2="170" stroke={YELLOW} strokeWidth="1.5"/>
        <polygon points="544,155 552,155 548,148" fill="none" stroke={WHITE} strokeWidth="1"/>
        <polygon points="544,165 552,165 548,158" fill="none" stroke={WHITE} strokeWidth="1"/>
        <polygon points="564,155 572,155 568,148" fill="none" stroke={WHITE} strokeWidth="1"/>
        <polygon points="564,165 572,165 568,158" fill="none" stroke={WHITE} strokeWidth="1"/>
      </g>

      {/* Ячейки — вертикальные ветви */}
      {cells.map((c, i) => {
        if (c.type === 'section' || c.type === 'section-r') return null;
        return (
          <g key={`cell-${i}`}>
            {/* Вертикальная линия шина → выключатель */}
            <line x1={c.x} y1="130" x2={c.x} y2="170" stroke={YELLOW} strokeWidth="1.5"/>

            {/* Разъединитель (штрих под углом) */}
            <line x1={c.x - 5} y1="145" x2={c.x + 5} y2="140" stroke={YELLOW} strokeWidth="1.5"/>

            {/* Выключатель (белый квадрат) */}
            <rect x={c.x - 10} y="170" width="20" height="20" fill={WHITE} stroke={YELLOW} strokeWidth="1"/>
            {c.label && (
              <text x={c.x} y="184" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="7" fill="#000">
                {c.label.split('\n').map((ln, k) => <tspan key={k} x={c.x} dy={k === 0 ? 0 : 8}>{ln}</tspan>)}
              </text>
            )}

            {/* Линия ниже выключателя */}
            <line x1={c.x} y1="190" x2={c.x} y2="220" stroke={YELLOW} strokeWidth="1.5"/>

            {/* Разъединитель */}
            <line x1={c.x - 5} y1="215" x2={c.x + 5} y2="220" stroke={YELLOW} strokeWidth="1.5"/>

            {/* ТТ (трансформатор тока) — круг с крестом */}
            {(c.type === 'trans-line' || c.type === 'line') && (
              <g>
                <circle cx={c.x} cy="235" r="10" fill="none" stroke={WHITE} strokeWidth="1.2"/>
                <line x1={c.x - 7} y1="228" x2={c.x + 7} y2="242" stroke={WHITE} strokeWidth="1"/>
                <line x1={c.x - 7} y1="242" x2={c.x + 7} y2="228" stroke={WHITE} strokeWidth="1"/>
              </g>
            )}

            <line x1={c.x} y1="245" x2={c.x} y2="290" stroke={YELLOW} strokeWidth="1.5"/>

            {/* Трансформатор напряжения — 3 пересекающихся круга (звезда) */}
            {c.type === 'trans-line' && (
              <g transform={`translate(${c.x}, 300)`}>
                <circle cx="0"  cy="-6" r="9" fill="none" stroke={YELLOW} strokeWidth="1.4"/>
                <circle cx="-7" cy="6"  r="9" fill="none" stroke={YELLOW} strokeWidth="1.4"/>
                <circle cx="7"  cy="6"  r="9" fill="none" stroke={YELLOW} strokeWidth="1.4"/>
                {/* Земля */}
                <line x1="0" y1="15" x2="0" y2="26" stroke={YELLOW} strokeWidth="1.2"/>
                <line x1="-6" y1="26" x2="6" y2="26" stroke={YELLOW} strokeWidth="1.5"/>
                <line x1="-4" y1="29" x2="4" y2="29" stroke={YELLOW} strokeWidth="1.2"/>
                <line x1="-2" y1="32" x2="2" y2="32" stroke={YELLOW} strokeWidth="1.2"/>
              </g>
            )}

            {/* ОПН + земля — для line-типов */}
            {c.type === 'line' && (
              <g transform={`translate(${c.x}, 300)`}>
                {/* ОПН — прямоугольник */}
                <rect x="-4" y="-8" width="8" height="18" fill="none" stroke={YELLOW} strokeWidth="1.2"/>
                {/* Стрелка вниз */}
                <line x1="0" y1="14" x2="0" y2="24" stroke={YELLOW} strokeWidth="1.5"/>
                <polygon points="-3,20 3,20 0,26" fill={YELLOW}/>
              </g>
            )}

            {/* Стрелка "К Т-1" */}
            {c.type === 'to-trans' && (
              <g>
                <line x1={c.x} y1="245" x2={c.x} y2="360" stroke={YELLOW} strokeWidth="1.5"/>
                {/* Трансформатор внизу — 3 круга */}
                <g transform={`translate(${c.x}, 370)`}>
                  <circle cx="0"  cy="-8" r="9" fill="none" stroke={YELLOW} strokeWidth="1.4"/>
                  <circle cx="-7" cy="4"  r="9" fill="none" stroke={YELLOW} strokeWidth="1.4"/>
                  <circle cx="7"  cy="4"  r="9" fill="none" stroke={YELLOW} strokeWidth="1.4"/>
                </g>
              </g>
            )}

            {/* Нижние подписи */}
            {c.transLabel && (
              <text x={c.x + 12} y="235" fontFamily="JetBrains Mono" fontSize="8" fill={YELLOW}>{c.transLabel}</text>
            )}
            {c.bottomLabel && c.type !== 'to-trans' && (
              <text x={c.x} y="352" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="8" fill={YELLOW}>{c.bottomLabel}</text>
            )}
            {c.bottomLabel && c.type === 'to-trans' && (
              <text x={c.x} y="405" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fill={YELLOW} fontWeight="bold">{c.bottomLabel}</text>
            )}
          </g>
        );
      })}

      {/* Стрелки вниз "Л-13" и "Л-8" — от ячеек 102 и 202 */}
      {[{x:395,label:'Л-13'},{x:695,label:'Л-8'}].map(a => (
        <g key={a.label}>
          <line x1={a.x} y1="335" x2={a.x} y2="380" stroke={YELLOW} strokeWidth="1.5"/>
          <polygon points={`${a.x-4},372 ${a.x+4},372 ${a.x},382`} fill={YELLOW}/>
          <text x={a.x} y="400" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill={YELLOW} fontWeight="bold">{a.label}</text>
        </g>
      ))}
    </svg>
  );
}

// ============ AddWidgetModal — выбор типа виджета ============
function AddWidgetModal({ open, onClose, onAdd, allowedTypes = ['values', 'chart', 'block', 'superset', 'scheme', 'text', 'link-int', 'link-ext'] }) {
  const [step, setStep] = uSD(1);
  const [type, setType] = uSD(null);
  const [data, setData] = uSD({});

  React.useEffect(() => {
    if (open) { setStep(1); setType(null); setData({}); }
  }, [open]);

  const types = [
    { key: 'values',   icon: <IconActivity size={24}/>,  label: 'KPI / Числовые показатели',  desc: 'Одно или несколько числовых KPI с единицами и источниками: ТИ, ТС, DWH, ручной ввод' },
    { key: 'chart',    icon: <IconLineChart size={24}/>, label: 'Тренды',                     desc: 'Собственный график по ТИ/ТС/DWH с настраиваемыми осями, KPI-индикаторами и отклонениями' },
    { key: 'scheme',   icon: <IconMap size={24}/>,       label: 'Мнемосхема ТП',              desc: 'Интерактивная технологическая схема с live-тегами' },
    { key: 'superset', icon: <IconBarChart size={24}/>,  label: 'BI-Аналитика (Superset)',    desc: 'Интегрированный аналитический виджет с получением данных из Superset' },
    { key: 'text',     icon: <IconType size={24}/>,      label: 'Текстовый блок',             desc: 'Заголовок и текстовое описание' },
    { key: 'link-int', icon: <IconLink size={24}/>,      label: 'Переход по системе',         desc: 'Навигация на смежные страницы системы' },
    { key: 'link-ext', icon: <IconExternal size={24}/>,  label: 'Внешний ресурс',             desc: 'Переход на внешний WEB-ресурс в новой вкладке' },
  ].filter(t => allowedTypes.includes(t.key));

  const confirm = () => {
    if (!type) return;
    onAdd({ type, content: data });
    onClose();
  };

  const isReady = () => {
    if (!type) return false;
    if (type === 'scheme') return !!data.schemeName;
    if (type === 'superset') return !!data.chartId;
    if (type === 'text') return !!data.body;
    if (type === 'link-int' || type === 'link-ext') return !!data.label && !!data.href;
    if (type === 'values') return !!data.title && Array.isArray(data.fields) && data.fields.length > 0 && data.fields.every(f => f.label && f.value !== '' && f.value != null);
    if (type === 'chart')  return !!data.title && Array.isArray(data.lines) && data.lines.length > 0 && data.lines.every(l => l.label);
    return false;
  };

  // Инициализация template при выборе типа
  React.useEffect(() => {
    if (type === 'values' && !data.fields) {
      setData({ title: '', description: '', fields: [{ id: 1, label: '', value: '', unit: '%', source: { kind: 'manual' } }] });
    }
    if (type === 'chart' && !data.lines) {
      setData(defaultChartData());
    }
  }, [type]);

  const updateField = (idx, patch) => setData(d => ({ ...d, fields: d.fields.map((f, i) => i === idx ? { ...f, ...patch } : f) }));
  const addField = () => setData(d => ({ ...d, fields: [...(d.fields || []), { id: Date.now(), label: '', value: '', unit: '%', source: { kind: 'manual' } }] }));
  const removeField = (idx) => setData(d => ({ ...d, fields: d.fields.filter((_, i) => i !== idx) }));

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === 1 ? 'Добавить виджет' : `Настройка · ${types.find(t => t.key === type)?.label}`}
      desc={step === 1 ? 'Выберите тип виджета — можно комбинировать любые типы на одной странице.' : 'Заполните содержимое виджета.'}
      size={type === 'chart' && step === 2 ? 'xl' : 'lg'}
      footer={step === 1 ? (
        <>
          <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn--primary" disabled={!type} onClick={() => setStep(2)}>Далее <IconChevronRight size={14}/></button>
        </>
      ) : (
        <>
          <button className="btn btn--ghost" onClick={() => setStep(1)}>‹ Назад</button>
          <button className="btn btn--brand" disabled={!isReady()} onClick={confirm}>
            <IconPlus size={14}/> Добавить на страницу
          </button>
        </>
      )}
    >
      {step === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {types.map(t => (
            <button
              key={t.key}
              onClick={() => { if (!t.disabled) setType(t.key); }}
              disabled={t.disabled}
              title={t.disabled ? t.note : undefined}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '14px 16px',
                background: t.disabled ? 'var(--ink-050)' : type === t.key ? 'var(--info-soft)' : 'var(--ink-000)',
                border: `1.5px solid ${t.disabled ? 'var(--ink-200)' : type === t.key ? 'var(--info)' : 'var(--ink-200)'}`,
                borderRadius: 'var(--r-md)',
                cursor: t.disabled ? 'not-allowed' : 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--font-sans)',
                transition: 'all 120ms',
                opacity: t.disabled ? 0.65 : 1,
                position: 'relative',
              }}
            >
              <div style={{
                width: 40, height: 40,
                background: t.disabled ? 'var(--ink-200)' : type === t.key ? 'var(--info)' : 'var(--ink-100)',
                color: t.disabled ? 'var(--ink-500)' : type === t.key ? '#fff' : 'var(--ink-600)',
                borderRadius: 'var(--r-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{t.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--ink-900)' }}>{t.label}</span>
                  {t.disabled && (
                    <span style={{
                      fontSize: 10, fontWeight: 600,
                      textTransform: 'uppercase', letterSpacing: '.04em',
                      padding: '1px 6px',
                      background: 'var(--warning-soft)', color: 'var(--warning)',
                      borderRadius: 'var(--r-sm)', fontFamily: 'var(--font-mono)',
                    }}>{t.note || 'в разработке'}</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.4 }}>{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      {step === 2 && type === 'scheme' && (
        <div className="form-group">
          <label className="form-label">Мнемосхема</label>
          <select className="select" value={data.schemeName || ''} onChange={e => setData({ schemeName: e.target.value })}>
            <option value="">— Выберите схему —</option>
            <option>Схема · Первый контур</option>
            <option>Схема · Второй контур</option>
            <option>Схема · Резервный контур</option>
            <option>Подстанция №4 · Общая</option>
          </select>
        </div>
      )}
      {step === 2 && type === 'superset' && (
        <div className="form-group">
          <label className="form-label">График Superset</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {Object.values(supersetCharts).map(c => (
              <button
                key={c.id}
                onClick={() => setData({ chartId: c.id })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px',
                  background: data.chartId === c.id ? 'var(--info-soft)' : 'var(--ink-000)',
                  border: `1.5px solid ${data.chartId === c.id ? 'var(--info)' : 'var(--ink-200)'}`,
                  borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{ color: 'var(--info)' }}>
                  {c.type === 'line' ? <IconLineChart size={18}/> : c.type === 'bar' ? <IconBarChart size={18}/> : <IconPieChart size={18}/>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--ink-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>{c.type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
      {step === 2 && type === 'text' && (
        <>
          <div className="form-group">
            <label className="form-label">Заголовок <span className="form-label__hint">опционально</span></label>
            <input className="input" value={data.title || ''} onChange={e => setData(d => ({ ...d, title: e.target.value }))} placeholder="Например: Оперативная сводка"/>
          </div>
          <div className="form-group">
            <label className="form-label">Текст <span className="form-label__required">*</span></label>
            <textarea className="textarea" value={data.body || ''} onChange={e => setData(d => ({ ...d, body: e.target.value }))} placeholder="Введите содержимое…"/>
          </div>
        </>
      )}
      {step === 2 && (type === 'link-int' || type === 'link-ext') && (
        <>
          <div className="form-group">
            <label className="form-label">Заголовок ссылки <span className="form-label__required">*</span></label>
            <input className="input" value={data.label || ''} onChange={e => setData(d => ({ ...d, label: e.target.value }))} placeholder="Например: Управление блоками"/>
          </div>
          <div className="form-group">
            <label className="form-label">{type === 'link-ext' ? 'URL' : 'Внутренний путь'} <span className="form-label__required">*</span></label>
            <input
              className="input"
              value={data.href || ''}
              onChange={e => setData(d => ({ ...d, href: e.target.value }))}
              placeholder={type === 'link-ext' ? 'https://…' : '#/blocks-page'}
            />
            <div className="form-help">
              {type === 'link-ext' ? 'Полный URL включая https://' : 'Например: #/home, #/blocks-page, #/schemes-page'}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Описание <span className="form-label__hint">опционально</span></label>
            <input className="input" value={data.desc || ''} onChange={e => setData(d => ({ ...d, desc: e.target.value }))} placeholder="Короткое пояснение"/>
          </div>
        </>
      )}
      {step === 2 && type === 'values' && (
        <>
          <div className="form-group">
            <label className="form-label">Заголовок виджета <span className="form-label__required">*</span></label>
            <input className="input" value={data.title || ''} onChange={e => setData(d => ({ ...d, title: e.target.value }))} placeholder="Например: Суточная сводка производства"/>
          </div>
          <div className="form-group">
            <label className="form-label">Описание <span className="form-label__hint">опционально</span></label>
            <input className="input" value={data.description || ''} onChange={e => setData(d => ({ ...d, description: e.target.value }))} placeholder="Например: обновлено 09:56 · Modbus TCP"/>
          </div>

          <div style={{
            padding: '10px 12px', marginTop: 4, marginBottom: 12,
            background: 'var(--ink-050)', borderRadius: 'var(--r-md)',
            fontSize: 12, color: 'var(--ink-600)',
            border: '1px solid var(--ink-200)',
          }}>
            <b style={{ color: 'var(--ink-800)' }}>Поля значений.</b> К каждому полю можно привязать источник данных: телеизмерение, телесигнал, запрос к витрине DWH — или ввести ручное значение.
          </div>

          {(data.fields || []).map((f, i) => (
            <ValueFieldEditor
              key={f.id}
              field={f}
              onChange={(patch) => updateField(i, patch)}
              onRemove={data.fields.length > 1 ? () => removeField(i) : null}
              index={i}
            />
          ))}

          <button
            className="btn btn--secondary"
            onClick={addField}
            style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}
          >
            <IconPlus size={14}/> Добавить ещё поле
          </button>
        </>
      )}
      {step === 2 && type === 'chart' && data.lines && (
        <AddChartForm data={data} onChange={setData}/>
      )}
    </Modal>
  );
}

// ============ Value Field Editor — редактор одного числового поля ============
function ValueFieldEditor({ field, onChange, onRemove, index }) {
  const [customUnit, setCustomUnit] = uSD(field.unit && !flatUnits.includes(field.unit));

  const setSourceKind = (kind) => {
    const source = kind === 'manual' ? { kind } : kind === 'dwh' ? { kind, query: '' } : { kind, ref: '' };
    onChange({ source });
  };

  return (
    <div style={{
      padding: 14, marginBottom: 10,
      background: 'var(--ink-000)',
      border: '1px solid var(--ink-200)',
      borderRadius: 'var(--r-md)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{
          width: 20, height: 20, borderRadius: 'var(--r-sm)',
          background: 'var(--ink-100)', color: 'var(--ink-600)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 600,
        }}>{index + 1}</span>
        <b style={{ fontSize: 13, color: 'var(--ink-800)' }}>Поле значения</b>
        {onRemove && (
          <button
            className="btn btn--ghost btn--icon btn--sm"
            onClick={onRemove}
            style={{ marginLeft: 'auto', color: 'var(--danger)' }}
            aria-label="Удалить поле"
          ><IconClose size={14}/></button>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Метка поля <span className="form-label__required">*</span></label>
        <input
          className="input"
          value={field.label}
          onChange={e => onChange({ label: e.target.value })}
          placeholder="Например: Суммарная мощность"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
        <div className="form-group">
          <label className="form-label">Значение <span className="form-label__required">*</span></label>
          <input
            className="input"
            type="number"
            step="any"
            value={field.value}
            onChange={e => onChange({ value: e.target.value === '' ? '' : Number(e.target.value) })}
            placeholder="42.7"
          />
        </div>
        <div className="form-group">
          <label className="form-label">Ед. изм.</label>
          {customUnit ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <input
                className="input"
                value={field.unit}
                onChange={e => onChange({ unit: e.target.value })}
                placeholder="кг·м/с²"
                style={{ flex: 1 }}
              />
              <button
                className="btn btn--ghost btn--icon btn--sm"
                onClick={() => { setCustomUnit(false); onChange({ unit: '%' }); }}
                title="Вернуться к списку"
                aria-label="Вернуться к списку"
                style={{ height: 36 }}
              ><IconChevronDown size={14}/></button>
            </div>
          ) : (
            <select
              className="select"
              value={field.unit}
              onChange={e => {
                if (e.target.value === '__custom__') { setCustomUnit(true); onChange({ unit: '' }); }
                else onChange({ unit: e.target.value });
              }}
            >
              {unitsCatalog.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map(u => <option key={u} value={u}>{u}</option>)}
                </optgroup>
              ))}
              <option value="__custom__">— Другое (задать вручную)…</option>
            </select>
          )}
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 8 }}>
        <label className="form-label">Источник данных</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, padding: 3, background: 'var(--ink-100)', borderRadius: 'var(--r-sm)' }}>
          {[
            { k: 'manual',    label: 'Ручное',   icon: <IconEdit size={12}/> },
            { k: 'telemetry', label: 'ТИ',       icon: <IconActivity size={12}/> },
            { k: 'telesignal',label: 'ТС',       icon: <IconZap size={12}/> },
            { k: 'dwh',       label: 'Витрина',  icon: <IconDatabase size={12}/> },
          ].map(opt => (
            <button
              key={opt.k}
              onClick={() => setSourceKind(opt.k)}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                padding: '6px 8px',
                background: field.source?.kind === opt.k ? 'var(--ink-000)' : 'transparent',
                border: field.source?.kind === opt.k ? '1px solid var(--ink-200)' : '1px solid transparent',
                borderRadius: 'var(--r-sm)',
                fontSize: 12, fontWeight: 500,
                color: field.source?.kind === opt.k ? 'var(--ink-900)' : 'var(--ink-600)',
                cursor: 'pointer', fontFamily: 'var(--font-sans)',
                boxShadow: field.source?.kind === opt.k ? 'var(--shadow-xs)' : 'none',
              }}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {field.source?.kind === 'telemetry' && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Телеизмерение</label>
          <select
            className="select"
            value={field.source.ref || ''}
            onChange={e => onChange({ source: { kind: 'telemetry', ref: e.target.value } })}
          >
            <option value="">— выберите ТИ —</option>
            {mockTelemetry.slice(0, 20).map(t => (
              <option key={t.id} value={t.name}>{t.name} · {t.block || '—'} · {t.value}</option>
            ))}
          </select>
        </div>
      )}
      {field.source?.kind === 'telesignal' && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Телесигнал</label>
          <select
            className="select"
            value={field.source.ref || ''}
            onChange={e => onChange({ source: { kind: 'telesignal', ref: e.target.value } })}
          >
            <option value="">— выберите ТС —</option>
            <option>ТС-выключатель_Q1</option>
            <option>ТС-разъединитель_QS1</option>
            <option>ТС-положение_ключа</option>
            <option>ТС-АВР_готов</option>
            <option>ТС-РПН_повышение</option>
            <option>ТС-защита_МТЗ</option>
            <option>ТС-сигнал_аварии</option>
          </select>
        </div>
      )}
      {field.source?.kind === 'dwh' && (
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">SQL-запрос к витрине DWH</label>
          <textarea
            className="textarea"
            value={field.source.query || ''}
            onChange={e => onChange({ source: { kind: 'dwh', query: e.target.value } })}
            placeholder="SELECT SUM(power) FROM gold.blocks_hourly WHERE date = current_date"
            style={{ minHeight: 64, fontFamily: 'var(--font-mono)', fontSize: 12 }}
          />
          <div className="form-help">Позже адресация будет через справочник запросов. Пока — сырой SQL к слою gold.</div>
        </div>
      )}
    </div>
  );
}

// ============ Универсальный рендер виджета по типу ============
function renderWidget(widget, isEditing, onRemove, onResize, onChangeChart) {
  const { type, content, w = 12 } = widget;
  const shell = (child) => (
    <WidgetShell key={widget.id} w={w} isEditing={isEditing} onResize={onResize} onRemove={onRemove}>
      {child}
    </WidgetShell>
  );
  switch (type) {
    case 'scheme':   return shell(<SchemeWidget content={content} isEditing={isEditing} onRemove={onRemove}/>);
    case 'superset': return shell(<SupersetWidget chartId={content.chartId} isEditing={isEditing} onRemove={onRemove} w={w} onChangeChart={onChangeChart}/>);
    case 'text':     return shell(<TextWidget content={content} isEditing={isEditing} onRemove={onRemove} onEdit={() => {}}/>);
    case 'values':   return shell(<ValuesWidget content={content} isEditing={isEditing} onRemove={onRemove} onEdit={() => {}} w={w}/>);
    case 'chart':    return shell(<ChartWidget content={content} isEditing={isEditing} onRemove={onRemove} w={w}/>);
    case 'link-int':
    case 'link-ext': return shell(<LinkWidget type={type} content={content} isEditing={isEditing} onRemove={onRemove}/>);
    default:         return shell(<div className="card" style={{ padding: 20 }}>Неизвестный тип виджета: {type}</div>);
  }
}

// ============ DashboardPage (Блоки) ============
function DashboardPage() {
  const [mode, setMode] = uSD('view');
  const [addModal, setAddModal] = uSD(false);
  const toast = useToast();
  const [widgets, setWidgets] = uSD([
    { id: 1, type: 'chart', w: 12, content: {
      title: 'Производственный график · Линия_1',
      description: 'обновлено 09:56 · Modbus TCP',
      xAxis: { label: 'Время', unit: 'ч', min: 0, max: 24 },
      yAxis: { label: 'Объём', unit: 'т/ч', min: 20, max: 200 },
      lines: [
        { id: 1, label: 'план', color: '#8A96A3', style: 'dashed', dataKey: 'plan', source: { kind: 'dwh', query: 'SELECT hour, plan FROM gold.production_plan' } },
        { id: 2, label: 'факт', color: '#C0392B', style: 'solid',  dataKey: 'fact', source: { kind: 'telemetry', ref: 'line1-output' } },
      ],
      indicators: [
        { id: 1, kind: 'temp', value: 62.28, unit: '°C', label: 'температура', source: { kind: 'telemetry', ref: 'температура_подшипника' } },
      ],
      deviations: { baseLineId: 1, thresholdPos: 3.0, thresholdNeg: -3.0, unit: '%', count: 2 },
    }},
  ]);

  const addWidget = ({ type, content }) => {
    const w = type === 'superset' || type === 'chart' ? 12 : type === 'scheme' || type === 'values' ? 6 : type === 'text' ? 12 : 4;
    setWidgets(ws => [...ws, { id: Date.now(), type, w, content }]);
    toast.success('Виджет добавлен');
  };
  const removeWidget = (id) => {
    const removed = widgets.find(w => w.id === id);
    setWidgets(ws => ws.filter(w => w.id !== id));
    toast.success('Виджет удалён', undefined, { action: { label: 'Отменить', onClick: () => setWidgets(ws => [...ws, removed]) } });
  };
  const resizeWidget = (id, newW) => setWidgets(ws => ws.map(w => w.id === id ? { ...w, w: newW } : w));

  return (
    <>
      <PageHeader
        title="Блоки"
        description="Производственный контур · обновление данных каждые 5 секунд"
        actions={mode === 'view' ? (
          <>
            <button className="btn btn--secondary" onClick={() => toast.info('Формируется PDF-отчёт…')}><IconDownload size={14}/> Экспорт</button>
            <button className="btn btn--primary" onClick={() => setMode('edit')}><IconEdit size={14}/> Редактировать</button>
          </>
        ) : (
          <>
            <button className="btn btn--brand" onClick={() => setAddModal(true)}><IconPlus size={14}/> Добавить виджет</button>
            <button className="btn btn--success" onClick={() => { setMode('view'); toast.success('Изменения сохранены'); }}>
              <IconCheck size={14}/> Готово
            </button>
          </>
        )}
      />
      <div style={{ padding: '0 32px 40px' }}>
        {mode === 'edit' && (
          <div className="alert alert--info" style={{ marginBottom: 16 }}>
            <IconInfo size={18} className="alert__icon"/>
            <div>
              <div className="alert__title">Режим редактирования</div>
              <div className="alert__body">Можно менять ширину виджета через <b>◄►</b> ручку справа, удалять через <b>×</b>, добавлять разные типы через кнопку <b>+ Добавить виджет</b>.</div>
            </div>
          </div>
        )}
        <div data-widget-grid>
          <WidgetGrid>
            {widgets.map(widget => renderWidget(
              widget, mode === 'edit',
              () => removeWidget(widget.id),
              (newW) => resizeWidget(widget.id, newW),
              (chartId) => setWidgets(ws => ws.map(w => w.id === widget.id ? { ...w, content: { chartId } } : w)),
            ))}
          </WidgetGrid>
        </div>

        {widgets.length === 0 && (
          <div className="card" style={{ padding: '48px 20px' }}>
            <div className="state" style={{ padding: 0 }}>
              <IconGrid size={40} style={{ color: 'var(--ink-300)' }}/>
              <div className="state__title">Пустой дашборд</div>
              <div className="state__body">Добавьте первый виджет.</div>
              <button className="btn btn--brand" onClick={() => setAddModal(true)}><IconPlus size={14}/> Добавить виджет</button>
            </div>
          </div>
        )}
      </div>
      <AddWidgetModal open={addModal} onClose={() => setAddModal(false)} onAdd={addWidget}/>
    </>
  );
}

Object.assign(window, { DashboardPage, WidgetGrid, WidgetShell, renderWidget, AddWidgetModal, LinkWidget, TextWidget, SupersetWidget, SchemeWidget, SubstationScheme, ValuesWidget, ValueFieldEditor, SourceBadge });
