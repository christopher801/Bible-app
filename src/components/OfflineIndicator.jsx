import { useApp } from '../context/AppContext.jsx';

const css = `
.offline-bar { display: flex; align-items: center; justify-content: center; gap: 8px; padding: 8px 14px; background: #1F2937; color: #fff; font-size: .9rem; text-align: center; }
`;

export default function OfflineIndicator() {
  const { online, t } = useApp();
  if (online) return null;
  return (
    <div className="offline-bar" role="status">
      <style>{css}</style>
      <i className="bi bi-wifi-off" aria-hidden="true" />
      <span>{t('offline.indicator')}</span>
    </div>
  );
}
