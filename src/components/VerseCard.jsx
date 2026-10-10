import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { getTranslation } from '../data/bible/translations.js';
import { getVerse } from '../services/bibleService.js';
import { refPath } from '../utils/reference.js';

/** Saved-verse card shared by Favorites, Highlights and Notes. Shows the real verse text. */
export default function VerseCard({ item, color, children, footer }) {
  const { t, refLabel } = useApp();
  const [text, setText] = useState(item.text || '');
  const tr = getTranslation(item.tr);

  useEffect(() => {
    let alive = true;
    if (!item.text) {
      getVerse(item.tr, item.book, item.chapter, item.verse)
        .then((v) => alive && v && setText(v))
        .catch(() => {});
    } else setText(item.text);
    return () => {
      alive = false;
    };
  }, [item.tr, item.book, item.chapter, item.verse, item.text]);

  return (
    <article className="vcard" data-hl={color || undefined}>
      <header className="vcard__head">
        <h3>
          <Link to={refPath(item.book, item.chapter, item.verse, item.tr)}>{refLabel(item)}</Link>
          {tr && <span className="vcard__tr">{tr.abbr}</span>}
        </h3>
        <Link className="btn btn-soft btn-sm" to={refPath(item.book, item.chapter, item.verse, item.tr)} aria-label={`${t('action.openInReader')}: ${refLabel(item)}`}>
          <i className="bi bi-box-arrow-up-right" aria-hidden="true" />
          <span className="d-none d-sm-inline ms-1">{t('common.open')}</span>
        </Link>
      </header>
      {text && <p className="vcard__text">{text}</p>}
      {children}
      {footer && <div className="vcard__foot">{footer}</div>}
    </article>
  );
}
