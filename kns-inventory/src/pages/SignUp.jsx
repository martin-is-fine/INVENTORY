import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Auth.css';

export default function SignUp() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      setTimeout(() => setError(''), 5000);
      return;
    }
    setSubmitting(true);
    setError('');
    const result = await signup(fullName.trim(), email.trim(), password);
    if (result.success) {
      navigate(result.role === 'admin' ? '/admin' : '/user');
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
        <p className="subtitle">Create a new account.</p>

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label htmlFor="fullName">Full Name</label>
            <input
              type="text"
              id="fullName"
              placeholder="Enter your full name."
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
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
              placeholder="Enter your password (min 6 characters)."
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="auth-btn" disabled={submitting}>
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link to="/signin" className="link-red">Sign In</Link>
        </div>
      </div>
    </div>
  );
}
