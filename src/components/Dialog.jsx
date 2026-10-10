import { useEffect, useId, useRef } from 'react';

const css = `
.app-dialog { border: 1px solid var(--border); border-radius: 16px; padding: 0; width: min(92vw, 520px); max-height: 88dvh; background: var(--surface); color: var(--text);
  box-shadow: 0 24px 60px rgba(0,0,0,.28); }
.app-dialog::backdrop { background: rgba(17,24,39,.55); }
.app-dialog--sheet { margin: auto auto 0; width: 100%; max-width: 640px; border-radius: 18px 18px 0 0; padding-bottom: env(safe-area-inset-bottom); }
@media (min-width: 768px) { .app-dialog--sheet { margin: auto; border-radius: 16px; } }
.app-dialog__body { padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: 88dvh; overflow-y: auto; }
.app-dialog__head { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.app-dialog__title { font-size: 1.15rem; margin: 0; font-weight: 700; }
.app-dialog__close { background: transparent; border: 0; width: 44px; height: 44px; border-radius: 10px; color: var(--text-2); margin-right: -8px; }
.app-dialog__close:hover { background: var(--accent-soft); color: var(--text); }
.app-dialog__foot { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 10px; }
@media (prefers-reduced-motion: no-preference) { .app-dialog[open] { animation: dlg-in .16s ease-out; } @keyframes dlg-in { from { opacity: 0; transform: translateY(8px); } } }
`;

/** Accessible modal built on the native <dialog> element (focus trap, Escape, backdrop). */
export default function Dialog({ open, onClose, title, children, footer, closeLabel, variant }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={`app-dialog${variant === 'sheet' ? ' app-dialog--sheet' : ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      <style>{css}</style>
      {open && (
        <div className="app-dialog__body">
          <div className="app-dialog__head">
            <h2 className="app-dialog__title" id={titleId}>
              {title}
            </h2>
            <button type="button" className="app-dialog__close" onClick={onClose} aria-label={closeLabel}>
              <i className="bi bi-x-lg" aria-hidden="true" />
            </button>
          </div>
          {children}
          {footer && <div className="app-dialog__foot">{footer}</div>}
        </div>
      )}
    </dialog>
  );
}
