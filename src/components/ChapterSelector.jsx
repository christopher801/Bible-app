import { getBook } from '../data/books.js';
import { useApp } from '../context/AppContext.jsx';

export default function ChapterSelector({ book, value, onChange, id }) {
  const { t } = useApp();
  const total = getBook(book) ? getBook(book).chapters : 0;
  return (
    <div className="select-field">
      <label htmlFor={id}>{t('reader.chapter')}</label>
      <select id={id} className="form-select" value={value} onChange={(e) => onChange(parseInt(e.target.value, 10))}>
        {Array.from({ length: total }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
}
