import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Pagination from '../../components/ui/Pagination';

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function ProjectList() {
  const { t } = useTranslation('admin');
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '0', 10);
  const sortDir = searchParams.get('sort') || 'desc';
  const searchQuery = searchParams.get('q') || '';

  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // project to delete
  const [deletingId, setDeletingId] = useState(null);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    setError(null);
    api.get('/api/v1/admin/projects', {
      params: { page, size: 12, sort: `created_at,${sortDir}` },
    })
      .then(res => {
        setProjects(res.data.content ?? res.data);
        setTotalPages(res.data.totalPages ?? 1);
      })
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, [page, sortDir]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // Debounced search update in URL
  const debouncedSetSearch = useRef(
    debounce((val) => {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        if (val) next.set('q', val); else next.delete('q');
        next.set('page', '0');
        return next;
      });
    }, 300)
  ).current;

  function handleSearchChange(e) {
    setLocalSearch(e.target.value);
    debouncedSetSearch(e.target.value);
  }

  function toggleSort() {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('sort', sortDir === 'desc' ? 'asc' : 'desc');
      next.set('page', '0');
      return next;
    });
  }

  function handlePageChange(p) {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('page', String(p));
      return next;
    });
  }

  async function handleTogglePublish(project) {
    setTogglingId(project.id);
    try {
      await api.patch(`/api/v1/admin/projects/${project.id}/publish`, {
        published: !project.published,
      });
      setProjects(prev =>
        prev.map(p => p.id === project.id ? { ...p, published: !p.published } : p)
      );
    } catch {
      // error silently swallowed; could add toast
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setDeletingId(confirmDelete.id);
    try {
      await api.delete(`/api/v1/admin/projects/${confirmDelete.id}`);
      setConfirmDelete(null);
      fetchProjects();
    } catch {
      // swallow
    } finally {
      setDeletingId(null);
    }
  }

  // Client-side filter by search query on current page data
  const displayed = searchQuery
    ? projects.filter(p => p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    : projects;

  const formatDate = (iso) => {
    if (!iso) return '—';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(iso));
  };

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
          {t('projects.heading', 'Projects')}
        </h1>
        <Link to="/admin/projects/new" className="btn btn-primary">
          {t('projects.add', 'Add Project')}
        </Link>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="search"
          placeholder={t('projects.search_placeholder', 'Search by title…')}
          value={localSearch}
          onChange={handleSearchChange}
          className="form-input"
          style={{ maxWidth: '320px' }}
          aria-label={t('projects.search_label', 'Search projects')}
        />
        <button
          type="button"
          onClick={toggleSort}
          className="btn btn-secondary"
          aria-label={t('projects.sort_label', 'Toggle date sort order')}
          style={{ fontSize: 'var(--text-small)', padding: '0.5rem 1rem' }}
        >
          {t('projects.date', 'Date')} {sortDir === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: '56px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : error ? (
        <p style={{ color: 'var(--color-error)' }}>{t('projects.error', 'Failed to load projects.')}</p>
      ) : (
        <>
          <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', backgroundColor: 'var(--color-white)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <th style={thStyle}>{t('projects.col_thumb', '')}</th>
                  <th style={thStyle}>{t('projects.col_title', 'Title')}</th>
                  <th style={thStyle}>{t('projects.col_categories', 'Categories')}</th>
                  <th style={thStyle}>{t('projects.col_status', 'Status')}</th>
                  <th style={thStyle}>{t('projects.col_date', 'Created')}</th>
                  <th style={thStyle}>{t('projects.col_actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {displayed.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
                      {t('projects.empty', 'No projects found.')}
                    </td>
                  </tr>
                )}
                {displayed.map(project => (
                  <tr
                    key={project.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background-color var(--transition-fast)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--color-cream)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    {/* Thumbnail */}
                    <td style={{ ...tdStyle, width: '60px' }}>
                      {project.thumbnailUrl || project.images?.[0]?.publicUrl ? (
                        <img
                          src={project.thumbnailUrl || project.images[0].publicUrl}
                          alt=""
                          width={48}
                          height={48}
                          style={{ objectFit: 'cover', borderRadius: 'var(--radius-sm)', display: 'block' }}
                        />
                      ) : (
                        <div style={{ width: 48, height: 48, backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-sm)' }} />
                      )}
                    </td>

                    {/* Title */}
                    <td style={{ ...tdStyle, maxWidth: '200px' }}>
                      <span className="truncate" style={{ display: 'block', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                        {project.title}
                      </span>
                    </td>

                    {/* Categories */}
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                        {project.categories?.slice(0, 2).map(cat => (
                          <span key={cat.id} className="badge" style={{ fontSize: 'var(--text-xs)' }}>
                            {cat.name}
                          </span>
                        ))}
                        {project.categories?.length > 2 && (
                          <span className="badge" style={{ fontSize: 'var(--text-xs)' }}>
                            +{project.categories.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td style={tdStyle}>
                      <span className={`badge ${project.published ? 'badge-success' : 'badge-draft'}`}>
                        {project.published ? t('projects.published', 'Published') : t('projects.draft', 'Draft')}
                      </span>
                    </td>

                    {/* Date */}
                    <td style={{ ...tdStyle, fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDate(project.createdAt)}
                    </td>

                    {/* Actions */}
                    <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
                        {/* Publish toggle */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(project)}
                          disabled={togglingId === project.id}
                          className="btn"
                          style={{
                            padding: '0.35rem 0.75rem',
                            fontSize: 'var(--text-xs)',
                            minHeight: 32,
                            backgroundColor: project.published ? '#fff9c4' : '#c8e6c9',
                            color: project.published ? '#5d4037' : '#1b5e20',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                          }}
                        >
                          {togglingId === project.id ? '…' : project.published
                            ? t('projects.unpublish', 'Unpublish')
                            : t('projects.publish', 'Publish')}
                        </button>

                        {/* Edit */}
                        <Link
                          to={`/admin/projects/${project.id}`}
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs)', minHeight: 32 }}
                        >
                          {t('projects.edit', 'Edit')}
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(project)}
                          className="btn btn-danger"
                          style={{ padding: '0.35rem 0.75rem', fontSize: 'var(--text-xs)', minHeight: 32 }}
                          aria-label={t('projects.delete_aria', 'Delete {{title}}', { title: project.title })}
                        >
                          {t('projects.delete', 'Delete')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        open={!!confirmDelete}
        title={t('projects.confirm_delete_title', 'Delete Project')}
        message={t('projects.confirm_delete_msg', 'Are you sure you want to delete "{{title}}"? This action cannot be undone.', { title: confirmDelete?.title })}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
        isLoading={!!deletingId}
      />
    </div>
  );
}

const thStyle = {
  textAlign: 'left',
  padding: 'var(--space-2) var(--space-3)',
  fontSize: 'var(--text-small)',
  fontWeight: 'var(--font-weight-semibold)',
  color: 'var(--color-text-muted)',
  whiteSpace: 'nowrap',
};

const tdStyle = {
  padding: 'var(--space-2) var(--space-3)',
  verticalAlign: 'middle',
};
