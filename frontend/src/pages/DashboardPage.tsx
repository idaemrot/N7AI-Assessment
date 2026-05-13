import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * DashboardPage — minimal authenticated landing page.
 * Document CRUD UI will be added in the next phase.
 */
export default function DashboardPage() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <button
          id="logout-btn"
          className="logout-btn"
          onClick={handleLogout}
        >
          Sign out
        </button>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-card">
          <p className="dashboard-welcome">
            Welcome{user ? `, ${user.email}` : ''}!
          </p>
          <span className={`role-badge role-badge--${role?.toLowerCase()}`}>
            {role ?? '—'}
          </span>
        </div>

        <p className="dashboard-note">
          Document management will appear here in the next phase.
        </p>
      </main>
    </div>
  );
}
