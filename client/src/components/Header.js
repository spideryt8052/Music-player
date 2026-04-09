import React, { useState } from 'react';
import '../styles/Header.css';

const Header = ({ onNavClick, isAdmin, userName, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (page) => {
    onNavClick(page);
    setMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    setMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="header-logo" onClick={() => handleNavClick('home')}>
          <span className="logo-icon">♪</span>
          <span className="logo-text">MusicPlayer</span>
        </div>

        {/* Menu Toggle (Mobile) */}
        <button 
          className="menu-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle Menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        {/* Navigation Menu */}
        <nav className={`header-nav ${menuOpen ? 'active' : ''}`}>
          <div className="nav-links">
            <button className="nav-link" onClick={() => handleNavClick('home')}>
              🏠 Home
            </button>
            <button className="nav-link" onClick={() => handleNavClick('playlist')}>
              📝 Playlist
            </button>
            <button className="nav-link" onClick={() => handleNavClick('artists')}>
              🎤 Artists
            </button>
            <button className="nav-link" onClick={() => handleNavClick('recent')}>
              🕒 Recent
            </button>
            <button className="nav-link" onClick={() => handleNavClick('favorites')}>
              ❤️ Favorites
            </button>
            {isAdmin ? (
              <>
                <button className="nav-link admin-upload-link" onClick={() => handleNavClick('upload')}>
                  📁 Upload Song
                </button>
                <button className="nav-link" onClick={() => handleNavClick('admin-coupons')}>
                  💳 Manage Coupons
                </button>
                <button className="nav-link admin-link" onClick={() => handleNavClick('admin-requests')}>
                  🔔 Admin Panel
                </button>
              </>
            ) : (
              <>
                <button className="nav-link" onClick={() => handleNavClick('upload-request')}>
                  📤 Request Song
                </button>
                <button className="nav-link" onClick={() => handleNavClick('subscription')}>
                  ✨ Subscribe
                </button>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="header-user-menu">
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-name">{userName}</span>
            </div>
            <button 
              className="nav-link logout-link" 
              onClick={handleLogout}
            >
              🚪 Logout
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
