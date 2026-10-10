import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { HIGHLIGHT_COLORS, KEYS, USER_DATA, clearKeys, removeHighlight, setHighlight } from '../services/storageService.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import VerseCard from '../components/VerseCard.jsx';

export default function Highlights() {
  const { t, confirm, toast } = useApp();
  const highlights = useStored(KEYS.highlights);
  const [filter, setFilter] = useState('all');
  usePageTitle(t('highlights.title'));
  const list = filter === 'all' ? highlights : highlights.filter((h) => h.color === filter);

  const clearAll = async () => {
    if (await confirm({ title: t('highlights.clear'), message: t('highlights.confirmClear'), confirmLabel: t('common.delete'), danger: true })) {
      clearKeys(USER_DATA.highlights);
      setFilter('all');
      toast(t('toast.cleared'));
    }
  };

  return (
    <div className="page">
      <PageHeader icon="bi-brush" title={t('highlights.title')}>
        {highlights.length > 0 && (
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={clearAll}>
            <i className="bi bi-trash me-1" aria-hidden="true" />
            {t('highlights.clear')}
          </button>
        )}
      </PageHeader>
      {highlights.length === 0 ? (
        <EmptyState icon="bi-brush" title={t('highlights.empty')} text={t('highlights.emptyHint')}>
          <Link className="btn btn-accent" to="/bible">{t('favorites.goRead')}</Link>
        </EmptyState>
      ) : (
        <>
          <div className="d-flex flex-wrap gap-2 align-items-center mb-3" role="group" aria-label={t('highlights.filter')}>
            <button type="button" className="btn btn-soft btn-sm" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>{t('highlights.all')}</button>
            {HIGHLIGHT_COLORS.map((c) => (
              <button key={c} type="button" className={`swatch swatch--${c}${filter === c ? ' swatch--on' : ''}`} aria-pressed={filter === c} aria-label={t(`color.${c}`)} onClick={() => setFilter(c)}>
                {filter === c && <i className="bi bi-check-lg" aria-hidden="true" />}
              </button>
            ))}
          </div>
          <div className="stack">
            {list.map((h) => (
              <VerseCard
                key={h.id}
                item={h}
                color={h.color}
                footer={
                  <>
                    <span className="small fw-semibold text-secondary-ink me-1">{t('highlights.change')}</span>
                    {HIGHLIGHT_COLORS.map((c) => (
                      <button key={c} type="button" className={`swatch swatch--${c}${h.color === c ? ' swatch--on' : ''}`} aria-pressed={h.color === c} aria-label={t('action.highlightColor', { color: t(`color.${c}`) })} onClick={() => setHighlight(h, h.text, c)}>
                        {h.color === c && <i className="bi bi-check-lg" aria-hidden="true" />}
                      </button>
                    ))}
                    <button type="button" className="btn btn-soft btn-sm ms-auto" onClick={() => { removeHighlight(h.id); toast(t('toast.highlightRemoved')); }}>
                      <i className="bi bi-x-circle me-1" aria-hidden="true" />{t('action.removeHighlight')}
                    </button>
                  </>
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
