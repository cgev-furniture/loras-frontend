import { useEffect, useRef, useId } from 'react';
import { useTranslation } from 'react-i18next';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, isLoading }) {
  const { t } = useTranslation('common');
  const titleId = useId();
  const modalRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // Focus trap + Escape key
  useEffect(() => {
    if (!open) return;

    function onKeyDown(e) {
      if (e.key === 'Escape') {
        onCancel?.();
        return;
      }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
    // Focus cancel button by default (safer UX)
    setTimeout(() => cancelBtnRef.current?.focus(), 50);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="overlay"
        style={{ zIndex: 'var(--z-modal)' }}
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        ref={modalRef}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 'calc(var(--z-modal) + 1)',
          backgroundColor: 'var(--color-white)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-modal)',
          padding: 'var(--space-6)',
          width: 'min(480px, 90vw)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
      >
        <h2
          id={titleId}
          style={{
            fontSize: 'var(--text-h3)',
            fontWeight: 'var(--font-weight-bold)',
            color: 'var(--color-text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {title || t('confirm_modal.default_title', 'Are you sure?')}
        </h2>

        {message && (
          <p
            style={{
              fontSize: 'var(--text-body)',
              color: 'var(--color-text-secondary)',
              lineHeight: 'var(--line-height-body)',
              marginBottom: 'var(--space-4)',
            }}
          >
            {message}
          </p>
        )}

        <div
          style={{
            display: 'flex',
            gap: 'var(--space-2)',
            justifyContent: 'flex-end',
            marginTop: 'var(--space-4)',
          }}
        >
          <button
            ref={cancelBtnRef}
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            {t('confirm_modal.cancel', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={isLoading}
          >
            {isLoading ? t('confirm_modal.loading', 'Deleting…') : t('confirm_modal.confirm', 'Delete')}
          </button>
        </div>
      </div>
    </>
  );
}
