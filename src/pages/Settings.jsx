import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { usePwa } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { TRANSLATIONS } from '../data/bible/translations.js';
import { preloadAll, isTranslationAvailable } from '../services/bibleService.js';
import { FONT_SIZE, LINE_HEIGHT, THEMES, USER_DATA, clearKeys } from '../services/storageService.js';
import { APP_VERSION } from '../config.js';
import PageHeader from '../components/PageHeader.jsx';
import InstallButton from '../components/InstallButton.jsx';

const css = `
.set-sec { margin-bottom: 18px; }
.set-row { display: grid; gap: 6px; margin-bottom: 16px; }
.set-preview { font-family: var(--font-reading); padding: 14px; border: 1px dashed var(--border); border-radius: var(--radius); background: var(--surface-soft); }
.clear-grid { display: grid; gap: 8px; grid-template-columns: 1fr; }
@media (min-width: 576px) { .clear-grid { grid-template-columns: 1fr 1fr; } }
`;

export default function Settings() {
  const { t, lang, setLang, translationId, setTranslation, theme, setTheme, fontSize, setFontSize, lineHeight, setLineHeight, confirm, toast, online } = useApp();
  const { installed } = usePwa();
  const [dl, setDl] = useState(null);
  const busy = useRef(false);
  usePageTitle(t('settings.title'));

  const download = async () => {
    if (busy.current || !isTranslationAvailable(translationId)) return;
    busy.current = true;
    setDl({ done: 0, total: 66 });
    try {
      await preloadAll(translationId, (done, total) => setDl({ done, total }));
      toast(t('toast.downloaded'), 'success');
    } catch (e) {
      toast(t('toast.downloadFailed'), 'error');
    } finally {
      busy.current = false;
      setDl(null);
    }
  };

  const clear = async (label, keys, messageKey = 'settings.confirmClearGeneric') => {
    if (await confirm({ title: label, message: t(messageKey), confirmLabel: t('common.delete'), danger: true })) {
      clearKeys(keys);
      toast(t('toast.cleared'));
    }
  };

  const clears = [
    ['settings.clearFavorites', USER_DATA.favorites],
    ['settings.clearHighlights', USER_DATA.highlights],
    ['settings.clearNotes', USER_DATA.notes],
    ['settings.clearHistory', USER_DATA.history],
    ['settings.clearPlans', USER_DATA.plans, 'settings.confirmClearPlans']
  ];

  return (
    <div className="page">
      <style>{css}</style>
      <PageHeader icon="bi-gear" title={t('settings.title')} />

      <section className="card-soft set-sec" aria-labelledby="s-lang">
        <h2 className="section-title" id="s-lang">{t('settings.language')}</h2>
        <div className="set-row">
          <label htmlFor="s-ui" className="fw-semibold">{t('settings.interfaceLang')}</label>
          <select id="s-ui" className="form-select" value={lang} onChange={(e) => setLang(e.target.value)}>
            <option value="ht" lang="ht">Kreyòl ayisyen</option>
            <option value="es" lang="es">Español</option>
            <option value="en" lang="en">English</option>
          </select>
        </div>
        <div className="set-row mb-1">
          <label htmlFor="s-tr" className="fw-semibold">{t('settings.bibleTranslation')}</label>
          <select id="s-tr" className="form-select" value={translationId} onChange={(e) => setTranslation(e.target.value)}>
            {TRANSLATIONS.map((tr) => (
              <option key={tr.id} value={tr.id} disabled={!tr.available}>
                {tr.name} ({tr.abbr}){tr.available ? '' : ` — ${t('settings.translationMissing')}`}
              </option>
            ))}
          </select>
          <small className="text-secondary-ink">{t('settings.translationNote')}</small>
          <Link to="/licenses">{t('settings.seeLicenses')}</Link>
        </div>
      </section>

      <section className="card-soft set-sec" aria-labelledby="s-app">
        <h2 className="section-title" id="s-app">{t('settings.appearance')}</h2>
        <div className="seg" role="group" aria-label={t('settings.theme')}>
          {THEMES.map((th) => (
            <button key={th} type="button" aria-pressed={theme === th} onClick={() => setTheme(th)}>{t(`theme.${th}`)}</button>
          ))}
        </div>
      </section>

      <section className="card-soft set-sec" aria-labelledby="s-read">
        <h2 className="section-title" id="s-read">{t('settings.reading')}</h2>
        <div className="set-row">
          <label htmlFor="s-fs" className="fw-semibold">{t('settings.fontSize')}: {fontSize}px</label>
          <input id="s-fs" type="range" className="form-range" min={FONT_SIZE.min} max={FONT_SIZE.max} step={FONT_SIZE.step} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} />
        </div>
        <div className="set-row">
          <label htmlFor="s-lh" className="fw-semibold">{t('settings.lineHeight')}: {lineHeight.toFixed(1)}</label>
          <input id="s-lh" type="range" className="form-range" min={LINE_HEIGHT.min} max={LINE_HEIGHT.max} step={LINE_HEIGHT.step} value={lineHeight} onChange={(e) => setLineHeight(Number(e.target.value))} />
        </div>
        <div className="small fw-semibold text-secondary-ink mb-1">{t('settings.preview')}</div>
        <p className="set-preview mb-0" style={{ fontSize, lineHeight }}>{t('settings.previewText')}</p>
      </section>

      <section className="card-soft set-sec" aria-labelledby="s-off">
        <h2 className="section-title" id="s-off">{t('settings.offline')}</h2>
        <p>{t('settings.offlineText')}</p>
        <button type="button" className="btn btn-accent" onClick={download} disabled={!!dl || !online || !isTranslationAvailable(translationId)}>
          <i className="bi bi-cloud-arrow-down me-2" aria-hidden="true" />
          {dl ? t('settings.offlineProgress', dl) : t('settings.offlineButton')}
        </button>
        {dl && <progress className="d-block w-100 mt-2" max={dl.total} value={dl.done} aria-label={t('settings.offlineProgress', dl)} />}
        <p className="small text-secondary-ink mt-2 mb-0">{t('settings.offlineNote')}</p>
      </section>

      <section className="card-soft set-sec" aria-labelledby="s-store">
        <h2 className="section-title" id="s-store">{t('settings.storage')}</h2>
        <p>{t('settings.storageText')}</p>
        <div className="clear-grid mb-3">
          {clears.map(([k, keys, msg]) => (
            <button key={k} type="button" className="btn btn-soft" onClick={() => clear(t(k), keys, msg)}>
              <i className="bi bi-trash me-2" aria-hidden="true" />{t(k)}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-danger" onClick={() => clear(t('settings.clearAll'), USER_DATA.all, 'settings.confirmClearAll')}>
          <i className="bi bi-exclamation-triangle me-2" aria-hidden="true" />{t('settings.clearAll')}
        </button>
      </section>

      <section className="card-soft set-sec" aria-labelledby="s-inst">
        <h2 className="section-title" id="s-inst">{t('settings.installation')}</h2>
        <p>{installed ? t('install.statusInstalled') : t('install.statusManual')}</p>
        <div className="d-flex flex-wrap gap-2">
          <InstallButton showInstalled />
          {!installed && <Link className="btn btn-soft" to="/install">{t('install.how')}</Link>}
        </div>
      </section>

      <section className="card-soft set-sec" aria-labelledby="s-about">
        <h2 className="section-title" id="s-about">{t('settings.about')}</h2>
        <p className="mb-1">{t('app.name')} · {t('common.version', { v: APP_VERSION })}</p>
        <p className="mb-2">{t('settings.privacyInfo')}</p>
        <div className="d-flex flex-wrap gap-3">
          <Link to="/privacy">{t('nav.privacy')}</Link>
          <Link to="/licenses">{t('nav.licenses')}</Link>
          <Link to="/about">{t('nav.about')}</Link>
        </div>
      </section>
    </div>
  );
}
