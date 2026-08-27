// «Графики» — справочник настроенных виджетов «График» (в Настройках платформы)

const { useState: uSCD } = React;

function ChartsDirectoryPage() {
  const [items, setItems] = uSCD(mockChartsDirectory);
  const [deleting, setDeleting] = uSCD(null);
  const [query, setQuery] = uSCD('');
  const toast = useToast();

  const filtered = query
    ? items.filter(v => v.name.toLowerCase().includes(query.toLowerCase()))
    : items;

  const doDelete = () => {
    if (deleting.usedIn.length > 0) {
      toast.error('Нельзя удалить', `${deleting.name} используется на: ${deleting.usedIn.join(', ')}`);
      setDeleting(null);
      return;
    }
    setItems(list => list.filter(v => v.id !== deleting.id));
    toast.success('Удалено', deleting.name, {
      action: { label: 'Отменить', onClick: () => setItems(list => [deleting, ...list]) }
    });
    setDeleting(null);
  };

  const sourceBadge = (s) => {
    const cfg = {
      'ТИ':     { bg: 'var(--info-soft)',    color: 'var(--info)',    icon: <IconActivity size={10}/> },
      'ТС':     { bg: 'var(--warning-soft)', color: 'var(--warning)', icon: <IconZap size={10}/> },
      'DWH':    { bg: 'var(--success-soft)', color: 'var(--success)', icon: <IconDatabase size={10}/> },
      'ручное': { bg: 'var(--ink-100)',      color: 'var(--ink-500)', icon: <IconEdit size={10}/> },
    }[s] || { bg: 'var(--ink-100)', color: 'var(--ink-500)' };
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 3,
        padding: '2px 6px', borderRadius: 'var(--r-sm)',
        background: cfg.bg, color: cfg.color,
        fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
        letterSpacing: '.03em',
      }}>{cfg.icon} {s}</span>
    );
  };

  return (
    <>
      <PageHeader
        title="Библиотека трендов"
        description={`${items.length} настроенных трендов · линии, KPI-индикаторы, отклонения`}
        actions={
          <>
            <div className="input-wrap" style={{ width: 240 }}>
              <IconSearch size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}/>
              <input className="input" placeholder="Поиск графиков…" value={query} onChange={e => setQuery(e.target.value)} style={{ paddingLeft: 32, height: 36 }}/>
            </div>
            <button className="btn btn--brand" onClick={() => toast.info('Полное создание графика — через «Добавить виджет» на странице')}>
              <IconPlus size={14}/> Создать тренд
            </button>
          </>
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        <div className="alert alert--info" style={{ marginBottom: 16 }}>
          <IconInfo size={18} className="alert__icon"/>
          <div>
            <div className="alert__body">
              Виджеты «Тренды» — переиспользуемые многолинейные графики с настраиваемыми осями, стилями линий, KPI-индикаторами и панелью отклонений. Линии привязываются к <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/telemetry'; }}><b>ТИ</b></a>, <a href="#" onClick={(e) => { e.preventDefault(); location.hash = '#/telesignals'; }}><b>ТС</b></a> или <b>витринам DWH</b>.
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 32 }}><label className="check"><input type="checkbox"/></label></th>
                <th className="sortable sorted">Имя <span className="sort-icon">↓</span></th>
                <th className="num">Линий</th>
                <th className="num">Индикаторов</th>
                <th>Источники данных</th>
                <th>Используется на страницах</th>
                <th>Последнее обновление</th>
                <th style={{ textAlign: 'right', width: 100 }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => (
                <tr key={v.id}>
                  <td><label className="check"><input type="checkbox"/></label></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <IconLineChart size={14} style={{ color: 'var(--eae-red)' }}/>
                      <span style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{v.name}</span>
                    </div>
                  </td>
                  <td className="num">{v.linesCount}</td>
                  <td className="num">{v.indicators}</td>
                  <td>
                    <div style={{ display: 'inline-flex', gap: 4, flexWrap: 'wrap' }}>
                      {v.sources.map((s, i) => <React.Fragment key={i}>{sourceBadge(s)}</React.Fragment>)}
                    </div>
                  </td>
                  <td>
                    {v.usedIn.length === 0
                      ? <span className="muted" style={{ fontStyle: 'italic', fontSize: 12 }}>не используется</span>
                      : v.usedIn.map((p, i) => <span key={i} className="badge badge--neutral" style={{ marginRight: 4 }}>{p}</span>)
                    }
                  </td>
                  <td className="mono">{v.lastUpdate}</td>
                  <td style={{ textAlign: 'right' }}>
                    <RowActions
                      onEdit={() => toast.info(`Открытие: ${v.name}`)}
                      onDelete={() => setDeleting(v)}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <div className="state" style={{ padding: '40px 20px' }}>
                    <IconLineChart size={40} style={{ color: 'var(--ink-300)' }}/>
                    <div className="state__title">Ничего не найдено</div>
                    <div className="state__body">Измените поисковый запрос или создайте новый график.</div>
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

      <ConfirmDelete
        open={!!deleting}
        onClose={() => setDeleting(null)}
        onConfirm={doDelete}
        entity="тренд"
        name={deleting?.name}
      />
    </>
  );
}

Object.assign(window, { ChartsDirectoryPage });
