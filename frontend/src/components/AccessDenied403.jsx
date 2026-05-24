import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

/**
 * AccessDenied403
 *
 * Displayed when a user attempts to access a restricted
 * authority/municipality page without proper clearance.
 */
const AccessDenied403 = () => {
  return (
    <div className="error-page error-403">
      {/* Decorative background shapes */}
      <div className="error-bg-shape error-bg-1"></div>
      <div className="error-bg-shape error-bg-2"></div>

      <div className="error-card">
        {/* Large 403 graphic with lock */}
        <div className="error-code-wrapper error-code-403">
          <span className="error-code">403</span>
          <span className="error-icon">🔒</span>
        </div>

        <h1 className="error-title">Access Denied.</h1>
        <p className="error-subtitle">
          You do not have the required municipal authority clearance to view this page.
        </p>

        <Link to="/citizen-dashboard" className="error-btn error-btn-warning">
          Back to Citizen Portal
        </Link>

        <Link to="/" className="error-link">
          ← Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default AccessDenied403;
