# Bible App (Bible-PWA)

A modern, accessible, offline-first Bible reading Progressive Web App with an interface in **Haitian Creole (ht)**, **Spanish (es)** and **English (en)**.

Version 1.0.0 · React + Vite + Bootstrap 5 + JavaScript (JSX) · no backend, no accounts, no tracking.

> **Verification status:** this source project was generated and statically inspected only (imports, routes, assets, translation-key parity, JSON data integrity). It has **not** been installed, built, run or browser-tested. Expect to fix small issues on first run.

## Technology stack
React 18, Vite 5, React Router DOM 6, Bootstrap 5.3, Bootstrap Icons, native CSS, localStorage, a hand-written service worker (`public/sw.js`) and a Web App Manifest. No TypeScript, Tailwind, Firebase or other backend.

## Commands (run these yourself)
```bash
npm install
npm run dev        # development server (service worker is only registered in production builds)
npm run build      # production build into dist/
npm run preview    # serve dist/ locally to test PWA install and offline mode
```

## Folder structure
```
public/            manifest.webmanifest, sw.js, offline.html, favicon.ico, icons/, _redirects
src/
  components/      header, sidebar, bottom nav, footer, verse UI, install UI, dialogs, toast…
  context/         AppContext (language, translation, theme, toasts, confirm dialogs)
  data/            books.js (66 books), plans.js, votd.js, devotionals.js
  data/bible/      translations.js (registry), loaders.js, <translation>/<book>.json, counts.json
  hooks/ i18n/     useStored, usePageTitle…; translations.js (ht/es/en), bookNames.js
  layouts/ pages/  MainLayout; one file per route (lazy-loaded)
  services/        bibleService, searchService, storageService, pwaService, sharingService
  styles/main.css  design tokens + shared styles (component styles are embedded in the JSX files)
  utils/           reference parser, accent-insensitive text helpers
```

## Bible data and licenses
| Translation | Language | Status | License | Source |
|---|---|---|---|---|
| King James Version (KJV) | en | Complete: 66 books, 1,189 chapters, 31,102 verses | Public domain | JSON export from `scrollmapper/bible_databases` |
| Reina-Valera 1909 (RV1909) | es | Complete: 66 books, 1,189 chapters, 31,102 verses | Public domain | JSON export from `scrollmapper/bible_databases` |
| Haitian Creole Bible (HCV) | ht | **Not included** | Not verified | — |

**Haitian Creole:** a Haitian Creole text exists in public repositories, but no redistribution license could be verified, so it was deliberately **not bundled** and nothing was invented. The interface is fully available in Haitian Creole; the Bible text in Haitian Creole is listed in Settings as "not available". Any Spanish revision newer than 1909 (RVR 1960 etc.) is copyrighted and not included.

Note: the KJV is public domain in the US and most countries; in the UK it is under a Crown patent. See `/licenses` in the app.

## How to add a new translation (for example a licensed Haitian Creole Bible)
1. Obtain text you are legally allowed to redistribute and record its license.
2. Create `src/data/bible/<id>/<bookId>.json` for each of the 66 books (ids in `src/data/books.js`). Each file is an array of chapters; each chapter is an array of verse strings (index 0 = verse 1).
3. Create `src/data/bible/<id>/counts.json`: `{ "genesis": [31, 25, ...], ... }` (verses per chapter). Preserve the source's real verse numbering.
4. Edit its entry in `src/data/bible/translations.js`: set `available: true`, `status`, counts, `source`, `license`, `attribution`, `copyright`. For Haitian Creole an entry with id `hcv` already exists; either keep the id and add the files, or change the id and `DEFAULT_TRANSLATION_BY_LANG`.
5. Nothing else is required: Reader, Search, Verse of the Day, plans and Settings read the registry.

## How to add an interface language
Add a dictionary with the same keys as `en` in `src/i18n/translations.js`, add its book names in `src/i18n/bookNames.js`, add the code to `LANGUAGES` in `storageService.js` and to the language `<select>` elements (`AppHeader.jsx`, `Settings.jsx`).

## Features
Home with Verse of the Day, Continue Reading, quick actions and install banner · books page with filter · reader (book/chapter selectors, font size, line spacing, cream/light/dark themes, verse actions: favorite, 5 highlight colors, notes, copy, share) · favorites · highlights · notes · local search (word, phrase, reference such as `John 3:16`/`Salmo 23`) · reading history · reading plans (John 21 days, Proverbs 31 days, Psalms 30 days) · settings · install page · About, Privacy, Terms, Licenses, Contact · 404.

## Local storage (nothing leaves the device)
Keys: `bible_app_language`, `bible_translation`, `bible_favorites`, `bible_highlights`, `bible_notes`, `bible_history`, `bible_last_reading`, `bible_font_size`, `bible_line_height`, `bible_theme`, `bible_install_dismissed`, `bible_storage_version`, `bible_plans`. All reads are validated and fall back to defaults; `initStorage()` runs versioned migrations (`MIGRATIONS` in `storageService.js`). Quota errors raise a localized toast. IndexedDB is not used: the Bible text is code-split into per-book chunks cached by the service worker, and search scans them in memory one book at a time.

## Offline architecture
- `public/sw.js` precaches the shell (`/index.html`, hashed JS/CSS parsed from it, icons, manifest, `offline.html`) at install. Navigations are network-first with a cached-shell fallback, then `offline.html`.
- Every page chunk is preloaded after first load so all screens work offline.
- Bible book chunks are emitted under `/data/` and kept in a separate long-lived cache (`bible-data-v1`), cache-first. A book becomes available offline once opened; **Settings → "Save the whole Bible for offline"** downloads all 66 books (about 4 MB per translation).
- `vite.config.js` stamps a build id into `dist/sw.js` so each deploy creates a fresh versioned shell cache and removes old ones. The service worker is registered only in production builds.
- Storage quota depends on the browser; offline availability is not unlimited.

## Deployment
Any static host works, but it **must serve `index.html` for unknown paths** (SPA fallback) so `/bible/john/3` works on refresh. Included: `public/_redirects` (Netlify/Cloudflare Pages) and `vercel.json`. For nginx use `try_files $uri /index.html;`. Serve over HTTPS and send `Cache-Control: no-cache` for `/sw.js`. The app expects to live at the domain root (`/`).

## Daily devotional
`src/data/devotionals.js` is intentionally empty (no verified-license content available). The page explains this and will display entries as soon as you add them (shape documented in the file).

## Contact page
Set `CONTACT_EMAIL` in `src/config.js`. While empty, the page honestly says no contact method is configured.

## Browser notes
Install prompt: Chrome/Edge (Android and desktop). iOS Safari uses Share → Add to Home Screen (instructions are in the app). Firefox desktop cannot install web apps. Uses native `<dialog>`, `navigator.share` (with clipboard fallback) and `env(safe-area-inset-*)`.

## Known limitations
- Not run, built or tested in a browser (see above).
- No Haitian Creole Bible text and no devotional content are bundled.
- Verses are numbered as in the source texts (KJV and RV1909 versification).
- Data is per device/browser; there is no sync or backup.
- Highlights, favorites and notes are tied to the translation they were created in.
- Reading plans are application-authored schedules; the Psalms plan opens the first psalm of each day's range.
- Search matches the start of words; no stemming.
