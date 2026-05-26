import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAccessToken } from '../utils/api.js';
import './AuthorityDashboard.css';

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [authorityInfo, setAuthorityInfo] = useState(null);
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [actionNotes, setActionNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = getAccessToken();
      const res = await fetch('${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/reports/authority/my-area', {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports);
        setAuthorityInfo(data.authority);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    }
  };

  // Stats
  const totalReports = reports.length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;
  const approvedCount = reports.filter(r => r.status === 'Approved').length;
  const completedCount = reports.filter(r => r.status === 'Completed').length;

  const filteredReports = filter === 'All' 
    ? reports 
    : reports.filter(r => r.status === filter);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending': return 'badge-pending';
      case 'Approved': return 'badge-progress';
      case 'Completed': return 'badge-resolved';
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

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setActionNotes(''); // Reset notes when closing
    } else {
      setExpandedId(id);
      setActionNotes('');
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this report?`)) return;
    
    setIsProcessing(true);
    try {
      const token = getAccessToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}/api/reports/${id}/${action}`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: actionNotes }),
        credentials: 'include'
      });

      if (res.ok) {
        setExpandedId(null);
        setActionNotes('');
        fetchReports(); // Refresh the list
      } else {
        const data = await res.json();
        alert(data.error || `Failed to ${action} report.`);
      }
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="auth-dashboard">
      {/* ========== WELCOME SECTION ========== */}
      <section className="auth-welcome">
        <div className="auth-welcome-text">
          <h1 className="auth-welcome-title">Welcome, {user?.fullName?.split(' ')[0]} 🏛️</h1>
          <p className="auth-welcome-subtitle">
            Managing civic issues for <strong>{user?.municipality || authorityInfo?.municipality}</strong>
          </p>
        </div>
        <div className="auth-welcome-stats">
          <div className="auth-stat-card">
            <span className="auth-stat-number">{totalReports}</span>
            <span className="auth-stat-label">Total</span>
          </div>
          <div className="auth-stat-card">
            <span className="auth-stat-number">{pendingCount}</span>
            <span className="auth-stat-label">Pending</span>
          </div>
          <div className="auth-stat-card">
            <span className="auth-stat-number">{approvedCount}</span>
            <span className="auth-stat-label">In Progress</span>
          </div>
          <div className="auth-stat-card auth-stat-card-accent">
            <span className="auth-stat-number">{completedCount}</span>
            <span className="auth-stat-label">Completed</span>
          </div>
        </div>
      </section>

      {/* ========== FILTER TABS ========== */}
      <div className="auth-filters">
        {['All', 'Pending', 'Approved', 'Completed', 'Rejected'].map(status => (
          <button 
            key={status}
            className={`auth-filter-btn ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* ========== REPORT LIST ========== */}
      <section className="auth-report-list">
        {filteredReports.length === 0 ? (
          <div className="auth-empty-state">
            <span className="auth-empty-icon">📭</span>
            <p className="auth-empty-text">No reports found for this filter.</p>
          </div>
        ) : (
          filteredReports.map((report) => (
            <div 
              className={`auth-report-card ${expandedId === report.id ? 'expanded' : ''}`} 
              key={report.id}
              onClick={() => toggleExpand(report.id)}
            >
              {/* Condensed Row */}
              <div className="auth-card-main">
                <div className="auth-card-thumb">
                  {report.image_url ? (
                    <img 
                      src={report.image_url.startsWith('data:') ? report.image_url : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${report.image_url}`} 
                      alt="Hazard" 
                      onError={(e) => {
                        if (!e.target.dataset.retried) {
                          e.target.dataset.retried = 'true';
                          e.target.src = `https://loclyai-backend.onrender.com${report.image_url}`;
                        }
                      }}
                    />
                  ) : (
                    <span>📸</span>
                  )}
                </div>
                <div className="auth-card-details">
                  <div className="auth-card-header">
                    <span className="auth-card-title">
                      {report.description.split('\n')[0].replace('Subject: ', '').replace(' Detected — Civic Hazard Report', '') || 'Civic Issue Report'}
                    </span>
                    <span className={`auth-badge ${getStatusClass(report.status)}`}>
                      {getStatusIcon(report.status)} {report.status}
                    </span>
                  </div>
                  <div className="auth-card-location">
                    📍 {report.address_display || `${report.ward}, ${report.municipality}, ${report.district}, ${report.state}`}
                  </div>
                  <div className="auth-card-meta">
                    <span>📅 {new Date(report.created_at).toLocaleDateString()}</span>
                    <span>👤 {report.citizen_name || 'Citizen'}</span>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedId === report.id && (
                <div className="auth-card-expanded" onClick={(e) => e.stopPropagation()}>
                  <div className="auth-expanded-grid">
                    {/* Image Column */}
                    <div className="auth-expanded-img">
                      {report.image_url && (
                        <img 
                          src={report.image_url.startsWith('data:') ? report.image_url : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${report.image_url}`} 
                          alt="Full Hazard" 
                          onError={(e) => {
                            if (!e.target.dataset.retried) {
                              e.target.dataset.retried = 'true';
                              e.target.src = `https://loclyai-backend.onrender.com${report.image_url}`;
                            }
                          }}
                        />
                      )}
                    </div>
                    
                    {/* Details Column */}
                    <div className="auth-expanded-info">
                      <div className="info-block">
                        <label>Description:</label>
                        <p>{report.description}</p>
                      </div>
                      
                      <div className="info-block">
                        <label>GPS Coordinates:</label>
                        <p>Lat: {report.latitude}, Lng: {report.longitude}</p>
                      </div>

                      {/* Contact Info (optional) */}
                      {report.citizen_phone && (
                        <div className="info-block">
                          <label>Citizen Contact:</label>
                          <p>📞 {report.citizen_phone}</p>
                        </div>
                      )}
                      
                      {/* Existing Notes */}
                      {report.authority_notes && (
                        <div className="info-block">
                          <label>Previous Notes:</label>
                          <p className="auth-previous-notes">{report.authority_notes}</p>
                        </div>
                      )}

                      {/* Action Area for Pending/Approved */}
                      {(report.status === 'Pending' || report.status === 'Approved') && (
                        <div className="auth-action-area">
                          <label>Add Notes (optional):</label>
                          <textarea 
                            className="auth-notes-input"
                            value={actionNotes}
                            onChange={(e) => setActionNotes(e.target.value)}
                            placeholder="Reason for rejection, or notes for the team..."
                            rows={3}
                          />
                          
                          <div className="auth-action-buttons">
                            {report.status === 'Pending' && (
                              <>
                                <button 
                                  className="auth-btn auth-btn-accept"
                                  onClick={() => handleAction(report.id, 'approve')}
                                  disabled={isProcessing}
                                >
                                  ✅ Approve & Assign
                                </button>
                                <button 
                                  className="auth-btn auth-btn-reject"
                                  onClick={() => handleAction(report.id, 'reject')}
                                  disabled={isProcessing}
                                >
                                  ❌ Reject
                                </button>
                              </>
                            )}
                            
                            {report.status === 'Approved' && (
                              <button 
                                className="auth-btn auth-btn-complete"
                                onClick={() => handleAction(report.id, 'complete')}
                                disabled={isProcessing}
                              >
                                🎉 Mark as Completed
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default AuthorityDashboard;
