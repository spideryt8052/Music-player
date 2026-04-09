import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import '../styles/Favorites.css';
import SongCard from '../components/SongCard';

const Favorites = ({ onSongSelect, onToast, favorites, onToggleFavorite }) => {
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all songs for adding to favorites
      const songsRes = await fetch('http://localhost:5000/api/songs');
      const songsData = await songsRes.json();

      if (songsData.songs) {
        setAllSongs(songsData.songs);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Please try again.');
      onToast('Error loading favorites', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const favoriteSongs = allSongs.filter(song => favorites.includes(song._id));

  const filteredSongs = allSongs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading favorites...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <div className="error-section">
          <h2>❤️ My Favorites</h2>
          <div className="error-message">
            <p>⚠️ {error}</p>
            <button
              className="retry-btn"
              onClick={fetchData}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <h1>❤️ My Favorites</h1>
        <div className="favorites-stats">
          <span>{favorites.length} favorite{favorites.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="no-favorites">
          <div className="no-favorites-content">
            <h2>No Favorites Yet</h2>
            <p>Start adding songs to your favorites to see them here!</p>
            <div className="heart-icon">❤️</div>
          </div>
        </div>
      ) : (
        <div className="favorites-section">
          <div className="favorites-grid">
            {favoriteSongs.map((song) => (
              <div key={song._id} className="favorite-item">
                <SongCard
                  song={song}
                  onPlay={() => onSongSelect(song)}
                  onToggleFavorite={() => onToggleFavorite(song)}
                  isFavorited={true}
                />
                <div className="favorite-actions">
                  <button
                    className="remove-favorite-btn"
                    onClick={() => onToggleFavorite(song)}
                    title="Remove from favorites"
                  >
                    💔 Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add More Favorites Section */}
      <div className="add-favorites-section">
        <h3>Add More Favorites</h3>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search songs to add to favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="songs-grid">
          {filteredSongs
            .filter(song => !favorites.includes(song._id)) // Only show songs not already favorited
            .map(song => (
            <div key={song._id} className="song-add-card">
              <SongCard
                song={song}
                onPlay={() => onSongSelect(song)}
                onToggleFavorite={() => onToggleFavorite(song)}
                isFavorited={false}
              />
              <button
                className="add-to-favorites-btn"
                onClick={() => onToggleFavorite(song)}
                title="Add to favorites"
              >
                ❤️ Add
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;