import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { getBook, isValidChapter, nextChapter, prevChapter } from '../data/books.js';
import { getTranslation } from '../data/bible/translations.js';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useVerseShare } from '../hooks/useVerseShare.js';
import { getChapter, isTranslationAvailable } from '../services/bibleService.js';
import {
  FONT_SIZE, LINE_HEIGHT, KEYS, THEMES, deleteNote, recordReading, refId, removeHighlight, saveNote, setHighlight, toggleFavorite
} from '../services/storageService.js';
import { refPath } from '../utils/reference.js';
import BookSelector from '../components/BookSelector.jsx';
import ChapterSelector from '../components/ChapterSelector.jsx';
import Verse from '../components/Verse.jsx';
import VerseActions from '../components/VerseActions.jsx';
import NoteDialog from '../components/NoteDialog.jsx';
import EmptyState from '../components/EmptyState.jsx';
import NotFound from './NotFound.jsx';

const css = `
.reader { max-width: 860px; margin: 0 auto; padding: 0 16px 24px; }
.reader--sel { padding-bottom: 240px; }
@media (min-width: 768px) { .reader--sel { padding-bottom: 24px; } }
.rbar { position: sticky; top: calc(var(--header-h) + env(safe-area-inset-top)); z-index: 1000; background: var(--header-bg); border-bottom: 1px solid var(--border); margin: 0 -16px 16px; padding: 10px 16px; }
@media (min-width: 992px) { .rbar { top: calc(var(--header-h) + env(safe-area-inset-top)); } }
.rbar__row { display: flex; align-items: flex-end; gap: 8px; flex-wrap: wrap; }
.select-field { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.select-field label { font-size: .75rem; font-weight: 600; color: var(--text-2); }
.rbar__book { flex: 2 1 160px; } .rbar__chap { flex: 1 1 84px; max-width: 120px; }
.rbar__btns { display: flex; gap: 6px; margin-left: auto; }
.icon-btn { display: inline-grid; place-items: center; width: 44px; height: 44px; border: 1px solid var(--border); background: var(--surface); color: var(--text); border-radius: 10px; text-decoration: none; }
.icon-btn:hover:not(:disabled):not([aria-disabled="true"]) { border-color: var(--accent); }
.icon-btn:disabled, .icon-btn[aria-disabled="true"] { opacity: .4; cursor: not-allowed; }
.icon-btn[aria-expanded="true"] { background: var(--accent); border-color: var(--accent); color: var(--on-accent); }
.rdisp { margin-top: 10px; padding: 12px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); display: grid; gap: 12px; grid-template-columns: 1fr; }
@media (min-width: 640px) { .rdisp { grid-template-columns: repeat(3, 1fr); } }
.rdisp__label { font-size: .8rem; font-weight: 700; color: var(--text-2); margin-bottom: 6px; }
.rdisp__ctl { display: flex; align-items: center; gap: 8px; }
.rdisp__val { min-width: 3.4ch; text-align: center; font-weight: 700; font-variant-numeric: tabular-nums; }
.rhead { margin: 8px 0 18px; }
.rhead h1 { font-size: clamp(1.6rem, 1.2rem + 1.6vw, 2.2rem); margin: 0; font-weight: 700; }
.rhead p { margin: 2px 0 0; color: var(--text-2); font-size: .92rem; }
.rtext { list-style: none; margin: 0; padding: 0; font-family: var(--font-reading); font-size: var(--reader-fs, 19px); line-height: var(--reader-lh, 1.8); color: var(--text); }
.verse { margin: 0; scroll-margin-top: 150px; border-radius: 8px; }
.verse__btn { display: block; width: 100%; text-align: left; background: transparent; border: 0; padding: 4px 6px; color: inherit; font: inherit; line-height: inherit; border-radius: 8px; cursor: pointer; }
.verse__btn:hover { background: var(--accent-soft); }
.verse--selected > .verse__btn { background: var(--accent-soft); outline: 2px solid var(--accent); }
.verse__n { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: .62em; font-weight: 700; color: var(--accent-ink); margin-right: .45em; vertical-align: super; }
.verse__text { box-decoration-break: clone; -webkit-box-decoration-break: clone; }
.verse[data-hl="orange"] .verse__text { background: var(--hl-orange); }
.verse[data-hl="yellow"] .verse__text { background: var(--hl-yellow); }
.verse[data-hl="green"] .verse__text { background: var(--hl-green); }
.verse[data-hl="blue"] .verse__text { background: var(--hl-blue); }
.verse[data-hl="purple"] .verse__text { background: var(--hl-purple); }
.verse__marks { margin-left: .5em; font-size: .7em; color: var(--accent-ink); display: inline-flex; gap: 4px; font-family: system-ui, sans-serif; }
@media (prefers-reduced-motion: no-preference) { .verse--flash > .verse__btn { animation: vflash 2.2s ease-out; } @keyframes vflash { 0%, 55% { box-shadow: 0 0 0 3px var(--accent); } 100% { box-shadow: 0 0 0 3px transparent; } } }
.vactions { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 1rem; line-height: 1.3; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: var(--shadow); padding: 10px 12px 12px; margin: 6px 0 10px; }
.vactions__head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.vactions__x { width: 44px; height: 44px; margin: -6px -8px -6px 0; border: 0; background: transparent; color: var(--text-2); border-radius: 10px; }
.vactions__row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
.vactions__btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; min-height: 58px; padding: 6px 4px; border: 1px solid var(--border); border-radius: 10px; background: var(--surface-soft); color: var(--text); font-size: .78rem; font-weight: 600; text-align: center; }
.vactions__btn i { font-size: 1.15rem; }
.vactions__btn:hover { border-color: var(--accent); }
.vactions__btn[aria-pressed="true"] i { color: var(--accent-ink); }
.vactions__hl { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
.vactions__hl-label { font-size: .8rem; font-weight: 700; color: var(--text-2); margin-right: 4px; }
@media (max-width: 767.98px) {
  .vactions { position: fixed; left: 8px; right: 8px; bottom: calc(var(--bottomnav-h) + env(safe-area-inset-bottom) + 8px); z-index: 1040; margin: 0; box-shadow: 0 -6px 28px rgba(0,0,0,.22); }
}
@media (min-width: 768px) { .vactions { max-width: 560px; } .vactions__btn { flex-direction: row; gap: 8px; font-size: .85rem; } }
.rnav { display: flex; gap: 10px; margin-top: 28px; }
.rnav .btn { flex: 1; min-height: 52px; display: flex; align-items: center; justify-content: center; gap: 8px; }
.rnav .btn:disabled { opacity: .45; }
.rnav-note { text-align: center; color: var(--text-2); font-size: .88rem; margin-top: 10px; }
.cgrid2 { list-style: none; padding: 0; margin: 16px 0 0; display: grid; gap: 8px; grid-template-columns: repeat(auto-fill, minmax(56px, 1fr)); }
.cgrid2 a { display: grid; place-items: center; min-height: 48px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; color: var(--text); text-decoration: none; font-weight: 700; }
.skeleton { height: 14px; border-radius: 6px; background: var(--border); margin: 18px 0; opacity: .7; }
`;

