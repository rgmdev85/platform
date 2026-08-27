// Справочник Схем (мнемосхем). Файл сохраняет имя Blocks.jsx для обратной совместимости,
// но экспортирует SchemesDirectoryPage (и BlocksPage как alias).

const { useState: uSB } = React;

const mockSchemesList = [
  { id: 1, name: 'Схема · Первый контур',    author: 'Пётр Петрович', createdAt: '2026-08-01 10:00:00', usedIn: ['Главная', 'Схемы (дашборд)'] },
  { id: 2, name: 'Схема · Второй контур',    author: 'Пётр Петрович', createdAt: '2026-08-01 10:20:00', usedIn: ['Схемы (дашборд)'] },
  { id: 3, name: 'Подстанция №4 · Общая',    author: 'Иван Смирнов',  createdAt: '2026-08-05 14:00:00', usedIn: ['Схемы (дашборд)'] },
  { id: 4, name: 'Магистральный трубопровод', author: 'Пётр Петрович', createdAt: '2026-08-12 09:30:00', usedIn: [] },
  { id: 5, name: 'Резерв · Контур охлаждения', author: 'Иван Смирнов', createdAt: '2026-08-18 16:00:00', usedIn: [] },
];

function AddSchemeModal({ open, onClose, onSave, initial }) {
  const [name, setName] = uSB(initial?.name || '');
  React.useEffect(() => { if (open) setName(initial?.name || ''); }, [open, initial]);
  const toast = useToast();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={initial ? 'Редактировать схему' : 'Создать схему'}
      desc="Название схемы. Содержимое настраивается в редакторе мнемосхем."
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn--brand" disabled={!name.trim()} onClick={() => onSave({ name })}>
            {initial ? 'Сохранить' : 'Создать и открыть'} <IconChevronRight size={14}/>
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Название схемы <span className="form-label__required">*</span></label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Например: Схема · Контур подачи"/>
        <div className="form-help">После создания откроется редактор мнемосхем во внешнем окне.</div>
      </div>
    </Modal>
  );
}

function BlocksPage() {
  const [items, setItems] = uSB(mockSchemesList);
  const [addOpen, setAddOpen] = uSB(false);
  const [editing, setEditing] = uSB(null);
  const [deleting, setDeleting] = uSB(null);
  const [query, setQuery] = uSB('');
  const toast = useToast();

  const filtered = query
    ? items.filter(s => s.name.toLowerCase().includes(query.toLowerCase()))
    : items;

  const save = (data) => {
    if (editing) {
      setItems(list => list.map(s => s.id === editing.id ? { ...s, ...data } : s));
      toast.success('Схема обновлена', data.name);
    } else {
      const newScheme = { id: Date.now(), ...data, author: 'Пётр Петрович', createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '), usedIn: [] };
      setItems(list => [newScheme, ...list]);
      toast.success('Схема создана', `${data.name} · открывается редактор`);
    }
    setAddOpen(false);
    setEditing(null);
  };

  const doDelete = () => {
    if (deleting.usedIn.length > 0) {
      toast.error('Нельзя удалить', `${deleting.name} используется: ${deleting.usedIn.join(', ')}`);
      setDeleting(null);
      return;
    }
    setItems(list => list.filter(s => s.id !== deleting.id));
    toast.success('Удалено', deleting.name, {
      action: { label: 'Отменить', onClick: () => setItems(list => [deleting, ...list]) }
    });
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Графические формы (Мнемосхемы)"
        description={`${items.length} графических форм · интерактивные с live-данными`}
        actions={
          <>
            <div className="input-wrap" style={{ width: 240 }}>
              <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}/>
              <input className="input" placeholder="Поиск схем…" value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 32, height: 36 }}/>
            </div>
            <button className="btn btn--secondary" onClick={() => toast.info('Открывается редактор мнемосхем…')}>
              <IconEdit size={14}/> Редактор мнемосхем
            </button>
            <button className="btn btn--brand" onClick={() => { setEditing(null); setAddOpen(true); }}>
              <IconPlus size={14}/> Создать схему
            </button>
          </>
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        <div className="alert alert--info" style={{ marginBottom: 16 }}>
          <IconInfo size={18} className="alert__icon"/>
          <div>
            <div className="alert__body">
              Схемы — интерактивные мнемосхемы объектов с привязкой к <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/telemetry'; }}><b>телеизмерениям</b></a> и <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/telesignals'; }}><b>телесигналам</b></a>. Редактирование содержимого — во внешнем редакторе мнемосхем.
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 32 }}><label className="check"><input type="checkbox"/></label></th>
                <th className="sortable sorted">Имя схемы <span className="sort-icon">↓</span></th>
                <th>Автор</th>
                <th>Используется на страницах</th>
                <th>Дата создания</th>
                <th style={{ textAlign: 'right', width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td><label className="check"><input type="checkbox"/></label></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconMap size={14} style={{ color: 'var(--eae-red)' }}/>
                      <span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{s.name}</span>
                    </div>
                  </td>
                  <td>{s.author}</td>
                  <td>
                    {s.usedIn.length === 0
                      ? <span className="muted" style={{ fontStyle: 'italic', fontSize: 12 }}>не используется</span>
                      : s.usedIn.map((p, i) => <span key={i} className="badge badge--neutral" style={{ marginRight: 4 }}>{p}</span>)
                    }
                  </td>
                  <td className="mono">{s.createdAt}</td>
                  <td style={{ textAlign: 'right' }}>
                    <RowActions
                      onEdit={() => { setEditing(s); setAddOpen(true); }}
                      onDelete={() => setDeleting(s)}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="state" style={{ padding: '40px 20px' }}>
                    <IconMap size={40} style={{ color: 'var(--ink-300)' }}/>
                    <div className="state__title">Ничего не найдено</div>
                    <div className="state__body">Измените поисковый запрос или создайте новую схему.</div>
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

      <AddSchemeModal open={addOpen} onClose={() => { setAddOpen(false); setEditing(null); }} onSave={save} initial={editing}/>
      <ConfirmDelete open={!!deleting} onClose={() => setDeleting(null)} onConfirm={doDelete} entity="графическую форму" name={deleting?.name}/>
    </>
  );
}

Object.assign(window, { BlocksPage });
