import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import '../styles/Recent.css';

const Recent = ({ onSongSelect, onToast, favorites, onToggleFavorite }) => {
  const [recentSongs, setRecentSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const safeFavorites = Array.isArray(favorites) ? favorites : [];

  const fetchRecentSongs = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view recent songs');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/recent', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.recent) {
        // Extract songs from the recent entries
        const songs = data.recent.map(recent => ({
          ...recent.song,
          playedAt: recent.playedAt
        })).filter(song => song._id); // Filter out any null songs

        setRecentSongs(songs);
      } else {
        setError(data.message || 'Failed to load recent songs');
      }
    } catch (err) {
      console.error('Error fetching recent songs:', err);
      setError('Failed to load recent songs. Please try again.');
      onToast?.('Error loading recent songs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentSongs();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatPlayedAt = (playedAt) => {
    if (!playedAt) return '';

    const date = new Date(playedAt);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const minutes = Math.floor(diffMs / (1000 * 60));
      return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)} hours ago`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const clearRecent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        onToast?.('Please login to clear recent songs', 'error');
        return;
      }

      const response = await fetch('http://localhost:5000/api/recent/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        onToast?.('Recent songs cleared', 'info');
        setRecentSongs([]);
      } else {
        onToast?.(data.message || 'Failed to clear recent songs', 'error');
      }
    } catch (err) {
      console.error('Error clearing recent songs:', err);
      onToast?.('Failed to clear recent songs', 'error');
    }
  };

  const handleToggleFavorite = (song) => {
    if (onToggleFavorite) {
      onToggleFavorite(song);
    }
  };

  const isFavorited = (songId) => safeFavorites.includes(songId);

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading your recent songs...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="recent-error-state">
          <h2>Recent Songs</h2>
          <div className="error-message recent-error-message">
            <p>{error}</p>
            <button
              className="retry-btn"
              onClick={fetchRecentSongs}
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="recent-header-card">
        <div className="recent-header-content">
          <p className="recent-kicker">Your listening history</p>
          <h1>Recently Played</h1>
          <p className="recent-subtitle">Quickly jump back to tracks you played lately.</p>
        </div>

        <div className="recent-header-actions">
          <button className="recent-refresh-btn" onClick={fetchRecentSongs} title="Refresh recent songs">
            Refresh
          </button>
          {recentSongs.length > 0 && (
            <button
              className="clear-recent-btn"
              onClick={clearRecent}
              title="Clear recent songs"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {recentSongs.length === 0 ? (
        <div className="no-recent recent-empty-state">
          <div className="no-recent-content">
            <h2>No Recent Songs</h2>
            <p>Start playing some music to see your recently played songs here!</p>
            <div className="music-icon">♪</div>
          </div>
        </div>
      ) : (
        <div className="recent-songs-section">
          <div className="recent-summary-row">
            <span>{recentSongs.length} tracks in history</span>
            <span>Updated just now</span>
          </div>

          <div className="recent-songs-list">
            {recentSongs.map((song, index) => (
              <div key={`${song._id}-${index}`} className="recent-song-item">
                <div className="recent-song-number">{index + 1}</div>

                <div className="recent-cover-wrap" onClick={() => onSongSelect(song)}>
                  {song.cover ? (
                    <img src={song.cover} alt={song.title} className="recent-song-cover" />
                  ) : (
                    <div className="recent-song-cover recent-song-cover-fallback">♪</div>
                  )}
                </div>

                <div className="recent-song-info">
                  <div className="recent-song-details">
                    <h3>{song.title}</h3>
                    <p>{song.artist}</p>
                  </div>
                  <div className="recent-played-at">
                    <span className="played-time">
                      {formatPlayedAt(song.playedAt)}
                    </span>
                  </div>
                </div>

                <div className="recent-song-actions">
                  <button
                    className={`favorite-recent-btn ${isFavorited(song._id) ? 'favorited' : ''}`}
                    onClick={() => handleToggleFavorite(song)}
                    title={isFavorited(song._id) ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    {isFavorited(song._id) ? 'Favorited' : 'Favorite'}
                  </button>
                  <button
                    className="play-recent-btn"
                    onClick={() => onSongSelect(song)}
                    title="Play"
                  >
                    Play
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recent;