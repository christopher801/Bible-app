// Canonical Protestant canon: 66 books in standard order.
// Book ids are stable identifiers; localized names live in src/i18n/bookNames.js.
export const BOOKS = [
  { id: 'genesis', testament: 'ot', chapters: 50 },
  { id: 'exodus', testament: 'ot', chapters: 40 },
  { id: 'leviticus', testament: 'ot', chapters: 27 },
  { id: 'numbers', testament: 'ot', chapters: 36 },
  { id: 'deuteronomy', testament: 'ot', chapters: 34 },
  { id: 'joshua', testament: 'ot', chapters: 24 },
  { id: 'judges', testament: 'ot', chapters: 21 },
  { id: 'ruth', testament: 'ot', chapters: 4 },
  { id: '1samuel', testament: 'ot', chapters: 31 },
  { id: '2samuel', testament: 'ot', chapters: 24 },
  { id: '1kings', testament: 'ot', chapters: 22 },
  { id: '2kings', testament: 'ot', chapters: 25 },
  { id: '1chronicles', testament: 'ot', chapters: 29 },
  { id: '2chronicles', testament: 'ot', chapters: 36 },
  { id: 'ezra', testament: 'ot', chapters: 10 },
  { id: 'nehemiah', testament: 'ot', chapters: 13 },
  { id: 'esther', testament: 'ot', chapters: 10 },
  { id: 'job', testament: 'ot', chapters: 42 },
  { id: 'psalms', testament: 'ot', chapters: 150 },
  { id: 'proverbs', testament: 'ot', chapters: 31 },
  { id: 'ecclesiastes', testament: 'ot', chapters: 12 },
  { id: 'songofsolomon', testament: 'ot', chapters: 8 },
  { id: 'isaiah', testament: 'ot', chapters: 66 },
  { id: 'jeremiah', testament: 'ot', chapters: 52 },
  { id: 'lamentations', testament: 'ot', chapters: 5 },
  { id: 'ezekiel', testament: 'ot', chapters: 48 },
  { id: 'daniel', testament: 'ot', chapters: 12 },
  { id: 'hosea', testament: 'ot', chapters: 14 },
  { id: 'joel', testament: 'ot', chapters: 3 },
  { id: 'amos', testament: 'ot', chapters: 9 },
  { id: 'obadiah', testament: 'ot', chapters: 1 },
  { id: 'jonah', testament: 'ot', chapters: 4 },
  { id: 'micah', testament: 'ot', chapters: 7 },
  { id: 'nahum', testament: 'ot', chapters: 3 },
  { id: 'habakkuk', testament: 'ot', chapters: 3 },
  { id: 'zephaniah', testament: 'ot', chapters: 3 },
  { id: 'haggai', testament: 'ot', chapters: 2 },
  { id: 'zechariah', testament: 'ot', chapters: 14 },
  { id: 'malachi', testament: 'ot', chapters: 4 },
  { id: 'matthew', testament: 'nt', chapters: 28 },
  { id: 'mark', testament: 'nt', chapters: 16 },
  { id: 'luke', testament: 'nt', chapters: 24 },
  { id: 'john', testament: 'nt', chapters: 21 },
  { id: 'acts', testament: 'nt', chapters: 28 },
  { id: 'romans', testament: 'nt', chapters: 16 },
  { id: '1corinthians', testament: 'nt', chapters: 16 },
  { id: '2corinthians', testament: 'nt', chapters: 13 },
  { id: 'galatians', testament: 'nt', chapters: 6 },
  { id: 'ephesians', testament: 'nt', chapters: 6 },
  { id: 'philippians', testament: 'nt', chapters: 4 },
  { id: 'colossians', testament: 'nt', chapters: 4 },
  { id: '1thessalonians', testament: 'nt', chapters: 5 },
  { id: '2thessalonians', testament: 'nt', chapters: 3 },
  { id: '1timothy', testament: 'nt', chapters: 6 },
  { id: '2timothy', testament: 'nt', chapters: 4 },
  { id: 'titus', testament: 'nt', chapters: 3 },
  { id: 'philemon', testament: 'nt', chapters: 1 },
  { id: 'hebrews', testament: 'nt', chapters: 13 },
  { id: 'james', testament: 'nt', chapters: 5 },
  { id: '1peter', testament: 'nt', chapters: 5 },
  { id: '2peter', testament: 'nt', chapters: 3 },
  { id: '1john', testament: 'nt', chapters: 5 },
  { id: '2john', testament: 'nt', chapters: 1 },
  { id: '3john', testament: 'nt', chapters: 1 },
  { id: 'jude', testament: 'nt', chapters: 1 },
  { id: 'revelation', testament: 'nt', chapters: 22 }
];

export const BOOK_IDS = BOOKS.map((b) => b.id);
const INDEX = new Map(BOOKS.map((b, i) => [b.id, i]));

export const OLD_TESTAMENT = BOOKS.filter((b) => b.testament === 'ot');
export const NEW_TESTAMENT = BOOKS.filter((b) => b.testament === 'nt');

export function getBook(id) {
  const i = INDEX.get(id);
  return i === undefined ? null : BOOKS[i];
}

export function isValidBook(id) {
  return INDEX.has(id);
}

export function isValidChapter(bookId, chapter) {
  const b = getBook(bookId);
  return !!b && Number.isInteger(chapter) && chapter >= 1 && chapter <= b.chapters;
}

/** Returns { book, chapter } for the chapter after the given one, or null at the end of the canon. */
export function nextChapter(bookId, chapter) {
  const i = INDEX.get(bookId);
  if (i === undefined) return null;
  if (chapter < BOOKS[i].chapters) return { book: bookId, chapter: chapter + 1 };
  if (i + 1 < BOOKS.length) return { book: BOOKS[i + 1].id, chapter: 1 };
  return null;
}

/** Returns { book, chapter } for the chapter before the given one, or null at the start of the canon. */
export function prevChapter(bookId, chapter) {
  const i = INDEX.get(bookId);
  if (i === undefined) return null;
  if (chapter > 1) return { book: bookId, chapter: chapter - 1 };
  if (i > 0) return { book: BOOKS[i - 1].id, chapter: BOOKS[i - 1].chapters };
  return null;
}
