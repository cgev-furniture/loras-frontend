import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import { useCategories } from '../hooks/useCategories';
import Card from '../components/ui/Card';
import SkeletonCard from '../components/ui/SkeletonCard';
import CategoryChip from '../components/ui/CategoryChip';
import Pagination from '../components/ui/Pagination';

const PAGE_SIZE = 12;

export default function Portfolio() {
  const { t } = useTranslation('portfolio');
  const [searchParams, setSearchParams] = useSearchParams();
  const { categories } = useCategories();

  // Derive state from URL
  const currentPage = parseInt(searchParams.get('page') || '0', 10);
  const selectedIds = searchParams.get('categories')
    ? searchParams.get('categories').split(',').filter(Boolean)
    : [];

  const [projects, setProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(() => {
    setLoading(true);
    const params = {
      page: currentPage,
      size: PAGE_SIZE,
    };
    if (selectedIds.length > 0) {
      params.categoryIds = selectedIds.join(',');
    }
    api.get('/api/v1/projects', { params })
      .then(res => {
        const data = res.data;
        if (data && typeof data === 'object' && 'content' in data) {
          setProjects(data.content);
          setTotalPages(data.totalPages ?? 1);
        } else {
          setProjects(Array.isArray(data) ? data : []);
          setTotalPages(1);
        }
      })
      .catch(() => {
        setProjects([]);
        setTotalPages(0);
      })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchParams.get('categories')]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  function handleCategoryToggle(id) {
    const idStr = String(id);
    const next = selectedIds.includes(idStr)
      ? selectedIds.filter(x => x !== idStr)
      : [...selectedIds, idStr];

    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', '0');
    if (next.length > 0) {
      newParams.set('categories', next.join(','));
    } else {
      newParams.delete('categories');
    }
    setSearchParams(newParams, { replace: false });
  }

  function handleClearAll() {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('categories');
    newParams.set('page', '0');
    setSearchParams(newParams, { replace: false });
  }

  function handlePageChange(page) {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(page));
    setSearchParams(newParams, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <>
      <Helmet>
        <title>{t('meta.title', 'Portfolio | LORAS Furniture')}</title>
        <meta name="description" content={t('meta.description', 'Browse custom furniture and fabrication projects by LORAS — CNC, 3D printing, laser cutting and outdoor advertising from Yerevan, Armenia.')} />
      </Helmet>

      {/* Page header */}
      <div
        style={{
          backgroundColor: 'var(--color-espresso)',
          paddingTop: 'calc(70px + var(--space-8))',
          paddingBottom: 'var(--space-8)',
        }}
      >
        <div className="container">
          <h1
            style={{
              color: 'var(--color-cream)',
              fontSize: 'clamp(1.8rem, 4vw, var(--text-h1))',
              marginBottom: 'var(--space-1)',
            }}
          >
            {t('heading', 'Portfolio')}
          </h1>
          <p style={{ color: 'rgba(244,235,225,0.7)', fontSize: 'var(--text-body)' }}>
            {t('subheading', 'Custom work, crafted to last')}
          </p>
        </div>
      </div>

      {/* Filter bar */}
      {categories.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: '70px',
            zIndex: 'var(--z-dropdown)',
            backgroundColor: 'var(--color-white)',
            borderBottom: '1px solid var(--color-border)',
            padding: 'var(--space-2) 0',
            boxShadow: '0 2px 8px rgba(50,27,18,0.06)',
          }}
        >
          <div
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {categories.map(cat => (
              <CategoryChip
                key={cat.id}
                label={cat.name}
                active={selectedIds.includes(String(cat.id))}
                onClick={() => handleCategoryToggle(cat.id)}
              />
            ))}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                style={{
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-muted)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  padding: '0.4rem 0.75rem',
                  minHeight: '44px',
                  textDecoration: 'underline',
                }}
              >
                {t('filter.clear_all', 'Clear all')}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Projects grid */}
      <section className="section" aria-label={t('projects_grid_label', 'Projects')}>
        <div className="container">
          {loading ? (
            <div className="grid-cards">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : projects.length > 0 ? (
            <>
              <div className="grid-cards">
                {projects.map(project => (
                  <Card key={project.id} project={project} />
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: 'var(--space-10) var(--space-4)',
                color: 'var(--color-text-muted)',
              }}
            >
              <p style={{ fontSize: 'var(--text-h4)', marginBottom: 'var(--space-3)' }}>
                {t('no_results.message', 'No projects match your filters.')}
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClearAll}
              >
                {t('no_results.view_all', 'View all projects')}
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
