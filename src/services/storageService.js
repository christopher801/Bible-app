// Centralized, versioned, validated localStorage layer.
// Everything stays on this device: nothing here is ever sent to a server.
import { isValidBook, isValidChapter } from '../data/books.js';
import { TRANSLATIONS, DEFAULT_TRANSLATION_BY_LANG, availableTranslations } from '../data/bible/translations.js';

export const KEYS = {
  language: 'bible_app_language',
  translation: 'bible_translation',
  favorites: 'bible_favorites',
  highlights: 'bible_highlights',
  notes: 'bible_notes',
  history: 'bible_history',
  lastReading: 'bible_last_reading',
  fontSize: 'bible_font_size',
  lineHeight: 'bible_line_height',
  theme: 'bible_theme',
  installDismissed: 'bible_install_dismissed',
  version: 'bible_storage_version',
  plans: 'bible_plans'
};

export const STORAGE_VERSION = 1;
export const LANGUAGES = ['ht', 'es', 'en'];
export const THEMES = ['cream', 'light', 'dark'];
export const HIGHLIGHT_COLORS = ['orange', 'yellow', 'green', 'blue', 'purple'];
export const FONT_SIZE = { min: 15, max: 30, step: 1, def: 19 };
export const LINE_HEIGHT = { min: 1.4, max: 2.4, step: 0.1, def: 1.8 };
const HISTORY_LIMIT = 50;
const NOTE_MAX = 2000;

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const ts = (v, d) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : d);

export function detectLanguage() {
  try {
    const list = [...(navigator.languages || []), navigator.language || ''];
    for (const l of list) {
      const code = String(l).slice(0, 2).toLowerCase();
      if (LANGUAGES.includes(code)) return code;
    }
  } catch (e) {
    /* ignore */
  }
  return 'en';
}

export const refId = (tr, book, chapter, verse) => `${tr}:${book}:${chapter}:${verse}`;

function cleanRef(o) {
  if (!isObj(o)) return null;
  const { tr, book, chapter, verse } = o;
  if (typeof tr !== 'string' || !TRANSLATIONS.some((t) => t.id === tr)) return null;
  if (!isValidBook(book) || !isValidChapter(book, chapter)) return null;
  if (!Number.isInteger(verse) || verse < 1 || verse > 200) return null;
  return { tr, book, chapter, verse, id: refId(tr, book, chapter, verse) };
}

function uniqueById(list) {
  const seen = new Set();
  return list.filter((x) => (seen.has(x.id) ? false : seen.add(x.id)));
}

// Each validator receives the raw parsed value (or undefined) and returns a safe value.
const VALIDATORS = {
  [KEYS.language]: (v) => (LANGUAGES.includes(v) ? v : detectLanguage()),
  [KEYS.translation]: (v) => {
    if (availableTranslations().some((t) => t.id === v)) return v;
    return DEFAULT_TRANSLATION_BY_LANG[detectLanguage()] || 'kjv';
  },
  [KEYS.theme]: (v) => (THEMES.includes(v) ? v : 'cream'),
  [KEYS.fontSize]: (v) => clamp(num(v, FONT_SIZE.def), FONT_SIZE.min, FONT_SIZE.max),
  [KEYS.lineHeight]: (v) => Math.round(clamp(num(v, LINE_HEIGHT.def), LINE_HEIGHT.min, LINE_HEIGHT.max) * 10) / 10,
  [KEYS.installDismissed]: (v) => (ts(v, 0) || null),
  [KEYS.version]: (v) => num(v, 0),
  [KEYS.favorites]: (v) =>
    uniqueById(
      (Array.isArray(v) ? v : []).map((o) => {
        const r = cleanRef(o);
        if (!r) return null;
        return { ...r, text: typeof o.text === 'string' ? o.text.slice(0, 2000) : '', createdAt: ts(o.createdAt, Date.now()) };
      }).filter(Boolean)
    ),
  [KEYS.highlights]: (v) =>
    uniqueById(
      (Array.isArray(v) ? v : []).map((o) => {
        const r = cleanRef(o);
        if (!r || !HIGHLIGHT_COLORS.includes(o.color)) return null;
        return { ...r, text: typeof o.text === 'string' ? o.text.slice(0, 2000) : '', color: o.color, createdAt: ts(o.createdAt, Date.now()) };
      }).filter(Boolean)
    ),
  [KEYS.notes]: (v) =>
    uniqueById(
      (Array.isArray(v) ? v : []).map((o) => {
        const r = cleanRef(o);
        if (!r || typeof o.note !== 'string' || !o.note.trim()) return null;
        const created = ts(o.createdAt, Date.now());
        return { ...r, text: typeof o.text === 'string' ? o.text.slice(0, 2000) : '', note: o.note.slice(0, NOTE_MAX), createdAt: created, updatedAt: ts(o.updatedAt, created) };
      }).filter(Boolean)
    ),
  [KEYS.history]: (v) =>
    (Array.isArray(v) ? v : [])
      .filter((o) => isObj(o) && TRANSLATIONS.some((t) => t.id === o.tr) && isValidBook(o.book) && isValidChapter(o.book, o.chapter))
      .map((o) => ({ tr: o.tr, book: o.book, chapter: o.chapter, ts: ts(o.ts, Date.now()) }))
      .slice(0, HISTORY_LIMIT),
  [KEYS.lastReading]: (v) =>
    isObj(v) && TRANSLATIONS.some((t) => t.id === v.tr) && isValidBook(v.book) && isValidChapter(v.book, v.chapter)
      ? { tr: v.tr, book: v.book, chapter: v.chapter, ts: ts(v.ts, Date.now()) }
      : null,
  [KEYS.plans]: (v) => {
    const out = {};
    if (isObj(v)) {
      for (const [id, days] of Object.entries(v)) {
        if (Array.isArray(days)) out[id] = [...new Set(days.filter((d) => Number.isInteger(d) && d >= 0 && d < 400))];
      }
    }
    return out;
  }
};

