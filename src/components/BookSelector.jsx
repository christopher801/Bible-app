import { OLD_TESTAMENT, NEW_TESTAMENT } from '../data/books.js';
import { useApp } from '../context/AppContext.jsx';

export default function BookSelector({ value, onChange, id }) {
  const { t, bookName } = useApp();
  return (
    <div className="select-field">
      <label htmlFor={id}>{t('reader.book')}</label>
      <select id={id} className="form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <optgroup label={t('books.ot')}>
          {OLD_TESTAMENT.map((b) => (
            <option key={b.id} value={b.id}>
              {bookName(b.id)}
            </option>
          ))}
        </optgroup>
        <optgroup label={t('books.nt')}>
          {NEW_TESTAMENT.map((b) => (
            <option key={b.id} value={b.id}>
              {bookName(b.id)}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
}
