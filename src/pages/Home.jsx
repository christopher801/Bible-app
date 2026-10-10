import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { KEYS } from '../services/storageService.js';
import { getTranslation } from '../data/bible/translations.js';
import { refPath } from '../utils/reference.js';
import VerseOfTheDay from '../components/VerseOfTheDay.jsx';
import InstallBanner from '../components/InstallBanner.jsx';

const css = `
.home-grid { display: grid; gap: 16px; }
@media (min-width: 992px) { .home-grid--2 { grid-template-columns: 1fr 1fr; } }
.quick { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
@media (min-width: 576px) { .quick { grid-template-columns: repeat(3, 1fr); } }
.quick a { display: flex; align-items: center; gap: 12px; min-height: 56px; padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text); text-decoration: none; font-weight: 600; }
.quick a:hover { border-color: var(--accent); }
.quick i { font-size: 1.3rem; color: var(--accent-ink); }
.mini-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mini-list a { display: block; padding: 10px 12px; border-radius: 10px; background: var(--surface-soft); border: 1px solid var(--border); color: var(--text); text-decoration: none; }
.mini-list a:hover { border-color: var(--accent); }
.mini-list small { display: block; color: var(--text-2); }
.mini-list .mini-text { font-family: var(--font-reading); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
`;

export default function Home() {
  const { t, refLabel } = useApp();
  const last = useStored(KEYS.lastReading);
  const history = useStored(KEYS.history);
  const favorites = useStored(KEYS.favorites);
  usePageTitle(null);

  const quick = [
    { to: '/bible', icon: 'bi-book', label: 'nav.bible' },
    { to: '/search', icon: 'bi-search', label: 'nav.search' },
    { to: '/favorites', icon: 'bi-heart', label: 'nav.favorites' },
    { to: '/notes', icon: 'bi-journal-text', label: 'nav.notes' },
    { to: '/reading-plans', icon: 'bi-calendar-check', label: 'nav.plans' },
    { to: '/settings', icon: 'bi-gear', label: 'nav.settings' }
  ];

  return (
    <div className="page">
      <style>{css}</style>
      <header className="page-head">
        <div className="page-head__text">
          <h1>{t('home.greeting')}</h1>
          <p>{t('home.intro')}</p>
        </div>
      </header>

      <div className="home-grid">
        <InstallBanner />
        <VerseOfTheDay />

        <section className="card-soft" aria-labelledby="home-continue">
          <h2 className="section-title" id="home-continue">
            <i className="bi bi-bookmark-star" aria-hidden="true" /> {t('home.continue')}
          </h2>
          {last ? (
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <div>
                <div className="fs-5 fw-bold">{refLabel({ book: last.book, chapter: last.chapter })}</div>
                <small className="text-secondary-ink">{getTranslation(last.tr)?.name}</small>
              </div>
              <Link className="btn btn-accent" to={refPath(last.book, last.chapter, null, last.tr)}>
                <i className="bi bi-play-fill me-1" aria-hidden="true" />
                {t('home.continueButton')}
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
              <p className="mb-0">{t('home.startText')}</p>
              <Link className="btn btn-accent" to="/bible/john/1">
                <i className="bi bi-play-fill me-1" aria-hidden="true" />
                {t('home.start')}
              </Link>
            </div>
          )}
        </section>

        <section aria-labelledby="home-quick">
          <h2 className="section-title" id="home-quick">{t('home.quick')}</h2>
          <ul className="quick">
            {quick.map((q) => (
              <li key={q.to}>
                <Link to={q.to}>
                  <i className={`bi ${q.icon}`} aria-hidden="true" />
                  <span>{t(q.label)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="home-grid home-grid--2">
          <section className="card-soft" aria-labelledby="home-recent">
            <h2 className="section-title" id="home-recent">
              <i className="bi bi-clock-history" aria-hidden="true" /> {t('home.recent')}
            </h2>
            {history.length === 0 ? (
              <p className="mb-0 text-secondary-ink">{t('home.recentEmpty')}</p>
            ) : (
              <ul className="mini-list">
                {history.slice(0, 4).map((h) => (
                  <li key={`${h.tr}-${h.book}-${h.chapter}`}>
                    <Link to={refPath(h.book, h.chapter, null, h.tr)}>
                      <strong>{refLabel(h)}</strong>
                      <small>{getTranslation(h.tr)?.abbr}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card-soft" aria-labelledby="home-favs">
            <h2 className="section-title" id="home-favs">
              <i className="bi bi-heart" aria-hidden="true" /> {t('home.favorites')}
            </h2>
            {favorites.length === 0 ? (
              <p className="mb-0 text-secondary-ink">{t('home.favoritesEmpty')}</p>
            ) : (
              <>
                <ul className="mini-list">
                  {favorites.slice(0, 3).map((f) => (
                    <li key={f.id}>
                      <Link to={refPath(f.book, f.chapter, f.verse, f.tr)}>
                        <strong>{refLabel(f)}</strong>
                        <span className="mini-text">{f.text}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link className="d-inline-block mt-2" to="/favorites">{t('common.seeAll')}</Link>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
