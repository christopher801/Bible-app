import { useApp } from '../context/AppContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { CONTACT_EMAIL } from '../config.js';
import PageHeader from '../components/PageHeader.jsx';

export default function Contact() {
  const { t } = useApp();
  usePageTitle(t('contact.title'));
  return (
    <div className="page prose">
      <PageHeader icon="bi-life-preserver" title={t('contact.title')} />
      {CONTACT_EMAIL ? (
        <p>
          {t('contact.email')}: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
        </p>
      ) : (
        <>
          <p>{t('contact.none')}</p>
          <p className="text-secondary-ink">{t('contact.noneHint')}</p>
        </>
      )}
    </div>
  );
}
