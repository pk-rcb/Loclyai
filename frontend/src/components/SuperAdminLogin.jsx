import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AuthorityAuth.css'; // Reuse authority styling for a premium look

const SuperAdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in both fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/superadmin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Login failed.');
      } else {
        localStorage.setItem('superAdminToken', data.accessToken);
        navigate('/superadmin/dashboard');
      }
    } catch (err) {
      setError('Network error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="authority-page">
      <div className="authority-bg-pattern"></div>
      <div className="authority-bg-shape authority-bg-shape-1"></div>
      <div className="authority-bg-shape authority-bg-shape-2"></div>

      <div className="authority-card" style={{ maxWidth: '400px' }}>
        <div className="authority-logo" style={{ justifyContent: 'center', marginBottom: '20px' }}>
          <span className="authority-logo-icon">👑</span>
          <span className="authority-logo-text">Super Admin</span>
        </div>
        
        {error && (
          <div className="authority-error">
            <span className="authority-error-icon">✕</span>
            {error}
          </div>
        )}

        <form className="authority-form" onSubmit={handleLogin}>
          <div className="aform-group">
            <label className="aform-label">Admin Email</label>
            <input 
              type="email" 
              className="aform-input" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@locly.ai"
              disabled={isSubmitting}
            />
          </div>
          <div className="aform-group">
            <label className="aform-label">Password</label>
            <input 
              type="password" 
              className="aform-input" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
            />
          </div>
          <button 
            type="submit" 
            className="authority-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Authenticating...' : 'Login securely'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SuperAdminLogin;
