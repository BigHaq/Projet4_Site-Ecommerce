import { Link } from 'react-router-dom';

export function Breadcrumb({ items }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-kora-muted py-3">
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-2">
          {idx > 0 && (
            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.to ? (
            <Link to={item.to} className="hover:text-primary transition-colors">{item.label}</Link>
          ) : (
            <span className="text-kora-text font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
