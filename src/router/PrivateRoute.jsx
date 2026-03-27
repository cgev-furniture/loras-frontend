// PrivateRoute — guards all /admin/* routes except /admin/login.
// Uses useAuth() to check session via GET /api/v1/admin/me.
// While loading: shows a centred spinner.
// If not authenticated: redirects to /admin/login, preserving the
//   intended destination in location state for post-login redirect.
// If authenticated: renders <Outlet />.
export default function PrivateRoute() {
  return null;
}
