// Страница 1 — Дашборд. Режимы: view / edit / add-widget modal.

const { useState: uSD, useMemo: uMD } = React;

function BlockCard({ block, isEditing, onRemove }) {
  const toast = useToast();
  const [date, setDate] = uSD('2026-08-24');

  return (
    <section className="card" style={{ marginBottom: 16, position: 'relative' }}>
      {/* Card header: title + breadcrumb */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 20px', borderBottom: '1px solid var(--ink-100)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {isEditing && (
            <span style={{ cursor: 'grab', color: 'var(--ink-400)', display: 'flex' }}>
              <IconDrag size={16}/>
            </span>
          )}
          <div>
            <div className="h-3" style={{ fontSize: 17 }}>{block.name}</div>
            <div className="caption mono" style={{ marginTop: 3 }}>
              Выгрузка сформирована 2026-08-24 10:06:03 · протокол: {block.protocol || 'Modbus TCP'}
            </div>
          </div>
        </div>
        {isEditing ? (
          <button
            className="btn btn--ghost btn--icon btn--sm"
            aria-label="Удалить виджет"
            onClick={onRemove}
            style={{ color: 'var(--danger)' }}
          >
            <IconClose size={16}/>
          </button>
        ) : (
          <nav className="crumbs">
            <a><IconHome size={11}/></a>
            <span className="crumbs__sep">/</span>
            <span className="current">{block.name}</span>
          </nav>
        )}
      </div>

      {/* Toolbar: date + show + KPI badges */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 20px', gap: 12, flexWrap: 'wrap',
        borderBottom: '1px solid var(--ink-100)', background: 'var(--ink-050)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label className="form-label" style={{ marginBottom: 0 }}>Дата</label>
          <div className="input-wrap" style={{ width: 180 }}>
            <IconCalendar size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}/>
            <input
              className="input"
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ paddingLeft: 32, height: 32 }}
            />
          </div>
          <button
            className="btn btn--success btn--sm"
            onClick={() => toast.success('Данные обновлены', `Блок ${block.name} · дата ${date}`)}
          >
            <IconPlay size={12}/> Показать данные
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="kpi" style={{ padding: '6px 14px', minWidth: 'auto' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--ink-500)', letterSpacing: '.05em' }}>Температура</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--info)', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
              62.28<span style={{ fontSize: 12, color: 'var(--ink-500)', marginLeft: 4, fontWeight: 500 }}>°C</span>
            </div>
          </div>
          <Dropdown
            align="right"
            trigger={
              <button className="btn btn--secondary btn--sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)', background: 'var(--danger-soft)' }}>
                Отклонения · 3 <IconChevronDown size={12}/>
              </button>
            }
            items={[
              { header: 'Отклонения на сегодня' },
              { icon: <IconAlert size={14}/>, label: '10:02 · Факт превышает ПБР на 5.1%', shortcut: '+8.2 МВт' },
              { icon: <IconAlert size={14}/>, label: '10:34 · Факт превышает ПБР на 3.2%', shortcut: '+5.1 МВт' },
              { icon: <IconWarning size={14}/>, label: '11:15 · Недобор −4.6%', shortcut: '−7.2 МВт' },
              { divider: true },
              { icon: <IconDownload size={14}/>, label: 'Экспорт в Excel', onClick: () => toast.info('Отчёт скачивается…') },
            ]}
          />
          <Dropdown
            align="right"
            trigger={
              <button className="btn btn--secondary btn--sm">
                Лог команд · 12 <IconChevronDown size={12}/>
              </button>
            }
            items={[
              { header: 'Последние команды УДГ/УДГК' },
              { icon: <IconTerminal size={14}/>, label: '09:00 · Установить ПБР 145 МВт', shortcut: 'выполнено' },
              { icon: <IconTerminal size={14}/>, label: '10:15 · Разгрузка на 10 МВт',   shortcut: 'выполнено' },
              { icon: <IconTerminal size={14}/>, label: '10:47 · Возврат в базовый режим', shortcut: 'выполнено' },
              { divider: true },
              { icon: <IconEye size={14}/>, label: 'Полный лог команд' },
            ]}
          />
        </div>
      </div>

      {/* Chart 1: PBR 24-hour */}
      <div style={{ padding: '16px 20px 8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <div className="h-4">{block.name} :: График ПБР 14 :: 40.00%</div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '1.5px dashed var(--line-kztk)' }}/> УДГКЭ
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '1.5px dashed var(--line-kzs)' }}/> УДГ
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 16, height: 2, background: 'var(--line-fact)' }}/> ФАКТ
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ display: 'inline-block', width: 16, height: 0, borderTop: '1.5px dashed var(--line-plan)' }}/> ПБР
            </span>
          </div>
        </div>
        <PBRChart pbr={mockPBR}/>
      </div>

      {/* Charts 2 + 3 side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, padding: '0 20px 16px' }}>
        <div>
          <div className="h-4" style={{ marginBottom: 8, fontSize: 13 }}>{block.name} :: Трёхминутная выработка :: 40.00%</div>
          <ThreeMinChart data={mockThreeMin}/>
        </div>
        <div>
          <div className="h-4" style={{ marginBottom: 8, fontSize: 13 }}>{block.name} :: Блоки ГОУ :: 40.00%</div>
          <GOUChart data={mockGOU}/>
        </div>
      </div>
    </section>
  );
}

function AddWidgetModal({ open, onClose, onAdd }) {
  const [selected, setSelected] = uSD('');
  const options = [
    { value: '', label: 'Выберите юнит' },
    { value: 'scheme_1', label: 'Схема_1' },
    { value: 'block_1', label: 'Блок_1' },
    { value: 'block_2', label: 'Блок_2' },
    { value: 'block_3', label: 'Блок_3' },
    { value: 'block_4', label: 'Блок_4' },
    { value: 'block_5', label: 'Блок_5' },
  ];
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Добавить виджет на страницу"
      desc="Выберите блок или схему для отображения на дашборде."
      footer={
        <>
          <button className="btn btn--ghost" onClick={onClose}>Отмена</button>
          <button
            className="btn btn--brand"
            disabled={!selected}
            onClick={() => { onAdd(selected); onClose(); }}
          >
            <IconPlus size={14}/> Добавить виджет
          </button>
        </>
      }
    >
      <div className="form-group">
        <label className="form-label">Юнит</label>
        <select className="select" value={selected} onChange={e => setSelected(e.target.value)}>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div className="form-help">Виджет будет добавлен в конец списка. После добавления можно перетаскивать.</div>
      </div>
    </Modal>
  );
}

function DashboardPage() {
  const [mode, setMode] = uSD('view'); // 'view' | 'edit'
  const [addModal, setAddModal] = uSD(false);
  const toast = useToast();

  const [widgets, setWidgets] = uSD([
    { id: 1, name: 'Блок_1', protocol: 'Modbus TCP' },
    { id: 2, name: 'Блок_2', protocol: 'МЭК-104' },
  ]);

  const addWidget = (unitKey) => {
    const label = unitKey.replace('block_', 'Блок_').replace('scheme_', 'Схема_');
    setWidgets(w => [...w, { id: Date.now(), name: label, protocol: 'МЭК-104' }]);
    toast.success('Виджет добавлен', `${label} появился внизу страницы`);
  };

  const removeWidget = (id) => {
    setWidgets(w => w.filter(x => x.id !== id));
    toast.success('Виджет удалён', 'Изменения сохранены', {
      action: { label: 'Отменить', onClick: () => toast.info('Восстанавливаем…') }
    });
  };

  return (
    <>
      <PageHeader
        title="страница 1"
        description="Диспетчерский пульт УДГК-1 · обновление данных каждые 5 секунд"
        actions={
          mode === 'view' ? (
            <>
              <button className="btn btn--secondary" onClick={() => toast.info('Формируется PDF-отчёт…')}>
                <IconDownload size={14}/> Экспорт
              </button>
              <button className="btn btn--primary" onClick={() => setMode('edit')}>
                <IconEdit size={14}/> Редактировать
              </button>
            </>
          ) : (
            <>
              <select className="select" style={{ width: 200 }} defaultValue="">
                <option value="">Выберите юнит…</option>
                <option>Схема_1</option>
                <option>Блок_3</option>
                <option>Блок_4</option>
              </select>
              <button className="btn btn--brand" onClick={() => setAddModal(true)}>
                <IconPlus size={14}/> Добавить виджет
              </button>
              <button className="btn btn--success" onClick={() => { setMode('view'); toast.success('Изменения сохранены', 'Дашборд обновлён'); }}>
                <IconCheck size={14}/> Готово
              </button>
            </>
          )
        }
      />

      <div style={{ padding: '0 32px 40px' }}>
        {mode === 'edit' && (
          <div className="alert alert--info" style={{ marginBottom: 16 }}>
            <IconInfo size={18} className="alert__icon"/>
            <div>
              <div className="alert__title">Режим редактирования</div>
              <div className="alert__body">
                Перетаскивайте виджеты за <b>::</b> слева от заголовка, удаляйте через × справа.
                Нажмите <b>Готово</b>, чтобы применить изменения.
              </div>
            </div>
          </div>
        )}

        {widgets.map(w => (
          <BlockCard
            key={w.id}
            block={w}
            isEditing={mode === 'edit'}
            onRemove={() => removeWidget(w.id)}
          />
        ))}

        {widgets.length === 0 && (
          <div className="card" style={{ padding: '48px 20px' }}>
            <div className="state" style={{ padding: 0 }}>
              <IconGrid size={40} style={{ color: 'var(--ink-300)' }}/>
              <div className="state__title">Пустой дашборд</div>
              <div className="state__body">Добавьте первый виджет, чтобы начать мониторинг блоков.</div>
              <button className="btn btn--brand" onClick={() => setAddModal(true)}>
                <IconPlus size={14}/> Добавить виджет
              </button>
            </div>
          </div>
        )}
      </div>

      <AddWidgetModal open={addModal} onClose={() => setAddModal(false)} onAdd={addWidget}/>
    </>
  );
}

Object.assign(window, { DashboardPage });
