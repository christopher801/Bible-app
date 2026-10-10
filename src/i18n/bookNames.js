import { BOOK_IDS } from '../data/books.js';

// Localized book names, in canonical order (matches BOOK_IDS).
const NAMES = {
  en: ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy', 'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel', '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles', 'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi', 'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John', '2 John', '3 John', 'Jude', 'Revelation'],
  es: ['Génesis', 'Éxodo', 'Levítico', 'Números', 'Deuteronomio', 'Josué', 'Jueces', 'Rut', '1 Samuel', '2 Samuel', '1 Reyes', '2 Reyes', '1 Crónicas', '2 Crónicas', 'Esdras', 'Nehemías', 'Ester', 'Job', 'Salmos', 'Proverbios', 'Eclesiastés', 'Cantares', 'Isaías', 'Jeremías', 'Lamentaciones', 'Ezequiel', 'Daniel', 'Oseas', 'Joel', 'Amós', 'Abdías', 'Jonás', 'Miqueas', 'Nahúm', 'Habacuc', 'Sofonías', 'Hageo', 'Zacarías', 'Malaquías', 'Mateo', 'Marcos', 'Lucas', 'Juan', 'Hechos', 'Romanos', '1 Corintios', '2 Corintios', 'Gálatas', 'Efesios', 'Filipenses', 'Colosenses', '1 Tesalonicenses', '2 Tesalonicenses', '1 Timoteo', '2 Timoteo', 'Tito', 'Filemón', 'Hebreos', 'Santiago', '1 Pedro', '2 Pedro', '1 Juan', '2 Juan', '3 Juan', 'Judas', 'Apocalipsis'],
  ht: ['Jenèz', 'Egzòd', 'Levitik', 'Nonb', 'Detewonòm', 'Jozye', 'Jij', 'Rit', '1 Samyèl', '2 Samyèl', '1 Wa', '2 Wa', '1 Kwonik', '2 Kwonik', 'Esdras', 'Neyemi', 'Estè', 'Jòb', 'Sòm', 'Pwovèb', 'Eklezyas', 'Kantik', 'Ezayi', 'Jeremi', 'Lamantasyon', 'Ezekyèl', 'Danyèl', 'Oze', 'Jowèl', 'Amòs', 'Abdyas', 'Jonas', 'Miche', 'Nawoum', 'Abakouk', 'Sofoni', 'Aje', 'Zakari', 'Malachi', 'Matye', 'Mak', 'Lik', 'Jan', 'Travay', 'Women', '1 Korentyen', '2 Korentyen', 'Galat', 'Efezyen', 'Filipyen', 'Kolosyen', '1 Tesalonisyen', '2 Tesalonisyen', '1 Timote', '2 Timote', 'Tit', 'Filemon', 'Ebre', 'Jak', '1 Pyè', '2 Pyè', '1 Jan', '2 Jan', '3 Jan', 'Jid', 'Revelasyon']
};

export const BOOK_NAMES = Object.fromEntries(
  Object.entries(NAMES).map(([lang, list]) => [lang, Object.fromEntries(BOOK_IDS.map((id, i) => [id, list[i]]))])
);

/** Extra spellings people commonly type, keyed by book id. */
export const BOOK_ALIASES = {
  psalms: ['psalm', 'psalmos', 'salmo', 'ps'],
  songofsolomon: ['song of songs', 'songs', 'canticles', 'cantar de los cantares', 'cantares', 'sg'],
  revelation: ['revelations', 'apocalypse', 'apocalipsis', 'rev'],
  acts: ['hechos de los apostoles', 'acts of the apostles'],
  john: ['jn'],
  genesis: ['gn', 'gen'],
  matthew: ['mt'],
  mark: ['mk'],
  luke: ['lk'],
  romans: ['rom'],
  proverbs: ['prov', 'pr'],
  isaiah: ['isa']
};

export function bookName(lang, id) {
  return (BOOK_NAMES[lang] && BOOK_NAMES[lang][id]) || BOOK_NAMES.en[id] || id;
}
