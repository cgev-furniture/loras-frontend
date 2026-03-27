import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import Pagination from '../../components/ui/Pagination';

export default function InquiryList() {
  const { t } = useTranslation('admin');
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('page') || '0', 10);

  const [inquiries, setInquiries] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const fetchInquiries = useCallback(() => {
    setLoading(true);
    api.get('/api/v1/admin/inquiries', { params: { page, size: 12 } })
      .then(res => {
        setInquiries(res.data.content ?? res.data);
        setTotalPages(res.data.totalPages ?? 1);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => { fetchInquiries(); }, [fetchInquiries]);

  function handlePageChange(p) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  }

  function toggleExpand(id) {
    setExpandedId(prev => prev === id ? null : id);
  }

  async function handleToggleRead(inquiry) {
    setTogglingId(inquiry.id);
    const nextRead = !inquiry.read;
    try {
      await api.patch(`/api/v1/admin/inquiries/${inquiry.id}/read`, { read: nextRead });
      setInquiries(prev =>
        prev.map(inq => inq.id === inquiry.id ? { ...inq, read: nextRead } : inq)
      );
    } catch {
      // swallow silently
    } finally {
      setTogglingId(null);
    }
  }

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  };

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
        {t('inquiries.heading', 'Inquiries')}
      </h1>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '72px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: 'var(--color-error)' }}>{t('inquiries.error', 'Failed to load inquiries.')}</p>
      ) : inquiries.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted)' }}>{t('inquiries.empty', 'No inquiries yet.')}</p>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {inquiries.map(inq => {
              const isExpanded = expandedId === inq.id;
              const isUnread = !inq.read;

              return (
                <div
                  key={inq.id}
                  style={{
                    backgroundColor: isUnread ? '#fdf8f3' : 'var(--color-white)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-card)',
                    border: isUnread ? '1px solid var(--color-caramel)' : '1px solid var(--color-border)',
                    overflow: 'hidden',
                    transition: 'border-color var(--transition-fast)',
                  }}
                >
                  {/* Row header — clickable to expand */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleExpand(inq.id)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') toggleExpand(inq.id); }}
                    aria-expanded={isExpanded}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr auto auto auto',
                      gap: 'var(--space-3)',
                      padding: 'var(--space-3)',
                      cursor: 'pointer',
                      alignItems: 'center',
                    }}
                    className="inquiry-row"
                  >
                    {/* Name + email */}
                    <div>
                      <p style={{ fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-text-primary)', margin: 0 }}>
                        {inq.name}
                      </p>
                      <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', margin: 0 }}>
                        {inq.email}
                      </p>
                    </div>

                    {/* Message preview */}
                    <p style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {inq.message?.slice(0, 80)}{inq.message?.length > 80 ? '…' : ''}
                    </p>

                    {/* Date */}
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(inq.submittedAt || inq.createdAt)}
                    </span>

                    {/* Badges */}
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'nowrap' }}>
                      {inq.emailDelivered !== undefined && (
                        <span className={`badge ${inq.emailDelivered ? 'badge-success' : ''}`} style={{ fontSize: 'var(--text-xs)' }}>
                          {inq.emailDelivered ? t('inquiries.email_ok', 'Email ✓') : t('inquiries.email_fail', 'Email ✗')}
                        </span>
                      )}
                      <span
                        className={`badge ${isUnread ? 'badge-accent' : ''}`}
                        style={{ fontSize: 'var(--text-xs)' }}
                      >
                        {isUnread ? t('inquiries.unread', 'Unread') : t('inquiries.read', 'Read')}
                      </span>
                    </div>

                    {/* Toggle read */}
                    <button
                      type="button"
                      onClick={e => { e.stopPropagation(); handleToggleRead(inq); }}
                      disabled={togglingId === inq.id}
                      className="btn"
                      style={{
                        padding: '0.3rem 0.75rem',
                        fontSize: 'var(--text-xs)',
                        minHeight: 32,
                        backgroundColor: isUnread ? 'var(--color-caramel)' : 'var(--color-border)',
                        color: isUnread ? 'var(--color-cream)' : 'var(--color-text-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {togglingId === inq.id
                        ? '…'
                        : isUnread
                        ? t('inquiries.mark_read', 'Mark read')
                        : t('inquiries.mark_unread', 'Mark unread')}
                    </button>
                  </div>

                  {/* Expanded message */}
                  {isExpanded && (
                    <div
                      style={{
                        padding: 'var(--space-3)',
                        borderTop: '1px solid var(--color-border)',
                        backgroundColor: '#fafafa',
                      }}
                    >
                      {inq.phone && (
                        <p style={{ fontSize: 'var(--text-small)', marginBottom: 'var(--space-1)' }}>
                          <strong>{t('inquiries.phone', 'Phone')}:</strong>{' '}
                          <a href={`tel:${inq.phone}`} style={{ color: 'var(--color-caramel)' }}>{inq.phone}</a>
                        </p>
                      )}
                      <p style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
                        {t('inquiries.full_message', 'Message')}:
                      </p>
                      <p style={{ fontSize: 'var(--text-body)', lineHeight: 'var(--line-height-body)', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {inq.message}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      <style>{`
        .inquiry-row:hover { background-color: rgba(139,98,47,0.04); }
        @media (max-width: 640px) {
          .inquiry-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
