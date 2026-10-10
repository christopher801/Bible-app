import { useEffect } from 'react';
import { HIGHLIGHT_COLORS } from '../services/storageService.js';
import { useApp } from '../context/AppContext.jsx';
import { canShare } from '../services/sharingService.js';

export default function VerseActions({ label, isFavorite, color, hasNote, onFavorite, onHighlight, onNote, onCopy, onShare, onClose }) {
  const { t } = useApp();

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="vactions" role="toolbar" aria-label={t('a11y.verseActions', { ref: label })}>
      <div className="vactions__head">
        <strong>{label}</strong>
        <button type="button" className="vactions__x" onClick={onClose} aria-label={t('common.close')}>
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      </div>
      <div className="vactions__row">
        <button type="button" className="vactions__btn" onClick={onFavorite} aria-pressed={isFavorite}>
          <i className={`bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}`} aria-hidden="true" />
          <span>{t(isFavorite ? 'action.unfavorite' : 'action.favorite')}</span>
        </button>
        <button type="button" className="vactions__btn" onClick={onNote} aria-pressed={hasNote}>
          <i className={`bi ${hasNote ? 'bi-journal-check' : 'bi-journal-plus'}`} aria-hidden="true" />
          <span>{t(hasNote ? 'action.editNote' : 'action.note')}</span>
        </button>
        <button type="button" className="vactions__btn" onClick={onCopy}>
          <i className="bi bi-clipboard" aria-hidden="true" />
          <span>{t('action.copy')}</span>
        </button>
        <button type="button" className="vactions__btn" onClick={onShare}>
          <i className={`bi ${canShare() ? 'bi-share' : 'bi-clipboard-plus'}`} aria-hidden="true" />
          <span>{t('action.share')}</span>
        </button>
      </div>
      <div className="vactions__hl" role="group" aria-label={t('action.highlight')}>
        <span className="vactions__hl-label">
          <i className="bi bi-brush" aria-hidden="true" /> {t('action.highlight')}
        </span>
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`swatch swatch--${c}${color === c ? ' swatch--on' : ''}`}
            onClick={() => onHighlight(c)}
            aria-pressed={color === c}
            aria-label={t('action.highlightColor', { color: t(`color.${c}`) })}
          >
            {color === c && <i className="bi bi-check-lg" aria-hidden="true" />}
          </button>
        ))}
        <button type="button" className="swatch swatch--none" onClick={() => onHighlight(null)} disabled={!color} aria-label={t('action.removeHighlight')}>
          <i className="bi bi-slash-circle" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
