import { useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export function usePageTitle(title) {
  const { t } = useApp();
  useEffect(() => {
    document.title = title ? `${title} · ${t('app.name')}` : t('app.name');
  }, [title, t]);
}