const cache = new Map();
const listeners = new Set();
let storageOk = true;

function readRaw(key) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch (e) {
    return undefined; // missing, blocked or malformed JSON → defaults
  }
}

function emit() {
  listeners.forEach((fn) => fn());
}

function emitError(kind, error) {
  try {
    window.dispatchEvent(new CustomEvent('bible-storage-error', { detail: { kind, error } }));
  } catch (e) {
    /* ignore */
  }
}

export const storage = {
  get(key) {
    if (cache.has(key)) return cache.get(key);
    const validate = VALIDATORS[key];
    const value = validate ? validate(readRaw(key)) : readRaw(key);
    cache.set(key, value);
    return value;
  },
  /** Validates, persists and notifies. Returns true on success. */
  set(key, value) {
    const validate = VALIDATORS[key];
    const clean = validate ? validate(value) : value;
    cache.set(key, clean);
    let ok = true;
    try {
      window.localStorage.setItem(key, JSON.stringify(clean));
    } catch (e) {
      ok = false;
      storageOk = false;
      emitError(e && e.name === 'QuotaExceededError' ? 'quota' : 'unavailable', e);
    }
    emit();
    return ok;
  },
  update(key, fn) {
    return storage.set(key, fn(storage.get(key)));
  },
  remove(key) {
    cache.delete(key);
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      /* ignore */
    }
    emit();
  },
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  isPersistent: () => storageOk
};

export function clearKeys(keys) {
  keys.forEach((k) => storage.remove(k));
}

export const USER_DATA = {
  favorites: [KEYS.favorites],
  highlights: [KEYS.highlights],
  notes: [KEYS.notes],
  history: [KEYS.history, KEYS.lastReading],
  plans: [KEYS.plans],
  all: Object.values(KEYS).filter((k) => k !== KEYS.version)
};

// ---- versioning & migrations -------------------------------------------------------------
const MIGRATIONS = {
  // 2: () => { /* transform data from v1 to v2 here */ }
};

export function initStorage() {
  const current = readRaw(KEYS.version);
  const from = typeof current === 'number' ? current : 0;
  for (let v = from + 1; v <= STORAGE_VERSION; v++) {
    if (MIGRATIONS[v]) {
      try {
        MIGRATIONS[v]();
      } catch (e) {
        /* a failed migration must never block the app */
      }
    }
  }
  if (from < STORAGE_VERSION) storage.set(KEYS.version, STORAGE_VERSION);
  window.addEventListener('storage', (e) => {
    if (!e.key) cache.clear();
    else cache.delete(e.key);
    emit();
  });
}

// ---- domain helpers ------------------------------------------------------------------------
export function isFavorite(list, id) {
  return list.some((f) => f.id === id);
}

export function toggleFavorite(ref, text) {
  const id = refId(ref.tr, ref.book, ref.chapter, ref.verse);
  let added = false;
  storage.update(KEYS.favorites, (list) => {
    if (list.some((f) => f.id === id)) return list.filter((f) => f.id !== id);
    added = true;
    return [{ ...ref, id, text: text || '', createdAt: Date.now() }, ...list];
  });
  return added;
}

export function removeFavorite(id) {
  storage.update(KEYS.favorites, (list) => list.filter((f) => f.id !== id));
}

export function setHighlight(ref, text, color) {
  const id = refId(ref.tr, ref.book, ref.chapter, ref.verse);
  storage.update(KEYS.highlights, (list) => {
    const rest = list.filter((h) => h.id !== id);
    return [{ ...ref, id, text: text || '', color, createdAt: Date.now() }, ...rest];
  });
}

export function removeHighlight(id) {
  storage.update(KEYS.highlights, (list) => list.filter((h) => h.id !== id));
}

/** Creates or updates the note for a verse. Returns false for empty/invalid input. */
export function saveNote(ref, text, noteText) {
  const note = String(noteText || '').trim().slice(0, NOTE_MAX);
  if (!note) return false;
  const id = refId(ref.tr, ref.book, ref.chapter, ref.verse);
  const now = Date.now();
  storage.update(KEYS.notes, (list) => {
    const existing = list.find((n) => n.id === id);
    const entry = { ...ref, id, text: text || (existing && existing.text) || '', note, createdAt: existing ? existing.createdAt : now, updatedAt: now };
    return [entry, ...list.filter((n) => n.id !== id)];
  });
  return true;
}

export function deleteNote(id) {
  storage.update(KEYS.notes, (list) => list.filter((n) => n.id !== id));
}

export function recordReading(tr, book, chapter) {
  const entry = { tr, book, chapter, ts: Date.now() };
  storage.set(KEYS.lastReading, entry);
  storage.update(KEYS.history, (list) => [entry, ...list.filter((h) => !(h.tr === tr && h.book === book && h.chapter === chapter))].slice(0, HISTORY_LIMIT));
}

export function togglePlanDay(planId, dayIndex) {
  storage.update(KEYS.plans, (plans) => {
    const done = new Set(plans[planId] || []);
    if (done.has(dayIndex)) done.delete(dayIndex);
    else done.add(dayIndex);
    return { ...plans, [planId]: [...done].sort((a, b) => a - b) };
  });
}

export function resetPlan(planId) {
  storage.update(KEYS.plans, (plans) => {
    const next = { ...plans };
    delete next[planId];
    return next;
  });
}
