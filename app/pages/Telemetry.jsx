// Управление телеизмерениями — таблица + сложная модалка добавления с accordion

const { useState: uST } = React;

function AddTelemetryModal({ open, onClose, onSave }) {
  const [showNewProtocol, setShowNewProtocol] = uST(false);
  const [useDefaults, setUseDefaults] = uST(true);
  const [form, setForm] = uST({
    // new protocol subform
    stdProtocol: 'МЭК-104', protoName: '', portAddr: '', ipServer: '', stationAddr: '',
    // main
    protocol: 'МЭК-104-1', address: '', name: '', signalType: 'Float',
  });
  const [errors, setErrors] = uST({});

  React.useEffect(() => {
    if (open) {
      setShowNewProtocol(false);
      setUseDefaults(true);
      setErrors({});
      setForm({ stdProtocol: 'МЭК-104', protoName: '', portAddr: '', ipServer: '', stationAddr: '', protocol: 'МЭК-104-1', address: '', name: '', signalType: 'Float' });
    }
  }, [open]);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.address.trim()) e.address = 'Обязательное поле';
    if (!form.name.trim()) e.name = 'Обязательное поле';
    if (showNewProtocol) {
      if (!form.protoName.trim()) e.protoName = 'Обязательное поле';
      if (!form.ipServer.trim() || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(form.ipServer)) e.ipServer = 'Неверный формат IP';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(form);
  };

  const canSubmit = form.address && form.name;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Добавление телеизмерения"
      desc="Создайте новое поле измерения. Опционально можно создать новый протокол на лету."
      size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Назад</button>
          <button className="btn btn--brand" disabled={!canSubmit} onClick={submit}>
            Сохранить телеизмерение
          </button>
        </>
      }
    >
      {/* Accordion: создать новый протокол */}
      <div className={`accordion ${showNewProtocol ? 'accordion--open' : ''}`} style={{ marginBottom: 16 }}>
        <div className="accordion__head" onClick={() => setShowNewProtocol(v => !v)}>
          <IconChevronRight size={14}/>
          <span>Создать новый протокол</span>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-500)' }}>{showNewProtocol ? 'скрыть' : 'необязательно'}</span>
        </div>
        {showNewProtocol && (
          <div className="accordion__body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Стандарт протокола</label>
                <select className="select" value={form.stdProtocol} onChange={e => upd('stdProtocol', e.target.value)}>
                  {PROTOCOL_OPTIONS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Имя протокола для ТМ <span className="form-label__required">*</span></label>
                <input className={`input ${errors.protoName ? 'input--error' : ''}`} value={form.protoName} onChange={e => upd('protoName', e.target.value)} placeholder="МЭК-104-3"/>
                {errors.protoName && <div className="form-error"><IconAlert size={12}/> {errors.protoName}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Адрес порта</label>
                <input className="input" value={form.portAddr} onChange={e => upd('portAddr', e.target.value)} placeholder="8700"/>
              </div>
              <div className="form-group">
                <label className="form-label">IP сервера <span className="form-label__required">*</span></label>
                <input className={`input ${errors.ipServer ? 'input--error' : ''}`} value={form.ipServer} onChange={e => upd('ipServer', e.target.value)} placeholder="10.77.116.02"/>
                {errors.ipServer && <div className="form-error"><IconAlert size={12}/> {errors.ipServer}</div>}
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Адрес станции (МЭК-104) / Name Space (OPC UA)</label>
                <input className="input" value={form.stationAddr} onChange={e => upd('stationAddr', e.target.value)}/>
              </div>
            </div>
          </div>
        )}
      </div>

      <label className="check" style={{ marginBottom: 16 }}>
        <input type="checkbox" checked={useDefaults} onChange={e => setUseDefaults(e.target.checked)}/>
        Использовать типовые параметры
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group">
          <label className="form-label">Протокол</label>
          <select className="select" value={form.protocol} onChange={e => upd('protocol', e.target.value)}>
            {mockProtocols.map(p => <option key={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Адрес телеизмерения <span className="form-label__required">*</span></label>
          <input className={`input ${errors.address ? 'input--error' : ''}`} value={form.address} onChange={e => upd('address', e.target.value)} placeholder="135"/>
          {errors.address && <div className="form-error"><IconAlert size={12}/> {errors.address}</div>}
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Имя телеизмерения <span className="form-label__required">*</span></label>
          <input className={`input ${errors.name ? 'input--error' : ''}`} value={form.name} onChange={e => upd('name', e.target.value)} placeholder="Например: b1-температура"/>
          {errors.name && <div className="form-error"><IconAlert size={12}/> {errors.name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Тип сигнала</label>
          <select className="select" value={form.signalType} onChange={e => upd('signalType', e.target.value)}>
            <option>Float</option>
            <option>Int</option>
            <option>Bool</option>
            <option>String</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

function TelemetryPage() {
  const [items, setItems] = uST(mockTelemetry);
  const [addOpen, setAddOpen] = uST(false);
  const [deleting, setDeleting] = uST(null);
  const [selected, setSelected] = uST([]);
  const [filters, setFilters] = uST([
    { label: 'Блок', value: 'Блок_1, Блок_2' },
    { label: 'Тип', value: 'Float' },
  ]);
  const [page, setPage] = uST(1);
  const [pageSize, setPageSize] = uST(20);
  const toast = useToast();

  const totalPages = Math.ceil(items.length / pageSize);
  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  const save = (data) => {
    const newItem = {
      id: Date.now(),
      time: new Date().toISOString().slice(0, 19).replace('T', ' '),
      block: data.protocol.includes('Блок') ? data.protocol : '—',
      name: data.name,
      signalType: data.signalType,
      quality: 1,
      value: '—',
    };
    setItems(is => [newItem, ...is]);
    toast.success('Телеизмерение добавлено', `${data.name} создано`);
    setAddOpen(false);
  };

  const doDelete = () => {
    setItems(is => is.filter(i => i.id !== deleting.id));
    toast.success('Телеизмерение удалено', `${deleting.name} убрано`, {
      action: { label: 'Отменить', onClick: () => setItems(is => [deleting, ...is]) }
    });
    setDeleting(null);
  };

  const bulkDelete = () => {
    setItems(is => is.filter(i => !selected.includes(i.id)));
    toast.success(`Удалено ${selected.length} записей`);
    setSelected([]);
  };

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(pagedItems.every(i => selected.includes(i.id)) ? [] : pagedItems.map(i => i.id));

  return (
    <>
      <PageHeader
        title="Аналоговые параметры (ТИ)"
        description={`${items.length} аналоговых параметров · live-обновление каждые 5 сек`}
        actions={
          <>
            <button className="btn btn--secondary"><IconDownload size={14}/> Экспорт CSV</button>
            <button className="btn btn--brand" onClick={() => setAddOpen(true)}>
              <IconPlus size={14}/> Создать поле измерения
            </button>
          </>
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        <div className="alert alert--info" style={{ marginBottom: 16 }}>
          <IconInfo size={18} className="alert__icon"/>
          <div>
            <div className="alert__body">
              Телеизмерения (ТИ) выстраиваются на основе <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/protocols'; }}><b>протоколов приёма данных</b></a> и привязываются к <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/schemes'; }}><b>схемам</b></a> и <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/charts'; }}><b>графикам</b></a>.
            </div>
          </div>
        </div>

        <FilterBar
          filters={filters}
          onRemove={(i) => setFilters(f => f.filter((_, idx) => idx !== i))}
          onClearAll={() => setFilters([])}
          onAdd={() => toast.info('Открывается панель фильтров…')}
          resultCount={items.length}
        />

        {selected.length > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 16px', marginBottom: 12,
            background: 'var(--info-soft)', border: '1px solid rgba(31,111,235,.24)',
            borderRadius: 'var(--r-md)',
          }}>
            <span style={{ fontWeight: 500, color: 'var(--info-hover)' }}>Выбрано: {selected.length}</span>
            <button className="btn btn--secondary btn--sm">Изменить блок…</button>
            <button className="btn btn--danger btn--sm" onClick={bulkDelete}><IconTrash size={12}/> Удалить выбранные</button>
            <button className="btn btn--ghost btn--sm" onClick={() => setSelected([])} style={{ marginLeft: 'auto' }}>Снять выделение</button>
          </div>
        )}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 32 }}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={pagedItems.length > 0 && pagedItems.every(i => selected.includes(i.id))}
                      onChange={toggleAll}
                    />
                  </label>
                </th>
                <th className="sortable sorted">Время прихода сигнала <span className="sort-icon">↓</span></th>
                <th className="sortable">Блок / Схема</th>
                <th className="sortable">Имя</th>
                <th className="sortable">Тип сигнала</th>
                <th className="sortable num">Код качества</th>
                <th className="num">Последнее значение</th>
                <th style={{ textAlign: 'right', width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.map(t => (
                <tr key={t.id} className={selected.includes(t.id) ? 'selected' : ''}>
                  <td><label className="check"><input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggle(t.id)}/></label></td>
                  <td className="mono">{t.time}</td>
                  <td>{t.block === '—' ? <span className="muted">—</span> : <span className="badge badge--neutral">{t.block}</span>}</td>
                  <td style={{ fontWeight: 500, color: 'var(--ink-800)' }}>{t.name}</td>
                  <td><span className="badge badge--info">{t.signalType}</span></td>
                  <td className="num" style={{ color: t.quality === 0 ? 'var(--danger)' : undefined, fontWeight: t.quality === 0 ? 600 : undefined }}>{t.quality}</td>
                  <td className="num">{t.value}</td>
                  <td style={{ textAlign: 'right' }}>
                    <RowActions
                      onEdit={() => toast.info(`Настройки: ${t.name}`)}
                      onDelete={() => setDeleting(t)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid var(--ink-100)' }}>
            <Pager page={page} pageSize={pageSize} total={items.length} onPageChange={setPage} onSizeChange={(s) => { setPageSize(s); setPage(1); }}/>
          </div>
        </div>
      </div>

      <AddTelemetryModal open={addOpen} onClose={() => setAddOpen(false)} onSave={save}/>
      <ConfirmDelete open={!!deleting} onClose={() => setDeleting(null)} onConfirm={doDelete} entity="телеизмерение" name={deleting?.name}/>
    </>
  );
}

Object.assign(window, { TelemetryPage });
