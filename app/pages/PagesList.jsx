// Управление страницами — список дашбордов

const { useState: uSL } = React;

function AddPageModal({ open, onClose, onSave }) {
  const [name, setName] = uSL('');
  React.useEffect(() => { if (open) setName(''); }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Создать страницу"
      desc="Новая страница появится в разделе «Мониторинг» боковой навигации."
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn--brand" disabled={!name.trim()} onClick={() => { onSave({ name }); onClose(); }}>
            Создать и открыть <IconChevronRight size={14}/>
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Название страницы <span className="form-label__required">*</span></label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Например: Диспетчерский пульт УДГК-2"/>
        <div className="form-help">Отображается в боковой навигации и заголовке страницы.</div>
      </div>
    </Modal>
  );
}

function PagesListPage() {
  const [pages, setPages] = uSL(mockPages);
  const [addOpen, setAddOpen] = uSL(false);
  const [deleting, setDeleting] = uSL(null);
  const toast = useToast();

  const save = (data) => {
    setPages(ps => [{ id: Date.now(), ...data, author: 'Пётр Петрович', createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '), widgets: 0, status: 'draft' }, ...ps]);
    toast.success('Страница создана', `«${data.name}» открывается в редакторе`);
  };

  const doDelete = () => {
    setPages(ps => ps.filter(p => p.id !== deleting.id));
    toast.success('Страница удалена', `«${deleting.name}» убрана`);
    setDeleting(null);
  };

  return (
    <>
      <PageHeader
        title="Управление страницами"
        description={`${pages.length} дашбордов · доступны всем администраторам`}
        actions={
          <>
            <button className="btn btn--secondary"><IconDownload size={14}/> Экспорт списка</button>
            <button className="btn btn--brand" onClick={() => setAddOpen(true)}>
              <IconPlus size={14}/> Создать страницу
            </button>
          </>
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th className="sortable">Имя страницы</th>
                <th>Статус</th>
                <th className="num">Виджетов</th>
                <th>Автор</th>
                <th className="sortable sorted">Дата создания <span className="sort-icon">↓</span></th>
                <th style={{ textAlign: 'right', width: 140 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconLayout size={14} style={{ color: 'var(--ink-400)' }}/>
                      <a onClick={() => location.hash = '#/dashboard'} style={{ fontWeight: 500, color: 'var(--ink-900)', cursor: 'pointer' }}>{p.name}</a>
                    </div>
                  </td>
                  <td>
                    {p.status === 'published'
                      ? <span className="badge badge--success badge--dot">Опубликована</span>
                      : <span className="badge badge--warning badge--dot">Черновик</span>
                    }
                  </td>
                  <td className="num">{p.widgets}</td>
                  <td>{p.author}</td>
                  <td className="mono">{p.createdAt}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn--ghost btn--icon btn--sm" onClick={() => location.hash = '#/dashboard'} title="Открыть"><IconEye size={14}/></button>
                    <button className="btn btn--ghost btn--icon btn--sm" onClick={() => toast.info(`Настройки: ${p.name}`)} title="Настройки"><IconSettings size={14}/></button>
                    <button className="btn btn--ghost btn--icon btn--sm" onClick={() => setDeleting(p)} title="Удалить" style={{ color: 'var(--danger)' }}><IconTrash size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddPageModal open={addOpen} onClose={() => setAddOpen(false)} onSave={save}/>
      <ConfirmDelete open={!!deleting} onClose={() => setDeleting(null)} onConfirm={doDelete} entity="страницу" name={deleting?.name}/>
    </>
  );
}

Object.assign(window, { PagesListPage });
