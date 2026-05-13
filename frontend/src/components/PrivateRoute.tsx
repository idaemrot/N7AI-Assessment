// PrivateRoute — to be implemented
// Wraps protected routes, redirects to /login if not authenticated
import { ReactNode } from 'react';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
