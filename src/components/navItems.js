// Single source of truth for navigation links (labels are translation keys).
export const MAIN_NAV = [
  { to: '/', icon: 'bi-house', labelKey: 'nav.home', end: true },
  { to: '/bible', icon: 'bi-book', labelKey: 'nav.bible' },
  { to: '/search', icon: 'bi-search', labelKey: 'nav.search' }
];

export const LIBRARY_NAV = [
  { to: '/favorites', icon: 'bi-heart', labelKey: 'nav.favorites' },
  { to: '/highlights', icon: 'bi-brush', labelKey: 'nav.highlights' },
  { to: '/notes', icon: 'bi-journal-text', labelKey: 'nav.notes' },
  { to: '/history', icon: 'bi-clock-history', labelKey: 'nav.history' },
  { to: '/reading-plans', icon: 'bi-calendar-check', labelKey: 'nav.plans' },
  { to: '/devotional', icon: 'bi-sunrise', labelKey: 'nav.devotional' }
];

export const APP_NAV = [
  { to: '/settings', icon: 'bi-gear', labelKey: 'nav.settings' },
  { to: '/install', icon: 'bi-download', labelKey: 'nav.install' }
];

export const INFO_NAV = [
  { to: '/about', icon: 'bi-info-circle', labelKey: 'nav.about' },
  { to: '/privacy', icon: 'bi-shield-check', labelKey: 'nav.privacy' },
  { to: '/terms', icon: 'bi-file-text', labelKey: 'nav.terms' },
  { to: '/licenses', icon: 'bi-award', labelKey: 'nav.licenses' },
  { to: '/contact', icon: 'bi-life-preserver', labelKey: 'nav.contact' }
];
