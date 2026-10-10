import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import InstallButton from './InstallButton.jsx';

const css = `
.hdr { position: sticky; top: 0; z-index: 1020; display: flex; align-items: center; gap: 12px; padding: calc(env(safe-area-inset-top) + 6px) 14px 6px; min-height: var(--header-h);
  background: var(--header-bg); border-bottom: 1px solid var(--border); backdrop-filter: none; }
.hdr__brand { display: flex; align-items: center; gap: 10px; color: var(--text); text-decoration: none; font-weight: 700; font-size: 1.1rem; min-height: 44px; }
.hdr__brand img { width: 32px; height: 32px; border-radius: 8px; }
.hdr__search { display: none; flex: 1; max-width: 460px; margin: 0 auto 0 12px; position: relative; }
.hdr__search input { padding-left: 38px; min-height: 42px; border-radius: 999px; }
.hdr__search i { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: var(--text-2); pointer-events: none; }
.hdr__tools { display: flex; align-items: center; gap: 8px; margin-left: auto; }
.hdr__tools select { min-height: 42px; width: auto; border-radius: 10px; padding-right: 2rem; }
.hdr__install { min-width: 44px; padding-inline: 12px; }
@media (min-width: 768px) { .hdr__search { display: block; } .hdr__tools { margin-left: 0; } }
@media (min-width: 992px) { .hdr__brand { display: none; } .hdr { padding-inline: 24px; } .hdr__search { margin-left: 0; } .hdr__tools { margin-left: auto; } }
`;

export default function AppHeader() {
  const { t, lang, setLang } = useApp();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const v = q.trim();
    navigate(v ? `/search?q=${encodeURIComponent(v)}` : '/search');
    setQ('');
  };

  return (
    <header className="hdr">
      <style>{css}</style>
      <Link to="/" className="hdr__brand">
        <img src="/icons/icon-192.png" alt="" width="32" height="32" />
        <span>{t('app.name')}</span>
      </Link>
      <form className="hdr__search" role="search" onSubmit={submit}>
        <label htmlFor="hdr-search" className="visually-hidden">
          {t('search.title')}
        </label>
        <i className="bi bi-search" aria-hidden="true" />
        <input id="hdr-search" className="form-control" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('common.search')} autoComplete="off" />
      </form>
      <div className="hdr__tools">
        <label htmlFor="hdr-lang" className="visually-hidden">
          {t('settings.interfaceLang')}
        </label>
        <select id="hdr-lang" className="form-select" value={lang} onChange={(e) => setLang(e.target.value)} lang={lang}>
          <option value="ht" lang="ht">Kreyòl</option>
          <option value="es" lang="es">Español</option>
          <option value="en" lang="en">English</option>
        </select>
        <InstallButton compact className="btn btn-soft hdr__install" />
      </div>
    </header>
  );
}
