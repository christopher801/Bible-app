import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Dialog from './Dialog.jsx';
import { MAIN_NAV, LIBRARY_NAV, APP_NAV, INFO_NAV } from './navItems.js';

const css = `
.bnav { position: fixed; inset: auto 0 0 0; z-index: 1030; display: flex; background: var(--surface); border-top: 1px solid var(--border);
  padding-bottom: env(safe-area-inset-bottom); height: calc(var(--bottomnav-h) + env(safe-area-inset-bottom)); }
@media (min-width: 992px) { .bnav { display: none; } }
.bnav__item { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; border: 0; background: transparent;
  color: var(--text-2); text-decoration: none; font-size: .72rem; font-weight: 600; padding: 6px 2px; }
.bnav__item i { font-size: 1.3rem; line-height: 1; }
.bnav__item span { max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bnav__item.active { color: var(--accent-ink); }
.bnav__item.active i { background: var(--accent); color: var(--on-accent); border-radius: 999px; padding: 3px 14px; margin-bottom: 1px; font-size: 1.15rem; }
.more-group { margin: 0 0 6px; font-size: .8rem; font-weight: 700; color: var(--text-2); }
.more-list { list-style: none; margin: 0 0 8px; padding: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
.more-list a { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 8px 12px; border-radius: 10px; background: var(--surface-soft); border: 1px solid var(--border); color: var(--text); text-decoration: none; font-weight: 500; font-size: .92rem; }
.more-list a.active { border-color: var(--accent); }
`;

const PRIMARY = [MAIN_NAV[0], MAIN_NAV[1], MAIN_NAV[2], LIBRARY_NAV[0]];

export default function BottomNav() {
  const { t } = useApp();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  const sections = [
    { title: t('nav.library'), items: LIBRARY_NAV },
    { title: t('nav.settings'), items: APP_NAV },
    { title: t('nav.info'), items: INFO_NAV }
  ];

  return (
    <>
      <style>{css}</style>
      <nav className="bnav" aria-label={t('a11y.mainNav')}>
        {PRIMARY.map((i) => (
          <NavLink key={i.to} to={i.to} end={i.end} className="bnav__item">
            <i className={`bi ${i.icon}`} aria-hidden="true" />
            <span>{t(i.labelKey)}</span>
          </NavLink>
        ))}
        <button type="button" className="bnav__item" onClick={() => setOpen(true)} aria-haspopup="dialog">
          <i className="bi bi-grid" aria-hidden="true" />
          <span>{t('nav.more')}</span>
        </button>
      </nav>
      <Dialog open={open} onClose={() => setOpen(false)} title={t('nav.moreTitle')} closeLabel={t('common.close')} variant="sheet">
        {sections.map((s) => (
          <div key={s.title}>
            <h3 className="more-group">{s.title}</h3>
            <ul className="more-list">
              {s.items.map((i) => (
                <li key={i.to}>
                  <NavLink to={i.to} className={({ isActive }) => (isActive ? 'active' : undefined)}>
                    <i className={`bi ${i.icon}`} aria-hidden="true" />
                    <span>{t(i.labelKey)}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Dialog>
    </>
  );
}
