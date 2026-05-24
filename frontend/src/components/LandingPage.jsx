import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="logo">
            <span className="logo-icon">🌍</span>
            <span className="logo-text">LoclyAI</span>
          </div>
          <div className="header-actions">
            <Link to="/auth" className="btn-citizen">Citizen Login</Link>
            <Link to="/authority-auth" className="btn-authority">Authority Login</Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-container">
          <div className="hero-content">
            <div className="badge">🌍 Your City, Fixed Faster.</div>
            <h1 className="hero-title">
              Spot an issue, snap a photo, let <span className="highlight">AI</span> report it.
            </h1>
            <p className="hero-description">
              Spot a civic issue? Don't ignore it—report it in seconds. LoclyAI uses advanced artificial 
              intelligence to instantly analyze civic hazards and report them directly to the municipality, 
              complete with verified locations.
            </p>
            <p className="hero-subtext">No long forms. No waiting on hold. Just snap and send.</p>
            <div className="hero-buttons">
              <button className="btn-primary">
                <span className="btn-icon">📸</span>
                Report an Issue
              </button>
              <button className="btn-secondary">
                <span className="btn-icon">🏛️</span>
                Municipality Dashboard
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <img 
              src="/images/smart_city_hero.png" 
              alt="LoclyAI Smart City Interface" 
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* For Citizens Section */}
      <section className="citizens-section">
        <div className="section-header">
          <span className="section-tag">For Citizens</span>
          <h2>How It Works</h2>
          <p>Report civic issues in 3 simple steps</p>
        </div>
        
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-number">1</div>
            <div className="step-icon-wrapper">
              <span className="step-icon">📸</span>
            </div>
            <h3>Spot It &amp; Snap It</h3>
            <p>
              Open LoclyAI and tap "Report an Issue." Our secure Live Camera opens instantly. 
              Point your phone at the problem—whether it's a pothole, an open manhole, or a fallen 
              traffic sign—and snap a picture.
            </p>
            <div className="step-note">
              <span className="note-icon">🔒</span>
              <small>Gallery uploads are disabled—all photos must be taken live for authenticity.</small>
            </div>
          </div>

          <div className="step-card step-card-featured">
            <div className="step-number">2</div>
            <div className="step-icon-wrapper">
              <span className="step-icon">🤖</span>
            </div>
            <h3>AI &amp; Auto-Location</h3>
            <p>
              No typing needed. The moment you take the photo, LoclyAI's Vision AI (powered by YOLOv8) 
              instantly identifies and classifies the hazard. Simultaneously, GPS coordinates are captured 
              to pinpoint the exact location for city workers.
            </p>
            <div className="step-tag">Fully Automated</div>
          </div>

          <div className="step-card">
            <div className="step-number">3</div>
            <div className="step-icon-wrapper">
              <span className="step-icon">✅</span>
            </div>
            <h3>Confirm &amp; Track</h3>
            <p>
              Review the AI's assessment (e.g., "Garbage Pile Detected – 92% Confidence"), 
              hit Submit, and you're done! Track the real-time status in your 
              "My Complaints" dashboard until it's marked Resolved.
            </p>
            <div className="step-tag">Real-time Updates</div>
          </div>
        </div>
      </section>

      {/* For Municipalities Section */}
      <section className="municipalities-section">
        <div className="municipalities-container">
          <div className="municipalities-content">
            <span className="section-tag section-tag-alt">For Municipalities</span>
            <h2>The Ultimate Authority Dashboard</h2>
            <p className="subtitle">Empower your city workforce with AI-driven tools.</p>

            <div className="benefits-grid">
              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <span className="benefit-icon">🧠</span>
                </div>
                <strong>AI Issue Clustering</strong>
                <span>Automatically groups duplicate reports to cut noise and prevent spam.</span>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <span className="benefit-icon">🗺️</span>
                </div>
                <strong>Live City Heatmaps</strong>
                <span>Visualize problem areas in real-time to allocate resources effectively.</span>
              </div>

              <div className="benefit-card">
                <div className="benefit-icon-wrapper">
                  <span className="benefit-icon">🚀</span>
                </div>
                <strong>Auto-Dispatching</strong>
                <span>Smartly route verified issues to the correct department instantly.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-left">
            <div className="footer-logo">🌍 LoclyAI</div>
            <p className="footer-tagline">Your city, fixed faster.</p>
          </div>
          <div className="footer-links">
            <a href="#contact">Contact Us</a>
            <a href="#login" className="authority-link">Authority Login</a>
          </div>
          <div className="copyright">
            &copy; {new Date().getFullYear()} LoclyAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
