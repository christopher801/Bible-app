// Loads Bible text lazily from the bundled per-book JSON chunks. Nothing here uses the network
// except fetching the app's own static chunks (which the service worker caches for offline use).
import { BOOK_IDS, getBook, isValidChapter } from '../data/books.js';
import { bookLoader, countsLoader } from '../data/bible/loaders.js';
import { getTranslation } from '../data/bible/translations.js';
import { VOTD_REFS } from '../data/votd.js';

const bookCache = new Map(); // `${tr}:${book}` -> Promise<string[][]>
const countsCache = new Map(); // tr -> Promise<{ [bookId]: number[] }>

export class BibleDataError extends Error {
  constructor(code, message) {
    super(message || code);
    this.code = code; // 'unavailable' | 'not-found' | 'load-failed'
  }
}

export function isTranslationAvailable(tr) {
  const t = getTranslation(tr);
  return !!(t && t.available);
}

export function loadBook(tr, bookId) {
  if (!isTranslationAvailable(tr)) return Promise.reject(new BibleDataError('unavailable'));
  const loader = bookLoader(tr, bookId);
  if (!loader) return Promise.reject(new BibleDataError('not-found'));
  const key = `${tr}:${bookId}`;
  if (!bookCache.has(key)) {
    const p = loader().catch((e) => {
      bookCache.delete(key); // allow retry (e.g. after reconnecting)
      throw new BibleDataError('load-failed', e && e.message);
    });
    bookCache.set(key, p);
  }
  return bookCache.get(key);
}

export function loadCounts(tr) {
  if (!isTranslationAvailable(tr)) return Promise.reject(new BibleDataError('unavailable'));
  const loader = countsLoader(tr);
  if (!loader) return Promise.reject(new BibleDataError('not-found'));
  if (!countsCache.has(tr)) {
    countsCache.set(
      tr,
      loader().catch((e) => {
        countsCache.delete(tr);
        throw new BibleDataError('load-failed', e && e.message);
      })
    );
  }
  return countsCache.get(tr);
}

/** Returns an array of verse strings (index 0 = verse 1). */
export async function getChapter(tr, bookId, chapter) {
  if (!isValidChapter(bookId, chapter)) throw new BibleDataError('not-found');
  const chapters = await loadBook(tr, bookId);
  const verses = chapters[chapter - 1];
  if (!verses) throw new BibleDataError('not-found');
  return verses;
}

export async function getVerse(tr, bookId, chapter, verse) {
  const verses = await getChapter(tr, bookId, chapter);
  return verses[verse - 1] || null;
}

export async function getVerseCount(tr, bookId, chapter) {
  const counts = await loadCounts(tr);
  return (counts[bookId] && counts[bookId][chapter - 1]) || 0;
}

export async function getBookVerseTotal(tr, bookId) {
  const counts = await loadCounts(tr);
  return (counts[bookId] || []).reduce((a, b) => a + b, 0);
}

/** Loads every book of a translation so it is available offline. Reports progress as (done, total). */
export async function preloadAll(tr, onProgress, signal) {
  let done = 0;
  const queue = [...BOOK_IDS];
  const workers = Array.from({ length: 4 }, async () => {
    while (queue.length) {
      if (signal && signal.aborted) return;
      const id = queue.shift();
      await loadBook(tr, id);
      done += 1;
      if (onProgress) onProgress(done, BOOK_IDS.length);
    }
  });
  await Promise.all(workers);
}

/** Local calendar day number (stable for the whole local day, changes at local midnight). */
export function localDayNumber(date = new Date()) {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}

/**
 * Deterministic Verse of the Day. Only references that really exist in the selected translation are used.
 * Returns { book, chapter, verse, text } using the real verse text.
 */
export async function getVerseOfTheDay(tr, date = new Date()) {
  const counts = await loadCounts(tr);
  const valid = VOTD_REFS.filter(([b, c, v]) => {
    const bk = getBook(b);
    return bk && counts[b] && c >= 1 && c <= bk.chapters && v >= 1 && v <= counts[b][c - 1];
  });
  if (!valid.length) throw new BibleDataError('not-found');
  const [book, chapter, verse] = valid[localDayNumber(date) % valid.length];
  const text = await getVerse(tr, book, chapter, verse);
  if (!text) throw new BibleDataError('not-found');
  return { book, chapter, verse, text };
}
