import { useApp } from '../context/AppContext.jsx';
import { usePwa } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import PageHeader from '../components/PageHeader.jsx';
import InstallButton from '../components/InstallButton.jsx';
import InstallInstructions from '../components/InstallInstructions.jsx';

export default function Install() {
  const { t } = useApp();
  const { canPrompt, installed } = usePwa();
  usePageTitle(t('install.title'));
  const status = installed ? 'install.statusInstalled' : canPrompt ? 'install.statusReady' : 'install.statusManual';
  return (
    <div className="page">
      <PageHeader icon="bi-download" title={t('install.title')} subtitle={t('install.intro')} />
      <section className="card-soft mb-4" aria-labelledby="inst-status">
        <h2 className="section-title" id="inst-status">{t('install.status')}</h2>
        <p role="status">{t(status)}</p>
        {canPrompt && !installed && <InstallButton showInstalled />}
        {installed && <InstallButton showInstalled />}
      </section>
      {!installed && <InstallInstructions />}
    </div>
  );
}
