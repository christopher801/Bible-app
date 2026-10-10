// Install prompt handling, service worker registration and platform detection.
let deferredPrompt = null;
let state = { canPrompt: false, installed: isStandalone() };
const listeners = new Set();

function setState(next) {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
}

export function isStandalone() {
  try {
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true
    );
  } catch (e) {
    return false;
  }
}

export function detectPlatform() {
  const ua = (navigator.userAgent || '').toLowerCase();
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/iphone|ipad|ipod/.test(ua) || iPadOS) return 'ios';
  if (/android/.test(ua)) return 'android';
  return 'desktop';
}

export function detectBrowser() {
  const ua = (navigator.userAgent || '').toLowerCase();
  if (/edg\//.test(ua)) return 'edge';
  if (/firefox|fxios/.test(ua)) return 'firefox';
  if (/chrome|crios|chromium/.test(ua)) return 'chrome';
  if (/safari/.test(ua)) return 'safari';
  return 'other';
}

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // keep the event so installation starts only from a user action
    deferredPrompt = e;
    setState({ canPrompt: true });
  });
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    setState({ canPrompt: false, installed: true });
  });
  try {
    window.matchMedia('(display-mode: standalone)').addEventListener('change', (e) => {
      if (e.matches) setState({ installed: true });
    });
  } catch (e) {
    /* older browsers */
  }
}

export const pwa = {
  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  getState: () => state
};

/** Must be called from a click handler. Resolves to 'accepted' | 'dismissed' | 'unavailable'. */
export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';
  const evt = deferredPrompt;
  deferredPrompt = null;
  setState({ canPrompt: false });
  try {
    await evt.prompt();
    const choice = await evt.userChoice;
    return choice && choice.outcome === 'accepted' ? 'accepted' : 'dismissed';
  } catch (e) {
    return 'unavailable';
  }
}

let registered = false;
/** Registers the service worker once (production builds only). onUpdate fires when a new version took control. */
export function registerServiceWorker(onUpdate) {
  if (registered || !('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  registered = true;
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hadController && onUpdate) onUpdate();
  });
  const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {});
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}
