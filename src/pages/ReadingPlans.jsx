import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { KEYS, resetPlan, togglePlanDay } from '../services/storageService.js';
import { PLANS, getPlan } from '../data/plans.js';
import { refPath } from '../utils/reference.js';
import PageHeader from '../components/PageHeader.jsx';
import NotFound from './NotFound.jsx';

const css = `
.pbar { height: 8px; border-radius: 999px; background: var(--border); overflow: hidden; margin: 8px 0; }
.pbar > span { display: block; height: 100%; background: var(--accent); }
.plan-days { list-style: none; margin: 16px 0 0; padding: 0; display: grid; gap: 8px; }
.plan-day { display: flex; align-items: center; gap: 10px; padding: 8px 10px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); }
.plan-day--done { background: var(--surface-soft); }
.plan-day--done .plan-day__title { text-decoration: line-through; color: var(--text-2); }
.plan-day__title { flex: 1; min-width: 0; }
.plan-day__title small { display: block; color: var(--text-2); }
.plan-check { width: 44px; height: 44px; flex: none; border-radius: 10px; border: 2px solid var(--border); background: var(--surface); color: var(--on-accent); }
.plan-check[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); }
`;

export default function ReadingPlans() {
  const { t, bookName, confirm, toast } = useApp();
  const [sp, setSp] = useSearchParams();
  const progress = useStored(KEYS.plans);
  usePageTitle(t('plans.title'));
  const planId = sp.get('plan');
  const plan = planId ? getPlan(planId) : null;
  if (planId && !plan) return <NotFound />;

  const dayLabel = (d) => (d.to ? t('plans.psalmsRange', { from: d.chapter, to: d.to }) : `${bookName(d.book)} ${d.chapter}`);

  if (!plan) {
    return (
      <div className="page">
        <style>{css}</style>
        <PageHeader icon="bi-calendar-check" title={t('plans.title')} subtitle={t('plans.intro')} />
        <div className="stack">
          {PLANS.map((p) => {
            const done = (progress[p.id] || []).length;
            const pct = Math.round((done / p.days.length) * 100);
            return (
              <article key={p.id} className="card-soft">
                <h2 className="h5">{t(p.titleKey)}</h2>
                <p className="mb-1">{t(p.descKey)}</p>
                <div className="pbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t('plans.progress', { done, total: p.days.length })}><span style={{ width: `${pct}%` }} /></div>
                <p className="small text-secondary-ink">{t('plans.progress', { done, total: p.days.length })}</p>
                <button type="button" className="btn btn-accent" onClick={() => setSp({ plan: p.id })}>{t(done ? 'plans.open' : 'plans.start')}</button>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  const done = new Set(progress[plan.id] || []);
  const total = plan.days.length;
  const pct = Math.round((done.size / total) * 100);
  const nextIdx = plan.days.findIndex((_, i) => !done.has(i));
  const reset = async () => {
    if (await confirm({ title: t('plans.reset'), message: t('plans.confirmReset'), confirmLabel: t('plans.reset'), danger: true })) {
      resetPlan(plan.id);
      toast(t('toast.cleared'));
    }
  };

  return (
    <div className="page">
      <style>{css}</style>
      <PageHeader icon="bi-calendar-check" title={t(plan.titleKey)} subtitle={t(plan.descKey)}>
        <button type="button" className="btn btn-soft btn-sm" onClick={() => setSp({})}>
          <i className="bi bi-arrow-left me-1" aria-hidden="true" />{t('plans.back')}
        </button>
      </PageHeader>
      <section className="card-soft" aria-label={t('plans.progress', { done: done.size, total })}>
        <div className="pbar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={t('plans.progress', { done: done.size, total })}><span style={{ width: `${pct}%` }} /></div>
        <p className="mb-2 fw-semibold">{t('plans.progress', { done: done.size, total })}</p>
        <div className="d-flex flex-wrap gap-2">
          {nextIdx >= 0 ? (
            <Link className="btn btn-accent" to={refPath(plan.days[nextIdx].book, plan.days[nextIdx].chapter)}>
              <i className="bi bi-play-fill me-1" aria-hidden="true" />{t('plans.resume', { n: nextIdx + 1 })} · {dayLabel(plan.days[nextIdx])}
            </Link>
          ) : (
            <strong role="status">{t('plans.completed')}</strong>
          )}
          {done.size > 0 && <button type="button" className="btn btn-outline-danger" onClick={reset}>{t('plans.reset')}</button>}
        </div>
      </section>
      <ol className="plan-days">
        {plan.days.map((d, i) => {
          const isDone = done.has(i);
          return (
            <li key={i} className={`plan-day${isDone ? ' plan-day--done' : ''}`}>
              <button type="button" className="plan-check" aria-pressed={isDone} aria-label={`${t('plans.day', { n: i + 1 })}: ${t(isDone ? 'plans.markUndone' : 'plans.markDone')}`} onClick={() => togglePlanDay(plan.id, i)}>
                {isDone && <i className="bi bi-check-lg" aria-hidden="true" />}
              </button>
              <div className="plan-day__title">
                <strong>{t('plans.day', { n: i + 1 })}</strong>
                <small>{dayLabel(d)}{i === nextIdx ? ` · ${t('plans.today')}` : ''}</small>
              </div>
              <Link className="btn btn-soft btn-sm" to={refPath(d.book, d.chapter)}>{t('plans.read')}</Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
