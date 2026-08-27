// «Телесигналы» — идентична странице Телеизмерения, только терминология и другой mock

const { useState: uSTs } = React;

// Отдельный mock телесигналов
const mockTelesignals = Array.from({ length: 32 }, (_, i) => {
  const blocks = ["Блок_1", "Блок_2", "Блок_3", "—"];
  const names = ["ТС-выключатель_Q1", "ТС-выключатель_Q2", "ТС-разъединитель_QS1", "ТС-положение_ключа", "ТС-АВР_готов", "ТС-РПН_повышение", "ТС-защита_МТЗ", "ТС-сигнал_аварии"];
  const t = new Date(2026, 7, 24, 9, 59 - (i * 3) % 40, 45 - i % 30);
  const pad = (n) => String(n).padStart(2, '0');
  return {
    id: i + 1,
    time: `${t.getFullYear()}-${pad(t.getMonth()+1)}-${pad(t.getDate())} ${pad(t.getHours())}:${pad(t.getMinutes())}:${pad(t.getSeconds())}`,
    block: blocks[i % 4],
    name: names[i % names.length],
    signalType: "Bool",
    quality: i === 5 || i === 19 ? 0 : 1,
    value: (i % 2 === 0) ? "1 (вкл)" : "0 (откл)",
  };
});

function TelesignalsPage() {
  const [items, setItems] = uSTs(mockTelesignals);
  const [addOpen, setAddOpen] = uSTs(false);
  const [deleting, setDeleting] = uSTs(null);
  const [selected, setSelected] = uSTs([]);
  const [filters, setFilters] = uSTs([{ label: 'Блок', value: 'Блок_1, Блок_2' }]);
  const [page, setPage] = uSTs(1);
  const [pageSize, setPageSize] = uSTs(20);
  const toast = useToast();

  const pagedItems = items.slice((page - 1) * pageSize, page * pageSize);

  const doDelete = () => {
    setItems(is => is.filter(i => i.id !== deleting.id));
    toast.success('Телесигнал удалён', `${deleting.name} убран`);
    setDeleting(null);
  };

  const toggle = (id) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
  const toggleAll = () => setSelected(pagedItems.every(i => selected.includes(i.id)) ? [] : pagedItems.map(i => i.id));

  return (
    <>
      <PageHeader
        title="Дискретные сигналы (ТС)"
        description={`${items.length} дискретных сигналов · live-обновление`}
        actions={
          <>
            <button className="btn btn--secondary"><IconDownload size={14}/> Экспорт CSV</button>
            <button className="btn btn--brand" onClick={() => setAddOpen(true)}><IconPlus size={14}/> Создать телесигнал</button>
          </>
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        <div className="alert alert--info" style={{ marginBottom: 16 }}>
          <IconInfo size={18} className="alert__icon"/>
          <div>
            <div className="alert__body">
              Телесигналы (ТС) выстраиваются на основе <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/protocols'; }}><b>протоколов приёма данных</b></a> и привязываются к <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/schemes'; }}><b>схемам</b></a> и <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/charts'; }}><b>графикам</b></a>.
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', marginBottom: 12, background: 'var(--info-soft)', border: '1px solid rgba(31,111,235,.24)', borderRadius: 'var(--r-md)' }}>
            <span style={{ fontWeight: 500, color: 'var(--info-hover)' }}>Выбрано: {selected.length}</span>
            <button className="btn btn--secondary btn--sm">Изменить блок…</button>
            <button className="btn btn--danger btn--sm" onClick={() => { setItems(is => is.filter(i => !selected.includes(i.id))); setSelected([]); toast.success(`Удалено ${selected.length} записей`); }}><IconTrash size={12}/> Удалить выбранные</button>
            <button className="btn btn--ghost btn--sm" onClick={() => setSelected([])} style={{ marginLeft: 'auto' }}>Снять выделение</button>
          </div>
        )}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 32 }}><label className="check"><input type="checkbox" checked={pagedItems.length > 0 && pagedItems.every(i => selected.includes(i.id))} onChange={toggleAll}/></label></th>
                <th className="sortable sorted">Время прихода сигнала <span className="sort-icon">↓</span></th>
                <th className="sortable">Блок / Схема</th>
                <th className="sortable">Имя</th>
                <th className="sortable">Тип сигнала</th>
                <th className="sortable num">Код качества</th>
                <th>Значение</th>
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
                  <td className="mono">{t.value}</td>
                  <td style={{ textAlign: 'right' }}>
                    <RowActions onEdit={() => toast.info(`Настройки: ${t.name}`)} onDelete={() => setDeleting(t)}/>
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

      <ConfirmDelete open={!!deleting} onClose={() => setDeleting(null)} onConfirm={doDelete} entity="телесигнал" name={deleting?.name}/>
    </>
  );
}

Object.assign(window, { TelesignalsPage });