function InvalidChapter({ book, chapter }) {
  const { t, bookName } = useApp();
  const info = getBook(book);
  usePageTitle(t('notfound.title'), { noindex: true });
  return (
    <div className="page">
      <style>{css}</style>
      <EmptyState icon="bi-exclamation-circle" title={t('notfound.title')} text={t('reader.invalidChapter', { chapter, book: bookName(book), max: info.chapters })}>
        <ul className="cgrid2">
          {Array.from({ length: info.chapters }, (_, i) => (
            <li key={i + 1}>
              <Link to={`/bible/${book}/${i + 1}`}>{i + 1}</Link>
            </li>
          ))}
        </ul>
      </EmptyState>
    </div>
  );
}

function ChapterView({ book, chapter, tr }) {
  const app = useApp();
  const { t, bookName, refLabel, toast, fontSize, lineHeight, theme, setFontSize, setLineHeight, setTheme } = app;
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const { copyVerse, shareVerse } = useVerseShare();
  const translation = getTranslation(tr);
  const favorites = useStored(KEYS.favorites);
  const highlights = useStored(KEYS.highlights);
  const notes = useStored(KEYS.notes);
  const [state, setState] = useState({ status: 'loading', verses: [] });
  const [selected, setSelected] = useState(null);
  const [noteFor, setNoteFor] = useState(null);
  const [showDisplay, setShowDisplay] = useState(false);
  const [flash, setFlash] = useState(null);
  const target = parseInt(sp.get('verse') || '', 10) || null;

  // Must stay below the useState calls: it reads `state` for the page description.
  usePageTitle(`${bookName(book)} ${chapter}`, {
    description:
      state.status === 'ok' && translation
        ? `${bookName(book)} ${chapter} (${translation.abbr}) — ${state.verses.slice(0, 3).join(' ')}`
        : undefined
  });

  useEffect(() => {
    let alive = true;
    if (!isTranslationAvailable(tr)) {
      setState({ status: 'unavailable', verses: [] });
      return undefined;
    }
    setState({ status: 'loading', verses: [] });
    getChapter(tr, book, chapter)
      .then((verses) => alive && setState({ status: 'ok', verses }))
      .catch(() => alive && setState({ status: 'error', verses: [] }));
    return () => {
      alive = false;
    };
  }, [tr, book, chapter]);

  useEffect(() => {
    if (state.status !== 'ok') return;
    recordReading(tr, book, chapter);
    if (target && target <= state.verses.length) {
      setFlash(target);
      const el = document.getElementById(`v${target}`);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'center' }));
      const timer = setTimeout(() => setFlash(null), 2300);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state, tr, book, chapter, target]);

  const favSet = useMemo(() => new Set(favorites.map((f) => f.id)), [favorites]);
  const hlMap = useMemo(() => new Map(highlights.map((h) => [h.id, h.color])), [highlights]);
  const noteMap = useMemo(() => new Map(notes.map((n) => [n.id, n])), [notes]);

  const onSelect = useCallback((n) => setSelected((s) => (s === n ? null : n)), []);
  const closeActions = useCallback(() => setSelected(null), []);

  useEffect(() => {
    if (selected && window.matchMedia && window.matchMedia('(max-width: 767.98px)').matches) {
      const el = document.getElementById(`v${selected}`);
      if (el) requestAnimationFrame(() => el.scrollIntoView({ block: 'center' }));
    }
  }, [selected]);

  const prev = prevChapter(book, chapter);
  const next = nextChapter(book, chapter);
  const go = (b, c) => navigate(refPath(b, c, null, sp.get('tr')));
  const goBook = (b) => navigate(refPath(b, 1, null, sp.get('tr')));

  const refFor = (n) => ({ tr, book, chapter, verse: n });
  const textFor = (n) => state.verses[n - 1] || '';

  const noteRef = noteFor ? refFor(noteFor) : null;
  const noteExisting = noteRef ? noteMap.get(refId(tr, book, chapter, noteFor)) : null;

  const step = (value, d, { min, max, step: s }) => Math.round(Math.min(max, Math.max(min, value + d * s)) * 10) / 10;

  return (
    <div className={`reader${selected ? ' reader--sel' : ''}`} style={{ '--reader-fs': `${fontSize}px`, '--reader-lh': lineHeight }}>
      <style>{css}</style>
      <div className="rbar">
        <div className="rbar__row">
          <div className="rbar__book">
            <BookSelector id="rd-book" value={book} onChange={goBook} />
          </div>
          <div className="rbar__chap">
            <ChapterSelector id="rd-chap" book={book} value={chapter} onChange={(c) => go(book, c)} />
          </div>
          <div className="rbar__btns">
            {prev ? (
              <Link className="icon-btn" to={refPath(prev.book, prev.chapter, null, sp.get('tr'))} aria-label={t('reader.prev')} rel="prev">
                <i className="bi bi-chevron-left" aria-hidden="true" />
              </Link>
            ) : (
              <button type="button" className="icon-btn" disabled aria-label={t('reader.prev')}>
                <i className="bi bi-chevron-left" aria-hidden="true" />
              </button>
            )}
            {next ? (
              <Link className="icon-btn" to={refPath(next.book, next.chapter, null, sp.get('tr'))} aria-label={t('reader.next')} rel="next">
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </Link>
            ) : (
              <button type="button" className="icon-btn" disabled aria-label={t('reader.next')}>
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </button>
            )}
            <button type="button" className="icon-btn" aria-expanded={showDisplay} aria-controls="reader-display" aria-label={t('reader.display')} onClick={() => setShowDisplay((v) => !v)}>
              <i className="bi bi-fonts" aria-hidden="true" />
            </button>
          </div>
        </div>
        {showDisplay && (
          <div className="rdisp" id="reader-display">
            <div>
              <div className="rdisp__label" id="rd-fs">{t('reader.fontSize')}</div>
              <div className="rdisp__ctl" role="group" aria-labelledby="rd-fs">
                <button type="button" className="icon-btn" onClick={() => setFontSize(step(fontSize, -1, FONT_SIZE))} disabled={fontSize <= FONT_SIZE.min} aria-label={t('reader.decrease')}>
                  <i className="bi bi-dash-lg" aria-hidden="true" />
                </button>
                <span className="rdisp__val" aria-live="polite">{fontSize}</span>
                <button type="button" className="icon-btn" onClick={() => setFontSize(step(fontSize, 1, FONT_SIZE))} disabled={fontSize >= FONT_SIZE.max} aria-label={t('reader.increase')}>
                  <i className="bi bi-plus-lg" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div>
              <div className="rdisp__label" id="rd-lh">{t('reader.lineHeight')}</div>
              <div className="rdisp__ctl" role="group" aria-labelledby="rd-lh">
                <button type="button" className="icon-btn" onClick={() => setLineHeight(step(lineHeight, -1, LINE_HEIGHT))} disabled={lineHeight <= LINE_HEIGHT.min} aria-label={t('reader.lineLess')}>
                  <i className="bi bi-text-paragraph" aria-hidden="true" />
                </button>
                <span className="rdisp__val" aria-live="polite">{lineHeight.toFixed(1)}</span>
                <button type="button" className="icon-btn" onClick={() => setLineHeight(step(lineHeight, 1, LINE_HEIGHT))} disabled={lineHeight >= LINE_HEIGHT.max} aria-label={t('reader.lineMore')}>
                  <i className="bi bi-list-nested" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div>
              <div className="rdisp__label" id="rd-th">{t('reader.theme')}</div>
              <div className="seg" role="group" aria-labelledby="rd-th">
                {THEMES.map((th) => (
                  <button key={th} type="button" aria-pressed={theme === th} onClick={() => setTheme(th)}>
                    {t(`theme.${th}`)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <header className="rhead">
        <h1>
          {bookName(book)} {chapter}
        </h1>
        {translation && <p>{t('reader.translationNow', { name: translation.name })}</p>}
      </header>

      {state.status === 'loading' && (
        <div aria-busy="true" aria-label={t('common.loading')}>
          {[90, 100, 82, 96, 70].map((w, i) => (
            <div key={i} className="skeleton" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {state.status === 'unavailable' && (
        <EmptyState icon="bi-journal-x" title={t('reader.unavailableTitle')} text={t('reader.unavailableText')}>
          <Link className="btn btn-accent" to="/settings">
            <i className="bi bi-gear me-1" aria-hidden="true" />
            {t('reader.goSettings')}
          </Link>
        </EmptyState>
      )}

      {state.status === 'error' && (
        <EmptyState icon="bi-wifi-off" title={t('common.retry')} text={t('reader.loadError')}>
          <button type="button" className="btn btn-accent" onClick={() => window.location.reload()}>
            <i className="bi bi-arrow-clockwise me-1" aria-hidden="true" />
            {t('common.retry')}
          </button>
        </EmptyState>
      )}

      {state.status === 'ok' && (
        <ol className="rtext" lang={translation ? translation.lang : undefined} aria-label={`${bookName(book)} ${chapter}`}>
          {state.verses.map((text, i) => {
            const n = i + 1;
            const id = refId(tr, book, chapter, n);
            return (
              <Verse key={n} n={n} text={text} color={hlMap.get(id)} favorite={favSet.has(id)} hasNote={noteMap.has(id)} selected={selected === n} flash={flash === n} onSelect={onSelect}>
                {selected === n && (
                  <VerseActions
                    label={refLabel(refFor(n))}
                    isFavorite={favSet.has(id)}
                    color={hlMap.get(id)}
                    hasNote={noteMap.has(id)}
                    onClose={closeActions}
                    onFavorite={() => toast(t(toggleFavorite(refFor(n), text) ? 'toast.favAdded' : 'toast.favRemoved'), 'success')}
                    onHighlight={(c) => {
                      if (c) {
                        setHighlight(refFor(n), text, c);
                        toast(t('toast.highlightSet'), 'success');
                      } else {
                        removeHighlight(id);
                        toast(t('toast.highlightRemoved'));
                      }
                    }}
                    onNote={() => setNoteFor(n)}
                    onCopy={() => copyVerse(refFor(n), text)}
                    onShare={() => shareVerse(refFor(n), text)}
                  />
                )}
              </Verse>
            );
          })}
        </ol>
      )}

      <nav className="rnav" aria-label={t('a11y.chapterNav')}>
        {prev ? (
          <Link className="btn btn-soft" to={refPath(prev.book, prev.chapter, null, sp.get('tr'))}>
            <i className="bi bi-arrow-left" aria-hidden="true" />
            <span>{t('reader.prev')}</span>
          </Link>
        ) : (
          <button type="button" className="btn btn-soft" disabled>
            <i className="bi bi-arrow-left" aria-hidden="true" />
            <span>{t('reader.prev')}</span>
          </button>
        )}
        {next ? (
          <Link className="btn btn-accent" to={refPath(next.book, next.chapter, null, sp.get('tr'))}>
            <span>{t('reader.next')}</span>
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </Link>
        ) : (
          <button type="button" className="btn btn-accent" disabled>
            <span>{t('reader.next')}</span>
            <i className="bi bi-arrow-right" aria-hidden="true" />
          </button>
        )}
      </nav>
      {(!prev || !next) && <p className="rnav-note">{t(!prev ? 'reader.atStart' : 'reader.atEnd')}</p>}

      <NoteDialog
        open={!!noteFor}
        onClose={() => setNoteFor(null)}
        refText={noteRef ? refLabel(noteRef) : ''}
        initial={noteExisting ? noteExisting.note : ''}
        onSave={(value) => {
          if (saveNote(noteRef, textFor(noteFor), value)) toast(t('toast.noteSaved'), 'success');
          setNoteFor(null);
        }}
        onDelete={
          noteExisting
            ? () => {
                deleteNote(noteExisting.id);
                toast(t('toast.noteDeleted'));
                setNoteFor(null);
              }
            : undefined
        }
      />
    </div>
  );
}

export default function Reader() {
  const { book, chapter: chapterParam } = useParams();
  const [sp] = useSearchParams();
  const { translationId } = useApp();
  const chapter = /^\d+$/.test(chapterParam || '') ? parseInt(chapterParam, 10) : NaN;
  const pinned = sp.get('tr');
  // ?tr= pins a translation for this visit only (used by links from saved verses).
  const tr = pinned && isTranslationAvailable(pinned) ? pinned : translationId;

  if (!getBook(book)) return <NotFound />;
  if (!isValidChapter(book, chapter)) return <InvalidChapter book={book} chapter={chapterParam} />;
  return <ChapterView key={`${tr}:${book}:${chapter}`} book={book} chapter={chapter} tr={tr} />;
}