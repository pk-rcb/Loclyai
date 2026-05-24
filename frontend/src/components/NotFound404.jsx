import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPages.css';

/**
 * NotFound404
 *
 * Displayed when a user navigates to a route that doesn't exist.
 * Themed to match the civic/city aesthetic of LoclyAI.
 */
const NotFound404 = () => {
  return (
    <div className="error-page error-404">
      {/* Decorative background shapes */}
      <div className="error-bg-shape error-bg-1"></div>
      <div className="error-bg-shape error-bg-2"></div>

      <div className="error-card">
        {/* Large 404 graphic */}
        <div className="error-code-wrapper error-code-404">
          <span className="error-code">404</span>
          <span className="error-icon">🚧</span>
        </div>

        <h1 className="error-title">Oops! We couldn't find that street.</h1>
        <p className="error-subtitle">
          The page you are looking for doesn't exist or has been moved.
        </p>

        <Link to="/citizen-dashboard" className="error-btn error-btn-primary">
          Return to Dashboard
        </Link>

        <Link to="/" className="error-link">
          ← Go to Homepage
        </Link>
      </div>
    </div>
  );
};

export default NotFound404;
