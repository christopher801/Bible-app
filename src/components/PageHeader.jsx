export default function PageHeader({ icon, title, subtitle, children }) {
  return (
    <header className="page-head">
      <div className="page-head__text">
        <h1>
          {icon && <i className={`bi ${icon}`} aria-hidden="true" />}
          <span>{title}</span>
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children && <div className="page-head__actions">{children}</div>}
    </header>
  );
}
