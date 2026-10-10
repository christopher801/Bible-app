import { useApp } from '../context/AppContext.jsx';
import { detectBrowser, detectPlatform } from '../services/pwaService.js';

const css = `
.install-steps { display: grid; gap: 14px; grid-template-columns: 1fr; }
@media (min-width: 768px) { .install-steps { grid-template-columns: repeat(3, 1fr); } }
.install-steps__card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; }
.install-steps__card--you { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-soft); }
.install-steps__card h3 { font-size: 1.05rem; margin: 0 0 6px; }
.install-steps__tag { display: inline-block; font-size: .8rem; font-weight: 600; color: var(--accent-ink); margin-bottom: 6px; }
.install-steps__card ol { padding-left: 1.2rem; margin: 0; display: grid; gap: 6px; }
`;

export default function InstallInstructions() {
  const { t } = useApp();
  const platform = detectPlatform();
  const browser = detectBrowser();
  const groups = [
    { id: 'android', icon: 'bi-phone' },
    { id: 'ios', icon: 'bi-apple' },
    { id: 'desktop', icon: 'bi-laptop' }
  ];
  return (
    <div>
      <style>{css}</style>
      <div className="install-steps">
        {groups.map((g) => (
          <section key={g.id} className={`install-steps__card${g.id === platform ? ' install-steps__card--you' : ''}`}>
            {g.id === platform && <span className="install-steps__tag">{t('install.yourDevice')}</span>}
            <h3>
              <i className={`bi ${g.icon} me-2`} aria-hidden="true" />
              {t(`install.${g.id}.title`)}
            </h3>
            <ol>
              <li>{t(`install.${g.id}.s1`)}</li>
              <li>{t(`install.${g.id}.s2`)}</li>
              <li>{t(`install.${g.id}.s3`)}</li>
            </ol>
          </section>
        ))}
      </div>
      {platform === 'desktop' && browser === 'firefox' && <p className="mt-3 text-secondary-ink">{t('install.firefoxNote')}</p>}
    </div>
  );
}
