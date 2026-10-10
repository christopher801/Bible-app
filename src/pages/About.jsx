import { useApp } from '../context/AppContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { APP_VERSION } from '../config.js';
import PageHeader from '../components/PageHeader.jsx';

export default function About() {
  const { t } = useApp();
  usePageTitle(t('about.title'));
  return (
    <div className="page prose">
      <PageHeader icon="bi-info-circle" title={t('about.title')} subtitle={t('common.version', { v: APP_VERSION })} />
      <p>{t('about.p1')}</p>
      <h2>{t('about.languagesTitle')}</h2>
      <p>{t('about.languagesText')}</p>
      <h2>{t('about.featuresTitle')}</h2>
      <ul>{[1, 2, 3, 4, 5, 6].map((n) => <li key={n}>{t(`about.f${n}`)}</li>)}</ul>
      <h2>{t('about.dataTitle')}</h2>
      <p>{t('about.dataText')}</p>
    </div>
  );
}
