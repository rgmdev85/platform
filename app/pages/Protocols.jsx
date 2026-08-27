// Управление протоколами — список + модалка добавления/редактирования

const { useState: uSP } = React;

const PROTOCOL_OPTIONS = ['МЭК-104', 'Modbus RTU', 'Modbus TCP/IP', 'OPC UA'];

function AddProtocolModal({ open, onClose, onSave, initial }) {
  const [form, setForm] = uSP({ name: '', protocol: 'МЭК-104', ipServer: '', backupIp: '', port: '', stationAddr: '' });
  const [errors, setErrors] = uSP({});

  React.useEffect(() => {
    if (open) {
      setForm(initial || { name: '', protocol: 'МЭК-104', ipServer: '', backupIp: '', port: '', stationAddr: '' });
      setErrors({});
    }
  }, [open, initial]);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Обязательное поле';
    if (!form.ipServer.trim()) e.ipServer = 'Обязательное поле';
    else if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(form.ipServer)) e.ipServer = 'Неверный формат IP-адреса';
    if (form.backupIp && !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(form.backupIp)) e.backupIp = 'Неверный формат IP-адреса';
    if (!form.port) e.port = 'Обязательное поле';
    else if (isNaN(Number(form.port)) || Number(form.port) < 1 || Number(form.port) > 65535) e.port = 'Значение вне диапазона 1–65535';
    if (!form.stationAddr.trim()) e.stationAddr = 'Обязательное поле';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave(form);
  };

  const isValid = form.name && form.ipServer && form.port && form.stationAddr && Object.keys(errors).length === 0;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Редактировать протокол' : 'Добавление протокола'}
      desc="Настройте параметры источника данных телеметрии."
      size="lg"
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn--brand" disabled={!isValid} onClick={submit}>
            {initial ? 'Сохранить изменения' : 'Сохранить протокол'}
          </button>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Имя протокола для ТМ <span className="form-label__required">*</span></label>
          <input className={`input ${errors.name ? 'input--error' : ''}`} value={form.name} onChange={e => update('name', e.target.value)} placeholder="Например: МЭК-104-1"/>
          {errors.name && <div className="form-error"><IconAlert size={12}/> {errors.name}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Протокол <span className="form-label__required">*</span></label>
          <select className="select" value={form.protocol} onChange={e => update('protocol', e.target.value)}>
            {PROTOCOL_OPTIONS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Адрес порта <span className="form-label__required">*</span><span className="form-label__hint">1–65535</span></label>
          <input className={`input ${errors.port ? 'input--error' : ''}`} value={form.port} onChange={e => update('port', e.target.value)} placeholder="8700"/>
          {errors.port && <div className="form-error"><IconAlert size={12}/> {errors.port}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">IP сервера <span className="form-label__required">*</span></label>
          <input className={`input ${errors.ipServer ? 'input--error' : ''}`} value={form.ipServer} onChange={e => update('ipServer', e.target.value)} placeholder="10.77.116.02"/>
          {errors.ipServer && <div className="form-error"><IconAlert size={12}/> {errors.ipServer}</div>}
        </div>
        <div className="form-group">
          <label className="form-label">Резервный IP сервера <span className="form-label__hint">опционально</span></label>
          <input className={`input ${errors.backupIp ? 'input--error' : ''}`} value={form.backupIp} onChange={e => update('backupIp', e.target.value)} placeholder="10.77.116.03"/>
          {errors.backupIp && <div className="form-error"><IconAlert size={12}/> {errors.backupIp}</div>}
        </div>
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label className="form-label">Адрес станции (МЭК-104) / Name Space (OPC UA) <span className="form-label__required">*</span></label>
          <input className={`input ${errors.stationAddr ? 'input--error' : ''}`} value={form.stationAddr} onChange={e => update('stationAddr', e.target.value)} placeholder="Для МЭК-104 обычно 1–65535"/>
          {errors.stationAddr && <div className="form-error"><IconAlert size={12}/> {errors.stationAddr}</div>}
          <div className="form-help">Для МЭК-104 — числовой адрес станции. Для OPC UA — namespace URI.</div>
        </div>
      </div>
    </Modal>
  );
}

function ProtocolsPage() {
  const [protocols, setProtocols] = uSP(mockProtocols);
  const [addOpen, setAddOpen] = uSP(false);
  const [editing, setEditing] = uSP(null);
  const [deleting, setDeleting] = uSP(null);
  const [query, setQuery] = uSP('');
  const toast = useToast();

  const filtered = protocols.filter(p =>
    !query || p.name.toLowerCase().includes(query.toLowerCase()) || p.ipServer.includes(query)
  );

  const save = (data) => {
    if (editing) {
      setProtocols(ps => ps.map(p => p.id === editing.id ? { ...p, ...data } : p));
      toast.success('Протокол обновлён', `${data.name} сохранён`);
    } else {
      setProtocols(ps => [{ id: Date.now(), ...data }, ...ps]);
      toast.success('Протокол создан', `${data.name} добавлен в список активных`);
    }
    setAddOpen(false);
    setEditing(null);
  };

  const doDelete = () => {
    setProtocols(ps => ps.filter(p => p.id !== deleting.id));
    toast.success('Протокол удалён', `${deleting.name} убран из списка`, {
      action: { label: 'Отменить', onClick: () => setProtocols(ps => [deleting, ...ps]) }
    });
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Сбор и первичная обработка данных"
        description={`${protocols.length} активных источников данных`}
        actions={
          <>
            <div className="input-wrap" style={{ width: 240 }}>
              <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}/>
              <input className="input" placeholder="Поиск протоколов…" value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 32, height: 36 }}/>
            </div>
            <button className="btn btn--brand" onClick={() => { setEditing(null); setAddOpen(true); }}>
              <IconPlus size={14}/> Создать протокол
            </button>
          </>
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable sorted">Имя <span className="sort-icon">↓</span></th>
                <th>Протокол</th>
                <th className="num">Адрес станции / NS</th>
                <th className="num">Порт</th>
                <th>IP сервера</th>
                <th>Резервный IP</th>
                <th style={{ textAlign: 'right', width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconCode size={14} style={{ color: 'var(--ink-400)' }}/>
                      <span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{p.name}</span>
                    </div>
                  </td>
                  <td><span className="badge badge--info">{p.protocol}</span></td>
                  <td className="mono">{p.stationAddr}</td>
                  <td className="num">{p.port}</td>
                  <td className="mono">{p.ipServer}</td>
                  <td className="mono" style={{ color: p.backupIp === '—' ? 'var(--ink-400)' : 'inherit' }}>{p.backupIp}</td>
                  <td style={{ textAlign: 'right' }}>
                    <RowActions
                      onEdit={() => { setEditing(p); setAddOpen(true); }}
                      onDelete={() => setDeleting(p)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ borderTop: '1px solid var(--ink-100)' }}>
            <Pager page={1} pageSize={50} total={filtered.length} onPageChange={() => {}} onSizeChange={() => {}}/>
          </div>
        </div>
      </div>

      <AddProtocolModal open={addOpen} onClose={() => { setAddOpen(false); setEditing(null); }} onSave={save} initial={editing}/>
      <ConfirmDelete open={!!deleting} onClose={() => setDeleting(null)} onConfirm={doDelete} entity="протокол" name={deleting?.name}/>
    </>
  );
}

Object.assign(window, { ProtocolsPage });
