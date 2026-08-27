// Главная — стартовая страница с виджетами разных типов

const { useState: uSH } = React;

function HomePage() {
  const [mode, setMode] = uSH('view');
  const [addModal, setAddModal] = uSH(false);
  const toast = useToast();
  const [widgets, setWidgets] = uSH(() => homeWidgets.map(w => ({ ...w })));

  const addWidget = ({ type, content }) => {
    const w = type === 'superset' || type === 'chart' ? 12 : type === 'scheme' || type === 'values' ? 6 : type === 'text' ? 12 : 4;
    setWidgets(ws => [...ws, { id: Date.now(), type, w, content }]);
    toast.success('Виджет добавлен на главную');
  };
  const removeWidget = (id) => {
    const removed = widgets.find(w => w.id === id);
    setWidgets(ws => ws.filter(w => w.id !== id));
    toast.success('Виджет удалён', undefined, { action: { label: 'Отменить', onClick: () => setWidgets(ws => [...ws, removed]) } });
  };
  const resizeWidget = (id, newW) => setWidgets(ws => ws.map(w => w.id === id ? { ...w, w: newW } : w));

  return (
    <>
      <PageHeader
        title="Главная"
        description={`Стартовый экран · ${widgets.length} виджетов · последнее обновление 09:56`}
        actions={mode === 'view' ? (
          <>
            <button className="btn btn--secondary" onClick={() => toast.info('Отчёт формируется…')}><IconDownload size={14}/> Экспорт</button>
            <button className="btn btn--primary" onClick={() => setMode('edit')}><IconEdit size={14}/> Редактировать</button>
          </>
        ) : (
          <>
            <button className="btn btn--brand" onClick={() => setAddModal(true)}><IconPlus size={14}/> Добавить виджет</button>
            <button className="btn btn--success" onClick={() => { setMode('view'); toast.success('Изменения сохранены'); }}>
              <IconCheck size={14}/> Готово
            </button>
          </>
        )}
      />
      <div style={{ padding: '0 32px 40px' }}>
        {mode === 'edit' && (
          <div className="alert alert--info" style={{ marginBottom: 16 }}>
            <IconInfo size={18} className="alert__icon"/>
            <div>
              <div className="alert__title">Режим редактирования</div>
              <div className="alert__body">Можно менять ширину виджета через <b>◄►</b> ручку справа, удалять через <b>×</b>, добавлять новые виджеты разных типов.</div>
            </div>
          </div>
        )}

        <div data-widget-grid>
          <WidgetGrid>
            {widgets.map(widget => renderWidget(
              widget, mode === 'edit',
              () => removeWidget(widget.id),
              (newW) => resizeWidget(widget.id, newW),
              (chartId) => setWidgets(ws => ws.map(w => w.id === widget.id ? { ...w, content: { chartId } } : w)),
            ))}
          </WidgetGrid>
        </div>

        {widgets.length === 0 && (
          <div className="card" style={{ padding: '48px 20px' }}>
            <div className="state" style={{ padding: 0 }}>
              <IconHome size={40} style={{ color: 'var(--ink-300)' }}/>
              <div className="state__title">Пустая главная</div>
              <div className="state__body">Соберите свой стартовый экран из блоков, графиков Superset, схем и ссылок.</div>
              <button className="btn btn--brand" onClick={() => setAddModal(true)}><IconPlus size={14}/> Добавить виджет</button>
            </div>
          </div>
        )}
      </div>
      <AddWidgetModal open={addModal} onClose={() => setAddModal(false)} onAdd={addWidget}/>
    </>
  );
}

Object.assign(window, { HomePage });
