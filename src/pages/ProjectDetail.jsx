import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import api from '../services/api';
import ImageFallback from '../components/ui/ImageFallback';

export default function ProjectDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation('common');

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    api.get(`/api/v1/projects/${slug}`)
      .then(res => { if (!cancelled) setProject(res.data); })
      .catch(err => { if (!cancelled) setError(err); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  function openLightbox(index) {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }

  function handleBack() {
    // Preserve previous portfolio search params if available
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/portfolio');
    }
  }

  if (loading) {
    return (
      <div
        style={{
          paddingTop: 'calc(70px + var(--space-8))',
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            border: '3px solid var(--color-border)',
            borderTopColor: 'var(--color-caramel)',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div
        style={{
          paddingTop: 'calc(70px + var(--space-8))',
          minHeight: '60vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-3)',
        }}
      >
        <h1 style={{ fontSize: 'var(--text-h2)' }}>Project not found</h1>
        <Link to="/portfolio" className="btn btn-primary">Back to Portfolio</Link>
      </div>
    );
  }

  const images = project.images ?? [];
  const firstImageUrl = images[0]?.publicUrl;
  const lang = i18n.language?.slice(0, 2) || 'en';

  const formattedDate = project.createdAt
    ? new Intl.DateTimeFormat(lang, { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(project.createdAt))
    : null;

  const ogDescription = project.description
    ? project.description.slice(0, 160)
    : 'A custom furniture project by LORAS.';

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';

  const slides = images.map(img => ({ src: img.publicUrl, alt: project.title }));

  return (
    <>
      <Helmet>
        <title>LORAS Furniture | {project.title}</title>
        <meta name="description" content={ogDescription} />
        <meta property="og:title" content={`LORAS Furniture | ${project.title}`} />
        <meta property="og:description" content={ogDescription} />
        {firstImageUrl && <meta property="og:image" content={firstImageUrl} />}
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div style={{ paddingTop: '70px' }}>
        {/* Hero image */}
        {firstImageUrl && (
          <div
            style={{
              width: '100%',
              maxHeight: '520px',
              overflow: 'hidden',
              backgroundColor: 'var(--color-espresso)',
              cursor: 'pointer',
            }}
            onClick={() => openLightbox(0)}
            role="button"
            tabIndex={0}
            aria-label={`Open gallery for ${project.title}`}
            onKeyDown={e => e.key === 'Enter' && openLightbox(0)}
          >
            <img
              src={firstImageUrl}
              alt={project.title}
              loading="eager"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                maxHeight: '520px',
              }}
            />
          </div>
        )}

        <div className="container" style={{ padding: 'var(--space-8) var(--space-4)' }}>
          {/* Back button */}
          <button
            type="button"
            onClick={handleBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--color-text-muted)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontSize: 'var(--text-small)',
              marginBottom: 'var(--space-4)',
              padding: 0,
              transition: 'color var(--transition-fast)',
            }}
            onMouseOver={e => (e.currentTarget.style.color = 'var(--color-caramel)')}
            onMouseOut={e => (e.currentTarget.style.color = 'var(--color-text-muted)')}
          >
            &#8592; Back to Portfolio
          </button>

          {/* Title & meta */}
          <div style={{ maxWidth: '800px', marginBottom: 'var(--space-6)' }}>
            <h1
              style={{
                fontSize: 'clamp(1.8rem, 4vw, var(--text-h1))',
                color: 'var(--color-text-primary)',
                marginBottom: 'var(--space-3)',
                lineHeight: 'var(--line-height-heading)',
              }}
            >
              {project.title}
            </h1>

            {/* Category badges */}
            {project.categories?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)', marginBottom: 'var(--space-2)' }}>
                {project.categories.map(cat => (
                  <span key={cat.id} className="badge badge-accent">
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {formattedDate && (
              <time
                dateTime={project.createdAt}
                style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}
              >
                {formattedDate}
              </time>
            )}

            {project.description && (
              <p
                style={{
                  marginTop: 'var(--space-3)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 'var(--line-height-body)',
                  fontSize: 'var(--text-body)',
                  whiteSpace: 'pre-line',
                }}
              >
                {project.description}
              </p>
            )}
          </div>

          {/* Image grid */}
          {images.length > 1 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: 'var(--space-2)',
                marginBottom: 'var(--space-6)',
              }}
              aria-label="Project image gallery"
            >
              {images.map((img, idx) => (
                <button
                  key={img.id ?? idx}
                  type="button"
                  onClick={() => openLightbox(idx)}
                  aria-label={`View image ${idx + 1} of ${images.length}`}
                  style={{
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    aspectRatio: '4/3',
                    display: 'block',
                  }}
                >
                  <ImageFallback
                    src={img.publicUrl}
                    alt={`${project.title} — image ${idx + 1}`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform var(--transition-base)',
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Video player */}
          {project.videoUrl && (
            <div style={{ marginBottom: 'var(--space-6)' }}>
              <video
                controls
                preload="none"
                playsInline
                poster={firstImageUrl}
                style={{
                  width: '100%',
                  maxWidth: '800px',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'var(--color-espresso)',
                }}
              >
                <source src={project.videoUrl} />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && slides.length > 0 && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Project gallery"
        >
          <Lightbox
            open={lightboxOpen}
            close={() => setLightboxOpen(false)}
            index={lightboxIndex}
            slides={slides}
          />
        </div>
      )}
    </>
  );
}
