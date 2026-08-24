// Sidebar + Topbar + Layout + простой in-app router

const { useState: uS1, useEffect: uE1 } = React;

const ROUTES = [
  { key: 'dashboard', label: 'Страница 1',              icon: 'grid',     group: 'monitoring' },
  { key: 'schemes',   label: 'Схемы',                    icon: 'map',      group: 'monitoring', disabled: true, note: 'редактор мнемосхем' },
  { key: 'pages',     label: 'Управление страницами',    icon: 'layout',   group: 'admin' },
  { key: 'blocks',    label: 'Блоки',                    icon: 'database', group: 'admin' },
  { key: 'protocols', label: 'Протоколы',                icon: 'code',     group: 'admin' },
  { key: 'telemetry', label: 'Телеизмерения',            icon: 'activity', group: 'admin' },
];

function useRouter() {
  const [route, setRoute] = uS1(() => (location.hash.replace('#/', '') || 'dashboard'));
  uE1(() => {
    const onHash = () => setRoute(location.hash.replace('#/', '') || 'dashboard');
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = (key) => { location.hash = '#/' + key; };
  return { route, navigate };
}

function renderIcon(name, size = 16) {
  const map = {
    grid: <IconGrid size={size} />, layout: <IconLayout size={size} />, database: <IconDatabase size={size} />,
    code: <IconCode size={size} />, activity: <IconActivity size={size} />, map: <IconMap size={size} />,
  };
  return map[name] || <IconGrid size={size} />;
}

function Sidebar({ route, onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src="brand/eae_logo.png" alt="ЕАЕ"/>
        <div>ЕАЕ:Платформа</div>
      </div>
      <div className="sidebar__nav">
        <div className="sidebar__group">
          <div className="sidebar__group-title">Мониторинг</div>
          {ROUTES.filter(r => r.group === 'monitoring').map(r => (
            <a
              key={r.key}
              className={`sidebar__item ${route === r.key ? 'sidebar__item--active' : ''}`}
              onClick={(e) => { e.preventDefault(); if (!r.disabled) onNavigate(r.key); }}
              style={r.disabled ? { opacity: .5, cursor: 'not-allowed' } : {}}
              title={r.disabled ? r.note : undefined}
            >
              {renderIcon(r.icon)}
              <span>{r.label}</span>
              {r.disabled && <span className="badge" style={{ marginLeft: 'auto', background: 'rgba(255,255,255,.06)', color: 'var(--ink-400)' }}>вне scope</span>}
            </a>
          ))}
        </div>
        <div className="sidebar__group">
          <div className="sidebar__group-title">Администрирование</div>
          {ROUTES.filter(r => r.group === 'admin').map(r => (
            <a
              key={r.key}
              className={`sidebar__item ${route === r.key || route.startsWith(r.key + '/') ? 'sidebar__item--active' : ''}`}
              onClick={(e) => { e.preventDefault(); onNavigate(r.key); }}
            >
              {renderIcon(r.icon)}
              <span>{r.label}</span>
            </a>
          ))}
        </div>
      </div>
      <div className="sidebar__footer">v.4.2.0 · build 2026.08</div>
    </aside>
  );
}

function Topbar({ breadcrumbs, onOpenSettings }) {
  const [q, setQ] = uS1('');
  const toast = useToast();

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="btn btn--ghost btn--icon btn--sm" aria-label="Свернуть навигацию">
          <IconChevronLeft size={14} />
        </button>
        <nav className="crumbs">
          <a onClick={(e) => { e.preventDefault(); location.hash = '#/dashboard'; }}><IconHome size={12}/></a>
          {breadcrumbs.map((b, i) => (
            <React.Fragment key={i}>
              <span className="crumbs__sep">/</span>
              {i === breadcrumbs.length - 1
                ? <span className="current">{b.label}</span>
                : <a onClick={(e) => { e.preventDefault(); b.href && (location.hash = b.href); }}>{b.label}</a>}
            </React.Fragment>
          ))}
        </nav>
      </div>
      <div className="topbar__search">
        <div className="input-wrap">
          <IconSearch size={16} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)', pointerEvents: 'none' }}/>
          <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск по всей системе · Ctrl+K"/>
        </div>
      </div>
      <div className="topbar__right">
        <Dropdown
          align="right"
          trigger={
            <button className="btn btn--ghost btn--icon btn--sm notif-btn" aria-label="Уведомления">
              <IconBell size={14} />
              <span className="notif-btn__dot"></span>
            </button>
          }
          items={[
            { header: 'Уведомления · 3 новых' },
            { icon: <IconAlert size={14}/>, label: 'Блок_1: отклонение +5.1% в 10:00', shortcut: '2м' },
            { icon: <IconWarning size={14}/>, label: 'Задержка приёма данных · МЭК-104-2', shortcut: '5м' },
            { icon: <IconCheck size={14}/>, label: 'Ежедневный отчёт сформирован', shortcut: '1ч' },
            { divider: true },
            { icon: <IconEye size={14}/>, label: 'Показать все', onClick: () => toast.info('Открываем центр уведомлений…') },
          ]}
        />
        <button className="btn btn--ghost btn--icon btn--sm" onClick={onOpenSettings} aria-label="Настройки">
          <IconSettings size={14} />
        </button>
        <div className="divider--v"></div>
        <Dropdown
          align="right"
          trigger={
            <div className="topbar__user">
              <div className="topbar__avatar">ПП</div>
              <div>
                <div className="topbar__user-name">Пётр Петрович</div>
                <div className="topbar__user-role">Администратор</div>
              </div>
              <IconChevronDown size={12} />
            </div>
          }
          items={[
            { header: 'petrov@eae.ru' },
            { icon: <IconEye size={14}/>, label: 'Профиль' },
            { icon: <IconSettings size={14}/>, label: 'Настройки аккаунта' },
            { divider: true },
            { icon: <IconClose size={14}/>, label: 'Выйти', danger: true, shortcut: '⇧⌘Q' },
          ]}
        />
      </div>
    </header>
  );
}

// Общий layout
function Layout({ children, breadcrumbs, onOpenSettings }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar route={useRouter().route} onNavigate={(k) => location.hash = '#/' + k}/>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar breadcrumbs={breadcrumbs} onOpenSettings={onOpenSettings}/>
        <main style={{ flex: 1, overflow: 'auto', background: 'var(--ink-050)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

// Общий header страницы (заголовок + правая панель действий)
function PageHeader({ title, description, actions }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '20px 32px 12px', gap: 16, flexWrap: 'wrap',
    }}>
      <div>
        <h1 className="h-1" style={{ marginBottom: description ? 6 : 0 }}>{title}</h1>
        {description && <div className="body-sm muted">{description}</div>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>{actions}</div>}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, Layout, PageHeader, useRouter, ROUTES });
