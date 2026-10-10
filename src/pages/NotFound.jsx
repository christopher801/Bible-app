import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import EmptyState from '../components/EmptyState.jsx';

export default function NotFound() {
  const { t } = useApp();
  usePageTitle(t('notfound.title'));
  return (
    <div className="page">
      <EmptyState icon="bi-compass" title={t('notfound.title')} text={t('notfound.text')}>
        <div className="d-flex flex-wrap gap-2 justify-content-center">
          <Link className="btn btn-accent" to="/">
            <i className="bi bi-house me-1" aria-hidden="true" />
            {t('notfound.home')}
          </Link>
          <Link className="btn btn-soft" to="/bible">
            <i className="bi bi-book me-1" aria-hidden="true" />
            {t('notfound.bible')}
          </Link>
        </div>
      </EmptyState>
    </div>
  );
}
