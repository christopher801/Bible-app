import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { DEVOTIONALS } from '../data/devotionals.js';
import { copyText } from '../services/sharingService.js';
import { refPath } from '../utils/reference.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';

function dayOfYear(d) {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(d.getFullYear(), 0, 0)) / 86400000);
}

export default function Devotional() {
  const { t, lang, refLabel, toast } = useApp();
  const [offset, setOffset] = useState(0);
  usePageTitle(t('devotional.title'));

  if (DEVOTIONALS.length === 0) {
    return (
      <div className="page">
        <PageHeader icon="bi-sunrise" title={t('devotional.title')} />
        <EmptyState icon="bi-sunrise" title={t('devotional.emptyTitle')} text={t('devotional.emptyText')}>
          <p className="small text-secondary-ink">{t('devotional.howTo')}</p>
          <Link className="btn btn-accent" to="/bible">{t('notfound.bible')}</Link>
        </EmptyState>
      </div>
    );
  }

  const date = new Date();
  date.setDate(date.getDate() + offset);
  const doy = dayOfYear(date);
  const entry = DEVOTIONALS.find((e) => e.dayOfYear === doy) || DEVOTIONALS[doy % DEVOTIONALS.length];
  const title = entry.title[lang] || entry.title.en;
  const body = entry.body[lang] || entry.body.en;

  return (
    <div className="page">
      <PageHeader icon="bi-sunrise" title={t('devotional.title')} subtitle={date.toLocaleDateString(lang === 'ht' ? 'fr' : lang, { dateStyle: 'full' })} />
      <article className="card-soft">
        <h2 className="h4">{title}</h2>
        <p style={{ whiteSpace: 'pre-line' }}>{body}</p>
        {entry.reference && (
          <Link className="btn btn-accent me-2" to={refPath(entry.reference.book, entry.reference.chapter, entry.reference.verse)}>
            {t('devotional.readPassage')}: {refLabel(entry.reference)}
          </Link>
        )}
        <button type="button" className="btn btn-soft" onClick={async () => toast(t((await copyText(`${title}\n\n${body}`)) ? 'toast.copied' : 'toast.copyFailed'))}>
          <i className="bi bi-share me-1" aria-hidden="true" />{t('action.share')}
        </button>
      </article>
      <div className="d-flex justify-content-between mt-3">
        <button type="button" className="btn btn-soft" onClick={() => setOffset((o) => o - 1)}><i className="bi bi-chevron-left" aria-hidden="true" /> {t('reader.prev')}</button>
        <button type="button" className="btn btn-soft" onClick={() => setOffset((o) => o + 1)}>{t('reader.next')} <i className="bi bi-chevron-right" aria-hidden="true" /></button>
      </div>
    </div>
  );
}
