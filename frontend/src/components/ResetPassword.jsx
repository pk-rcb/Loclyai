import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import './CitizenAuth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!newPassword || !confirmPassword) {
      setMessage({ type: 'error', text: 'Both fields are required.' });
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    if (!token || !email) {
      setMessage({ type: 'error', text: 'Invalid reset link. Please request a new one.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/password/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error });
        return;
      }

      setMessage({ type: 'success', text: data.message });
      setTimeout(() => navigate('/auth'), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-shape auth-bg-shape-1"></div>
      <div className="auth-bg-shape auth-bg-shape-2"></div>

      <div className="auth-card">
        <Link to="/auth" className="auth-back-link">← Back to Login</Link>

        <Link to="/" className="auth-logo-link">
          <div className="auth-logo">
            <span className="auth-logo-icon">🌍</span>
            <span className="auth-logo-text">LoclyAI</span>
          </div>
          <p className="auth-tagline">Your city, fixed faster.</p>
        </Link>

        <h2 style={{ textAlign: 'center', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Reset Password
        </h2>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Enter your new password below.
        </p>

        {message.text && (
          <div className={message.type === 'success' ? 'auth-success' : 'auth-error'}>
            <span className={message.type === 'success' ? 'auth-success-icon' : 'auth-error-icon'}>
              {message.type === 'success' ? '✓' : '✕'}
            </span>
            {message.text}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="newPassword" className="form-label">New Password</label>
            <input
              id="newPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmNewPassword" className="form-label">Confirm New Password</label>
            <input
              id="confirmNewPassword"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="spinner"></span> Resetting...</>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          <Link to="/auth" className="auth-inline-link" style={{ textDecoration: 'underline' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
