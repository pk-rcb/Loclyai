import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AuthorityAuth.css';
import { useAuth } from '../context/AuthContext';

const AuthorityAuth = () => {
  const [authMode, setAuthMode] = useState('LOGIN');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form field states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Location states
  const [pincode, setPincode] = useState('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [ward, setWard] = useState('');
  const [postOffices, setPostOffices] = useState([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const resetForm = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setEmployeeId('');
    setPassword('');
    setConfirmPassword('');
    setPincode('');
    setStateName('');
    setDistrict('');
    setMunicipality('');
    setWard('');
    setPostOffices([]);
    setErrors({});
    setSuccessMessage('');
    setIsSubmitting(false);
  };

  const switchTab = (mode) => {
    if (mode === authMode) return;
    resetForm();
    setAuthMode(mode);
  };

  useEffect(() => {
    if (pincode.length === 6 && /^\d+$/.test(pincode)) {
      fetchPincodeData(pincode);
    } else {
      setStateName('');
      setDistrict('');
      setMunicipality('');
      setPostOffices([]);
    }
  }, [pincode]);

  const fetchPincodeData = async (pin) => {
    setIsLoadingLocation(true);
    setErrors((prev) => ({ ...prev, pincode: null }));
    try {
      // India Post API — returns accurate State, District, Block, Division for every Indian pincode
      const res = await fetch(`https://api.postalpincode.in/pincode/${pin}`);
      if (res.ok) {
        const data = await res.json();
        if (data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
          const firstPO = data[0].PostOffice[0];
          const state = firstPO.State || '';
          const dist = firstPO.District || '';
          const offices = data[0].PostOffice.map(po => ({
            Name: po.Name,
            Block: po.Block,
            Division: po.Division,
          }));
          setStateName(state);
          setDistrict(dist);
          setPostOffices(offices);
          // Auto-select municipality from District (primary routing key)
          if (dist) setMunicipality(dist);
        } else {
          setErrors((prev) => ({ ...prev, pincode: 'Pincode not found. Please check and try again.' }));
          setStateName('');
          setDistrict('');
          setMunicipality('');
          setPostOffices([]);
        }
      } else {
        setErrors((prev) => ({ ...prev, pincode: 'Could not fetch pincode data. Please enter details manually.' }));
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, pincode: 'Pincode API unavailable. Please enter details manually.' }));
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Official email or employee ID is required.';
    if (!password) newErrors.password = 'Password is required.';
    return newErrors;
  };

  const validateSignup = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    if (!email.trim()) newErrors.email = 'Official email is required.';
    else if (email.endsWith('@gmail.com') || email.endsWith('@yahoo.com') || email.endsWith('@hotmail.com')) {
      newErrors.email = 'Please use your official municipal email address.';
    }
    if (!employeeId.trim()) newErrors.employeeId = 'Employee ID is required.';
    if (!phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!pincode.trim() || pincode.length !== 6) newErrors.pincode = 'Valid 6-digit Pincode is required.';
    if (!municipality.trim()) newErrors.municipality = 'Municipality selection is required.';
    if (!ward.trim()) newErrors.ward = 'Ward selection is required.';
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    const validationErrors = authMode === 'LOGIN' ? validateLogin() : validateSignup();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const endpoint = authMode === 'LOGIN' ? '/api/authority/login' : '/api/authority/signup';
      const body = authMode === 'LOGIN'
        ? { email, password }
        : { fullName, email, phone, employeeId, pincode, state: stateName, district, municipality, ward, password };

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

      if (authMode === 'LOGIN') {
        login(data.user, data.accessToken);
        setSuccessMessage(data.message);
        setTimeout(() => navigate('/citizen-dashboard'), 800);
      } else {
        setSuccessMessage(data.message);
        resetForm(); // clear form so they can login after approval
      }
    } catch (err) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="authority-page">
      <div className="authority-bg-pattern"></div>
      <div className="authority-bg-shape authority-bg-shape-1"></div>
      <div className="authority-bg-shape authority-bg-shape-2"></div>

      <div className="authority-card">
        <Link to="/" className="authority-logo-link">
          <div className="authority-logo">
            <span className="authority-logo-icon">🏛️</span>
            <span className="authority-logo-text">LoclyAI</span>
          </div>
          <div className="authority-portal-badge">Authority Portal</div>
        </Link>

        <div className="authority-tabs">
          <button
            className={`authority-tab ${authMode === 'LOGIN' ? 'authority-tab-active' : ''}`}
            onClick={() => switchTab('LOGIN')}
            type="button"
          >
            Login
          </button>
          <button
            className={`authority-tab ${authMode === 'SIGNUP' ? 'authority-tab-active' : ''}`}
            onClick={() => switchTab('SIGNUP')}
            type="button"
          >
            Sign Up
          </button>
          <div
            className="authority-tab-indicator"
            style={{ transform: authMode === 'SIGNUP' ? 'translateX(100%)' : 'translateX(0)' }}
          ></div>
        </div>

        {successMessage && (
          <div className="authority-success">
            <span className="authority-success-icon">✓</span>
            {successMessage}
          </div>
        )}

        {errors.general && (
          <div className="authority-error">
            <span className="authority-error-icon">✕</span>
            {errors.general}
          </div>
        )}

        <form className="authority-form" onSubmit={handleSubmit} noValidate>
          {authMode === 'SIGNUP' && (
            <div className="aform-group">
              <label htmlFor="authorityFullName" className="aform-label">Full Name</label>
              <input
                id="authorityFullName"
                type="text"
                className={`aform-input ${errors.fullName ? 'aform-input-error' : ''}`}
                placeholder="e.g. Inspector Ramesh K."
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.fullName && <span className="aform-error">{errors.fullName}</span>}
            </div>
          )}

          {authMode === 'SIGNUP' && (
            <div className="aform-group">
              <label htmlFor="authorityEmployeeId" className="aform-label">Employee ID / Badge Number</label>
              <input
                id="authorityEmployeeId"
                type="text"
                className={`aform-input ${errors.employeeId ? 'aform-input-error' : ''}`}
                placeholder="e.g. EMP12345"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.employeeId && <span className="aform-error">{errors.employeeId}</span>}
            </div>
          )}

          <div className="aform-group">
            <label htmlFor="authorityEmail" className="aform-label">
              {authMode === 'LOGIN' ? 'Official Email' : 'Official Email'}
            </label>
            <input
              id="authorityEmail"
              type="email"
              className={`aform-input ${errors.email ? 'aform-input-error' : ''}`}
              placeholder="e.g. ramesh@municipality.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.email && <span className="aform-error">{errors.email}</span>}
          </div>

          {authMode === 'SIGNUP' && (
            <div className="aform-group">
              <label htmlFor="authorityPhone" className="aform-label">Phone Number</label>
              <input
                id="authorityPhone"
                type="tel"
                className={`aform-input ${errors.phone ? 'aform-input-error' : ''}`}
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.phone && <span className="aform-error">{errors.phone}</span>}
            </div>
          )}

          {authMode === 'SIGNUP' && (
            <>
              <div className="aform-group">
                <label htmlFor="authorityPincode" className="aform-label">Location Pincode</label>
                <input
                  id="authorityPincode"
                  type="text"
                  maxLength={6}
                  className={`aform-input ${errors.pincode ? 'aform-input-error' : ''}`}
                  placeholder="e.g. 400001"
                  value={pincode}
                  onChange={(e) => {
                    setPincode(e.target.value);
                    setErrors((prev) => ({ ...prev, pincode: null }));
                  }}
                  disabled={isSubmitting}
                />
                {isLoadingLocation && <span className="aform-hint">Fetching location data...</span>}
                {errors.pincode && <span className="aform-error">{errors.pincode}</span>}
              </div>

              {pincode.length === 6 && (
                <div className="aform-group" style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="aform-label">State <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 400 }}>(auto)</span></label>
                    <input
                      type="text"
                      className="aform-input"
                      value={stateName}
                      readOnly
                      style={{ opacity: 0.75, cursor: 'default' }}
                      placeholder="Auto-filled from pincode"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="aform-label">District <span style={{ fontSize: '11px', color: '#6ee7b7', fontWeight: 400 }}>(auto)</span></label>
                    <input
                      type="text"
                      className="aform-input"
                      value={district}
                      readOnly
                      style={{ opacity: 0.75, cursor: 'default' }}
                      placeholder="Auto-filled from pincode"
                    />
                  </div>
                </div>
              )}

              {pincode.length === 6 && (
                <>
                  <div className="aform-group">
                    <label htmlFor="authorityMunicipality" className="aform-label">
                      Municipality / District
                      <span style={{ fontSize: '11px', color: '#6ee7b7', marginLeft: '6px', fontWeight: 400 }}>
                        (auto-fetched — used for report routing)
                      </span>
                    </label>
                    {postOffices.length > 0 ? (
                      <select
                        id="authorityMunicipality"
                        className={`aform-input ${errors.municipality ? 'aform-input-error' : ''}`}
                        value={municipality}
                        onChange={(e) => setMunicipality(e.target.value)}
                        disabled={isSubmitting}
                      >
                        {/* District is the top-level option and default — matches Nominatim geocode output */}
                        <option value={district}>{district} (District — Recommended)</option>
                        {postOffices.map((po, idx) => (
                          <option key={idx} value={po.Name}>
                            {po.Name}{po.Block && po.Block !== 'NA' ? ` (${po.Block})` : ''}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id="authorityMunicipality"
                        type="text"
                        className={`aform-input ${errors.municipality ? 'aform-input-error' : ''}`}
                        placeholder="e.g. Mumbai"
                        value={municipality}
                        onChange={(e) => setMunicipality(e.target.value)}
                        disabled={isSubmitting}
                      />
                    )}
                    {errors.municipality && <span className="aform-error">{errors.municipality}</span>}
                  </div>

                  <div className="aform-group">
                    <label htmlFor="authorityWard" className="aform-label">Ward / Zone</label>
                    <input
                      id="authorityWard"
                      type="text"
                      className={`aform-input ${errors.ward ? 'aform-input-error' : ''}`}
                      placeholder="e.g. Ward K-East"
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      disabled={isSubmitting}
                    />
                    {errors.ward && <span className="aform-error">{errors.ward}</span>}
                  </div>
                </>
              )}
            </>
          )}

          <div className="aform-group">
            <div className="aform-label-row">
              <label htmlFor="authorityPassword" className="aform-label">Password</label>
              {authMode === 'LOGIN' && (
                <a href="#forgot" className="authority-forgot-link">Forgot Password?</a>
              )}
            </div>
            <input
              id="authorityPassword"
              type="password"
              className={`aform-input ${errors.password ? 'aform-input-error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />
            {errors.password && <span className="aform-error">{errors.password}</span>}
          </div>

          {authMode === 'SIGNUP' && (
            <div className="aform-group">
              <label htmlFor="authorityConfirmPassword" className="aform-label">Confirm Password</label>
              <input
                id="authorityConfirmPassword"
                type="password"
                className={`aform-input ${errors.confirmPassword ? 'aform-input-error' : ''}`}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="aform-error">{errors.confirmPassword}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="authority-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="authority-spinner"></span>
                Processing...
              </>
            ) : authMode === 'LOGIN' ? (
              'Login to Authority Portal'
            ) : (
              'Create Authority Account'
            )}
          </button>
        </form>

        <p className="authority-footer-text">
          {authMode === 'LOGIN' ? (
            <>
              Don't have an authority account?{' '}
              <button
                type="button"
                className="authority-inline-link"
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
                className="authority-inline-link"
                onClick={() => switchTab('LOGIN')}
              >
                Login
              </button>
            </>
          )}
        </p>

        <p className="authority-citizen-redirect">
          Are you a citizen? <Link to="/auth" className="authority-citizen-link">Go to Citizen Login →</Link>
        </p>
      </div>
    </div>
  );
};

export default AuthorityAuth;
