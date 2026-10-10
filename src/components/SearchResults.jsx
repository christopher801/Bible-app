import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { splitByQuery, excerpt } from '../utils/text.js';
import { refPath } from '../utils/reference.js';

const css = `
.sres { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.sres a { display: block; padding: 12px 14px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); color: var(--text); text-decoration: none; }
.sres a:hover { border-color: var(--accent); }
.sres__ref { display: block; font-weight: 700; color: var(--accent-ink); margin-bottom: 2px; font-size: .95rem; }
.sres__text { font-family: var(--font-reading); line-height: 1.55; }
.sres mark { background: var(--hl-yellow); color: inherit; padding: 0 2px; border-radius: 3px; }
`;

export default function SearchResults({ results, query, label }) {
  const { refLabel } = useApp();
  return (
    <ul className="sres" aria-label={label}>
      <style>{css}</style>
      {results.map((r) => (
        <li key={`${r.book}-${r.chapter}-${r.verse}`}>
          <Link to={refPath(r.book, r.chapter, r.verse)}>
            <span className="sres__ref">{refLabel(r)}</span>
            <span className="sres__text">
              {splitByQuery(excerpt(r.text, query), query).map((p, i) => (p.match ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>))}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
