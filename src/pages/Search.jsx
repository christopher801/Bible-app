import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { isTranslationAvailable, getVerseCount } from '../services/bibleService.js';
import { searchBible, MIN_QUERY, MAX_RESULTS } from '../services/searchService.js';
import { parseReference, refPath } from '../utils/reference.js';
import PageHeader from '../components/PageHeader.jsx';
import SearchBar from '../components/SearchBar.jsx';
import SearchResults from '../components/SearchResults.jsx';

const EXAMPLES = ['love', 'amor', 'lanmou', 'John 3:16', 'Psalm 23', 'Genesis 1:1'];

export default function Search() {
  const { t, translationId, translation, bookName, refLabel } = useApp();
  const [sp, setSp] = useSearchParams();
  const urlQ = sp.get('q') || '';
  const [input, setInput] = useState(urlQ);
  const [query, setQuery] = useState(urlQ.trim());
  const [state, setState] = useState({ status: 'idle', results: [], truncated: false, progress: 0 });
  const [refInfo, setRefInfo] = useState(null);
  const lastUrl = useRef(urlQ);
  usePageTitle(t('search.title'));

  // Header search box navigates here with ?q=… → sync into the input.
  useEffect(() => {
    if (urlQ !== lastUrl.current) {
      lastUrl.current = urlQ;
      setInput(urlQ);
    }
  }, [urlQ]);

  // Debounce typing.
  useEffect(() => {
    const id = setTimeout(() => {
      const v = input.trim();
      setQuery(v);
      lastUrl.current = v;
      setSp(v ? { q: v } : {}, { replace: true });
    }, 350);
    return () => clearTimeout(id);
  }, [input, setSp]);

  // Reference detection (validated against the real data when a verse is given).
  useEffect(() => {
    let alive = true;
    const r = parseReference(query);
    if (!r) return setRefInfo(null);
    if (r.invalid === 'chapter') return setRefInfo({ error: t('search.invalidChapter', { book: bookName(r.book), max: r.max }) });
    if (r.verse && isTranslationAvailable(translationId)) {
      getVerseCount(translationId, r.book, r.chapter)
        .then((n) => alive && setRefInfo(r.verse <= n ? { ref: r } : { error: t('search.invalidVerse', { book: bookName(r.book), chapter: r.chapter }) }))
        .catch(() => alive && setRefInfo({ ref: r }));
    } else setRefInfo({ ref: r });
    return () => {
      alive = false;
    };
  }, [query, translationId, t, bookName]);

  // Full-text search.
  useEffect(() => {
    const r = parseReference(query);
    const refWithChapter = r && r.chapter;
    if (query.length < MIN_QUERY || refWithChapter || r?.invalid) return setState({ status: 'idle', results: [], truncated: false, progress: 0 });
    if (!isTranslationAvailable(translationId)) return setState({ status: 'unavailable', results: [], truncated: false, progress: 0 });
    const ctl = new AbortController();
    setState((s) => ({ ...s, status: 'searching', progress: 0 }));
    searchBible(query, translationId, { signal: ctl.signal, onProgress: (d, tot, n) => !ctl.signal.aborted && setState((s) => ({ ...s, progress: d, results: s.status === 'searching' ? s.results : s.results })) })
      .then((res) => !res.aborted && setState({ status: 'done', results: res.results, truncated: res.truncated, progress: 0 }))
      .catch(() => !ctl.signal.aborted && setState({ status: 'error', results: [], truncated: false, progress: 0 }));
    return () => ctl.abort();
  }, [query, translationId]);

  const n = state.results.length;
  return (
    <div className="page">
      <PageHeader icon="bi-search" title={t('search.title')} subtitle={translation ? t('search.inTranslation', { name: translation.name }) : undefined} />
      <SearchBar value={input} onChange={setInput} onSubmit={() => setQuery(input.trim())} placeholder={t('search.placeholder')} label={t('search.title')} clearLabel={t('search.clear')} autoFocus />
      {!query && (
        <div className="mt-3">
          <p className="text-secondary-ink">{t('search.hint')}</p>
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <span className="text-secondary-ink">{t('search.examples')}</span>
            {EXAMPLES.map((ex) => (
              <button key={ex} type="button" className="btn btn-soft btn-sm" onClick={() => setInput(ex)}>
                {ex}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="mt-3" aria-live="polite">
        {query.length > 0 && query.length < MIN_QUERY && <p>{t('search.minChars', { n: MIN_QUERY })}</p>}
        {refInfo && refInfo.error && <p className="text-danger" role="alert">{refInfo.error}</p>}
        {refInfo && refInfo.ref && (
          <Link className="btn btn-accent mb-3" to={refInfo.ref.chapter ? refPath(refInfo.ref.book, refInfo.ref.chapter, refInfo.ref.verse) : `/bible/${refInfo.ref.book}`}>
            <i className="bi bi-arrow-right-circle me-2" aria-hidden="true" />
            {t('search.reference')}: {refInfo.ref.chapter ? refLabel(refInfo.ref) : bookName(refInfo.ref.book)}
          </Link>
        )}
        {state.status === 'searching' && <p className="text-secondary-ink">{t('search.searching', { done: state.progress, total: 66 })}</p>}
        {state.status === 'unavailable' && <p>{t('search.unavailable')}</p>}
        {state.status === 'error' && <p className="text-danger" role="alert">{t('search.error')}</p>}
        {state.status === 'done' && (
          <>
            {n === 0 ? <p>{t('search.empty', { q: query, name: translation.name })}</p> : <p className="fw-semibold">{n === 1 ? t('search.resultsOne') : t('search.results', { n })}</p>}
            {state.truncated && <p className="text-secondary-ink">{t('search.truncated', { n: MAX_RESULTS })}</p>}
            {n > 0 && <SearchResults results={state.results} query={query} label={t('search.verseLabel')} />}
          </>
        )}
      </div>
    </div>
  );
}
