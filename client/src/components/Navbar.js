import React, { useState } from 'react';
import '../styles/Navbar.css';

const Navbar = ({ onNavClick, isAdmin, userName, onLogout }) => {
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
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => handleNavClick('home')}>
          ♪ MusicPlayer
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? '✕' : '☰'}
        </button>

        <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
          <li>
            <button className="nav-btn" onClick={() => handleNavClick('home')}>
              🏠 Home
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => handleNavClick('playlist')}>
              📝 Playlist
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => handleNavClick('recent')}>
              🕒 Recent
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => handleNavClick('favorites')}>
              ❤️ Favorites
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => handleNavClick('analytics')}>
              📊 Analytics
            </button>
          </li>
          <li>
            <button className="nav-btn" onClick={() => handleNavClick('upload-request')}>
              📤 Request Song
            </button>
          </li>
          {isAdmin && (
            <>
              <li>
                <button className="nav-btn admin-btn" onClick={() => handleNavClick('admin-requests')}>
                  🔔 Admin Requests
                </button>
              </li>
              <li>
                <button className="nav-btn upload-btn" onClick={() => handleNavClick('upload')}>
                  📁 Upload (Admin)
                </button>
              </li>
            </>
          )}
          <li>
            <div className="user-info">
              <span className="user-icon">👤</span>
              <span className="user-name">{userName}</span>
            </div>
          </li>
          <li>
            <button className="nav-btn logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;