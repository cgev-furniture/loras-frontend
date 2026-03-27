import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher';

export default function Navbar() {
  const { t } = useTranslation('common');
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerRef = useRef(null);
  const hamburgerRef = useRef(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY >= 80);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // Return focus to hamburger when drawer closes
    setTimeout(() => hamburgerRef.current?.focus(), 50);
  }, []);

  // Escape key + body scroll lock
  useEffect(() => {
    if (!drawerOpen) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') closeDrawer();
      // Focus trap
      if (e.key === 'Tab' && drawerRef.current) {
        const focusable = Array.from(
          drawerRef.current.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    // Auto-focus first element in drawer
    setTimeout(() => {
      const focusable = drawerRef.current?.querySelector(
        'a[href], button:not([disabled])'
      );
      focusable?.focus();
    }, 50);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, closeDrawer]);

  // Close drawer on navigation
  function closeDrawerNav() {
    closeDrawer();
  }

  const navLinks = [
    { to: '/', label: t('nav.home', 'Home') },
    { to: '/portfolio', label: t('nav.portfolio', 'Portfolio') },
    { to: '/contact', label: t('nav.contact', 'Contact') },
  ];

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 'var(--z-sticky)',
          backgroundColor: scrolled ? 'var(--color-espresso)' : 'transparent',
          boxShadow: scrolled ? 'var(--shadow-navbar)' : 'none',
          transition: 'background-color var(--transition-slow), box-shadow var(--transition-slow)',
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '70px',
          }}
        >
          {/* Logo */}
          <Link to="/" aria-label="LORAS Furniture — Home">
            <img
              src="/src/assets/logo-light.svg"
              alt="LORAS Furniture"
              style={{ height: '40px', width: 'auto' }}
            />
          </Link>

          {/* Desktop nav */}
          <nav
            aria-label="Main navigation"
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}
            className="desktop-nav"
          >
            {navLinks.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                style={({ isActive }) => ({
                  color: isActive ? 'var(--color-caramel)' : 'var(--color-cream)',
                  fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
                  textDecoration: 'none',
                  fontSize: 'var(--text-body)',
                  transition: 'color var(--transition-fast)',
                })}
              >
                {label}
              </NavLink>
            ))}
            <LanguageSwitcher />
          </nav>

          {/* Mobile hamburger */}
          <button
            ref={hamburgerRef}
            className="mobile-menu-btn"
            aria-label={drawerOpen ? t('nav.close_menu', 'Close menu') : t('nav.open_menu', 'Open menu')}
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(o => !o)}
            style={{
              display: 'none',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: '5px',
              width: '44px',
              height: '44px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
            }}
          >
            <span
              style={{
                display: 'block',
                width: '24px',
                height: '2px',
                backgroundColor: 'var(--color-cream)',
                transition: 'transform var(--transition-fast)',
                transform: drawerOpen ? 'rotate(45deg) translateY(7px)' : 'none',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '24px',
                height: '2px',
                backgroundColor: 'var(--color-cream)',
                opacity: drawerOpen ? 0 : 1,
                transition: 'opacity var(--transition-fast)',
              }}
            />
            <span
              style={{
                display: 'block',
                width: '24px',
                height: '2px',
                backgroundColor: 'var(--color-cream)',
                transition: 'transform var(--transition-fast)',
                transform: drawerOpen ? 'rotate(-45deg) translateY(-7px)' : 'none',
              }}
            />
          </button>
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          className="overlay"
          onClick={closeDrawer}
          aria-hidden="true"
          style={{ zIndex: 'calc(var(--z-sticky) - 1)' }}
        />
      )}

      {/* Mobile drawer */}
      <nav
        id="mobile-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.mobile_menu', 'Mobile menu')}
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: 'var(--color-espresso)',
          zIndex: 'var(--z-modal)',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--transition-slow)',
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--space-6) var(--space-4)',
          gap: 'var(--space-3)',
        }}
      >
        <button
          aria-label="Close menu"
          onClick={closeDrawer}
          style={{
            alignSelf: 'flex-end',
            color: 'var(--color-cream)',
            fontSize: '1.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            lineHeight: 1,
            padding: '4px',
          }}
        >
          &times;
        </button>
        {navLinks.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={closeDrawerNav}
            style={({ isActive }) => ({
              color: isActive ? 'var(--color-caramel)' : 'var(--color-cream)',
              fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
              textDecoration: 'none',
              fontSize: 'var(--text-h4)',
              padding: 'var(--space-1) 0',
            })}
          >
            {label}
          </NavLink>
        ))}
        <div style={{ marginTop: 'var(--space-2)' }}>
          <LanguageSwitcher />
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
