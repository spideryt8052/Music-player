import React, { useState, useEffect } from 'react';
import '../styles/AdModal.css';

const AdModal = ({ isVisible, onClose, onUpgrade }) => {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (!isVisible) {
      setTimeLeft(30);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="ad-modal-overlay">
      <div className="ad-modal-container">
        <div className="ad-header">
          <h3>Listening Break</h3>
          <span className="ad-timer">{timeLeft}s</span>
        </div>

        <div className="ad-content">
          <div className="ad-placeholder">
            <div className="ad-image">
              <svg viewBox="0 0 200 140" className="ad-icon">
                <rect width="200" height="140" fill="#f0f0f0" />
                <circle cx="100" cy="70" r="30" fill="#ddd" />
                <path d="M75 50 L125 70 L75 90 Z" fill="#999" />
              </svg>
            </div>
            <h2>Upgrade to Premium</h2>
            <p>Enjoy uninterrupted music and ad-free listening.</p>
            <button className="ad-upgrade-btn" onClick={onUpgrade}>
              Upgrade Now
            </button>
          </div>
        </div>

        <div className="ad-footer">
          <p className="ad-message">
            Music is paused during this short break.
          </p>
          {timeLeft > 0 && (
            <p className="ad-countdown">
              Ad will close in {timeLeft} second{timeLeft !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdModal;
