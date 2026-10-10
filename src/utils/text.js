/** Case- and accent-insensitive folding that keeps string length identical, so match indexes map back to the original text. */
export function fold(str) {
  let out = '';
  for (const ch of String(str)) {
    const f = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    out += f.length === ch.length ? f : ch.toLowerCase().length === ch.length ? ch.toLowerCase() : ch;
  }
  return out;
}

export function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Builds a regex that matches the query at the start of a word (folded text). */
export function buildMatcher(query, flags = 'g') {
  const q = fold(query).trim().replace(/\s+/g, ' ');
  if (!q) return null;
  return new RegExp('(^|[^\\p{L}\\p{N}])(' + escapeRegExp(q).replace(/ /g, '\\s+') + ')', 'u' + flags);
}

/** Splits text into [{ text, match }] parts around matches of the query. */
export function splitByQuery(text, query) {
  const re = buildMatcher(query, 'g');
  if (!re) return [{ text, match: false }];
  const folded = fold(text);
  const parts = [];
  let last = 0;
  let m;
  while ((m = re.exec(folded))) {
    const start = m.index + m[1].length;
    const end = start + m[2].length;
    if (start > last) parts.push({ text: text.slice(last, start), match: false });
    parts.push({ text: text.slice(start, end), match: true });
    last = end;
    if (re.lastIndex === m.index) re.lastIndex++;
  }
  if (last < text.length) parts.push({ text: text.slice(last), match: false });
  return parts.length ? parts : [{ text, match: false }];
}

/** Trims a long verse around the first match. */
export function excerpt(text, query, max = 240) {
  if (text.length <= max) return text;
  const re = buildMatcher(query, '');
  const m = re ? re.exec(fold(text)) : null;
  const pos = m ? m.index + m[1].length : 0;
  const start = Math.max(0, pos - Math.floor(max / 3));
  const end = Math.min(text.length, start + max);
  return (start > 0 ? '… ' : '') + text.slice(start, end).trim() + (end < text.length ? ' …' : '');
}
