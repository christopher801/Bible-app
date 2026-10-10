// Lazy loaders: every book (and the per-chapter verse counts) is its own chunk,
// so nothing from the Bible text is part of the initial bundle.
// Layout: ./<translationId>/<bookId>.json (array of chapters, each an array of verse strings)
//         ./<translationId>/counts.json   ({ bookId: [verseCountPerChapter] })
const modules = import.meta.glob('./*/*.json', { import: 'default' });

export function bookLoader(translationId, bookId) {
  return modules[`./${translationId}/${bookId}.json`] || null;
}

export function countsLoader(translationId) {
  return modules[`./${translationId}/counts.json`] || null;
}
