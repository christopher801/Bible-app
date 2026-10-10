import { memo } from 'react';

/** One verse. The text is a real button so it works with keyboard and screen readers. */
function Verse({ n, text, color, favorite, hasNote, selected, flash, onSelect, children }) {
  return (
    <li id={`v${n}`} className={`verse${selected ? ' verse--selected' : ''}${flash ? ' verse--flash' : ''}`} data-hl={color || undefined}>
      <button type="button" className="verse__btn" onClick={() => onSelect(n)} aria-expanded={selected}>
        <sup className="verse__n">{n}</sup>
        <span className="verse__text">{text}</span>
        {(favorite || hasNote) && (
          <span className="verse__marks" aria-hidden="true">
            {favorite && <i className="bi bi-heart-fill" />}
            {hasNote && <i className="bi bi-journal-text" />}
          </span>
        )}
      </button>
      {children}
    </li>
  );
}

export default memo(Verse);
