import { Component } from 'react';
import { translate } from '../i18n/translations.js';
import { storage, KEYS } from '../services/storageService.js';

/** Last-resort screen so a rendering bug never shows a blank page. */
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    if (!this.state.failed) return this.props.children;
    const lang = storage.get(KEYS.language);
    return (
      <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 420 }}>
          <h1 style={{ fontSize: '1.4rem' }}>{translate(lang, 'error.title')}</h1>
          <p>{translate(lang, 'error.text')}</p>
          <button type="button" className="btn btn-accent" onClick={() => window.location.assign('/')}>
            {translate(lang, 'error.reload')}
          </button>
        </div>
      </div>
    );
  }
}
