import React from 'react';
import '../styles/SongCard.css';

const SongCard = ({ song, rank, onPlay, onToggleFavorite, isFavorited }) => {
  const handlePlay = () => {
    if (onPlay) {
      onPlay(song);
    }
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation(); // Prevent triggering play when clicking favorite
    if (onToggleFavorite) {
      onToggleFavorite(song);
    }
  };

  return (
    <div className="song-card">
      <div className="song-card-image">
        {song.cover ? (
          <img src={song.cover} alt={song.title} />
        ) : (
          <div className="song-card-placeholder">♪</div>
        )}
        {rank && <div className="song-rank">#{rank}</div>}
        <button className="play-button" onClick={handlePlay} title="Play">
          ▶️
        </button>
        {onToggleFavorite && (
          <button
            className={`favorite-button ${isFavorited ? 'favorited' : ''}`}
            onClick={handleToggleFavorite}
            title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorited ? '❤️' : '🤍'}
          </button>
        )}
      </div>
      <div className="song-card-info">
        <h3 className="song-title">{song.title}</h3>
        <p className="song-artist">{song.artist}</p>
        {song.playCount !== undefined && (
          <p className="song-plays">{song.playCount} plays</p>
        )}
      </div>
    </div>
  );
};

export default SongCard;