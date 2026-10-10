import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { OLD_TESTAMENT, NEW_TESTAMENT } from '../data/books.js';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { KEYS } from '../services/storageService.js';
import { fold } from '../utils/text.js';
import PageHeader from '../components/PageHeader.jsx';

const css = `
.bgrid { list-style: none; margin: 0 0 24px; padding: 0; display: grid; gap: 10px; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
.bgrid a { display: flex; flex-direction: column; justify-content: center; min-height: 64px; padding: 10px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius);
  color: var(--text); text-decoration: none; }
.bgrid a:hover { border-color: var(--accent); }
.bgrid a.is-current { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); background: var(--surface-soft); }
.bgrid strong { line-height: 1.25; }
.bgrid small { color: var(--text-2); }
`;

export default function BibleBooks() {
  const { t, bookName } = useApp();
  const last = useStored(KEYS.lastReading);
  const [q, setQ] = useState('');
  usePageTitle(t('books.title'));

  const filter = (list) => {
    const f = fold(q.trim());
    return f ? list.filter((b) => fold(bookName(b.id)).includes(f)) : list;
  };
  const ot = useMemo(() => filter(OLD_TESTAMENT), [q, bookName]); // eslint-disable-line react-hooks/exhaustive-deps
  const nt = useMemo(() => filter(NEW_TESTAMENT), [q, bookName]); // eslint-disable-line react-hooks/exhaustive-deps

  const group = (id, title, list) =>
    list.length > 0 && (
      <section aria-labelledby={id}>
        <h2 className="section-title" id={id}>
          {title} <span className="text-secondary-ink fw-normal">· {t('books.countBooks', { n: list.length })}</span>
        </h2>
        <ul className="bgrid">
          {list.map((b) => (
            <li key={b.id}>
              <Link to={`/bible/${b.id}`} className={last && last.book === b.id ? 'is-current' : undefined} aria-label={`${bookName(b.id)}, ${t('common.chaptersN', { n: b.chapters })}`}>
                <strong>{bookName(b.id)}</strong>
                <small>{t('common.chaptersN', { n: b.chapters })}</small>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );

  return (
    <div className="page">
      <style>{css}</style>
      <PageHeader icon="bi-book" title={t('books.title')} />
      <div className="mb-4">
        <label htmlFor="book-filter" className="form-label fw-semibold">
          {t('books.search')}
        </label>
        <input id="book-filter" type="search" className="form-control" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('books.searchPlaceholder')} autoComplete="off" />
      </div>
      {group('ot-title', t('books.ot'), ot)}
      {group('nt-title', t('books.nt'), nt)}
      {ot.length === 0 && nt.length === 0 && <p role="status">{t('books.noResults', { q })}</p>}
    </div>
  );
}
