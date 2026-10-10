import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { storage, KEYS } from '../services/storageService.js';
import { translate } from '../i18n/translations.js';
import { bookName } from '../i18n/bookNames.js';
import { getTranslation } from '../data/bible/translations.js';
import { ToastRegion } from '../components/Toast.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const useKey = (key) => useSyncExternalStore(storage.subscribe, () => storage.get(key));
let toastSeq = 0;

export function AppProvider({ children }) {
  const lang = useKey(KEYS.language);
  const translationId = useKey(KEYS.translation);
  const theme = useKey(KEYS.theme);
  const fontSize = useKey(KEYS.fontSize);
  const lineHeight = useKey(KEYS.lineHeight);
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

  const t = useCallback((key, params) => translate(lang, key, params), [lang]);
  const bName = useCallback((id) => bookName(lang, id), [lang]);
  const refLabel = useCallback((r) => `${bookName(lang, r.book)} ${r.chapter}${r.verse ? ':' + r.verse : ''}`, [lang]);
  const formatDate = useCallback(
    (ts) => {
      try {
        return new Intl.DateTimeFormat(lang === 'ht' ? 'fr' : lang, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ts));
      } catch (e) {
        return new Date(ts).toLocaleString();
      }
    },
    [lang]
  );

  const dismissToast = useCallback((id) => setToasts((l) => l.filter((x) => x.id !== id)), []);
  const toast = useCallback((message, type = 'info') => {
    const id = ++toastSeq;
    setToasts((l) => [...l.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts((l) => l.filter((x) => x.id !== id)), type === 'error' ? 6500 : 3500);
  }, []);

  /** Opens an accessible confirmation dialog. Resolves to true when confirmed. */
  const confirm = useCallback((opts) => new Promise((resolve) => setDialog({ ...opts, resolve })), []);
  const closeDialog = useCallback(
    (result) => {
      if (dialog) dialog.resolve(result);
      setDialog(null);
    },
    [dialog]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-bs-theme', theme === 'dark' ? 'dark' : 'light');
  }, [theme]);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  useEffect(() => {
    const onErr = (e) => toast(t(e.detail && e.detail.kind === 'quota' ? 'toast.storageFull' : 'toast.storageUnavailable'), 'error');
    window.addEventListener('bible-storage-error', onErr);
    return () => window.removeEventListener('bible-storage-error', onErr);
  }, [t, toast]);

  useEffect(() => {
    const onUpdated = () => toast(t('toast.updated'), 'info');
    window.addEventListener('bible-sw-updated', onUpdated);
    return () => window.removeEventListener('bible-sw-updated', onUpdated);
  }, [t, toast]);

  const value = useMemo(
    () => ({
      lang,
      t,
      bookName: bName,
      refLabel,
      formatDate,
      translationId,
      translation: getTranslation(translationId),
      theme,
      fontSize,
      lineHeight,
      online,
      toast,
      confirm,
      setLang: (v) => storage.set(KEYS.language, v),
      setTranslation: (v) => storage.set(KEYS.translation, v),
      setTheme: (v) => storage.set(KEYS.theme, v),
      setFontSize: (v) => storage.set(KEYS.fontSize, v),
      setLineHeight: (v) => storage.set(KEYS.lineHeight, v)
    }),
    [lang, t, bName, refLabel, formatDate, translationId, theme, fontSize, lineHeight, online, toast, confirm]
  );

  return (
    <AppContext.Provider value={value}>
      {children}
      <ToastRegion toasts={toasts} onDismiss={dismissToast} label={t('a11y.notifications')} closeLabel={t('common.close')} />
      <ConfirmDialog
        dialog={dialog}
        onResult={closeDialog}
        cancelLabel={t('common.cancel')}
        defaultConfirm={t('common.confirm')}
      />
    </AppContext.Provider>
  );
}
