import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { useVerseShare } from '../hooks/useVerseShare.js';
import { getVerseOfTheDay, isTranslationAvailable } from '../services/bibleService.js';
import { KEYS, isFavorite, refId, toggleFavorite } from '../services/storageService.js';
import { refPath } from '../utils/reference.js';

const css = `
.votd { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 20px; }
.votd__kicker { display: flex; align-items: center; gap: 8px; font-weight: 700; color: var(--accent-ink); margin-bottom: 10px; }
.votd__text { font-family: var(--font-reading); font-size: clamp(1.15rem, 1rem + .8vw, 1.45rem); line-height: 1.6; margin: 0 0 10px; }
.votd__ref { font-weight: 700; margin: 0 0 14px; }
.votd__ref span { color: var(--text-2); font-weight: 500; }
.votd__actions { display: flex; flex-wrap: wrap; gap: 8px; }
`;

export default function VerseOfTheDay() {
  const { t, translationId, translation, refLabel, toast } = useApp();
  const favorites = useStored(KEYS.favorites);
  const { copyVerse, shareVerse } = useVerseShare();
  const [state, setState] = useState({ status: 'loading' });

  useEffect(() => {
    let alive = true;
    if (!isTranslationAvailable(translationId)) {
      setState({ status: 'unavailable' });
      return undefined;
    }
    setState({ status: 'loading' });
    getVerseOfTheDay(translationId)
      .then((v) => alive && setState({ status: 'ok', v }))
      .catch(() => alive && setState({ status: 'error' }));
    return () => {
      alive = false;
    };
  }, [translationId]);

  let body;
  if (state.status === 'loading') body = <p className="mb-0 text-secondary-ink">{t('common.loading')}</p>;
  else if (state.status === 'unavailable') body = <p className="mb-0">{t('votd.unavailable')}</p>;
  else if (state.status === 'error') body = <p className="mb-0">{t('votd.error')}</p>;
  else {
    const { v } = state;
    const ref = { tr: translationId, book: v.book, chapter: v.chapter, verse: v.verse };
    const fav = isFavorite(favorites, refId(ref.tr, ref.book, ref.chapter, ref.verse));
    body = (
      <>
        <blockquote className="mb-0">
          <p className="votd__text">{v.text}</p>
          <footer className="votd__ref">
            {refLabel(ref)} <span>· {translation.abbr}</span>
          </footer>
        </blockquote>
        <div className="votd__actions">
          <button
            type="button"
            className="btn btn-soft btn-sm"
            aria-pressed={fav}
            onClick={() => toast(t(toggleFavorite(ref, v.text) ? 'toast.favAdded' : 'toast.favRemoved'), 'success')}
          >
            <i className={`bi ${fav ? 'bi-heart-fill' : 'bi-heart'} me-1`} aria-hidden="true" />
            {t(fav ? 'action.unfavorite' : 'action.favorite')}
          </button>
          <button type="button" className="btn btn-soft btn-sm" onClick={() => copyVerse(ref, v.text)}>
            <i className="bi bi-clipboard me-1" aria-hidden="true" />
            {t('action.copy')}
          </button>
          <button type="button" className="btn btn-soft btn-sm" onClick={() => shareVerse(ref, v.text)}>
            <i className="bi bi-share me-1" aria-hidden="true" />
            {t('action.share')}
          </button>
          <Link className="btn btn-accent btn-sm" to={refPath(ref.book, ref.chapter, ref.verse)}>
            <i className="bi bi-book me-1" aria-hidden="true" />
            {t('action.openInReader')}
          </Link>
        </div>
      </>
    );
  }

  return (
    <section className="votd" aria-labelledby="votd-title">
      <style>{css}</style>
      <h2 className="votd__kicker h6 mb-2" id="votd-title">
        <i className="bi bi-sun" aria-hidden="true" />
        {t('home.votd')}
      </h2>
      {body}
    </section>
  );
}
