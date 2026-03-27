import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export default function NotFound() {
  const { t } = useTranslation('common');

  return (
    <>
      <Helmet>
        <title>{t('not_found.meta_title', '404 — Page Not Found | LORAS Furniture')}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-espresso)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-8) var(--space-4)',
          textAlign: 'center',
        }}
      >
        {/* Giant 404 */}
        <div
          aria-hidden="true"
          style={{
            fontSize: 'clamp(5rem, 20vw, 10rem)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-caramel)',
            lineHeight: 1,
            marginBottom: 'var(--space-4)',
            letterSpacing: '-0.02em',
            opacity: 0.9,
          }}
        >
          404
        </div>

        <h1
          style={{
            color: 'var(--color-cream)',
            fontSize: 'clamp(1.4rem, 3vw, var(--text-h2))',
            fontWeight: 'var(--font-weight-semibold)',
            marginBottom: 'var(--space-3)',
          }}
        >
          {t('not_found.heading', 'Page not found')}
        </h1>

        <p
          style={{
            color: 'rgba(244,235,225,0.7)',
            fontSize: 'var(--text-body)',
            maxWidth: '440px',
            lineHeight: 'var(--line-height-body)',
            marginBottom: 'var(--space-6)',
          }}
        >
          {t('not_found.message', "The page you're looking for doesn't exist or has been moved.")}
        </p>

        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            {t('not_found.go_home', 'Go Home')}
          </Link>
          <Link to="/portfolio" className="btn btn-ghost">
            {t('not_found.view_portfolio', 'View Portfolio')}
          </Link>
        </div>
      </div>
    </>
  );
}
