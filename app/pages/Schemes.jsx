// «Схемы» — дашборд мнемосхем (аналог «Блоки», но с виджетами-схемами по умолчанию)

const { useState: uSS } = React;

function SchemesPage() {
  const [mode, setMode] = uSS('view');
  const [addModal, setAddModal] = uSS(false);
  const toast = useToast();
  const [widgets, setWidgets] = uSS([
    { id: 1, type: 'scheme', w: 12, content: { schemeName: 'Схема · Первый контур' } },
    { id: 2, type: 'scheme', w: 6,  content: { schemeName: 'Схема · Второй контур' } },
    { id: 3, type: 'scheme', w: 6,  content: { schemeName: 'Подстанция №4 · Общая' } },
  ]);

  const addWidget = ({ type, content }) => {
    const w = type === 'superset' || type === 'chart' ? 12 : type === 'scheme' || type === 'values' ? 6 : type === 'text' ? 12 : 4;
    setWidgets(ws => [...ws, { id: Date.now(), type, w, content }]);
    toast.success('Виджет добавлен');
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
        title="Схемы"
        description="Мнемосхемы объектов с live-данными"
        actions={mode === 'view' ? (
          <>
            <button className="btn btn--secondary" onClick={() => toast.info('Открывается редактор мнемосхем…')}><IconEdit size={14}/> Редактор мнемосхем</button>
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
              <div className="alert__body">Меняйте размер виджетов, добавляйте новые схемы, блоки или графики Superset.</div>
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
      </div>
      <AddWidgetModal open={addModal} onClose={() => setAddModal(false)} onAdd={addWidget}/>
    </>
  );
}

Object.assign(window, { SchemesPage });
