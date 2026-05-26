import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './CitizenAuth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Email is required.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/password/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage({ type: 'error', text: data.error });
        return;
      }

      setMessage({ type: 'success', text: data.message });
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
          Forgot Password?
        </h2>
        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Enter your email and we'll send you a link to reset your password.
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
            <label htmlFor="resetEmail" className="form-label">Email Address</label>
            <input
              id="resetEmail"
              type="email"
              className="form-input"
              placeholder="e.g. citizen@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <button type="submit" className="auth-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <><span className="spinner"></span> Sending...</>
            ) : (
              'Send Reset Link'
            )}
          </button>
        </form>

        <p className="auth-footer-text">
          Remember your password?{' '}
          <Link to="/auth" className="auth-inline-link" style={{ textDecoration: 'underline' }}>Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
