import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReactNode } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * Wraps any route that requires authentication.
 * Redirects to /login if no JWT token is present in context/localStorage.
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { token } = useAuth();

  if (!token) {
    // Replace the current history entry so the user can't back-button into
    // a protected page after logging out.
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
