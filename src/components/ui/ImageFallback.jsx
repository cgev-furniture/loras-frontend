import { useState } from 'react';

export default function ImageFallback({ src, alt, className, style, loading = 'lazy' }) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--color-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
        aria-hidden="true"
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden="true">
          <rect width="40" height="40" rx="4" fill="var(--color-cream)" />
          <text
            x="50%"
            y="54%"
            dominantBaseline="middle"
            textAnchor="middle"
            fontFamily="'Poppins', sans-serif"
            fontWeight="700"
            fontSize="13"
            fill="var(--color-brown)"
            letterSpacing="1"
          >
            LORAS
          </text>
        </svg>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onError={() => setErrored(true)}
    />
  );
}
