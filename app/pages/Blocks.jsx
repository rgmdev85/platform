// Управление блоками — список + модалка добавления/редактирования

const { useState: uSB } = React;

function AddBlockModal({ open, onClose, onSave, initial }) {
  const [modbusId, setModbusId] = uSB(initial?.modbusId || '');
  const [name, setName] = uSB(initial?.name || '');
  const [errors, setErrors] = uSB({});
  React.useEffect(() => {
    if (open) {
      setModbusId(initial?.modbusId || '');
      setName(initial?.name || '');
      setErrors({});
    }
  }, [open, initial]);

  const validate = () => {
    const e = {};
    if (!modbusId.trim()) e.modbusId = 'Обязательное поле';
    else if (!/^\d+$/.test(modbusId)) e.modbusId = 'Должно быть числом';
    if (!name.trim()) e.name = 'Обязательное поле';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    onSave({ modbusId, name });
  };

  const isValid = modbusId.trim() && name.trim();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Редактировать блок' : 'Добавление блока'}
      desc="Заполните поля идентификации блока. Далее можно будет привязать телеизмерения."
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn--brand" disabled={!isValid} onClick={submit}>
            {initial ? 'Сохранить' : 'Далее'} <IconChevronRight size={14}/>
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">ID Modbus terminal <span className="form-label__required">*</span></label>
        <input
          className={`input ${errors.modbusId ? 'input--error' : ''}`}
          value={modbusId}
          onChange={e => setModbusId(e.target.value)}
          placeholder="Например: 201071"
        />
        {errors.modbusId && <div className="form-error"><IconAlert size={12}/> {errors.modbusId}</div>}
      </div>
      <div className="form-group">
        <label className="form-label">Название блока <span className="form-label__required">*</span></label>
        <input
          className={`input ${errors.name ? 'input--error' : ''}`}
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Например: Блок_1"
        />
        {errors.name && <div className="form-error"><IconAlert size={12}/> {errors.name}</div>}
        <div className="form-help">Отображается в списках блоков и на дашборде.</div>
      </div>
    </Modal>
  );
}

function BlocksPage() {
  const [blocks, setBlocks] = uSB(mockBlocks);
  const [addOpen, setAddOpen] = uSB(false);
  const [editing, setEditing] = uSB(null);
  const [deleting, setDeleting] = uSB(null);
  const [query, setQuery] = uSB('');
  const [sortBy, setSortBy] = uSB('createdAt');
  const [sortDir, setSortDir] = uSB('desc');
  const toast = useToast();

  const filtered = React.useMemo(() => {
    let list = blocks;
    if (query) list = list.filter(b => b.name.toLowerCase().includes(query.toLowerCase()) || b.modbusId.includes(query));
    list = [...list].sort((a, b) => {
      const av = a[sortBy], bv = b[sortBy];
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [blocks, query, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  const save = (data) => {
    if (editing) {
      setBlocks(bs => bs.map(b => b.id === editing.id ? { ...b, ...data } : b));
      toast.success('Блок обновлён', `${data.name} сохранён`);
    } else {
      const newBlock = { id: Date.now(), ...data, createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '), telemetryCount: 0 };
      setBlocks(bs => [newBlock, ...bs]);
      toast.success('Блок создан', `${data.name} появился в списке`);
    }
    setAddOpen(false);
    setEditing(null);
  };

  const doDelete = () => {
    setBlocks(bs => bs.filter(b => b.id !== deleting.id));
    toast.success('Блок удалён', `${deleting.name} убран из списка`, {
      action: { label: 'Отменить', onClick: () => setBlocks(bs => [deleting, ...bs]) }
    });
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Управление блоками"
        description={`${blocks.length} блоков · последнее обновление 2 сек назад`}
        actions={
          <>
            <div className="input-wrap" style={{ width: 240 }}>
              <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}/>
              <input className="input" placeholder="Поиск блоков…" value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 32, height: 36 }}/>
            </div>
            <button className="btn btn--secondary"><IconRefresh size={14}/> Обновить</button>
            <button className="btn btn--brand" onClick={() => { setEditing(null); setAddOpen(true); }}>
              <IconPlus size={14}/> Создать блок
            </button>
          </>
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 32 }}><label className="check"><input type="checkbox"/></label></th>
                <th className={`sortable ${sortBy === 'name' ? 'sorted' : ''}`} onClick={() => toggleSort('name')}>
                  Имя блока <span className="sort-icon">{sortBy === 'name' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th className={`sortable ${sortBy === 'modbusId' ? 'sorted' : ''}`} onClick={() => toggleSort('modbusId')}>
                  ID Modbus terminal <span className="sort-icon">{sortBy === 'modbusId' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th className="num">Телеизмерений</th>
                <th className={`sortable ${sortBy === 'createdAt' ? 'sorted' : ''}`} onClick={() => toggleSort('createdAt')}>
                  Дата создания <span className="sort-icon">{sortBy === 'createdAt' ? (sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                </th>
                <th style={{ textAlign: 'right', width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td><label className="check"><input type="checkbox"/></label></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconDatabase size={14} style={{ color: 'var(--ink-400)' }}/>
                      <span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{b.name}</span>
                    </div>
                  </td>
                  <td className="mono">{b.modbusId}</td>
                  <td className="num">{b.telemetryCount}</td>
                  <td className="mono">{b.createdAt}</td>
                  <td style={{ textAlign: 'right' }}>
                    <RowActions
                      onEdit={() => { setEditing(b); setAddOpen(true); }}
                      onDelete={() => setDeleting(b)}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="state" style={{ padding: '40px 20px' }}>
                    <IconDatabase size={40} style={{ color: 'var(--ink-300)' }}/>
                    <div className="state__title">Блоков не найдено</div>
                    <div className="state__body">Попробуйте изменить поисковый запрос или создайте новый блок.</div>
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

      <AddBlockModal open={addOpen} onClose={() => { setAddOpen(false); setEditing(null); }} onSave={save} initial={editing}/>
      <ConfirmDelete open={!!deleting} onClose={() => setDeleting(null)} onConfirm={doDelete} entity="блок" name={deleting?.name}/>
    </>
  );
}

Object.assign(window, { BlocksPage });
