// Route-level code splitting. `preloadAllPages` warms every chunk after first load so that
// all screens are also in the service worker cache for offline navigation.
export const pageLoaders = {
  Home: () => import('./Home.jsx'),
  BibleBooks: () => import('./BibleBooks.jsx'),
  BookPage: () => import('./BookPage.jsx'),
  Reader: () => import('./Reader.jsx'),
  Search: () => import('./Search.jsx'),
  Favorites: () => import('./Favorites.jsx'),
  Highlights: () => import('./Highlights.jsx'),
  Notes: () => import('./Notes.jsx'),
  History: () => import('./History.jsx'),
  ReadingPlans: () => import('./ReadingPlans.jsx'),
  Devotional: () => import('./Devotional.jsx'),
  Settings: () => import('./Settings.jsx'),
  Install: () => import('./Install.jsx'),
  About: () => import('./About.jsx'),
  Privacy: () => import('./Privacy.jsx'),
  Terms: () => import('./Terms.jsx'),
  Licenses: () => import('./Licenses.jsx'),
  Contact: () => import('./Contact.jsx'),
  NotFound: () => import('./NotFound.jsx')
};

export function preloadAllPages() {
  const run = () => Object.values(pageLoaders).forEach((load) => load().catch(() => {}));
  if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 4000 });
  else setTimeout(run, 2500);
}
