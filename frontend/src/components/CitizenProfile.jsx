import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authFetch } from '../utils/api';
import './CitizenProfile.css';

const CitizenProfile = ({ onBack }) => {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('PROFILE');

  // Profile form states
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Delete account states
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (!fullName.trim() || !phone.trim()) {
      setProfileMessage({ type: 'error', text: 'Full name and phone are required.' });
      return;
    }

    setProfileLoading(true);
    try {
      const response = await authFetch('/citizen/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName: fullName.trim(), phone: phone.trim() }),
      });
      const data = await response.json();

      if (!response.ok) {
        setProfileMessage({ type: 'error', text: data.error });
        return;
      }

      // Update auth context with new user data
      login(data.user, localStorage.getItem('accessToken'));
      setProfileMessage({ type: 'success', text: data.message });
    } catch (err) {
      setProfileMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'All fields are required.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await authFetch('/citizen/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage({ type: 'error', text: data.error });
        return;
      }

      setPasswordMessage({ type: 'success', text: data.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) return;
    setDeleteLoading(true);
    try {
      const response = await authFetch('/citizen/account', {
        method: 'DELETE',
        body: JSON.stringify({ password: deletePassword }),
      });
      const data = await response.json();

      if (!response.ok) {
        setPasswordMessage({ type: 'error', text: data.error });
        setDeleteLoading(false);
        return;
      }

      // Account deleted — clear auth and redirect
      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      setPasswordMessage({ type: 'error', text: 'Network error.' });
      setDeleteLoading(false);
    }
  };

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'N/A';

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <button className="profile-back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h1 className="profile-title">Settings</h1>
        <p className="profile-subtitle">Manage your account and preferences</p>
      </div>

      {/* Tab Switcher */}
      <div className="profile-tabs">
        <button
          className={`profile-tab ${activeTab === 'PROFILE' ? 'profile-tab-active' : ''}`}
          onClick={() => setActiveTab('PROFILE')}
        >
          👤 Profile
        </button>
        <button
          className={`profile-tab ${activeTab === 'SECURITY' ? 'profile-tab-active' : ''}`}
          onClick={() => setActiveTab('SECURITY')}
        >
          🔒 Security
        </button>
      </div>

      {/* ===== PROFILE TAB ===== */}
      {activeTab === 'PROFILE' && (
        <div className="profile-section" key="profile">
          {/* User Info Card */}
          <div className="profile-info-card">
            <div className="profile-avatar-lg">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'C'}
            </div>
            <div className="profile-info-details">
              <h2 className="profile-info-name">{user?.fullName || 'Citizen'}</h2>
              <p className="profile-info-email">{user?.email}</p>
              <span className="profile-info-badge">🌍 Citizen</span>
              <span className="profile-info-since">Member since {memberSince}</span>
            </div>
          </div>

          {/* Edit Form */}
          <form className="profile-form" onSubmit={handleProfileUpdate}>
            <h3 className="profile-form-title">Edit Profile</h3>

            {profileMessage.text && (
              <div className={`profile-msg profile-msg-${profileMessage.type}`}>
                {profileMessage.type === 'success' ? '✓' : '✕'} {profileMessage.text}
              </div>
            )}

            <div className="profile-field">
              <label className="profile-label">Email</label>
              <input className="profile-input profile-input-disabled" value={user?.email || ''} disabled />
              <span className="profile-field-hint">Email cannot be changed</span>
            </div>

            <div className="profile-field">
              <label className="profile-label">Full Name</label>
              <input
                className="profile-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                disabled={profileLoading}
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">Phone Number</label>
              <input
                className="profile-input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                disabled={profileLoading}
              />
            </div>

            <button className="profile-save-btn" type="submit" disabled={profileLoading}>
              {profileLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      )}

      {/* ===== SECURITY TAB ===== */}
      {activeTab === 'SECURITY' && (
        <div className="profile-section" key="security">
          {/* Change Password */}
          <form className="profile-form" onSubmit={handlePasswordChange}>
            <h3 className="profile-form-title">🔑 Change Password</h3>

            {passwordMessage.text && (
              <div className={`profile-msg profile-msg-${passwordMessage.type}`}>
                {passwordMessage.type === 'success' ? '✓' : '✕'} {passwordMessage.text}
              </div>
            )}

            <div className="profile-field">
              <label className="profile-label">Current Password</label>
              <input
                className="profile-input"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                disabled={passwordLoading}
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">New Password</label>
              <input
                className="profile-input"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={passwordLoading}
              />
            </div>

            <div className="profile-field">
              <label className="profile-label">Confirm New Password</label>
              <input
                className="profile-input"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                disabled={passwordLoading}
              />
            </div>

            <button className="profile-save-btn" type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          {/* Danger Zone */}
          <div className="profile-danger-zone">
            <h3 className="profile-danger-title">⚠️ Danger Zone</h3>
            <p className="profile-danger-text">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            {!showDeleteConfirm ? (
              <button className="profile-delete-btn" onClick={() => setShowDeleteConfirm(true)}>
                Delete Account
              </button>
            ) : (
              <div className="profile-delete-confirm">
                <p className="profile-delete-warning">Enter your password to confirm:</p>
                <input
                  className="profile-input profile-input-danger"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Your password"
                />
                <div className="profile-delete-actions">
                  <button
                    className="profile-delete-confirm-btn"
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading || !deletePassword}
                  >
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    className="profile-delete-cancel-btn"
                    onClick={() => { setShowDeleteConfirm(false); setDeletePassword(''); }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CitizenProfile;
