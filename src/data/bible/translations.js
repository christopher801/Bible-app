// Translation registry. `available: true` means the complete text is bundled in this project.
// To add a translation, see README.md ("How to add a new translation").
export const TRANSLATIONS = [
  {
    id: 'kjv',
    lang: 'en',
    name: 'King James Version',
    abbr: 'KJV',
    available: true,
    status: 'complete',
    books: 66,
    chapters: 1189,
    verses: 31102,
    source: 'scrollmapper/bible_databases (github.com/scrollmapper/bible_databases), JSON export of the KJV text',
    license: 'Public domain',
    attribution: 'No attribution is legally required. In the United Kingdom the KJV is subject to a perpetual Crown patent; this app does not claim otherwise.',
    copyright: 'Original 1611 translation, standard 1769 text. Public domain in the United States and most other countries.'
  },
  {
    id: 'rv1909',
    lang: 'es',
    name: 'Reina-Valera 1909',
    abbr: 'RV1909',
    available: true,
    status: 'complete',
    books: 66,
    chapters: 1189,
    verses: 31102,
    source: 'scrollmapper/bible_databases (github.com/scrollmapper/bible_databases), JSON export of La Santa Biblia Reina-Valera (1909)',
    license: 'Public domain',
    attribution: 'No attribution is legally required.',
    copyright: 'Reina-Valera 1909 revision. Public domain. Later revisions (1960, 1995, etc.) are copyrighted and are NOT included.'
  },
  {
    id: 'hcv',
    lang: 'ht',
    name: 'Bib an Kreyòl Ayisyen (Haitian Creole Bible)',
    abbr: 'HCV',
    available: false,
    status: 'missing',
    books: 0,
    chapters: 0,
    verses: 0,
    source: 'Not bundled',
    license: 'Not verified',
    attribution: '',
    copyright: 'No Haitian Creole Bible text with a verified redistribution license was available when this project was generated, so none is included and none was invented.'
  }
];

export const DEFAULT_TRANSLATION_BY_LANG = { en: 'kjv', es: 'rv1909' };

export function getTranslation(id) {
  return TRANSLATIONS.find((t) => t.id === id) || null;
}

export function availableTranslations() {
  return TRANSLATIONS.filter((t) => t.available);
}
