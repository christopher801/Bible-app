import { useId } from 'react';
import { useApp } from '../context/AppContext.jsx';

const css = `
.sbar { position: relative; display: flex; align-items: center; }
.sbar > i.bi-search { position: absolute; left: 14px; color: var(--text-2); pointer-events: none; }
.sbar input { padding-left: 42px; padding-right: 48px; min-height: 48px; border-radius: 12px; }
.sbar button { position: absolute; right: 4px; width: 44px; height: 44px; border: 0; background: transparent; color: var(--text-2); border-radius: 10px; }
.sbar button:hover { background: var(--accent-soft); color: var(--text); }
`;

export default function SearchBar({ value, onChange, onSubmit, placeholder, label, clearLabel, autoFocus }) {
  const id = useId();
  return (
    <form
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(value);
      }}
    >
      <style>{css}</style>
      <label htmlFor={id} className="visually-hidden">
        {label}
      </label>
      <div className="sbar">
        <i className="bi bi-search" aria-hidden="true" />
        <input
          id={id}
          type="search"
          className="form-control"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck="false"
          enterKeyHint="search"
          autoFocus={autoFocus}
        />
        {value && (
          <button type="button" onClick={() => onChange('')} aria-label={clearLabel}>
            <i className="bi bi-x-lg" aria-hidden="true" />
          </button>
        )}
      </div>
    </form>
  );
}
