import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.jsx';
import { useStored } from '../hooks/useStored.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { KEYS, USER_DATA, clearKeys, deleteNote, saveNote } from '../services/storageService.js';
import { fold } from '../utils/text.js';
import PageHeader from '../components/PageHeader.jsx';
import EmptyState from '../components/EmptyState.jsx';
import VerseCard from '../components/VerseCard.jsx';
import NoteDialog from '../components/NoteDialog.jsx';

export default function Notes() {
  const { t, confirm, toast, formatDate, refLabel } = useApp();
  const notes = useStored(KEYS.notes);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(null);
  usePageTitle(t('notes.title'));

  const list = useMemo(() => {
    const f = fold(q.trim());
    return f ? notes.filter((n) => fold(n.note).includes(f) || fold(n.text).includes(f) || fold(refLabel(n)).includes(f)) : notes;
  }, [notes, q, refLabel]);

  const remove = async (n) => {
    if (await confirm({ title: t('common.delete'), message: t('notes.confirmDelete'), confirmLabel: t('common.delete'), danger: true })) {
      deleteNote(n.id);
      toast(t('toast.noteDeleted'));
    }
  };
  const clearAll = async () => {
    if (await confirm({ title: t('notes.clear'), message: t('notes.confirmClear'), confirmLabel: t('common.delete'), danger: true })) {
      clearKeys(USER_DATA.notes);
      toast(t('toast.cleared'));
    }
  };

  return (
    <div className="page">
      <PageHeader icon="bi-journal-text" title={t('notes.title')}>
        {notes.length > 0 && (
          <button type="button" className="btn btn-outline-danger btn-sm" onClick={clearAll}>
            <i className="bi bi-trash me-1" aria-hidden="true" />
            {t('notes.clear')}
          </button>
        )}
      </PageHeader>
      {notes.length === 0 ? (
        <EmptyState icon="bi-journal-text" title={t('notes.empty')} text={t('notes.emptyHint')}>
          <Link className="btn btn-accent" to="/bible">{t('favorites.goRead')}</Link>
        </EmptyState>
      ) : (
        <>
          <label htmlFor="notes-q" className="form-label fw-semibold">{t('notes.search')}</label>
          <input id="notes-q" type="search" className="form-control mb-3" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('notes.searchPlaceholder')} autoComplete="off" />
          {list.length === 0 && <p role="status">{t('notes.noMatches', { q })}</p>}
          <div className="stack">
            {list.map((n) => (
              <VerseCard
                key={n.id}
                item={n}
                footer={null}
              >
                <p className="vcard__note">{n.note}</p>
                <p className="small text-secondary-ink mb-2">
                  {t('notes.created', { date: formatDate(n.createdAt) })}
                  {n.updatedAt !== n.createdAt && <> · {t('notes.modified', { date: formatDate(n.updatedAt) })}</>}
                </p>
                <div className="vcard__foot">
                  <button type="button" className="btn btn-soft btn-sm" onClick={() => setEditing(n)}><i className="bi bi-pencil me-1" aria-hidden="true" />{t('common.edit')}</button>
                  <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => remove(n)}><i className="bi bi-trash me-1" aria-hidden="true" />{t('common.delete')}</button>
                </div>
              </VerseCard>
            ))}
          </div>
        </>
      )}
      <NoteDialog
        open={!!editing}
        onClose={() => setEditing(null)}
        refText={editing ? refLabel(editing) : ''}
        initial={editing ? editing.note : ''}
        onSave={(v) => {
          if (saveNote(editing, editing.text, v)) toast(t('toast.noteSaved'), 'success');
          setEditing(null);
        }}
      />
    </div>
  );
}
