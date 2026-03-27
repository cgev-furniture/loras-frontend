import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

function StatCard({ label, value, color }) {
  return (
    <div
      style={{
        backgroundColor: 'var(--color-white)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        padding: 'var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-1)',
        borderLeft: `4px solid ${color || 'var(--color-caramel)'}`,
      }}
    >
      <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)', fontWeight: 'var(--font-weight-medium)' }}>
        {label}
      </span>
      <span style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-text-primary)' }}>
        {value ?? '—'}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { t } = useTranslation('admin');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/api/v1/admin/stats')
      .then(res => setStats(res.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h1 style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-bold)', marginBottom: 'var(--space-6)', color: 'var(--color-text-primary)' }}>
        {t('dashboard.heading', 'Dashboard')}
      </h1>

      {/* Stat cards */}
      {loading ? (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}
        >
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="skeleton" style={{ height: '100px', borderRadius: 'var(--radius-lg)' }} />
          ))}
        </div>
      ) : error ? (
        <div style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
          {t('dashboard.error', 'Failed to load stats.')}
        </div>
      ) : stats ? (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}
        >
          <StatCard
            label={t('dashboard.published', 'Published Projects')}
            value={stats.publishedProjects}
            color="var(--color-success)"
          />
          <StatCard
            label={t('dashboard.drafts', 'Draft Projects')}
            value={stats.draftProjects}
            color="#9e9e9e"
          />
          <StatCard
            label={t('dashboard.total_inquiries', 'Total Inquiries')}
            value={stats.totalInquiries}
            color="var(--color-caramel)"
          />
          <StatCard
            label={t('dashboard.unread_inquiries', 'Unread Inquiries')}
            value={stats.unreadInquiries}
            color="var(--color-error)"
          />
        </div>
      ) : null}

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-8)' }}>
        <Link to="/admin/projects/new" className="btn btn-primary">
          {t('dashboard.add_project', 'Add Project')}
        </Link>
        <Link to="/admin/inquiries" className="btn btn-secondary">
          {t('dashboard.view_inquiries', 'View Inquiries')}
        </Link>
      </div>

      {/* Projects per category bar chart */}
      {stats?.projectsByCategory?.length > 0 && (
        <section>
          <h2 style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)', marginBottom: 'var(--space-4)', color: 'var(--color-text-primary)' }}>
            {t('dashboard.by_category', 'Projects by Category')}
          </h2>
          <div
            style={{
              backgroundColor: 'var(--color-white)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-card)',
              padding: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
            }}
          >
            {stats.projectsByCategory.map(({ categoryName, count }) => {
              const maxCount = Math.max(...stats.projectsByCategory.map(c => c.count), 1);
              const pct = Math.round((count / maxCount) * 100);
              return (
                <div key={categoryName}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-text-primary)' }}>
                      {categoryName}
                    </span>
                    <span style={{ fontSize: 'var(--text-small)', color: 'var(--color-text-muted)' }}>
                      {count}
                    </span>
                  </div>
                  <div style={{ height: '8px', backgroundColor: 'var(--color-border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        backgroundColor: 'var(--color-caramel)',
                        borderRadius: 'var(--radius-full)',
                        transition: 'width var(--transition-slow)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
