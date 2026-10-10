const css = `
.toast-region { position: fixed; z-index: 2000; left: 0; right: 0; bottom: calc(var(--bottomnav-h) + env(safe-area-inset-bottom) + 12px);
  display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 0 12px; pointer-events: none; }
@media (min-width: 992px) { .toast-region { bottom: 24px; } }
.toast-item { pointer-events: auto; display: flex; align-items: center; gap: 10px; max-width: 520px; width: fit-content; padding: 10px 12px 10px 16px;
  background: #1F2937; color: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.25); font-size: .95rem; line-height: 1.4; }
.toast-item--success { border-left: 4px solid #22C55E; }
.toast-item--error { border-left: 4px solid #F87171; }
.toast-item--info { border-left: 4px solid var(--accent); }
.toast-item button { background: transparent; border: 0; color: inherit; min-width: 36px; min-height: 36px; border-radius: 8px; opacity: .8; }
.toast-item button:hover { opacity: 1; background: rgba(255,255,255,.12); }
`;

export function ToastRegion({ toasts, onDismiss, label, closeLabel }) {
  return (
    <>
      <style>{css}</style>
      <div className="toast-region" role="region" aria-label={label}>
        <div aria-live="polite" aria-atomic="false" style={{ display: 'contents' }}>
          {toasts.map((t) => (
            <div key={t.id} className={`toast-item toast-item--${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
              <span>{t.message}</span>
              <button type="button" onClick={() => onDismiss(t.id)} aria-label={closeLabel}>
                <i className="bi bi-x-lg" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
