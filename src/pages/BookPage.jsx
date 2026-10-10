import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getBook } from '../data/books.js';
import { useApp } from '../context/AppContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { getBookVerseTotal, isTranslationAvailable } from '../services/bibleService.js';
import PageHeader from '../components/PageHeader.jsx';
import NotFound from './NotFound.jsx';

const css = `
.cgrid { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(56px, 1fr)); }
.cgrid a { display: grid; place-items: center; min-height: 52px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; color: var(--text); text-decoration: none; font-weight: 700; }
.cgrid a:hover { border-color: var(--accent); background: var(--accent-soft); }
`;

export default function BookPage() {
  const { book } = useParams();
  const info = getBook(book);
  const { t, bookName, translationId } = useApp();
  const [verses, setVerses] = useState(null);
  usePageTitle(info ? bookName(book) : t('notfound.title'));

  useEffect(() => {
    let alive = true;
    setVerses(null);
    if (info && isTranslationAvailable(translationId)) {
      getBookVerseTotal(translationId, book)
        .then((n) => alive && setVerses(n))
        .catch(() => {});
    }
    return () => {
      alive = false;
    };
  }, [book, translationId, info]);

  if (!info) return <NotFound />;

  return (
    <div className="page">
      <style>{css}</style>
      <PageHeader
        icon="bi-book"
        title={bookName(book)}
        subtitle={`${t('common.chaptersN', { n: info.chapters })}${verses ? ` · ${t('common.versesN', { n: verses })}` : ''}`}
      >
        <Link className="btn btn-accent" to={`/bible/${book}/1`}>
          {t('books.firstChapter')}
        </Link>
      </PageHeader>
      <nav aria-label={t('reader.chapterList', { book: bookName(book) })}>
        <h2 className="section-title">{t('books.chooseChapter')}</h2>
        <ul className="cgrid">
          {Array.from({ length: info.chapters }, (_, i) => (
            <li key={i + 1}>
              <Link to={`/bible/${book}/${i + 1}`} aria-label={`${bookName(book)} ${i + 1}`}>
                {i + 1}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-4">
        <Link to="/bible">
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />
          {t('nav.bible')}
        </Link>
      </p>
    </div>
  );
}
