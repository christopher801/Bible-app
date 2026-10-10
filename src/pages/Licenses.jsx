import { useApp } from '../context/AppContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { TRANSLATIONS } from '../data/bible/translations.js';
import PageHeader from '../components/PageHeader.jsx';

const SOFTWARE = [['React', 'MIT'], ['React Router', 'MIT'], ['Vite', 'MIT'], ['Bootstrap', 'MIT'], ['Bootstrap Icons', 'MIT']];

export default function Licenses() {
  const { t } = useApp();
  usePageTitle(t('licenses.title'));
  return (
    <div className="page prose">
      <PageHeader icon="bi-award" title={t('licenses.title')} subtitle={t('licenses.intro')} />
      <h2>{t('licenses.translations')}</h2>
      <div className="stack">
        {TRANSLATIONS.map((tr) => (
          <article key={tr.id} className="card-soft">
            <h3 className="h5">{tr.name} <span className="vcard__tr">{tr.abbr}</span></h3>
            <dl className="mb-0">
              <dt>{t('licenses.status')}</dt>
              <dd>{tr.available ? t('licenses.statusComplete', { books: tr.books, chapters: tr.chapters, verses: tr.verses }) : t('licenses.statusMissing')}</dd>
              <dt>{t('licenses.source')}</dt>
              <dd>{tr.source}</dd>
              <dt>{t('licenses.license')}</dt>
              <dd>{tr.license}</dd>
              <dt>{t('licenses.copyright')}</dt>
              <dd>{tr.copyright}</dd>
              <dt>{t('licenses.attribution')}</dt>
              <dd>{tr.attribution || t('licenses.noAttr')}</dd>
            </dl>
            {!tr.available && <p className="mt-2 mb-0 fw-semibold">{t('licenses.missingNote')}</p>}
          </article>
        ))}
      </div>
      <h2>{t('licenses.software')}</h2>
      <p>{t('licenses.softwareText')}</p>
      <ul>{SOFTWARE.map(([n, l]) => <li key={n}>{n} — {l}</li>)}</ul>
    </div>
  );
}
