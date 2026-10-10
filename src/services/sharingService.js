// Copy / share helpers. Never throw: callers receive a status string.
export async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (e) {
    return false;
  }
}

export const canShare = () => typeof navigator !== 'undefined' && typeof navigator.share === 'function';

/** Resolves to 'shared' | 'cancelled' | 'unsupported' | 'error'. */
export async function shareText({ title, text }) {
  if (!canShare()) return 'unsupported';
  try {
    await navigator.share({ title, text });
    return 'shared';
  } catch (e) {
    return e && e.name === 'AbortError' ? 'cancelled' : 'error';
  }
}

export function formatVerse({ text, label, abbr }) {
  return `“${text}”\n— ${label}${abbr ? ` (${abbr})` : ''}`;
}
