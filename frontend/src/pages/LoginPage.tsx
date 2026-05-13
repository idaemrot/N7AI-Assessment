import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { isAxiosError } from 'axios';

export default function LoginPage() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    try {
      await login({ email: email.trim(), password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (isAxiosError(err) && err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">

        {/* Brand ─────────────────────────────────────────────────────── */}
        <div className="login-brand">
          <span className="login-brand-name">DocPortal</span>
        </div>

        <h1 className="login-heading">Sign in to your account</h1>
        <p className="login-tagline">Document management for your team.</p>

        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="login-error" role="alert">{error}</p>
          )}

          <button
            id="login-submit"
            type="submit"
            className="login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
