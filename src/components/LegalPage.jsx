import { useApp } from '../context/AppContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import PageHeader from './PageHeader.jsx';

export default function LegalPage({ prefix, icon, sections }) {
  const { t } = useApp();
  usePageTitle(t(`${prefix}.title`));
  return (
    <div className="page prose">
      <PageHeader icon={icon} title={t(`${prefix}.title`)} subtitle={t(`${prefix}.intro`)} />
      {Array.from({ length: sections }, (_, i) => (
        <section key={i}>
          <h2>{t(`${prefix}.s${i + 1}.t`)}</h2>
          <p>{t(`${prefix}.s${i + 1}.b`)}</p>
        </section>
      ))}
    </div>
  );
}
