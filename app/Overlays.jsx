// Toast система, Modal и Drawer + Dropdown menu

const { useState, useEffect, useContext, createContext, useRef, useCallback } = React;

// ============ TOAST ============
const ToastContext = createContext(null);
const useToast = () => useContext(ToastContext);

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const push = useCallback((toast) => {
    const id = ++idRef.current;
    const item = { id, ...toast };
    setToasts((prev) => [...prev, item]);
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, toast.duration || 4500);
    }
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (title, desc, opts) => push({ variant: 'success', title, desc, ...opts }),
    error:   (title, desc, opts) => push({ variant: 'danger',  title, desc, ...opts }),
    warning: (title, desc, opts) => push({ variant: 'warning', title, desc, ...opts }),
    info:    (title, desc, opts) => push({ variant: 'info',    title, desc, ...opts }),
    push,
    dismiss,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div style={{
        position: 'fixed', top: 72, right: 20, zIndex: 90,
        display: 'flex', flexDirection: 'column', gap: 10,
        pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast--${t.variant}`} style={{ pointerEvents: 'auto', animation: 'toastIn 200ms cubic-bezier(.2,.7,.2,1)' }}>
            <div className="toast__icon">
              {t.variant === 'success' && <IconCheck size={18} />}
              {t.variant === 'danger'  && <IconAlert size={18} />}
              {t.variant === 'warning' && <IconWarning size={18} />}
              {t.variant === 'info'    && <IconInfo size={18} />}
            </div>
            <div className="toast__body">
              {t.title && <div className="toast__title">{t.title}</div>}
              {t.desc && <div className="toast__desc">{t.desc}</div>}
            </div>
            {t.action && (
              <button className="toast__action" onClick={() => { t.action.onClick?.(); dismiss(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button
              className="toast__action"
              style={{ opacity: .5, fontSize: 18, padding: 0, minWidth: 22 }}
              onClick={() => dismiss(t.id)}
              aria-label="Закрыть"
            >×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============ MODAL ============
function Modal({ open, onClose, title, desc, children, footer, size = 'md', closeOnBackdrop = true }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = { sm: '', md: '', lg: 'modal--lg', xl: 'modal--xl' }[size] || '';

  return (
    <div
      className="modal-backdrop"
      style={{ animation: 'fadeIn 180ms ease-out' }}
      onClick={(e) => { if (e.target === e.currentTarget && closeOnBackdrop) onClose?.(); }}
    >
      <div className={`modal ${sizeClass}`} style={{ animation: 'modalIn 200ms cubic-bezier(.2,.7,.2,1)' }} role="dialog" aria-modal="true">
        <div className="modal__header">
          <div>
            {title && <div className="modal__title">{title}</div>}
            {desc && <div className="modal__desc">{desc}</div>}
          </div>
          <button className="modal__close" onClick={onClose} aria-label="Закрыть">
            <IconClose size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  );
}

// ============ DRAWER (side panel) ============
function Drawer({ open, onClose, title, children, width = 320 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(15,23,32,.35)',
          opacity: open ? 1 : 0, pointerEvents: open ? 'auto' : 'none',
          transition: 'opacity 200ms',
        }}
      />
      <aside style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width,
        background: 'var(--ink-000)', zIndex: 80,
        boxShadow: 'var(--shadow-lg)',
        transform: open ? 'translateX(0)' : `translateX(${width}px)`,
        transition: 'transform 240ms cubic-bezier(.2,.7,.2,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid var(--ink-200)',
        }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-900)' }}>{title}</div>
          <button className="modal__close" onClick={onClose} aria-label="Закрыть">
            <IconClose size={18} />
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
          {children}
        </div>
      </aside>
    </>
  );
}

// ============ DROPDOWN MENU ============
function Dropdown({ trigger, items, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <div onClick={() => setOpen(v => !v)}>
        {typeof trigger === 'function' ? trigger(open) : trigger}
      </div>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)',
          [align === 'right' ? 'right' : 'left']: 0,
          minWidth: 200, background: 'var(--ink-000)',
          border: '1px solid var(--ink-200)',
          borderRadius: 'var(--r-md)', boxShadow: 'var(--shadow-md)',
          padding: 4, zIndex: 60,
          animation: 'ddIn 140ms cubic-bezier(.2,.7,.2,1)',
        }}>
          {items.map((it, i) => it.divider ? (
            <div key={i} style={{ height: 1, background: 'var(--ink-100)', margin: '4px 0' }} />
          ) : it.header ? (
            <div key={i} style={{
              padding: '6px 10px', fontSize: 11, textTransform: 'uppercase',
              color: 'var(--ink-500)', fontWeight: 600, letterSpacing: '.06em',
            }}>{it.header}</div>
          ) : (
            <button
              key={i}
              onClick={() => { it.onClick?.(); setOpen(false); }}
              disabled={it.disabled}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '7px 10px', border: 'none', background: 'transparent',
                borderRadius: 'var(--r-sm)', cursor: it.disabled ? 'not-allowed' : 'pointer',
                fontSize: 13, color: it.danger ? 'var(--danger)' : 'var(--ink-800)',
                textAlign: 'left', fontFamily: 'var(--font-sans)',
                opacity: it.disabled ? .5 : 1,
              }}
              onMouseEnter={(e) => { if (!it.disabled) e.currentTarget.style.background = it.danger ? 'var(--danger-soft)' : 'var(--ink-100)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              {it.icon && <span style={{ display: 'flex', color: it.danger ? 'var(--danger)' : 'var(--ink-500)' }}>{it.icon}</span>}
              <span style={{ flex: 1 }}>{it.label}</span>
              {it.shortcut && <span style={{ fontSize: 11, color: 'var(--ink-400)', fontFamily: 'var(--font-mono)' }}>{it.shortcut}</span>}
              {it.badge && <span className={`badge badge--${it.badge.variant || 'neutral'}`} style={{ marginLeft: 4 }}>{it.badge.text}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ToastProvider, useToast, Modal, Drawer, Dropdown });
