import { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

function DashboardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
    </svg>
  );
}
function ProjectsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
function CategoriesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 6h16M4 12h16M4 18h7" />
    </svg>
  );
}
function InquiriesIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export default function AdminShell() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await api.post('/api/v1/auth/logout');
    } catch {
      // swallow — cookie is cleared server-side; redirect regardless
    } finally {
      navigate('/admin/login', { replace: true });
    }
  }

  const navItems = [
    { to: '/admin', end: true, label: t('nav.dashboard', 'Dashboard'), Icon: DashboardIcon },
    { to: '/admin/projects', label: t('nav.projects', 'Projects'), Icon: ProjectsIcon },
    { to: '/admin/categories', label: t('nav.categories', 'Categories'), Icon: CategoriesIcon },
    { to: '/admin/inquiries', label: t('nav.inquiries', 'Inquiries'), Icon: InquiriesIcon },
  ];

  const sidebarStyle = {
    width: '240px',
    minHeight: '100vh',
    backgroundColor: 'var(--color-espresso)',
    color: 'var(--color-cream)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    position: 'sticky',
    top: 0,
    height: '100vh',
    overflowY: 'auto',
  };

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-2)',
    padding: '0.65rem var(--space-3)',
    borderRadius: 'var(--radius-md)',
    color: isActive ? 'var(--color-caramel)' : 'rgba(244,235,225,0.75)',
    backgroundColor: isActive ? 'rgba(139,98,47,0.12)' : 'transparent',
    textDecoration: 'none',
    fontSize: 'var(--text-body)',
    fontWeight: isActive ? 'var(--font-weight-semibold)' : 'var(--font-weight-regular)',
    transition: 'color var(--transition-fast), background-color var(--transition-fast)',
  });

  const Sidebar = () => (
    <aside style={sidebarStyle} aria-label={t('sidebar.aria_label', 'Admin sidebar')}>
      {/* Logo */}
      <div style={{ padding: 'var(--space-4) var(--space-3)', borderBottom: '1px solid rgba(244,235,225,0.1)' }}>
        <img src="/src/assets/logo-light.svg" alt="LORAS Furniture" height="36" style={{ width: 'auto' }} />
      </div>

      {/* Nav */}
      <nav style={{ padding: 'var(--space-3)', flex: 1 }}>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(({ to, end, label, Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                style={({ isActive }) => linkStyle(isActive)}
              >
                <Icon />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div style={{ padding: 'var(--space-3)', borderTop: '1px solid rgba(244,235,225,0.1)' }}>
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          style={{
            ...linkStyle(false),
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: loggingOut ? 'not-allowed' : 'pointer',
            opacity: loggingOut ? 0.6 : 1,
          }}
        >
          <LogoutIcon />
          {loggingOut ? t('nav.logging_out', 'Logging out…') : t('nav.logout', 'Logout')}
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop layout: sidebar + content */}
      <div style={{ display: 'flex', minHeight: '100vh' }} className="admin-layout">
        <div className="admin-sidebar-wrapper">
          <Sidebar />
        </div>

        {/* Mobile top bar */}
        <div
          className="admin-topbar"
          style={{
            display: 'none',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            backgroundColor: 'var(--color-espresso)',
            zIndex: 'var(--z-sticky)',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--space-3)',
          }}
        >
          <img src="/src/assets/logo-light.svg" alt="LORAS Furniture" height="30" />
          <button
            type="button"
            onClick={() => setMobileOpen(o => !o)}
            aria-label={t('nav.open_menu', 'Open menu')}
            aria-expanded={mobileOpen}
            style={{
              width: 44, height: 44,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 5, background: 'transparent', border: 'none', cursor: 'pointer', padding: 8,
            }}
          >
            {[0, 1, 2].map(i => (
              <span key={i} style={{ display: 'block', width: 22, height: 2, background: 'var(--color-cream)', borderRadius: 2 }} />
            ))}
          </button>
        </div>

        {/* Mobile drawer overlay */}
        {mobileOpen && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(50,27,18,0.6)', zIndex: 'var(--z-overlay)' }}
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile drawer */}
        {mobileOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, bottom: 0, width: '240px',
            zIndex: 'var(--z-modal)', backgroundColor: 'var(--color-espresso)',
          }}>
            <Sidebar />
          </div>
        )}

        {/* Main content */}
        <main
          id="admin-main"
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-content)',
            minHeight: '100vh',
            overflowY: 'auto',
          }}
          className="admin-main"
        >
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-wrapper { display: none !important; }
          .admin-topbar { display: flex !important; }
          .admin-main { padding-top: 60px !important; }
        }
      `}</style>
    </>
  );
}
