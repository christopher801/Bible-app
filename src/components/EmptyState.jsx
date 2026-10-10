export default function EmptyState({ icon = 'bi-inbox', title, text, children }) {
  return (
    <div className="empty-state">
      <i className={`bi ${icon}`} aria-hidden="true" />
      <h2>{title}</h2>
      {text && <p>{text}</p>}
      {children}
    </div>
  );
}
