// useApi — thin hook wrapper around Axios for data fetching.
// Usage: const { data, loading, error, refetch } = useApi('/api/v1/projects', { params })
// Fires on mount and when the URL or params change.
// Returns { data, loading, error, refetch } — no caching at MVP.
// The Axios instance (services/api.js) handles 401 globally.
