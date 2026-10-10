// Application-authored reading schedules. Only references are stored; text is read from the Bible data.
import { getBook } from './books.js';

function chaptersOf(bookId) {
  const n = getBook(bookId).chapters;
  return Array.from({ length: n }, (_, i) => ({ book: bookId, chapter: i + 1 }));
}

export const PLANS = [
  { id: 'john-21', titleKey: 'plans.john.title', descKey: 'plans.john.desc', days: chaptersOf('john') },
  { id: 'proverbs-31', titleKey: 'plans.proverbs.title', descKey: 'plans.proverbs.desc', days: chaptersOf('proverbs') },
  {
    id: 'psalms-30',
    titleKey: 'plans.psalms.title',
    descKey: 'plans.psalms.desc',
    // 150 psalms over 30 days: 5 psalms per day, each reading is one chapter reference.
    days: Array.from({ length: 30 }, (_, d) => ({
      book: 'psalms',
      chapter: d * 5 + 1,
      to: d * 5 + 5
    }))
  }
];

export function getPlan(id) {
  return PLANS.find((p) => p.id === id) || null;
}
