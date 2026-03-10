import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ role, children }) {
  const { isLoggedIn, profile, loading } = useAuth();

  if (loading) return <LoadingSpinner message="Checking authentication..." />;
  if (!isLoggedIn) return <Navigate to="/signin" replace />;
  if (role && profile?.role !== role) return <Navigate to="/signin" replace />;

  return children;
}
