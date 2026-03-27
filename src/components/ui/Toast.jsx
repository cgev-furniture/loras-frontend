import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Toast — fixed bottom-center notification.
 * - Listens for the global `session-expired` custom event.
 * - Also accepts { message, type } props for manual use.
 * - Auto-dismisses after 4 seconds.
 */
export default function Toast({ message: propMessage, type: propType }) {
  const { t } = useTranslation('common');
  const [toast, setToast] = useState(null); // { message, type }

  const show = useCallback((message, type = 'info') => {
    setToast({ message, type });
  }, []);

  const dismiss = useCallback(() => {
    setToast(null);
  }, []);

  // Listen for session-expired event
  useEffect(() => {
    function onSessionExpired() {
      show(t('toast.session_expired', 'Session expired — please log in again'), 'error');
    }
    window.addEventListener('session-expired', onSessionExpired);
    return () => window.removeEventListener('session-expired', onSessionExpired);
  }, [show, t]);

  // Prop-driven display
  useEffect(() => {
    if (propMessage) show(propMessage, propType || 'info');
  }, [propMessage, propType, show]);

  // Auto-dismiss after 4s
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(dismiss, 4000);
    return () => clearTimeout(timer);
  }, [toast, dismiss]);

  if (!toast) return null;

  const bgByType = {
    error: 'var(--color-error)',
    success: 'var(--color-success)',
    info: 'var(--color-espresso)',
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      style={{
        position: 'fixed',
        bottom: 'var(--space-6)',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 'var(--z-toast)',
        backgroundColor: bgByType[toast.type] || bgByType.info,
        color: 'var(--color-cream)',
        padding: 'var(--space-2) var(--space-4)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-modal)',
        maxWidth: 'min(480px, 90vw)',
        width: 'max-content',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        fontSize: 'var(--text-body)',
        fontWeight: 'var(--font-weight-medium)',
        animation: 'toast-in 250ms ease',
      }}
    >
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('toast.dismiss', 'Dismiss notification')}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '1.25rem',
          lineHeight: 1,
          padding: '0 0.25rem',
          flexShrink: 0,
          opacity: 0.8,
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(-50%) translateY(12px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  );
}
