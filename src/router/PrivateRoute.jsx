import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div className="page-loading" />;
  if (!isAuthenticated) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return children || <Outlet />;
}
