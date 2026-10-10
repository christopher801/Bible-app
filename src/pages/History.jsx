import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { KEYS, USER_DATA, clearKeys } from '../services/storageService.js';
import { getTranslation } from '../data/bible/translations.js';
import { refPath } from '../utils/reference.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function History() {
  const { t, confirm, toast, formatDate, refLabel } = useApp();
  const history = useStored(KEYS.history);
  usePageTitle(t('history.title'));

  const clearAll = async () => {
    if (await confirm({ title: t('history.clear'), message: t('history.confirmClear'), confirmLabel: t('common.clear'), danger: true })) {
      clearKeys(USER_DATA.history);
      toast(t('toast.cleared'));
    }
  };

  return (
    <div className="page">
      <PageHeader icon="bi-clock-history" title={t('history.title')}>
        {history.length > 0 && (
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={clearAll}>
            <i className="bi bi-trash me-1" aria-hidden="true" />
            {t('history.clear')}
          </button>
        )}
      </PageHeader>
      {history.length === 0 ? (
        <EmptyState icon="bi-clock-history" title={t('history.empty')} text={t('history.emptyHint')}>
          <Link className="btn btn-accent" to="/bible">{t('favorites.goRead')}</Link>
        </EmptyState>
      ) : (
        <ul className="stack list-unstyled p-0">
          {history.map((h) => (
            <li key={`${h.tr}-${h.book}-${h.chapter}`}>
              <Link className="vcard vcard--link" to={refPath(h.book, h.chapter, null, h.tr)}>
                <span>
                  <strong>{refLabel(h)}</strong> <span className="vcard__tr">{getTranslation(h.tr)?.abbr}</span>
                  <small className="d-block text-secondary-ink">{t('history.lastRead', { date: formatDate(h.ts) })}</small>
                </span>
                <i className="bi bi-chevron-right" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
