import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './CitizenAuth.css';
import { useAuth } from '../context/AuthContext';

const CitizenAuth = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  // Toggle between 'LOGIN' and 'SIGNUP' modes
  const [authMode, setAuthMode] = useState('LOGIN');

  // Form field states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  /**
   * Clears all form fields and resets error/success states.
   * Called when switching between Login and Sign Up tabs.
   */
  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setConfirmPassword('');
    setErrors({});
    setSuccessMessage('');
    setIsSubmitting(false);
  };

  /**
   * Handles tab switching between LOGIN and SIGNUP modes.
   */
  const switchTab = (mode) => {
    if (mode === authMode) return;
    resetForm();
    setAuthMode(mode);
  };

  /**
   * Validates the login form.
   * Returns an object of field-specific error messages.
   */
  const validateLogin = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    return newErrors;
  };

  /**
   * Validates the sign-up form.
   * Returns an object of field-specific error messages.
   */
  const validateSignup = () => {
    const newErrors = {};
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    }
    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }
    return newErrors;
  };

  /**
   * Handles form submission for both Login and Sign Up.
   * Validates fields, shows a loading state, then mocks
   * a 2-second API call using setTimeout.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');

    // Run validation based on current auth mode
    const validationErrors =
      authMode === 'LOGIN' ? validateLogin() : validateSignup();

    // If errors exist, display them and stop
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Clear previous errors, enter loading state
    setErrors({});
    setIsSubmitting(true);

    try {
      const endpoint = authMode === 'LOGIN' ? '/api/citizen/login' : '/api/citizen/signup';
      const body = authMode === 'LOGIN'
        ? { email, phone, password }
        : { fullName, email, phone, password };

      const response = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.error });
        setIsSubmitting(false);
        return;
      }

      login(data.user, data.accessToken);
      setSuccessMessage(data.message);
      setTimeout(() => navigate('/citizen-dashboard'), 800);
    } catch (err) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Decorative background shapes */}
      <div className="auth-bg-shape auth-bg-shape-1"></div>
      <div className="auth-bg-shape auth-bg-shape-2"></div>

      <div className="auth-card">
        {/* Logo / Branding */}
        <Link to="/" className="auth-logo-link">
          <div className="auth-logo">
            <span className="auth-logo-icon">🌍</span>
            <span className="auth-logo-text">LoclyAI</span>
          </div>
          <p className="auth-tagline">Your city, fixed faster.</p>
        </Link>

        {/* Tab Switcher */}
        <div className="auth-tabs">
          <button
            className={`auth-tab ${authMode === 'LOGIN' ? 'auth-tab-active' : ''}`}
            onClick={() => switchTab('LOGIN')}
            type="button"
          >
            Login
          </button>
          <button
            className={`auth-tab ${authMode === 'SIGNUP' ? 'auth-tab-active' : ''}`}
            onClick={() => switchTab('SIGNUP')}
            type="button"
          >
            Sign Up
          </button>
          {/* Animated underline indicator */}
          <div
            className="auth-tab-indicator"
            style={{ transform: authMode === 'SIGNUP' ? 'translateX(100%)' : 'translateX(0)' }}
          ></div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="auth-success">
            <span className="auth-success-icon">✓</span>
            {successMessage}
          </div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <div className="auth-error">
            <span className="auth-error-icon">✕</span>
            {errors.general}
          </div>
        )}

        {/* Auth Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* ---- SIGN UP: Full Name field ---- */}
          {authMode === 'SIGNUP' && (
            <div className="form-group">
              <label htmlFor="fullName" className="form-label">Full Name</label>
              <input
                id="fullName"
                type="text"
                className={`form-input ${errors.fullName ? 'form-input-error' : ''}`}
                placeholder="e.g. Rahul Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.fullName && <span className="form-error">{errors.fullName}</span>}
            </div>
          )}

          {/* ---- Email field ---- */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              className={`form-input ${errors.email ? 'form-input-error' : ''}`}
              placeholder="e.g. citizen@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          {/* ---- Phone Number field ---- */}
          <div className="form-group">
            <label htmlFor="phone" className="form-label">Phone Number</label>
            <input
              id="phone"
              type="tel"
              className={`form-input ${errors.phone ? 'form-input-error' : ''}`}
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* ---- Password field ---- */}
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="password" className="form-label">Password</label>
              {authMode === 'LOGIN' && (
                <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
              )}
            </div>
            <input
              id="password"
              type="password"
              className={`form-input ${errors.password ? 'form-input-error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.password && <span className="form-error">{errors.password}</span>}
          </div>

          {/* ---- SIGN UP: Confirm Password field ---- */}
          {authMode === 'SIGNUP' && (
            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className={`form-input ${errors.confirmPassword ? 'form-input-error' : ''}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="form-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          {/* ---- Submit Button ---- */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Authenticating...
              </>
            ) : authMode === 'LOGIN' ? (
              'Login'
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Footer prompt to switch mode */}
        <p className="auth-footer-text">
          {authMode === 'LOGIN' ? (
            <>
              Don't have an account?{' '}
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => switchTab('SIGNUP')}
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => switchTab('LOGIN')}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default CitizenAuth;
