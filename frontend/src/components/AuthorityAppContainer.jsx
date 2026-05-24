import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthorityDashboard from './AuthorityDashboard';
import { useAuth } from '../context/AuthContext';
import './CitizenAppContainer.css';

/**
 * AuthorityAppContainer
 * 
 * The top-level post-login shell for authority users.
 * Displays a persistent header with brand + user menu,
 * and renders the AuthorityDashboard as the sole view.
 */
const AuthorityAppContainer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <div className="citizen-app">
      {/* ========== PERSISTENT GLOBAL HEADER ========== */}
      <header className="citizen-header">
        <div className="citizen-header-inner">
          {/* Left: Brand */}
          <div className="citizen-brand">
            <span className="citizen-brand-icon">🏛️</span>
            <span className="citizen-brand-text">LoclyAI</span>
            <span
              style={{
                marginLeft: '0.5rem',
                padding: '0.15rem 0.6rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#7c3aed',
                background: 'rgba(124, 58, 237, 0.1)',
                borderRadius: '999px',
              }}
            >
              Authority Portal
            </span>
          </div>

          {/* Right: Profile */}
          <div className="citizen-header-actions">
            <div className="citizen-user-menu-wrapper">
              <button
                className="citizen-header-btn citizen-profile-btn"
                title="Profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="citizen-avatar">
                  {user?.fullName?.charAt(0)?.toUpperCase() || 'A'}
                </span>
              </button>
              {showUserMenu && (
                <div className="citizen-user-menu">
                  <div className="citizen-user-menu-header">
                    <span className="citizen-user-menu-name">
                      {user?.fullName || 'Authority'}
                    </span>
                    <span className="citizen-user-menu-email">
                      {user?.email}
                    </span>
                  </div>
                  <div className="citizen-user-menu-divider"></div>
                  <button className="citizen-user-menu-item">
                    👤 Profile & Settings
                  </button>
                  <button
                    className="citizen-user-menu-item citizen-user-menu-logout"
                    onClick={async () => {
                      await logout();
                      navigate('/');
                    }}
                  >
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ========== MAIN CONTENT AREA ========== */}
      <main className="citizen-main">
        <AuthorityDashboard />
      </main>
    </div>
  );
};

export default AuthorityAppContainer;
