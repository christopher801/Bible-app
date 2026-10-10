import { useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { copyText, shareText, formatVerse } from '../services/sharingService.js';
import { getTranslation } from '../data/bible/translations.js';

/** Copy / share handlers for a verse { tr, book, chapter, verse } with its text. */
export function useVerseShare() {
  const { t, refLabel, toast } = useApp();

  const build = useCallback(
    (ref, text) => {
      const tr = getTranslation(ref.tr);
      return formatVerse({ text, label: refLabel(ref), abbr: tr ? tr.abbr : '' });
    },
    [refLabel]
  );

  const copyVerse = useCallback(
    async (ref, text) => {
      const ok = await copyText(build(ref, text));
      toast(t(ok ? 'toast.copied' : 'toast.copyFailed'), ok ? 'success' : 'error');
    },
    [build, t, toast]
  );

  const shareVerse = useCallback(
    async (ref, text) => {
      const body = build(ref, text);
      const res = await shareText({ title: refLabel(ref), text: body });
      if (res === 'shared') toast(t('toast.shared'), 'success');
      else if (res === 'unsupported') {
        const ok = await copyText(body);
        toast(t(ok ? 'toast.shareCopied' : 'toast.copyFailed'), ok ? 'info' : 'error');
      } else if (res === 'error') toast(t('toast.shareFailed'), 'error');
    },
    [build, refLabel, t, toast]
  );

  return { copyVerse, shareVerse };
}
