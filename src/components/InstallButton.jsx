import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { usePwa } from '../hooks/useStored.js';
import { promptInstall } from '../services/pwaService.js';

/**
 * Real install button when the browser exposes the install prompt; otherwise a link to the
 * manual instructions. Renders nothing once the app is installed (unless showInstalled is set).
 */
export default function InstallButton({ className = 'btn btn-accent', compact = false, showInstalled = false }) {
  const { t, toast } = useApp();
  const { canPrompt, installed } = usePwa();

  if (installed) {
    return showInstalled ? (
      <span className="badge text-bg-success px-3 py-2">
        <i className="bi bi-check-circle me-1" aria-hidden="true" />
        {t('install.installed')}
      </span>
    ) : null;
  }

  if (canPrompt) {
    const onClick = async () => {
      const result = await promptInstall();
      if (result === 'accepted') toast(t('toast.installed'), 'success');
      else if (result === 'dismissed') toast(t('toast.installDismissed'));
    };
    return (
      <button type="button" className={className} onClick={onClick} aria-label={compact ? t('install.button') : undefined}>
        <i className="bi bi-download" aria-hidden="true" />
        {!compact && <span className="ms-2">{t('install.button')}</span>}
      </button>
    );
  }

  return (
    <Link to="/install" className={className} aria-label={compact ? t('install.how') : undefined}>
      <i className="bi bi-question-circle" aria-hidden="true" />
      {!compact && <span className="ms-2">{t('install.how')}</span>}
    </Link>
  );
}
