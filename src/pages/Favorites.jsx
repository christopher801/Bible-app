import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { useVerseShare } from '../hooks/useVerseShare.js';
import { KEYS, USER_DATA, clearKeys, removeFavorite } from '../services/storageService.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import VerseCard from '../components/VerseCard.jsx';

export default function Favorites() {
  const { t, confirm, toast } = useApp();
  const favorites = useStored(KEYS.favorites);
  const { copyVerse, shareVerse } = useVerseShare();
  usePageTitle(t('favorites.title'));

  const clearAll = async () => {
    if (await confirm({ title: t('favorites.clear'), message: t('favorites.confirmClear'), confirmLabel: t('common.delete'), danger: true })) {
      clearKeys(USER_DATA.favorites);
      toast(t('toast.cleared'));
    }
  };

  return (
    <div className="page">
      <PageHeader icon="bi-heart" title={t('favorites.title')} subtitle={favorites.length ? t('favorites.count', { n: favorites.length }) : undefined}>
        {favorites.length > 0 && (
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={clearAll}>
            <i className="bi bi-trash me-1" aria-hidden="true" />
            {t('favorites.clear')}
          </button>
        )}
      </PageHeader>
      {favorites.length === 0 ? (
        <EmptyState icon="bi-heart" title={t('favorites.empty')} text={t('favorites.emptyHint')}>
          <Link className="btn btn-accent" to="/bible">{t('favorites.goRead')}</Link>
        </EmptyState>
      ) : (
        <div className="stack">
          {favorites.map((f) => (
            <VerseCard
              key={f.id}
              item={f}
              footer={
                <>
                  <button type="button" className="btn btn-soft btn-sm" onClick={() => copyVerse(f, f.text)}><i className="bi bi-clipboard me-1" aria-hidden="true" />{t('action.copy')}</button>
                  <button type="button" className="btn btn-soft btn-sm" onClick={() => shareVerse(f, f.text)}><i className="bi bi-share me-1" aria-hidden="true" />{t('action.share')}</button>
                  <button type="button" className="btn btn-soft btn-sm ms-auto" onClick={() => { removeFavorite(f.id); toast(t('toast.favRemoved')); }}><i className="bi bi-heart-fill me-1" aria-hidden="true" />{t('action.unfavorite')}</button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
