import { useTranslation } from 'react-i18next';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation('common');

  if (totalPages <= 1) return null;

  // Build page number list — show up to 7 pages with ellipsis
  function buildPages() {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
      return pages;
    }
    // Always include first, last, current and nearby
    const rangeStart = Math.max(1, currentPage - 1);
    const rangeEnd = Math.min(totalPages - 2, currentPage + 1);
    pages.push(0);
    if (rangeStart > 1) pages.push('...');
    for (let i = rangeStart; i <= rangeEnd; i++) pages.push(i);
    if (rangeEnd < totalPages - 2) pages.push('...');
    pages.push(totalPages - 1);
    return pages;
  }

  const pages = buildPages();
  const btnStyle = (active) => ({
    minWidth: '40px',
    height: '40px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid',
    borderColor: active ? 'var(--color-caramel)' : 'var(--color-border)',
    backgroundColor: active ? 'var(--color-caramel)' : 'var(--color-white)',
    color: active ? 'var(--color-cream)' : 'var(--color-text-primary)',
    fontWeight: active ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
    cursor: 'pointer',
    fontSize: 'var(--text-small)',
    transition: 'all var(--transition-fast)',
    padding: '0 0.5rem',
  });

  return (
    <nav
      aria-label={t('pagination.label', 'Pagination')}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-1)',
        marginTop: 'var(--space-6)',
        flexWrap: 'wrap',
      }}
    >
      {/* Prev */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
        aria-label={t('pagination.prev', 'Previous page')}
        style={{
          ...btnStyle(false),
          opacity: currentPage === 0 ? 0.4 : 1,
          cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        &#8592;
      </button>

      {/* Page numbers — hidden on mobile via CSS */}
      <div
        className="pagination-numbers"
        style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}
      >
        {pages.map((page, idx) =>
          page === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{ ...btnStyle(false), border: 'none', backgroundColor: 'transparent', cursor: 'default' }}
            >
              &hellip;
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={t('pagination.page', 'Page {{n}}', { n: page + 1 })}
              aria-current={page === currentPage ? 'page' : undefined}
              style={btnStyle(page === currentPage)}
            >
              {page + 1}
            </button>
          )
        )}
      </div>

      {/* Next */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
        aria-label={t('pagination.next', 'Next page')}
        style={{
          ...btnStyle(false),
          opacity: currentPage === totalPages - 1 ? 0.4 : 1,
          cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
        }}
      >
        &#8594;
      </button>

      <style>{`
        @media (max-width: 640px) {
          .pagination-numbers { display: none; }
        }
      `}</style>
    </nav>
  );
}
