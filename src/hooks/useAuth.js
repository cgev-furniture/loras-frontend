// useAuth — derives auth state by calling GET /api/v1/admin/me on mount.
// Backend is the source of truth; never reads JWT from JS.
// Returns { user, loading, isAuthenticated }
// Used by PrivateRoute to guard /admin/* routes.
// On 401: Axios interceptor (services/api.js) handles redirect to /admin/login.
