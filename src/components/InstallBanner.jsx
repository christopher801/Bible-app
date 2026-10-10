import { useApp } from '../context/AppContext.jsx';
import { usePwa, useStored } from '../hooks/useStored.js';
import { KEYS, storage } from '../services/storageService.js';
import { detectPlatform } from '../services/pwaService.js';
import InstallButton from './InstallButton.jsx';

const SNOOZE_MS = 30 * 24 * 60 * 60 * 1000;
const css = `
.install-banner { display: flex; align-items: center; gap: 14px; padding: 14px 16px; background: var(--surface); border: 1px solid var(--border); border-left: 4px solid var(--accent);
  border-radius: var(--radius); box-shadow: var(--shadow); }
.install-banner img { width: 48px; height: 48px; border-radius: 12px; flex: none; }
.install-banner__text { flex: 1; min-width: 0; }
.install-banner__text strong { display: block; }
.install-banner__text span { color: var(--text-2); font-size: .92rem; }
.install-banner__actions { display: flex; align-items: center; gap: 6px; flex: none; }
@media (max-width: 575.98px) { .install-banner { flex-wrap: wrap; } .install-banner__actions { width: 100%; justify-content: flex-end; } }
`;

export default function InstallBanner() {
  const { t } = useApp();
  const { canPrompt, installed } = usePwa();
  const dismissedAt = useStored(KEYS.installDismissed);
  const snoozed = dismissedAt && Date.now() - dismissedAt < SNOOZE_MS;
  // Relevant when the browser can install directly, or on iOS where manual steps are needed.
  const relevant = canPrompt || detectPlatform() === 'ios';
  if (installed || snoozed || !relevant) return null;

  return (
    <aside className="install-banner" aria-label={t('install.banner.title')}>
      <style>{css}</style>
      <img src="/icons/icon-192.png" alt="" width="48" height="48" />
      <div className="install-banner__text">
        <strong>{t('install.banner.title')}</strong>
        <span>{t('install.banner.text')}</span>
      </div>
      <div className="install-banner__actions">
        <InstallButton />
        <button type="button" className="btn btn-ghost" onClick={() => storage.set(KEYS.installDismissed, Date.now())} aria-label={t('common.dismiss')}>
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
