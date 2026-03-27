import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z.string().optional(),
  message: z
    .string()
    .min(1, 'Message is required')
    .max(2000, 'Message must be 2000 characters or fewer'),
  website: z.string().max(0, 'Bot detected'), // honeypot
});

const MAX_MSG = 2000;

export default function Contact() {
  const { t } = useTranslation('contact');
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', message: '', website: '' },
  });

  const messageValue = watch('message') || '';

  async function onSubmit(data) {
    setSubmitError(null);
    // Silently drop honeypot-triggered submissions
    if (data.website) {
      setSubmitted(true);
      return;
    }
    const { website: _hp, ...payload } = data;
    try {
      await api.post('/api/v1/contact', payload);
      setSubmitted(true);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || t('form.error_generic', 'Something went wrong. Please try again.');
      setSubmitError(msg);
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('meta.title', 'Contact | LORAS Furniture')}</title>
        <meta name="description" content={t('meta.description', 'Get in touch with LORAS Furniture. Send us a message or reach out on WhatsApp.')} />
      </Helmet>

      {/* Page header */}
      <div
        style={{
          backgroundColor: 'var(--color-espresso)',
          paddingTop: 'calc(70px + var(--space-8))',
          paddingBottom: 'var(--space-8)',
        }}
      >
        <div className="container">
          <h1
            style={{
              color: 'var(--color-cream)',
              fontSize: 'clamp(1.8rem, 4vw, var(--text-h1))',
              marginBottom: 'var(--space-1)',
            }}
          >
            {t('headline', "Let's Build Something Together")}
          </h1>
          <p style={{ color: 'rgba(244,235,225,0.7)' }}>
            {t('subheadline', 'We respond within 24 hours. WhatsApp is fastest.')}
          </p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="grid-2" style={{ alignItems: 'start' }}>

            {/* Form column */}
            <div>
              {submitted ? (
                <div
                  role="alert"
                  style={{
                    backgroundColor: '#e8f5e9',
                    border: '1px solid #a5d6a7',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'var(--space-6)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>
                    ✓
                  </div>
                  <h2 style={{ color: '#1b5e20', marginBottom: 'var(--space-2)' }}>
                    {t('success.heading', 'Message sent!')}
                  </h2>
                  <p style={{ color: '#2e7d32' }}>
                    {t('success.body', "Thank you for reaching out. We'll get back to you shortly.")}
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
                >
                  {/* Honeypot — visually hidden from real users */}
                  <input
                    {...register('website')}
                    name="website"
                    tabIndex={-1}
                    aria-hidden="true"
                    autoComplete="off"
                    style={{ display: 'none' }}
                  />

                  {/* Name */}
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">
                      {t('form.name_label', 'Full Name')} <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <input
                      {...register('name')}
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      className={`form-input${errors.name ? ' error' : ''}`}
                      placeholder={t('form.name_placeholder', 'Your name')}
                      aria-required="true"
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <span id="name-error" className="form-error" role="alert">
                        {errors.name.message}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label htmlFor="contact-email" className="form-label">
                      {t('form.email_label', 'Email')} <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <input
                      {...register('email')}
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      className={`form-input${errors.email ? ' error' : ''}`}
                      placeholder={t('form.email_placeholder', 'your@email.com')}
                      aria-required="true"
                      aria-describedby={errors.email ? 'email-error' : undefined}
                    />
                    {errors.email && (
                      <span id="email-error" className="form-error" role="alert">
                        {errors.email.message}
                      </span>
                    )}
                  </div>

                  {/* Phone (optional) */}
                  <div className="form-group">
                    <label htmlFor="contact-phone" className="form-label">
                      {t('form.phone_label', 'Phone')}
                      <span style={{ color: 'var(--color-text-muted)', fontWeight: 'normal', marginLeft: '0.35rem', fontSize: 'var(--text-xs)' }}>
                        ({t('form.optional', 'optional')})
                      </span>
                    </label>
                    <input
                      {...register('phone')}
                      id="contact-phone"
                      type="tel"
                      autoComplete="tel"
                      className="form-input"
                      placeholder={t('form.phone_placeholder', '+374 98 000 000')}
                    />
                  </div>

                  {/* Message */}
                  <div className="form-group">
                    <label htmlFor="contact-message" className="form-label">
                      {t('form.message_label', 'Message')} <span aria-hidden="true" style={{ color: 'var(--color-error)' }}>*</span>
                    </label>
                    <textarea
                      {...register('message')}
                      id="contact-message"
                      rows={6}
                      className={`form-textarea${errors.message ? ' error' : ''}`}
                      placeholder={t('form.message_placeholder', 'Tell us about your project...')}
                      aria-required="true"
                      aria-describedby="message-counter"
                      maxLength={MAX_MSG}
                    />
                    <div
                      id="message-counter"
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                      }}
                    >
                      {errors.message ? (
                        <span className="form-error" role="alert">{errors.message.message}</span>
                      ) : (
                        <span />
                      )}
                      <span
                        style={{
                          fontSize: 'var(--text-xs)',
                          color: messageValue.length > MAX_MSG * 0.9 ? 'var(--color-error)' : 'var(--color-text-muted)',
                        }}
                      >
                        {messageValue.length}/{MAX_MSG}
                      </span>
                    </div>
                  </div>

                  {/* Submit error */}
                  {submitError && (
                    <div
                      role="alert"
                      style={{
                        backgroundColor: '#ffebee',
                        border: '1px solid #ef9a9a',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--space-2) var(--space-3)',
                        color: 'var(--color-error)',
                        fontSize: 'var(--text-small)',
                      }}
                    >
                      {submitError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                    aria-disabled={isSubmitting}
                    style={{ alignSelf: 'flex-start' }}
                  >
                    {isSubmitting
                      ? t('form.submitting', 'Sending...')
                      : t('form.submit', 'Send Message')}
                  </button>
                </form>
              )}
            </div>

            {/* Contact info panel */}
            <div
              style={{
                backgroundColor: 'var(--color-espresso)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-6)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-4)',
              }}
            >
              <h2
                style={{
                  color: 'var(--color-cream)',
                  fontSize: 'var(--text-h4)',
                  marginBottom: 'var(--space-1)',
                }}
              >
                {t('info.heading', 'Reach us directly')}
              </h2>

              {/* WhatsApp — most prominent */}
              <a
                href="https://wa.me/37498110895"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp"
                style={{ justifyContent: 'flex-start', gap: 'var(--space-2)' }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                {t('info.whatsapp', 'WhatsApp us')}
              </a>

              {/* Phone */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-caramel)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.63a19.79 19.79 0 01-3.07-8.63A2 2 0 012 0h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 14.92v2z" />
                </svg>
                <a
                  href="tel:+37498110895"
                  style={{ color: 'var(--color-cream)', textDecoration: 'none', fontSize: 'var(--text-body)' }}
                >
                  +374 98 110 895
                </a>
              </div>

              {/* Email */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-caramel)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <a
                  href="mailto:info@lorasfurniture.com"
                  style={{ color: 'var(--color-cream)', textDecoration: 'none', fontSize: 'var(--text-body)' }}
                >
                  info@lorasfurniture.com
                </a>
              </div>

              {/* Instagram */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--color-caramel)" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                <a
                  href="https://instagram.com/lorasfurniture"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--color-cream)', textDecoration: 'none', fontSize: 'var(--text-body)' }}
                >
                  @lorasfurniture
                </a>
              </div>

              {/* Location */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-caramel)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ color: 'rgba(244,235,225,0.8)', fontSize: 'var(--text-body)' }}>
                  {t('info.location', 'Yerevan, Armenia')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
