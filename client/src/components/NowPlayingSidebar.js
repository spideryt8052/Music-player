import React, { useState } from 'react';
import '../styles/NowPlayingSidebar.css';

const NowPlayingSidebar = ({ currentSong, isFavorited, onToggleFavorite, onClose }) => {
  const [isMiniMode, setIsMiniMode] = useState(false);

  if (!currentSong) return null;

  const durationText = currentSong.duration
    ? `${Math.floor(currentSong.duration / 60)}:${(currentSong.duration % 60).toString().padStart(2, '0')}`
    : 'Unknown';

  const uploadedText = currentSong.createdAt
    ? new Date(currentSong.createdAt).toLocaleDateString()
    : 'Unknown';

  return (
    <div className={`now-playing-sidebar ${isMiniMode ? 'mini-mode' : ''}`}>
      <div className="sidebar-header">
        <h3>Now Playing</h3>
        <div className="sidebar-header-actions">
          <button
            className="mini-toggle"
            onClick={() => setIsMiniMode(prev => !prev)}
            title={isMiniMode ? 'Expand view' : 'Mini view'}
          >
            {isMiniMode ? 'Expand' : 'Mini'}
          </button>
          <button className="close-sidebar" onClick={onClose} title="Close">
            ✕
          </button>
        </div>
      </div>

      <div className="song-display-card">
        <div className="album-art-large">
          {currentSong.cover ? (
            <img src={currentSong.cover} alt={currentSong.title} />
          ) : (
            <div className="album-placeholder">♪</div>
          )}
        </div>

        <div className="song-info-large">
          <h2 className="song-title-large">{currentSong.title}</h2>
          <p className="song-artist-large">{currentSong.artist}</p>
          {!isMiniMode && <p className="song-genre">{currentSong.genre || 'Unknown Genre'}</p>}
        </div>

        <div className="song-actions">
          <button
            className={`favorite-btn-large ${isFavorited ? 'favorited' : ''}`}
            onClick={() => onToggleFavorite(currentSong)}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
        </div>
      </div>

      {!isMiniMode && (
        <div className="song-details">
          <div className="detail-item">
            <span className="detail-label">Duration</span>
            <span className="detail-value">{durationText}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Plays</span>
            <span className="detail-value">{currentSong.playCount || 0}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Uploaded</span>
            <span className="detail-value">{uploadedText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default NowPlayingSidebar;