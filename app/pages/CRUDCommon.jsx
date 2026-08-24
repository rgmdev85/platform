// Общие компоненты: FilterBar, ConfirmDelete, TableActionRow

const { useState: uSC } = React;

function FilterBar({ filters, onRemove, onClearAll, onAdd, resultCount }) {
  return (
    <div className="filter-bar" style={{ marginBottom: 16 }}>
      <span className="filter-bar__label"><IconFilter size={11} style={{ verticalAlign: 'middle', marginRight: 4 }}/> Фильтры</span>
      {filters.map((f, i) => (
        <span key={i} className="chip chip--active">
          <span className="chip__label">{f.label}:</span>
          <span className="chip__value">{f.value}</span>
          <button className="chip__close" onClick={() => onRemove(i)}>×</button>
        </span>
      ))}
      <span className="chip" style={{ cursor: 'pointer' }} onClick={onAdd}>
        <span className="chip__label"><IconPlus size={11} style={{ verticalAlign: 'middle', marginRight: 4 }}/> фильтр</span>
      </span>
      {filters.length > 0 && (
        <button className="filter-bar__clear" onClick={onClearAll}>Сбросить всё</button>
      )}
      {resultCount != null && (
        <div style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink-500)', fontFamily: 'var(--font-mono)' }}>
          {resultCount} строк
        </div>
      )}
    </div>
  );
}

function ConfirmDelete({ open, onClose, onConfirm, entity, name }) {
  const [ack, setAck] = uSC(false);
  React.useEffect(() => { if (open) setAck(false); }, [open]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Удалить ${entity}?`}
      desc={<>Элемент <b className="mono" style={{ color: 'var(--ink-900)' }}>{name}</b> будет безвозвратно удалён. Все связанные исторические записи сохранятся в архиве.</>}
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
          <button className="btn btn--danger" disabled={!ack} onClick={onConfirm}>Удалить</button>
        </>
      }
    >
      <label className="check">
        <input type="checkbox" checked={ack} onChange={e => setAck(e.target.checked)}/>
        Я понимаю, что действие необратимо
      </label>
    </Modal>
  );
}

function RowActions({ onEdit, onDelete }) {
  return (
    <div style={{ display: 'inline-flex', gap: 4 }}>
      <button className="btn btn--ghost btn--icon btn--sm" title="Настройки" onClick={onEdit}>
        <IconSettings size={14}/>
      </button>
      <button className="btn btn--ghost btn--icon btn--sm" title="Удалить" onClick={onDelete} style={{ color: 'var(--danger)' }}>
        <IconTrash size={14}/>
      </button>
    </div>
  );
}

function Pager({ page, pageSize, total, onPageChange, onSizeChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
      <div className="pager">
        <button className="pager__btn" disabled={page === 1} onClick={() => onPageChange(page - 1)}>‹</button>
        {[...Array(pages)].slice(0, 5).map((_, i) => (
          <button
            key={i}
            className={`pager__btn ${page === i + 1 ? 'pager__btn--active' : ''}`}
            onClick={() => onPageChange(i + 1)}
          >{i + 1}</button>
        ))}
        {pages > 5 && (
          <>
            <span className="pager__btn" style={{ pointerEvents: 'none', border: 'none', background: 'transparent' }}>…</span>
            <button className="pager__btn" onClick={() => onPageChange(pages)}>{pages}</button>
          </>
        )}
        <button className="pager__btn" disabled={page === pages} onClick={() => onPageChange(page + 1)}>›</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="pager__info">Строк: {from}–{to} из {total}</span>
        <select className="select" style={{ width: 80, height: 30 }} value={pageSize} onChange={e => onSizeChange(Number(e.target.value))}>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>
    </div>
  );
}

function StatusBadge({ quality }) {
  if (quality === 1) return <span className="badge badge--success badge--dot">В норме</span>;
  if (quality === 0) return <span className="badge badge--danger badge--dot">Ошибка</span>;
  return <span className="badge badge--warning badge--dot">Внимание</span>;
}

Object.assign(window, { FilterBar, ConfirmDelete, RowActions, Pager, StatusBadge });
