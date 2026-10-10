import { BOOKS, getBook } from '../data/books.js';
import { BOOK_NAMES, BOOK_ALIASES } from '../i18n/bookNames.js';
import { fold } from './text.js';

const norm = (s) => fold(s).replace(/[^\p{L}\p{N}]/gu, '');

// Alias map built from the names in every interface language plus common spellings.
const ALIAS = new Map();
for (const { id } of BOOKS) {
  for (const lang of Object.keys(BOOK_NAMES)) ALIAS.set(norm(BOOK_NAMES[lang][id]), id);
  ALIAS.set(id, id);
  for (const a of BOOK_ALIASES[id] || []) ALIAS.set(norm(a), id);
}

export function resolveBook(text) {
  return ALIAS.get(norm(text)) || null;
}

/**
 * Parses references such as "John 3:16", "Psalm 23", "1 Cor 13", "Juan 3 16" or just "Genesis".
 * Returns { book, chapter?, verse? } or null when it does not look like a reference.
 * Chapter numbers are validated against the canon; verse numbers must be checked against loaded data.
 */
export function parseReference(input) {
  const raw = String(input || '').trim();
  if (!raw) return null;
  const whole = resolveBook(raw);
  if (whole) return { book: whole };
  const m = raw.match(/^(.*?[^\d\s:.,])\s*(\d{1,3})(?:\s*[:.,\s]\s*(\d{1,3}))?$/u);
  if (!m) return null;
  const book = resolveBook(m[1]);
  if (!book) return null;
  const chapter = parseInt(m[2], 10);
  const verse = m[3] ? parseInt(m[3], 10) : undefined;
  const b = getBook(book);
  if (chapter < 1 || chapter > b.chapters) return { book, invalid: 'chapter', max: b.chapters };
  if (verse !== undefined && verse < 1) return { book, chapter, invalid: 'verse' };
  return { book, chapter, verse };
}

/** Path to a chapter/verse in the reader. `tr` pins a specific translation for that visit only. */
export function refPath(book, chapter, verse, tr) {
  const params = new URLSearchParams();
  if (verse) params.set('verse', String(verse));
  if (tr) params.set('tr', tr);
  const qs = params.toString();
  return `/bible/${book}/${chapter}${qs ? `?${qs}` : ''}`;
}
