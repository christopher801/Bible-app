import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { MAIN_NAV, LIBRARY_NAV, APP_NAV } from './navItems.js';

const css = `
.side { display: none; position: fixed; inset: 0 auto 0 0; width: var(--sidebar-w); flex-direction: column; gap: 4px; padding: calc(env(safe-area-inset-top) + 14px) 12px 16px;
  background: var(--surface); border-right: 1px solid var(--border); overflow-y: auto; z-index: 1010; }
@media (min-width: 992px) { .side { display: flex; } }
.side__brand { display: flex; align-items: center; gap: 10px; padding: 4px 8px 14px; color: var(--text); text-decoration: none; font-weight: 700; font-size: 1.15rem; }
.side__brand img { width: 36px; height: 36px; border-radius: 9px; }
.side__group { margin: 10px 0 0; padding: 0; list-style: none; display: grid; gap: 2px; }
.side__link { display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 8px 12px; border-radius: 10px; color: var(--text); text-decoration: none; font-weight: 500; }
.side__link i { font-size: 1.15rem; color: var(--text-2); }
.side__link:hover { background: var(--accent-soft); }
.side__link.active { background: var(--accent); color: var(--on-accent); font-weight: 700; }
.side__link.active i { color: var(--on-accent); }
.side__sep { height: 1px; background: var(--border); margin: 10px 8px; }
`;

function Group({ items, t }) {
  return (
    <ul className="side__group">
      {items.map((i) => (
        <li key={i.to}>
          <NavLink to={i.to} end={i.end} className="side__link">
            <i className={`bi ${i.icon}`} aria-hidden="true" />
            <span>{t(i.labelKey)}</span>
          </NavLink>
        </li>
      ))}
    </ul>
  );
}

export default function Sidebar() {
  const { t } = useApp();
  return (
    <nav className="side" aria-label={t('a11y.mainNav')}>
      <style>{css}</style>
      <Link to="/" className="side__brand">
        <img src="/icons/icon-192.png" alt="" width="36" height="36" />
        <span>{t('app.name')}</span>
      </Link>
      <Group items={MAIN_NAV} t={t} />
      <div className="side__sep" role="presentation" />
      <Group items={LIBRARY_NAV} t={t} />
      <div className="side__sep" role="presentation" />
      <Group items={APP_NAV} t={t} />
    </nav>
  );
}
