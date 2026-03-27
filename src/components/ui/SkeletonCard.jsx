export default function SkeletonCard() {
  return (
    <div
      className="card"
      aria-hidden="true"
      style={{ overflow: 'hidden' }}
    >
      {/* Thumbnail skeleton — 4:3 */}
      <div
        className="skeleton"
        style={{ paddingTop: '75%', position: 'relative' }}
      />
      {/* Body skeleton */}
      <div style={{ padding: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        <div
          className="skeleton"
          style={{ height: '1.25rem', width: '80%', borderRadius: 'var(--radius-sm)' }}
        />
        <div
          className="skeleton"
          style={{ height: '1rem', width: '55%', borderRadius: 'var(--radius-sm)' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'var(--space-1)' }}>
          <div className="skeleton" style={{ height: '1.4rem', width: '4rem', borderRadius: 'var(--radius-full)' }} />
          <div className="skeleton" style={{ height: '1.4rem', width: '5rem', borderRadius: 'var(--radius-full)' }} />
        </div>
      </div>
    </div>
  );
}
