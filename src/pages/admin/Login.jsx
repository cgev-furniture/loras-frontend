import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export default function Login() {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const from = location.state?.from?.pathname || '/admin';

  async function onSubmit(data) {
    try {
      const res = await api.post('/api/v1/auth/login', data);
      if (res.data?.mustChangePassword) {
        navigate('/admin/change-password', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError('root', { message: t('login.rate_limit', 'Too many attempts. Please wait.') });
      } else {
        setError('root', { message: t('login.error', 'Invalid username or password.') });
      }
    }
  }

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>{t('login.page_title', 'Admin Login — LORAS Furniture')}</title>
      </Helmet>

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--color-espresso)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-4)',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <img src="/src/assets/logo-light.svg" alt="LORAS Furniture" height="48" style={{ width: 'auto' }} />
        </div>

        {/* Card */}
        <div
          style={{
            backgroundColor: 'var(--color-white)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-modal)',
            padding: 'var(--space-6)',
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--text-h3)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--space-4)',
              textAlign: 'center',
            }}
          >
            {t('login.heading', 'Admin Login')}
          </h1>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* Root error */}
            {errors.root && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#fdecea',
                  color: 'var(--color-error)',
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--space-3)',
                  fontSize: 'var(--text-small)',
                }}
              >
                {errors.root.message}
              </div>
            )}

            {/* Username */}
            <div className="form-group" style={{ marginBottom: 'var(--space-3)' }}>
              <label htmlFor="username" className="form-label">
                {t('login.username_label', 'Username')}
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                autoFocus
                {...register('username')}
                className={`form-input${errors.username ? ' error' : ''}`}
                aria-invalid={!!errors.username}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <span id="username-error" className="form-error">
                  {t('login.username_required', 'Username is required')}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group" style={{ marginBottom: 'var(--space-4)' }}>
              <label htmlFor="password" className="form-label">
                {t('login.password_label', 'Password')}
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className={`form-input${errors.password ? ' error' : ''}`}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <span id="password-error" className="form-error">
                  {t('login.password_required', 'Password is required')}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
              style={{ width: '100%' }}
            >
              {isSubmitting ? t('login.submitting', 'Signing in…') : t('login.submit', 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
