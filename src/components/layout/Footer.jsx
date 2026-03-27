import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation('common');
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-espresso)',
        color: 'var(--color-cream)',
        padding: 'var(--space-10) 0 var(--space-4)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)',
          }}
        >
          {/* Brand */}
          <div>
            <img
              src="/src/assets/logo-light.svg"
              alt="LORAS Furniture"
              height="36"
              style={{ width: 'auto', marginBottom: 'var(--space-3)' }}
            />
            <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)', lineHeight: 'var(--line-height-body)' }}>
              {t('footer.tagline', 'Modern. Functional. Timeless.')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 style={{ color: 'var(--color-cream)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-body)' }}>
              {t('footer.nav_heading', 'Pages')}
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {[
                { to: '/', label: t('nav.home', 'Home') },
                { to: '/portfolio', label: t('nav.portfolio', 'Portfolio') },
                { to: '/contact', label: t('nav.contact', 'Contact') },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    style={{
                      color: 'var(--color-text-muted)',
                      textDecoration: 'none',
                      fontSize: 'var(--text-small)',
                      transition: 'color var(--transition-fast)',
                    }}
                    onMouseOver={e => (e.target.style.color = 'var(--color-cream)')}
                    onMouseOut={e => (e.target.style.color = 'var(--color-text-muted)')}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'var(--color-cream)', marginBottom: 'var(--space-3)', fontSize: 'var(--text-body)' }}>
              {t('footer.contact_heading', 'Contact')}
            </h4>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <li>
                <a
                  href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '37498110895'}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#25d366', textDecoration: 'none', fontSize: 'var(--text-small)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href="tel:+37498110895"
                  style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--text-small)' }}
                >
                  +374 98 110 895
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@lorasfurniture.com"
                  style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--text-small)' }}
                >
                  info@lorasfurniture.com
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/lorasfurniture"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-text-muted)', textDecoration: 'none', fontSize: 'var(--text-small)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  @lorasfurniture
                </a>
              </li>
              <li style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
                {t('footer.location', 'Yerevan, Armenia')}
              </li>
            </ul>
          </div>
        </div>

        <hr style={{ borderColor: 'rgba(244,235,225,0.12)', borderTop: '1px solid', margin: '0 0 var(--space-4)' }} />

        <p style={{ textAlign: 'center', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {t('footer.copyright', `© ${year} LORAS Furniture. All rights reserved.`, { year })}
        </p>
      </div>
    </footer>
  );
}
