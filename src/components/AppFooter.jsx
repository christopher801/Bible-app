import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { APP_VERSION } from '../config.js';

const css = `
.foot { margin-top: 40px; border-top: 1px solid var(--border); background: var(--surface-soft); }
.foot__in { max-width: 1100px; margin: 0 auto; padding: 28px 20px 20px; display: grid; gap: 24px; grid-template-columns: 1fr; }
@media (min-width: 768px) { .foot__in { grid-template-columns: 1.4fr 1fr 1fr; } }
.foot__brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 1.1rem; color: var(--text); text-decoration: none; margin-bottom: 8px; }
.foot__brand img { width: 36px; height: 36px; border-radius: 9px; }
.foot p { color: var(--text-2); margin: 0; max-width: 38ch; }
.foot h2 { font-size: .85rem; font-weight: 700; color: var(--text-2); margin: 0 0 8px; }
.foot ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 2px; }
.foot li a { display: inline-flex; align-items: center; min-height: 40px; color: var(--text); text-decoration: none; border-radius: 6px; }
.foot li a:hover { color: var(--accent-ink); text-decoration: underline; }
.foot__bottom { max-width: 1100px; margin: 0 auto; padding: 14px 20px 22px; border-top: 1px solid var(--border); display: flex; flex-wrap: wrap; gap: 6px 18px; justify-content: space-between; color: var(--text-2); font-size: .88rem; }
`;

export default function AppFooter() {
  const { t } = useApp();
  return (
    <footer className="foot">
      <style>{css}</style>
      <div className="foot__in">
        <div>
          <Link to="/" className="foot__brand">
            <img src="/icons/icon-192.png" alt="" width="36" height="36" />
            <span>{t('app.name')}</span>
          </Link>
          <p>{t('footer.desc')}</p>
        </div>
        <nav aria-label={t('a11y.footerNav')}>
          <h2>{t('footer.explore')}</h2>
          <ul>
            <li><Link to="/">{t('nav.home')}</Link></li>
            <li><Link to="/bible">{t('nav.bible')}</Link></li>
            <li><Link to="/search">{t('nav.search')}</Link></li>
            <li><Link to="/favorites">{t('nav.favorites')}</Link></li>
          </ul>
        </nav>
        <nav aria-label={t('footer.legal')}>
          <h2>{t('footer.legal')}</h2>
          <ul>
            <li><Link to="/about">{t('nav.about')}</Link></li>
            <li><Link to="/privacy">{t('nav.privacy')}</Link></li>
            <li><Link to="/terms">{t('nav.terms')}</Link></li>
            <li><Link to="/licenses">{t('nav.licenses')}</Link></li>
            <li><Link to="/contact">{t('nav.contact')}</Link></li>
          </ul>
        </nav>
      </div>
      <div className="foot__bottom">
        <span>{t('footer.note')}</span>
        <span>{t('common.version', { v: APP_VERSION })}</span>
      </div>
    </footer>
  );
}
