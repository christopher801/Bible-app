import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { SITE_URL } from '../config.js';

// Personal or low-value pages: keep them out of Google's index.
const PRIVATE_PATHS = ['/favorites', '/highlights', '/notes', '/history', '/settings', '/search', '/install'];

function setMeta(attr, key, value) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(href) {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

/**
 * Sets the document title plus SEO tags for the current page:
 * description, canonical URL (query string removed), Open Graph/Twitter tags and robots.
 * Usage: usePageTitle('John 3', { description: '…', noindex: false })
 */
export function usePageTitle(title, options = {}) {
  const { t } = useApp();
  const { pathname } = useLocation();
  const { description, noindex } = options;

  useEffect(() => {
    const full = title ? `${title} · ${t('app.name')}` : t('app.name');
    const desc = (description || t('app.tagline')).replace(/\s+/g, ' ').trim().slice(0, 160);
    const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : '/';
    const url = SITE_URL + clean;
    const hidden = noindex || PRIVATE_PATHS.includes(clean);

    document.title = full;
    setMeta('name', 'description', desc);
    setMeta('name', 'robots', hidden ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1');
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', full);
    setMeta('name', 'twitter:description', desc);
    setCanonical(url);
  }, [title, description, noindex, pathname, t]);
}