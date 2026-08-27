// Форма создания виджета «График»: оси / линии / индикаторы / отклонения

const { useState: uSCF } = React;

// Мини-компонент выбора цвета из палитры
function ColorSwatchPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {LINE_COLORS.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: 24, height: 24, borderRadius: 'var(--r-sm)',
            background: c,
            border: value === c ? '2px solid var(--ink-900)' : '2px solid transparent',
            outline: value === c ? '1px solid var(--ink-000)' : 'none',
            outlineOffset: -3,
            cursor: 'pointer',
            transition: 'transform 120ms',
            transform: value === c ? 'scale(1.1)' : 'scale(1)',
          }}
          title={c}
          aria-label={`Цвет ${c}`}
        />
      ))}
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ width: 24, height: 24, border: '1px dashed var(--ink-300)', borderRadius: 'var(--r-sm)', padding: 0, cursor: 'pointer', background: 'var(--ink-000)' }}
        title="Свой цвет"
      />
    </div>
  );
}

function LineStylePicker({ value, onChange }) {
  const options = [
    { key: 'solid',   label: 'Сплошная' },
    { key: 'dashed',  label: 'Пунктир'  },
    { key: 'dotted',  label: 'Точечная' },
    { key: 'dashdot', label: 'Штрих-пунктир' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
      {options.map(opt => {
        const active = value === opt.key;
        const style = LINE_STYLES[opt.key];
        return (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px',
              background: active ? 'var(--info-soft)' : 'var(--ink-000)',
              border: `1px solid ${active ? 'var(--info)' : 'var(--ink-200)'}`,
              borderRadius: 'var(--r-sm)',
              cursor: 'pointer',
              fontSize: 12,
              color: active ? 'var(--info-hover)' : 'var(--ink-700)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <svg width="32" height="6" style={{ flexShrink: 0 }}>
              <line x1="0" y1="3" x2="32" y2="3"
                    stroke={active ? 'var(--info-hover)' : 'var(--ink-700)'}
                    strokeWidth={style.width}
                    strokeDasharray={style.dasharray}/>
            </svg>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// Компактный picker источника данных (ТИ/ТС/DWH/manual/новое ТИ)
function DataSourcePicker({ source, onChange }) {
  const toast = useToast();
  const kind = source?.kind || 'manual';
  const setKind = (k) => {
    if (k === 'new-ti') {
      toast.info('Открывается форма создания телеизмерения…');
      return;
    }
    if (k === 'manual') onChange({ kind: 'manual' });
    else if (k === 'dwh') onChange({ kind: 'dwh', query: '' });
    else onChange({ kind: k, ref: '' });
  };
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, padding: 3, background: 'var(--ink-100)', borderRadius: 'var(--r-sm)', marginBottom: 6 }}>
        {[
          { k: 'manual',    label: 'Ручное',  icon: <IconEdit size={12}/> },
          { k: 'telemetry', label: 'ТИ',      icon: <IconActivity size={12}/> },
          { k: 'telesignal',label: 'ТС',      icon: <IconZap size={12}/> },
          { k: 'dwh',       label: 'Витрина', icon: <IconDatabase size={12}/> },
          { k: 'new-ti',    label: '+ создать', icon: <IconPlus size={12}/> },
        ].map(opt => (
          <button
            key={opt.k}
            onClick={() => setKind(opt.k)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              padding: '5px 4px',
              background: kind === opt.k ? 'var(--ink-000)' : 'transparent',
              border: kind === opt.k ? '1px solid var(--ink-200)' : '1px solid transparent',
              borderRadius: 'var(--r-sm)',
              fontSize: 11, fontWeight: 500,
              color: kind === opt.k ? 'var(--ink-900)' : 'var(--ink-600)',
              cursor: 'pointer', fontFamily: 'var(--font-sans)',
              boxShadow: kind === opt.k ? 'var(--shadow-xs)' : 'none',
            }}
          >
            {opt.icon} {opt.label}
          </button>
        ))}
      </div>
      {kind === 'telemetry' && (
        <select className="select" value={source?.ref || ''} onChange={e => onChange({ kind: 'telemetry', ref: e.target.value })}>
          <option value="">— выберите ТИ —</option>
          {mockTelemetry.slice(0, 20).map(t => <option key={t.id} value={t.name}>{t.name} · {t.block || '—'}</option>)}
        </select>
      )}
      {kind === 'telesignal' && (
        <select className="select" value={source?.ref || ''} onChange={e => onChange({ kind: 'telesignal', ref: e.target.value })}>
          <option value="">— выберите ТС —</option>
          <option>ТС-выключатель_Q1</option>
          <option>ТС-разъединитель_QS1</option>
          <option>ТС-АВР_готов</option>
          <option>ТС-защита_МТЗ</option>
        </select>
      )}
      {kind === 'dwh' && (
        <textarea
          className="textarea"
          value={source?.query || ''}
          onChange={e => onChange({ kind: 'dwh', query: e.target.value })}
          placeholder="SELECT hour, value FROM gold.production_plan WHERE date = current_date"
          style={{ minHeight: 52, fontFamily: 'var(--font-mono)', fontSize: 12 }}
        />
      )}
    </div>
  );
}

// ============ AddChartForm — полная форма ============
function AddChartForm({ data, onChange }) {
  const chart = data;
  const upd = (patch) => onChange({ ...chart, ...patch });
  const updAxis = (axis, patch) => upd({ [axis]: { ...chart[axis], ...patch } });
  const updLine = (id, patch) => upd({ lines: chart.lines.map(l => l.id === id ? { ...l, ...patch } : l) });
  const addLine = () => upd({ lines: [...chart.lines, { id: Date.now(), label: '', color: LINE_COLORS[chart.lines.length % LINE_COLORS.length], style: 'solid', dataKey: 'plan', source: { kind: 'manual' } }] });
  const removeLine = (id) => upd({ lines: chart.lines.filter(l => l.id !== id) });
  const updInd = (id, patch) => upd({ indicators: chart.indicators.map(i => i.id === id ? { ...i, ...patch } : i) });
  const addInd = () => upd({ indicators: [...chart.indicators, { id: Date.now(), kind: 'temp', label: '', value: 0, unit: '°C', source: { kind: 'manual' } }] });
  const removeInd = (id) => upd({ indicators: chart.indicators.filter(i => i.id !== id) });

  return (
    <>
      {/* 1. Основное */}
      <FormSection title="1. Основное" defaultOpen>
        <div className="form-group">
          <label className="form-label">Название графика <span className="form-label__required">*</span></label>
          <input className="input" value={chart.title} onChange={e => upd({ title: e.target.value })} placeholder="Например: Производственный график"/>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Описание <span className="form-label__hint">опционально</span></label>
          <input className="input" value={chart.description} onChange={e => upd({ description: e.target.value })} placeholder="Например: обновлено 09:56 · Modbus TCP"/>
        </div>
      </FormSection>

      {/* 2. Оси */}
      <FormSection title="2. Оси координат" defaultOpen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Ось X (горизонталь)</div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Название</label>
              <input className="input" value={chart.xAxis.label} onChange={e => updAxis('xAxis', { label: e.target.value })} placeholder="Время"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ед. изм.</label>
                <input className="input" value={chart.xAxis.unit} onChange={e => updAxis('xAxis', { unit: e.target.value })} placeholder="ч"/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">min</label>
                <input className="input" type="number" value={chart.xAxis.min} onChange={e => updAxis('xAxis', { min: Number(e.target.value) })}/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">max</label>
                <input className="input" type="number" value={chart.xAxis.max} onChange={e => updAxis('xAxis', { max: Number(e.target.value) })}/>
              </div>
            </div>
          </div>
          <div>
            <div className="eyebrow" style={{ marginBottom: 6 }}>Ось Y (вертикаль)</div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Название</label>
              <input className="input" value={chart.yAxis.label} onChange={e => updAxis('yAxis', { label: e.target.value })} placeholder="Мощность"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ед. изм.</label>
                <input className="input" value={chart.yAxis.unit} onChange={e => updAxis('yAxis', { unit: e.target.value })} placeholder="МВт"/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">min</label>
                <input className="input" type="number" value={chart.yAxis.min} onChange={e => updAxis('yAxis', { min: Number(e.target.value) })}/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">max</label>
                <input className="input" type="number" value={chart.yAxis.max} onChange={e => updAxis('yAxis', { max: Number(e.target.value) })}/>
              </div>
            </div>
          </div>
        </div>
      </FormSection>

      {/* 3. Линии */}
      <FormSection title={`3. Линии графика (${chart.lines.length})`} defaultOpen>
        {chart.lines.map((ln, i) => (
          <div key={ln.id} style={{
            padding: 12, marginBottom: 8,
            background: 'var(--ink-000)',
            border: '1px solid var(--ink-200)',
            borderRadius: 'var(--r-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 20, height: 20, borderRadius: 'var(--r-sm)',
                background: ln.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, color: '#fff', fontWeight: 700, fontFamily: 'var(--font-mono)',
              }}>{i + 1}</span>
              <b style={{ fontSize: 13, color: 'var(--ink-800)' }}>Линия #{i + 1}</b>
              {chart.lines.length > 1 && (
                <button
                  className="btn btn--ghost btn--icon btn--sm"
                  onClick={() => removeLine(ln.id)}
                  style={{ marginLeft: 'auto', color: 'var(--danger)' }}
                ><IconClose size={14}/></button>
              )}
            </div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Название линии <span className="form-label__required">*</span></label>
              <input className="input" value={ln.label} onChange={e => updLine(ln.id, { label: e.target.value })} placeholder="Например: план, факт, расход сырья 1"/>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
              <div>
                <label className="form-label" style={{ marginBottom: 4 }}>Цвет</label>
                <ColorSwatchPicker value={ln.color} onChange={c => updLine(ln.id, { color: c })}/>
              </div>
              <div>
                <label className="form-label" style={{ marginBottom: 4 }}>Стиль линии</label>
                <LineStylePicker value={ln.style} onChange={s => updLine(ln.id, { style: s })}/>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Источник данных</label>
              <DataSourcePicker source={ln.source} onChange={s => updLine(ln.id, { source: s })}/>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary" onClick={addLine} style={{ width: '100%', justifyContent: 'center' }}>
          <IconPlus size={14}/> Добавить линию
        </button>
      </FormSection>

      {/* 4. Индикаторы (KPI-плашки как в блоке) */}
      <FormSection title={`4. KPI-индикаторы (${chart.indicators.length})`}>
        <div style={{ padding: '8px 10px', marginBottom: 10, background: 'var(--ink-050)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--ink-600)' }}>
          Индикаторы отображаются в правом верхнем углу графика, как в виджете «Блок». Типовые: температура (°C), давление (бар), расход (т/ч).
        </div>
        {chart.indicators.map((ind, i) => (
          <div key={ind.id} style={{
            padding: 12, marginBottom: 8,
            background: 'var(--ink-000)',
            border: '1px solid var(--ink-200)',
            borderRadius: 'var(--r-md)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <b style={{ fontSize: 13, color: 'var(--ink-800)' }}>Индикатор #{i + 1}</b>
              <button
                className="btn btn--ghost btn--icon btn--sm"
                onClick={() => removeInd(ind.id)}
                style={{ marginLeft: 'auto', color: 'var(--danger)' }}
              ><IconClose size={14}/></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 8 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Тип</label>
                <select className="select" value={ind.kind} onChange={e => updInd(ind.id, { kind: e.target.value })}>
                  <option value="temp">Температура</option>
                  <option value="pressure">Давление</option>
                  <option value="flow">Расход</option>
                  <option value="manual">Другое</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Значение</label>
                <input className="input" type="number" step="any" value={ind.value} onChange={e => updInd(ind.id, { value: Number(e.target.value) })}/>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Ед. изм.</label>
                <input className="input" value={ind.unit} onChange={e => updInd(ind.id, { unit: e.target.value })} placeholder="°C / бар / т/ч"/>
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Источник данных</label>
              <DataSourcePicker source={ind.source} onChange={s => updInd(ind.id, { source: s })}/>
            </div>
          </div>
        ))}
        <button className="btn btn--secondary" onClick={addInd} style={{ width: '100%', justifyContent: 'center' }}>
          <IconPlus size={14}/> Добавить индикатор
        </button>
      </FormSection>

      {/* 5. Отклонения */}
      <FormSection title="5. Панель отклонений">
        <div style={{ padding: '8px 10px', marginBottom: 10, background: 'var(--ink-050)', borderRadius: 'var(--r-md)', fontSize: 12, color: 'var(--ink-600)' }}>
          Панель отклонений появляется рядом с индикаторами. Отклонение считается как разница между <b>фактической линией</b> и <b>базовой</b>. При превышении порога срабатывает подсветка на графике.
        </div>
        <label className="check" style={{ marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={!!chart.deviations}
            onChange={e => upd({ deviations: e.target.checked ? { baseLineId: chart.lines[0]?.id, thresholdPos: 3.0, thresholdNeg: -3.0, unit: '%', count: 0 } : null })}
          />
          Включить отслеживание отклонений
        </label>
        {chart.deviations && (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 8 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Базовая линия</label>
              <select
                className="select"
                value={chart.deviations.baseLineId || ''}
                onChange={e => upd({ deviations: { ...chart.deviations, baseLineId: Number(e.target.value) } })}
              >
                {chart.lines.map(l => <option key={l.id} value={l.id}>{l.label || 'Без имени'}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Порог +</label>
              <input
                className="input" type="number" step="0.1"
                value={chart.deviations.thresholdPos}
                onChange={e => upd({ deviations: { ...chart.deviations, thresholdPos: Number(e.target.value) } })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Порог −</label>
              <input
                className="input" type="number" step="0.1"
                value={chart.deviations.thresholdNeg}
                onChange={e => upd({ deviations: { ...chart.deviations, thresholdNeg: Number(e.target.value) } })}
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Ед. изм.</label>
              <select
                className="select"
                value={chart.deviations.unit}
                onChange={e => upd({ deviations: { ...chart.deviations, unit: e.target.value } })}
              >
                <option value="%">%</option>
                <option value="абс">абс</option>
              </select>
            </div>
          </div>
        )}
      </FormSection>
    </>
  );
}

// Секция-аккордеон
function FormSection({ title, defaultOpen, children }) {
  const [open, setOpen] = uSCF(defaultOpen || false);
  return (
    <div className={`accordion ${open ? 'accordion--open' : ''}`} style={{ marginBottom: 12 }}>
      <div className="accordion__head" onClick={() => setOpen(v => !v)}>
        <IconChevronRight size={14}/>
        <span>{title}</span>
      </div>
      {open && <div className="accordion__body">{children}</div>}
    </div>
  );
}

// Дефолтный шаблон нового графика
const defaultChartData = () => ({
  title: '',
  description: '',
  xAxis: { label: 'Время', unit: 'ч', min: 0, max: 24 },
  yAxis: { label: 'Значение', unit: 'МВт', min: 0, max: 200 },
  lines: [
    { id: 1, label: 'план', color: '#8A96A3', style: 'dashed', dataKey: 'plan', source: { kind: 'dwh', query: '' } },
    { id: 2, label: 'факт', color: '#C0392B', style: 'solid',  dataKey: 'fact', source: { kind: 'telemetry', ref: '' } },
  ],
  indicators: [],
  deviations: null,
});

Object.assign(window, { AddChartForm, defaultChartData, ColorSwatchPicker, LineStylePicker, DataSourcePicker, FormSection });
