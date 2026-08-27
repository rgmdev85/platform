// «Значения» — справочник настроенных виджетов «Значения» (в Настройках платформы)
// Справочник виджетов «Значения». Данные — из глобального mockValuesDirectoryList.

const { useState: uSV } = React;

// Alias для обратной совместимости в App.jsx
const mockValuesDirectory = mockValuesDirectoryList;

function ValuesDirectoryPage() {
  const [items, setItems] = uSV(mockValuesDirectoryList);
  const [addOpen, setAddOpen] = uSV(false);
  const [editing, setEditing] = uSV(null);
  const [deleting, setDeleting] = uSV(null);
  const [query, setQuery] = uSV('');
  const [sortBy, setSortBy] = uSV('lastUpdate');
  const [sortDir, setSortDir] = uSV('desc');
  const toast = useToast();

  const filtered = React.useMemo(() => {
    let list = items;
    if (query) list = list.filter(v => v.name.toLowerCase().includes(query.toLowerCase()));
    list = [...list].sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [items, query, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const save = (data) => {
    if (editing) {
      setItems(list => list.map(v => v.id === editing.id ? { ...v, ...data } : v));
      toast.success('Виджет «Значения» обновлён', data.name);
    } else {
      const newItem = { id: Date.now(), ...data, createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '), lastUpdate: '—', usedIn: [] };
      setItems(list => [newItem, ...list]);
      toast.success('Виджет «Значения» создан', `${data.name} · ${data.fieldsCount} полей`);
    }
    setAddOpen(false);
    setEditing(null);
  };

  const doDelete = () => {
    const inUse = deleting.usedIn.length > 0;
    if (inUse) {
      toast.error('Нельзя удалить', `${deleting.name} используется на страницах: ${deleting.usedIn.join(', ')}`);
      setDeleting(null);
      return;
    }
    setItems(list => list.filter(v => v.id !== deleting.id));
    toast.success('Удалено', `${deleting.name}`, {
      action: { label: 'Отменить', onClick: () => setItems(list => [deleting, ...list]) }
    });
    setDeleting(null);
  };

  const sourceBadges = (sources) => sources.map((s, i) => {
    const cfg = {
      'ТИ':      { bg: 'var(--info-soft)',    color: 'var(--info)',    icon: <IconActivity size={10}/> },
      'ТС':      { bg: 'var(--warning-soft)', color: 'var(--warning)', icon: <IconZap size={10}/> },
      'DWH':     { bg: 'var(--success-soft)', color: 'var(--success)', icon: <IconDatabase size={10}/> },
      'ручное':  { bg: 'var(--ink-100)',      color: 'var(--ink-500)', icon: <IconEdit size={10}/> },
    }[s] || { bg: 'var(--ink-100)', color: 'var(--ink-500)' };
    return (
      <span key={i} style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '2px 6px', borderRadius: 'var(--r-sm)',
        background: cfg.bg, color: cfg.color,
        fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
        letterSpacing: '.03em',
      }}>{cfg.icon} {s}</span>
    );
  });

  return (
    <>
      <PageHeader
        title="Текущие параметры"
        description={`${items.length} настроенных виджетов «Текущие параметры» · привязки к ТИ, ТС и витринам DWH`}
        actions={
          <>
            <div className="input-wrap" style={{ width: 240 }}>
              <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}/>
              <input className="input" placeholder="Поиск значений…" value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 32, height: 36 }}/>
            </div>
            <button className="btn btn--brand" onClick={() => { setEditing(null); setAddOpen(true); }}>
              <IconPlus size={14}/> Создать значение
            </button>
          </>
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        <div className="alert alert--info" style={{ marginBottom: 16 }}>
          <IconInfo size={18} className="alert__icon"/>
          <div>
            <div className="alert__body">
              Виджеты «KPI / Числовые показатели» — переиспользуемые KPI-карточки. Каждое поле привязывается к <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/telemetry'; }}><b>телеизмерению</b></a>, <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/telesignals'; }}><b>телесигналу</b></a> или SQL-запросу к <b>витрине DWH</b>. Отдельно от привязки можно использовать ручное значение.
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 32 }}><label className="check"><input type="checkbox"/></label></th>
                <th className={`sortable ${sortBy === 'name' ? 'sorted' : ''}`} onClick={() => toggleSort('name')}>
                  Имя <span className="sort-icon">{sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th className="num">Полей</th>
                <th>Источники данных</th>
                <th>Используется на страницах</th>
                <th className={`sortable ${sortBy === 'lastUpdate' ? 'sorted' : ''}`} onClick={() => toggleSort('lastUpdate')}>
                  Последнее обновление <span className="sort-icon">{sortBy === 'lastUpdate' ? (sortDir === 'asc' ? '↑' : '↓') : '↓'}</span>
                </th>
                <th style={{ textAlign: 'right', width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td><label className="check"><input type="checkbox"/></label></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconActivity size={14} style={{ color: 'var(--eae-red)' }}/>
                      <span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{v.name}</span>
                    </div>
                  </td>
                  <td className="num">{v.fieldsCount}</td>
                  <td>
                    <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
                      {sourceBadges(v.sources)}
                    </div>
                  </td>
                  <td>
                    {v.usedIn.length === 0
                      ? <span className="muted" style={{ fontStyle: 'italic', fontSize: 12 }}>не используется</span>
                      : (
                        <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
                          {v.usedIn.map((p, i) => (
                            <span key={i} className="badge badge--neutral">{p}</span>
                          ))}
                        </div>
                      )
                    }
                  </td>
                  <td className="mono" style={{ color: v.lastUpdate === '—' ? 'var(--ink-400)' : 'inherit' }}>{v.lastUpdate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <RowActions
                      onEdit={() => { setEditing(v); setAddOpen(true); }}
                      onDelete={() => setDeleting(v)}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="state" style={{ padding: '40px 20px' }}>
                    <IconActivity size={40} style={{ color: 'var(--ink-300)' }}/>
                    <div className="state__title">Ничего не найдено</div>
                    <div className="state__body">Измените поисковый запрос или создайте новый виджет «Значения».</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid var(--ink-100)' }}>
            <Pager page={1} pageSize={50} total={filtered.length} onPageChange={() => {}} onSizeChange={() => {}}/>
          </div>
        </div>
      </div>

      <AddValueDirectoryModal
        open={addOpen}
        onClose={() => { setAddOpen(false); setEditing(null); }}
        onSave={save}
        initial={editing}
      />
      <ConfirmDelete
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        entity="KPI-виджет"
        name={deleting?.name}
      />
    </>
  );
}

// ============ Быстрая модалка создания записи в справочнике «Значения» ============
// Не редактор полей — просто карточка справочника. Полноценный редактор — на дашборде через AddWidgetModal.
function AddValueDirectoryModal({ open, onClose, onSave, initial }) {
  const [name, setName] = uSV(initial?.name || '');
  const [fieldsCount, setFieldsCount] = uSV(initial?.fieldsCount || 1);
  const [sources, setSources] = uSV(initial?.sources || []);

  React.useEffect(() => {
    if (open) {
      setName(initial?.name || '');
      setFieldsCount(initial?.fieldsCount || 1);
      setSources(initial?.sources || []);
    }
  }, [open, initial]);

  const toggleSource = (s) => {
    setSources(list => list.includes(s) ? list.filter(x => x !== s) : [...list, s]);
  };

  const valid = name.trim() && fieldsCount > 0 && sources.length > 0;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Редактировать KPI' : 'Создать KPI-виджет'}
      desc="Справочная карточка виджета «KPI / Числовые показатели». Полное редактирование полей — при размещении виджета на странице."
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn--brand" disabled={!valid} onClick={() => onSave({ name, fieldsCount, sources })}>
            {initial ? 'Сохранить' : 'Создать'}
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Имя виджета <span className="form-label__required">*</span></label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Например: Оперативные показатели"/>
        <div className="form-help">Уникальное имя, отображается в списке значений и при добавлении на страницу.</div>
      </div>
      <div className="form-group">
        <label className="form-label">Количество полей <span className="form-label__required">*</span></label>
        <input className="input" type="number" min="1" max="12" value={fieldsCount} onChange={e => setFieldsCount(Number(e.target.value) || 1)}/>
        <div className="form-help">От 1 до 12. Каждое поле — отдельный KPI со своим источником данных.</div>
      </div>
      <div className="form-group">
        <label className="form-label">Источники данных <span className="form-label__required">*</span></label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            { k: 'ручное',  desc: 'Ручное',       icon: <IconEdit size={14}/> },
            { k: 'ТИ',      desc: 'Телеизмерение', icon: <IconActivity size={14}/> },
            { k: 'ТС',      desc: 'Телесигнал',    icon: <IconZap size={14}/> },
            { k: 'DWH',     desc: 'Витрина DWH',   icon: <IconDatabase size={14}/> },
          ].map(opt => {
            const active = sources.includes(opt.k);
            return (
              <button
                key={opt.k}
                onClick={() => toggleSource(opt.k)}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                  padding: '10px 6px',
                  background: active ? 'var(--info-soft)' : 'var(--ink-000)',
                  border: `1.5px solid ${active ? 'var(--info)' : 'var(--ink-200)'}`,
                  borderRadius: 'var(--r-md)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  color: active ? 'var(--info-hover)' : 'var(--ink-700)',
                }}
              >
                <span style={{ color: active ? 'var(--info)' : 'var(--ink-500)' }}>{opt.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 500 }}>{opt.desc}</span>
              </button>
            );
          })}
        </div>
        <div className="form-help">Отметьте типы источников, которые будут использоваться в полях. Можно выбрать несколько.</div>
      </div>
    </Modal>
  );
}

Object.assign(window, { ValuesDirectoryPage, mockValuesDirectory: mockValuesDirectoryList });
