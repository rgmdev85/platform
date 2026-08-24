// Root — роутер + Settings drawer

const { useState: uSA } = React;

const BREADCRUMBS_MAP = {
  dashboard:  [{ label: 'Мониторинг' }, { label: 'Страница 1' }],
  pages:      [{ label: 'Администрирование' }, { label: 'Управление страницами' }],
  blocks:     [{ label: 'Администрирование' }, { label: 'Блоки' }],
  protocols:  [{ label: 'Администрирование' }, { label: 'Протоколы' }],
  telemetry:  [{ label: 'Администрирование' }, { label: 'Телеизмерения' }],
};

function SettingsDrawer({ open, onClose }) {
  const toast = useToast();
  const items = [
    { key: 'receive',    icon: <IconRadio size={16}/>,     label: 'Приём данных',        desc: '6 активных источников' },
    { key: 'signaling',  icon: <IconWarning size={16}/>,   label: 'Телесигнализация',    desc: '3 активных сигнала', badge: 3 },
    { key: 'signals',    icon: <IconZap size={16}/>,       label: 'Телесигналы',         desc: '12 настроенных' },
    { key: 'blocks',     icon: <IconDatabase size={16}/>,  label: 'Блоки',               desc: '5 блоков', href: '#/blocks' },
    { key: 'schemes',    icon: <IconMap size={16}/>,       label: 'Схемы',               desc: 'редактор мнемосхем' },
  ];
  return (
    <Drawer open={open} onClose={onClose} title="Настройки платформы" width={340}>
      <div style={{ padding: '4px 0' }}>
        <div className="eyebrow" style={{ padding: '8px 12px 4px' }}>Разделы</div>
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
            {it.badge && <span className="badge badge--danger">{it.badge}</span>}
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
          <IconChevronRight size={14} style={{ color: 'var(--ink-400)' }}/>
        </button>
      </div>

      <div className="divider"></div>
      <div className="eyebrow" style={{ padding: '8px 12px 4px' }}>Информация</div>
      <div style={{ padding: '0 12px', color: 'var(--ink-500)', fontSize: 12, fontFamily: 'var(--font-mono)', lineHeight: 1.8 }}>
        <div>Версия: 4.2.0</div>
        <div>Build: 2026.08.24</div>
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
    case 'dashboard':  content = <DashboardPage/>;      break;
    case 'pages':      content = <PagesListPage/>;      break;
    case 'blocks':     content = <BlocksPage/>;         break;
    case 'protocols':  content = <ProtocolsPage/>;      break;
    case 'telemetry':  content = <TelemetryPage/>;      break;
    default:           content = <DashboardPage/>;      break;
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
