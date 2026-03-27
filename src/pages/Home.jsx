import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import api from '../services/api';
import Card from '../components/ui/Card';
import SkeletonCard from '../components/ui/SkeletonCard';

const SERVICES = [
  {
    key: 'custom_furniture',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="16" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    key: 'cnc_machining',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
  {
    key: '3d_printing',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    key: 'laser_cutting',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
      </svg>
    ),
  },
  {
    key: 'outdoor_advertising',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" y1="22" x2="4" y2="15" />
      </svg>
    ),
  },
];

export default function Home() {
  const { t, i18n } = useTranslation('common');
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  // Sync lang attribute
  useEffect(() => {
    document.documentElement.lang = i18n.language?.slice(0, 2) || 'hy';
  }, [i18n.language]);

  // Fetch featured projects
  useEffect(() => {
    let cancelled = false;
    setProjectsLoading(true);
    api.get('/api/v1/projects', { params: { size: 6 } })
      .then(res => {
        if (!cancelled) setProjects(res.data?.content ?? res.data ?? []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setProjectsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <Helmet>
        <title>LORAS Furniture — Modern, Functional, Timeless | Yerevan, Armenia</title>
        <meta
          name="description"
          content={t('meta.home_description', 'Custom furniture and fabrication crafted to last. Based in Yerevan, Armenia — LORAS offers custom furniture, CNC machining, 3D printing, laser cutting and outdoor advertising.')}
        />
      </Helmet>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-espresso)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          paddingTop: '70px', /* navbar offset */
        }}
        aria-label="Hero"
      >
        {/* Subtle texture overlay */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 70% 50%, rgba(139,98,47,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div
          className="container"
          style={{
            textAlign: 'center',
            padding: 'var(--space-10) var(--space-4)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Vertical logo */}
          <img
            src="/src/assets/logo-light.svg"
            alt="LORAS Furniture"
            style={{
              height: '120px',
              width: 'auto',
              marginBottom: 'var(--space-6)',
              display: 'inline-block',
            }}
          />

          <h1
            style={{
              color: 'var(--color-cream)',
              fontSize: 'clamp(2rem, 5vw, var(--text-h1))',
              fontWeight: 'var(--font-weight-bold)',
              letterSpacing: '0.04em',
              marginBottom: 'var(--space-3)',
              lineHeight: 'var(--line-height-heading)',
            }}
          >
            {t('hero.tagline', 'Modern. Functional. Timeless.')}
          </h1>

          <p
            style={{
              color: 'rgba(244,235,225,0.8)',
              fontSize: 'clamp(1rem, 2.5vw, var(--text-h4))',
              maxWidth: '560px',
              margin: '0 auto var(--space-6)',
              lineHeight: 'var(--line-height-body)',
              fontWeight: 'var(--font-weight-light)',
            }}
          >
            {t('hero.subheadline', 'Custom furniture and fabrication crafted to last in Yerevan, Armenia')}
          </p>

          <div
            style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/portfolio" className="btn btn-primary">
              {t('hero.cta_explore', 'Explore Our Work')}
            </Link>
            <Link to="/contact" className="btn btn-ghost">
              {t('hero.cta_contact', 'Get in Touch')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust band ───────────────────────────────────────────────── */}
      <section
        style={{
          backgroundColor: 'var(--color-cream)',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
          padding: 'var(--space-5) 0',
        }}
        aria-label="Trust signals"
      >
        <div
          className="container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--space-8)',
            flexWrap: 'wrap',
          }}
        >
          {[
            { stat: t('trust.projects_stat', '100+'), label: t('trust.projects', 'Projects Completed') },
            { stat: t('trust.disciplines_stat', '5'), label: t('trust.disciplines', 'Craft Disciplines') },
            { stat: t('trust.location_stat', 'YVN'), label: t('trust.location', 'Yerevan, Armenia') },
          ].map(({ stat, label }) => (
            <div key={label} style={{ textAlign: 'center', minWidth: '120px' }}>
              <div
                style={{
                  fontSize: 'var(--text-h2)',
                  fontWeight: 'var(--font-weight-bold)',
                  color: 'var(--color-caramel)',
                  lineHeight: 1,
                }}
              >
                {stat}
              </div>
              <div
                style={{
                  fontSize: 'var(--text-small)',
                  color: 'var(--color-text-muted)',
                  marginTop: '0.35rem',
                  fontWeight: 'var(--font-weight-medium)',
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── About / Brand story ──────────────────────────────────────── */}
      <section className="section" style={{ backgroundColor: 'var(--color-white)' }} aria-labelledby="about-heading">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto var(--space-8)' }}>
            <h2
              id="about-heading"
              style={{
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
                fontSize: 'clamp(1.5rem, 3vw, var(--text-h2))',
              }}
            >
              {t('about.heading', 'Built with purpose')}
            </h2>
            <p
              style={{
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--text-body)',
                lineHeight: 'var(--line-height-body)',
              }}
            >
              {t(
                'about.statement',
                'At LORAS, every piece is designed with purpose — built to be modern in form, functional in use, and timeless in quality.'
              )}
            </p>
          </div>

          {/* Services grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--space-4)',
            }}
          >
            {SERVICES.map(({ key, icon }) => (
              <div
                key={key}
                style={{
                  padding: 'var(--space-4)',
                  backgroundColor: 'var(--bg-content)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: 'var(--space-2)',
                  transition: 'box-shadow var(--transition-base)',
                }}
                onMouseOver={e => (e.currentTarget.style.boxShadow = 'var(--shadow-card-hover)')}
                onMouseOut={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                <div style={{ color: 'var(--color-caramel)' }}>{icon}</div>
                <h3
                  style={{
                    fontSize: 'var(--text-body)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {t(`services.${key}.name`, key.replace(/_/g, ' '))}
                </h3>
                <p
                  style={{
                    fontSize: 'var(--text-small)',
                    color: 'var(--color-text-muted)',
                    lineHeight: 'var(--line-height-body)',
                    margin: 0,
                  }}
                >
                  {t(`services.${key}.desc`, '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Projects ────────────────────────────────────────── */}
      <section className="section" aria-labelledby="projects-heading">
        <div className="container">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-6)',
            }}
          >
            <div>
              <h2
                id="projects-heading"
                style={{ fontSize: 'clamp(1.5rem, 3vw, var(--text-h2))', marginBottom: '0.35rem' }}
              >
                {t('projects.heading', 'Our Work')}
              </h2>
              <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
                {t('projects.subheading', 'A selection of recent projects')}
              </p>
            </div>
            <Link to="/portfolio" className="btn btn-secondary">
              {t('projects.view_all', 'View All Projects')}
            </Link>
          </div>

          <div className="grid-cards">
            {projectsLoading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : projects.slice(0, 6).map(project => <Card key={project.id} project={project} />)
            }
          </div>

          {!projectsLoading && projects.length === 0 && (
            <p
              style={{
                textAlign: 'center',
                color: 'var(--color-text-muted)',
                padding: 'var(--space-8) 0',
              }}
            >
              {t('projects.empty', 'No projects yet — check back soon.')}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
