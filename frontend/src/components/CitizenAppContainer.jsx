import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CitizenDashboard from './CitizenDashboard';
import SmartReporter from './SmartReporter';
import CitizenProfile from './CitizenProfile';
import { useAuth } from '../context/AuthContext';
import { getAccessToken } from '../utils/api.js';
import './CitizenAppContainer.css';

/**
 * CitizenAppContainer
 * 
 * The top-level post-login shell for citizens.
 * Manages navigation between DASHBOARD and REPORTER views
 * via internal state (no URL changes).
 */
const CitizenAppContainer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Primary view state: 'DASHBOARD', 'REPORTER', or 'PROFILE'
  const [currentView, setCurrentView] = useState('DASHBOARD');

  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const token = getAccessToken();
      const res = await fetch('${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/reports/my-reports', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = data.reports.map(r => ({
          id: `RPT-${r.id}`,
          rawId: r.id,
          type: r.description.split('\n')[0].replace('Subject: ', '').replace(' Detected — Civic Hazard Report', '') || 'Report',
          date: new Date(r.created_at).toISOString().split('T')[0],
          status: r.status,
          location: r.address_display || `${r.ward || ''}, ${r.municipality || ''}`,
          confidence: 99, // mock or parse from desc
          thumbnail: '📸',
          imageUrl: r.image_url ? `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${r.image_url}` : null,
          authorityName: r.authority_name,
          authorityNotes: r.authority_notes,
          resolvedAt: r.resolved_at
        }));
        setComplaints(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch reports', err);
    }
  };

  /**
   * Called when the Smart Reporter completes successfully.
   * Adds a new mock report to the top of the complaints list
   * and switches back to the DASHBOARD view.
   */
  const handleReportComplete = useCallback(() => {
    fetchComplaints(); // Refresh from backend instead of local mock
    setCurrentView('DASHBOARD');
  }, []);

  return (
    <div className="citizen-app">
      {/* ========== PERSISTENT GLOBAL HEADER ========== */}
      <header className="citizen-header">
        <div className="citizen-header-inner">
          {/* Left: Brand */}
          <div className="citizen-brand">
            <span className="citizen-brand-icon">🌍</span>
            <span className="citizen-brand-text">LoclyAI</span>
          </div>

          {/* Right: Notifications & Profile */}
          <div className="citizen-header-actions">
            <button className="citizen-header-btn" title="Notifications">
              <span className="citizen-header-btn-icon">🔔</span>
              <span className="citizen-notif-dot"></span>
            </button>
            <div className="citizen-user-menu-wrapper">
              <button
                className="citizen-header-btn citizen-profile-btn"
                title="Profile"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <span className="citizen-avatar">{user?.fullName?.charAt(0)?.toUpperCase() || 'C'}</span>
              </button>
              {showUserMenu && (
                <div className="citizen-user-menu">
                  <div className="citizen-user-menu-header">
                    <span className="citizen-user-menu-name">{user?.fullName || 'Citizen'}</span>
                    <span className="citizen-user-menu-email">{user?.email}</span>
                  </div>
                  <div className="citizen-user-menu-divider"></div>
                  <button className="citizen-user-menu-item" onClick={() => { setCurrentView('PROFILE'); setShowUserMenu(false); }}>
                    👤 Profile & Settings
                  </button>
                  <button className="citizen-user-menu-item citizen-user-menu-logout" onClick={async () => { await logout(); navigate('/'); }}>
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
        {currentView === 'DASHBOARD' && (
          <CitizenDashboard
            complaints={complaints}
            onNewReport={() => setCurrentView('REPORTER')}
          />
        )}
        {currentView === 'REPORTER' && (
          <SmartReporter
            onComplete={handleReportComplete}
            onCancel={() => setCurrentView('DASHBOARD')}
          />
        )}
        {currentView === 'PROFILE' && (
          <CitizenProfile
            onBack={() => setCurrentView('DASHBOARD')}
          />
        )}
      </main>
    </div>
  );
};

export default CitizenAppContainer;
