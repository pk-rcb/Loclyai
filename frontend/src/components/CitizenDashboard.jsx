import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccessToken } from '../utils/api.js';
import './CitizenDashboard.css';

/**
 * CitizenDashboard
 *
 * Post-login view showing:
 * - Welcome banner with impact stats
 * - Submit New Report CTA
 * - Scrollable complaint cards with status tracking
 * - Withdraw option for Pending reports
 * - Expandable details for Approved/Completed reports
 */
const CitizenDashboard = ({ complaints, onNewReport, onRefresh }) => {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState(null);
  const [withdrawingId, setWithdrawingId] = useState(null);

  // Stats
  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const approvedCount = complaints.filter(c => c.status === 'Approved' || c.status === 'Completed').length;
  const resolvedCount = complaints.filter(c => c.status === 'Completed').length;

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'badge-resolved';
      case 'Pending': return 'badge-pending';
      case 'Approved': return 'badge-progress';
      case 'Rejected': return 'badge-rejected';
      case 'Withdrawn': return 'badge-withdrawn';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return '⏳';
      case 'Approved': return '✅';
      case 'Completed': return '🎉';
      case 'Rejected': return '❌';
      case 'Withdrawn': return '↩️';
      default: return '📋';
    }
  };

  const handleWithdraw = async (reportId) => {
    if (!window.confirm('Are you sure you want to withdraw this report?')) return;
    
    setWithdrawingId(reportId);
    try {
      const token = getAccessToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/reports/${reportId}/withdraw`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });

      if (res.ok) {
        if (onRefresh) onRefresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to withdraw report.');
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setWithdrawingId(null);
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="dashboard">
      {/* ========== WELCOME SECTION ========== */}
      <section className="dashboard-welcome">
        <div className="welcome-text">
          <h1 className="welcome-title">Hello, {user?.fullName?.split(' ')[0] || 'Citizen'} 👋</h1>
          <p className="welcome-subtitle">
            Your reports are making a difference. Track them in real-time!
          </p>
        </div>
        <div className="welcome-stats">
          <div className="stat-card">
            <span className="stat-number">{complaints.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{pendingCount}</span>
            <span className="stat-label">Pending</span>
          </div>
          <div className="stat-card stat-card-accent">
            <span className="stat-number">{resolvedCount}</span>
            <span className="stat-label">Resolved</span>
          </div>
        </div>
      </section>

      {/* ========== CTA BUTTON ========== */}
      <button className="new-report-btn" onClick={onNewReport}>
        <span className="new-report-icon">➕</span>
        Submit New Report
      </button>

      {/* ========== COMPLAINT HISTORY ========== */}
      <section className="complaint-history">
        <h2 className="history-title">My Complaints</h2>

        {complaints.length === 0 ? (
          <div className="empty-state">
            <span className="empty-state-icon">📭</span>
            <p className="empty-state-text">No reports yet. Submit your first civic issue!</p>
          </div>
        ) : (
          <div className="complaint-list">
            {complaints.map((complaint) => (
              <div
                className={`complaint-card ${expandedId === complaint.rawId ? 'complaint-card-expanded' : ''}`}
                key={complaint.id}
                onClick={() => toggleExpand(complaint.rawId)}
              >
                {/* Main Row */}
                <div className="complaint-main-row">
                  {/* Thumbnail */}
                  <div className="complaint-thumb">
                    {complaint.imageUrl ? (
                      <img 
                        src={complaint.imageUrl} 
                        alt="Report" 
                        className="complaint-thumb-img"
                        onError={(e) => {
                          if (!e.target.dataset.retried) {
                            e.target.dataset.retried = 'true';
                            e.target.src = complaint.imageUrl.replace(`\${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}`, 'https://loclyai-backend.onrender.com');
                          }
                        }}
                      />
                    ) : (
                      <span className="complaint-thumb-emoji">{complaint.thumbnail}</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="complaint-details">
                    <div className="complaint-top-row">
                      <span className="complaint-type">{complaint.type}</span>
                      <span className={`complaint-status ${getStatusClass(complaint.status)}`}>
                        {getStatusIcon(complaint.status)} {complaint.status}
                      </span>
                    </div>
                    <span className="complaint-location">📍 {complaint.location}</span>
                    <div className="complaint-meta">
                      <span className="complaint-date">📅 {complaint.date}</span>
                      <span className="complaint-id">{complaint.id}</span>
                    </div>
                  </div>
                </div>

                {/* ─── Expanded Details ─── */}
                {expandedId === complaint.rawId && (
                  <div className="complaint-expanded" onClick={(e) => e.stopPropagation()}>
                    {/* Status Timeline */}
                    <div className="status-timeline">
                      <div className={`timeline-step ${complaint.status !== 'Withdrawn' ? 'timeline-step-done' : ''}`}>
                        <div className="timeline-dot"></div>
                        <span>Submitted</span>
                      </div>
                      <div className="timeline-line"></div>
                      <div className={`timeline-step ${['Approved', 'Completed'].includes(complaint.status) ? 'timeline-step-done' : ''}`}>
                        <div className="timeline-dot"></div>
                        <span>Approved</span>
                      </div>
                      <div className="timeline-line"></div>
                      <div className={`timeline-step ${complaint.status === 'Completed' ? 'timeline-step-done' : ''}`}>
                        <div className="timeline-dot"></div>
                        <span>Completed</span>
                      </div>
                    </div>

                    {/* Authority Info */}
                    {complaint.authorityName && (
                      <div className="expanded-info-row">
                        <span className="expanded-label">🏛️ Handled by:</span>
                        <span className="expanded-value">{complaint.authorityName}</span>
                      </div>
                    )}

                    {/* Authority Notes */}
                    {complaint.authorityNotes && (
                      <div className="expanded-info-row">
                        <span className="expanded-label">📝 Authority Notes:</span>
                        <span className="expanded-value">{complaint.authorityNotes}</span>
                      </div>
                    )}

                    {/* Resolved At */}
                    {complaint.resolvedAt && (
                      <div className="expanded-info-row">
                        <span className="expanded-label">✅ Resolved on:</span>
                        <span className="expanded-value">{new Date(complaint.resolvedAt).toLocaleDateString()}</span>
                      </div>
                    )}

                    {/* Withdraw Button (only for Pending) */}
                    {complaint.status === 'Pending' && (
                      <button
                        className="withdraw-btn"
                        onClick={(e) => { e.stopPropagation(); handleWithdraw(complaint.rawId); }}
                        disabled={withdrawingId === complaint.rawId}
                      >
                        {withdrawingId === complaint.rawId ? 'Withdrawing...' : '↩️ Withdraw Report'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CitizenDashboard;
