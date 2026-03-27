import { Link } from 'react-router-dom';
import ImageFallback from './ImageFallback';

export default function Card({ project }) {
  if (!project) return null;
  const { slug, title, thumbnailUrl, images, categories } = project;
  const thumb = thumbnailUrl || images?.[0]?.publicUrl;

  return (
    <Link
      to={`/portfolio/${slug}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
      aria-label={`View project: ${title}`}
    >
      <article className="card" style={{ cursor: 'pointer' }}>
        {/* Thumbnail — 4:3 aspect ratio */}
        <div
          style={{
            position: 'relative',
            paddingTop: '75%', /* 4:3 */
            overflow: 'hidden',
            backgroundColor: 'var(--color-border)',
          }}
        >
          {thumb ? (
            <img
              src={thumb}
              alt={title}
              loading="lazy"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform var(--transition-slow)',
              }}
              onMouseOver={e => (e.currentTarget.style.transform = 'scale(1.04)')}
              onMouseOut={e => (e.currentTarget.style.transform = 'scale(1)')}
            />
          ) : (
            <div style={{ position: 'absolute', inset: 0 }}>
              <ImageFallback />
            </div>
          )}
        </div>

        {/* Card body */}
        <div style={{ padding: 'var(--space-3)' }}>
          <h3
            className="line-clamp-2"
            style={{
              fontSize: 'var(--text-h4)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
              marginBottom: categories?.length ? 'var(--space-1)' : 0,
              lineHeight: '1.3',
            }}
          >
            {title}
          </h3>

          {categories?.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '0.35rem',
                marginTop: 'var(--space-1)',
              }}
            >
              {categories.slice(0, 2).map(cat => (
                <span key={cat.id} className="badge" style={{ fontSize: 'var(--text-xs)' }}>
                  {cat.name}
                </span>
              ))}
              {categories.length > 2 && (
                <span className="badge" style={{ fontSize: 'var(--text-xs)' }}>
                  +{categories.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
