import { useEffect, useId, useRef, useState } from 'react';
import Dialog from './Dialog.jsx';
import { useApp } from '../context/AppContext.jsx';

const MAX = 2000;

export default function NoteDialog({ open, onClose, refText, initial = '', onSave, onDelete }) {
  const { t } = useApp();
  const id = useId();
  const [value, setValue] = useState(initial);
  const [error, setError] = useState('');
  const area = useRef(null);

  useEffect(() => {
    if (open) {
      setValue(initial);
      setError('');
      setTimeout(() => area.current && area.current.focus(), 30);
    }
  }, [open, initial]);

  const save = () => {
    if (!value.trim()) {
      setError(t('notes.emptyError'));
      return;
    }
    onSave(value.trim());
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('notes.dialogTitle', { ref: refText })}
      closeLabel={t('common.close')}
      footer={
        <>
          {onDelete && (
            <button type="button" className="btn btn-outline-danger me-auto" onClick={onDelete}>
              <i className="bi bi-trash me-1" aria-hidden="true" />
              {t('common.delete')}
            </button>
          )}
          <button type="button" className="btn btn-soft" onClick={onClose}>
            {t('common.cancel')}
          </button>
          <button type="button" className="btn btn-accent" onClick={save}>
            {t('common.save')}
          </button>
        </>
      }
    >
      <div>
        <label htmlFor={id} className="form-label fw-semibold">
          {t('notes.label')}
        </label>
        <textarea
          ref={area}
          id={id}
          className={`form-control${error ? ' is-invalid' : ''}`}
          rows={6}
          maxLength={MAX}
          value={value}
          placeholder={t('notes.placeholder')}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
          aria-describedby={`${id}-help`}
        />
        <div id={`${id}-help`} className={`form-text${error ? ' text-danger' : ''}`} role={error ? 'alert' : undefined}>
          {error || t('notes.limit', { n: MAX - value.length })}
        </div>
      </div>
    </Dialog>
  );
}
