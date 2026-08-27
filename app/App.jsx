// Root — роутер + Settings drawer

const { useState: uSA } = React;

const BREADCRUMBS_MAP = {
  home:          [{ label: 'Главная' }],
  'schemes-page':[{ label: 'Мониторинг' }, { label: 'Схемы' }],
  pages:         [{ label: 'Администрирование' }, { label: 'Управление страницами' }],
  schemes:       [{ label: 'Справочники' }, { label: 'Графические формы (Мнемосхемы)' }],
  values:        [{ label: 'Справочники' }, { label: 'Текущие параметры' }],
  charts:        [{ label: 'Справочники' }, { label: 'Библиотека трендов' }],
  protocols:     [{ label: 'Справочники' }, { label: 'Сбор и первичная обработка данных' }],
  telemetry:     [{ label: 'Справочники' }, { label: 'Аналоговые параметры (ТИ)' }],
  telesignals:   [{ label: 'Справочники' }, { label: 'Дискретные сигналы (ТС)' }],
};

function SettingsDrawer({ open, onClose }) {
  const toast = useToast();
  const items = [
    { key: 'protocols',    icon: <IconRadio size={16}/>,     label: 'Сбор и первичная обработка данных', desc: `${mockProtocols.length} активных источников`, href: '#/protocols' },
    { key: 'telesignals',  icon: <IconZap size={16}/>,       label: 'Дискретные сигналы (ТС)',    desc: '32 сигнала', href: '#/telesignals' },
    { key: 'telemetry',    icon: <IconActivity size={16}/>,  label: 'Аналоговые параметры (ТИ)',  desc: `${mockTelemetry.length} полей`, href: '#/telemetry' },
    { key: 'values',       icon: <IconActivity size={16}/>,  label: 'Текущие параметры', desc: `${(mockValuesDirectoryList || []).length} виджетов · KPI из ТИ/ТС/DWH`, href: '#/values' },
    { key: 'charts',       icon: <IconLineChart size={16}/>, label: 'Библиотека трендов', desc: `${(mockChartsDirectory || []).length} виджетов · линии, KPI, отклонения`, href: '#/charts' },
    { key: 'schemes',      icon: <IconMap size={16}/>,       label: 'Графические формы (Мнемосхемы)', desc: 'справочник схем', href: '#/schemes' },
  ];
  return (
    <Drawer open={open} onClose={onClose} title="Настройки платформы" width={360}>
      <div style={{ padding: '4px 0' }}>
        <div className="eyebrow" style={{ padding: '8px 12px 4px' }}>Справочники</div>
        {items.map(it => (
          <button
            key={it.key}
            onClick={() => {
              if (it.href) { location.hash = it.href; onClose(); }
              else toast.info(`Открывается: ${it.label}`);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '10px 12px',
              border: 'none', background: 'transparent',
              borderRadius: 'var(--r-sm)', cursor: 'pointer',
              textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 14,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--ink-100)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span style={{ color: 'var(--ink-500)', display: 'flex' }}>{it.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, color: 'var(--ink-900)' }}>{it.label}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{it.desc}</div>
            </div>
            <IconChevronRight size={14} style={{ color: 'var(--ink-400)' }}/>
          </button>
        ))}

        <div className="divider"></div>

        <div className="eyebrow" style={{ padding: '8px 12px 4px' }}>Внешние инструменты</div>
        <button
          onClick={() => toast.info('Открывается редактор мнемосхем во внешнем окне…')}
          style={{
            display: 'flex', alignItems: 'center', gap: 12, width: '100%',
            padding: '10px 12px', border: '1px solid var(--ink-200)',
            background: 'var(--ink-000)', borderRadius: 'var(--r-md)',
            cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-sans)', fontSize: 14, margin: '0 0 8px',
          }}
        >
          <span style={{ color: 'var(--eae-red)', display: 'flex' }}><IconEdit size={16}/></span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, color: 'var(--ink-900)' }}>Редактор мнемосхем</div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>Открывается в отдельном окне</div>
          </div>
          <IconExternal size={14} style={{ color: 'var(--ink-400)' }}/>
        </button>
      </div>

      <div className="divider"></div>
      <div className="eyebrow" style={{ padding: '8px 12px 4px' }}>Информация</div>
      <div style={{ padding: '0 12px', color: 'var(--ink-500)', fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
        <div>Версия: 4.2.0</div>
        <div>Build: 2026.08.27</div>
        <div>API: 10.77.116.02:8700</div>
        <div>Kafka: 100k+ тегов/сек</div>
      </div>
    </Drawer>
  );
}

function App() {
  const { route } = useRouter();
  const [settingsOpen, setSettingsOpen] = uSA(false);

  const key = route.split('/')[0];
  const crumbs = BREADCRUMBS_MAP[key] || [{ label: 'Home' }];

  let content;
  switch (key) {
    case 'home':          content = <HomePage/>;             break;
    case 'schemes-page':  content = <SchemesPage/>;          break;
    case 'pages':         content = <PagesListPage/>;        break;
    case 'schemes':       content = <BlocksPage/>;           break;   // reuse: справочник схем (табличный)
    case 'values':        content = <ValuesDirectoryPage/>;  break;
    case 'charts':        content = <ChartsDirectoryPage/>;  break;
    case 'protocols':     content = <ProtocolsPage/>;        break;
    case 'telemetry':     content = <TelemetryPage/>;        break;
    case 'telesignals':   content = <TelesignalsPage/>;      break;
    default:              content = <HomePage/>;             break;
  }

  return (
    <ToastProvider>
      <Layout breadcrumbs={crumbs} onOpenSettings={() => setSettingsOpen(true)}>
        {content}
      </Layout>
      <SettingsDrawer open={settingsOpen} onClose={() => setSettingsOpen(false)}/>
    </ToastProvider>
  );
}

function mount() {
  ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
}
