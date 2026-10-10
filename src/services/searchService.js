// Local, offline Bible search. Books are loaded lazily one at a time (and cached), the scan yields to the
// UI thread between books, and results can be cancelled with an AbortSignal.
import { BOOK_IDS } from '../data/books.js';
import { loadBook, isTranslationAvailable } from './bibleService.js';
import { fold, buildMatcher } from '../utils/text.js';

const foldedCache = new Map(); // `${tr}:${book}` -> string[][] (folded)
export const MAX_RESULTS = 300;
export const MIN_QUERY = 2;

const tick = () => new Promise((r) => setTimeout(r, 0));

async function foldedBook(tr, book) {
  const key = `${tr}:${book}`;
  if (foldedCache.has(key)) return foldedCache.get(key);
  const chapters = await loadBook(tr, book);
  const folded = chapters.map((c) => c.map(fold));
  foldedCache.set(key, folded);
  return folded;
}

/**
 * Searches the whole translation for a word or phrase (matches the start of words, ignores case and accents).
 * onProgress(done, total, resultsSoFar) is called after every book.
 * Resolves to { results: [{book, chapter, verse, text}], truncated }.
 */
export async function searchBible(query, tr, { signal, onProgress } = {}) {
  const q = String(query || '').trim();
  if (q.length < MIN_QUERY) return { results: [], truncated: false };
  if (!isTranslationAvailable(tr)) throw new Error('unavailable');
  const re = buildMatcher(q, '');
  const results = [];
  let truncated = false;
  for (let i = 0; i < BOOK_IDS.length; i++) {
    if (signal && signal.aborted) return { results, truncated, aborted: true };
    const book = BOOK_IDS[i];
    const [folded, original] = await Promise.all([foldedBook(tr, book), loadBook(tr, book)]);
    outer: for (let c = 0; c < folded.length; c++) {
      for (let v = 0; v < folded[c].length; v++) {
        if (re.test(folded[c][v])) {
          if (results.length >= MAX_RESULTS) {
            truncated = true;
            break outer;
          }
          results.push({ book, chapter: c + 1, verse: v + 1, text: original[c][v] });
        }
      }
    }
    if (onProgress) onProgress(i + 1, BOOK_IDS.length, results.length);
    if (truncated) break;
    await tick();
  }
  return { results, truncated };
}
