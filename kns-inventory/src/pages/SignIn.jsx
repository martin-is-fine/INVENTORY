import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    const result = await login(email.trim(), password);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/user');
    } else {
      setError(result.message);
      setTimeout(() => setError(''), 5000);
    }
    setSubmitting(false);
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setSubmitting(true);
    setError('');
    const result = await resetPassword(forgotEmail.trim());
    if (result.success) {
      setSuccess(result.message);
      setShowForgot(false);
      setTimeout(() => setSuccess(''), 8000);
    } else {
      setError(result.message);
      setTimeout(() => setError(''), 5000);
    }
    setSubmitting(false);
  }

  return (
    <div className="auth-body">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.png" alt="KNS Logo" className="logo-small" />
        </div>
        <h1>KNS Inventory</h1>
        <p className="subtitle">Sign in to your account.</p>

        {!showForgot ? (
          <form onSubmit={handleSubmit}>
            <div className="auth-form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email."
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="auth-form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                placeholder="Enter your password."
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <a href="#" className="forgot-link" onClick={(e) => { e.preventDefault(); setShowForgot(true); }}>
              Forgot your password?
            </a>

            <button type="submit" className="auth-btn" disabled={submitting}>
              {submitting ? 'Signing In...' : 'Sign In'}
            </button>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </form>
        ) : (
          <form onSubmit={handleForgotPassword}>
            <p className="subtitle">Enter your email to receive a password reset link.</p>
            <div className="auth-form-group">
              <label htmlFor="forgotEmail">Email</label>
              <input
                type="email"
                id="forgotEmail"
                placeholder="Enter your email."
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-btn" disabled={submitting}>
              {submitting ? 'Sending...' : 'Send Reset Link'}
            </button>
            <button type="button" className="auth-btn" style={{ background: '#6c757d', marginTop: 8 }} onClick={() => setShowForgot(false)}>
              Back to Sign In
            </button>
            {error && <div className="error-message">{error}</div>}
          </form>
        )}

        <div className="auth-footer">
          <Link to="/signup" className="link-blue">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
