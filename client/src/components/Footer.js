import React from 'react';
import '../styles/Footer.css';

const Footer = ({ onNavClick }) => {
  const currentYear = new Date().getFullYear();
  const handleQuickLinkClick = (page) => {
    if (onNavClick) {
      onNavClick(page);
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* About Section */}
          <div className="footer-section">
            <h4>About MusicPlayer</h4>
            <p>Your favorite music player with modern design and powerful features.</p>
            <button type="button" className="footer-link" onClick={() => handleQuickLinkClick('about')}>
              About Developer
            </button>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('home')}>Home</button></li>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('playlist')}>Playlists</button></li>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('artists')}>Artists</button></li>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('favorites')}>Favorites</button></li>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('recent')}>Recent</button></li>
            </ul>
          </div>

          {/* Resources */}
          <div className="footer-section">
            <h4>Resources</h4>
            <ul>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('help-center')}>Help Center</button></li>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('documentation')}>Documentation</button></li>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('support')}>Support</button></li>
              <li><button type="button" className="footer-link" onClick={() => handleQuickLinkClick('feedback')}>Feedback</button></li>
            </ul>
          </div>

          {/* Social Media */}
          <div className="footer-section">
            <h4>Follow Us</h4>
            <div className="social-links">
              <a href="#facebook" className="social-icon">f</a>
              <a href="#twitter" className="social-icon">𝕏</a>
              <a href="#instagram" className="social-icon">📷</a>
              <a href="#youtube" className="social-icon">▶️</a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} MusicPlayer. All rights reserved.</p>
          </div>
          <div className="footer-legal">
            <a href="#privacy">Privacy Policy</a>
            <span className="separator">•</span>
            <a href="#terms">Terms of Service</a>
            <span className="separator">•</span>
            <a href="#cookies">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
