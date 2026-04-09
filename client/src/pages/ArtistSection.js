import React, { useMemo } from 'react';
import '../styles/Artists.css';
import SongCard from '../components/SongCard';

const ArtistSection = ({ artist, songs = [], onSongSelect, onToggleFavorite, favorites = [], onBack }) => {
  const artistSongs = useMemo(() => {
    if (!artist?.name) {
      return [];
    }

    const target = artist.name.trim().toLowerCase();
    return songs
      .filter((song) => (song.artist || '').trim().toLowerCase() === target)
      .sort((a, b) => (b.playCount || 0) - (a.playCount || 0));
  }, [artist, songs]);

  const topSong = artistSongs[0];
  const genres = Array.from(new Set(artistSongs.map((song) => song.genre).filter(Boolean)));

  if (!artist) {
    return (
      <div className="artist-section-page fade-in-up">
        <section className="section">
          <h2>Artist section unavailable</h2>
          <p className="text-secondary">Choose an artist first to open their dedicated page.</p>
          <button type="button" className="btn-primary" onClick={onBack}>
            Back to Artists
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="artist-section-page fade-in-up">
      <section className="artist-section-hero section">
        <div className="artist-section-hero-copy">
          <button type="button" className="btn-secondary artist-back-btn" onClick={onBack}>
            ← Back to Artists
          </button>
          <span className="artist-kicker">Artist Section</span>
          <h1>{artist.name}</h1>
          <p>
            Explore the full section for this artist, including their most played songs and every track
            currently in your library.
          </p>
        </div>
        <div className="artist-stat-panel">
          <div className="artist-stat">
            <strong>{artistSongs.length}</strong>
            <span>Songs</span>
          </div>
          <div className="artist-stat">
            <strong>{genres.length || 1}</strong>
            <span>Genres</span>
          </div>
          <div className="artist-stat">
            <strong>{artistSongs.reduce((total, song) => total + (song.playCount || 0), 0)}</strong>
            <span>Total Plays</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>About This Artist</h2>
          <span className="artist-count-badge">{artistSongs.length} tracks</span>
        </div>
        <div className="artist-info-grid">
          <div className="artist-info-card">
            <h3>Top track</h3>
            <p>{topSong ? topSong.title : 'No track available'}</p>
          </div>
          <div className="artist-info-card">
            <h3>Genres</h3>
            <p>{genres.length > 0 ? genres.join(', ') : 'Genre not specified'}</p>
          </div>
          <div className="artist-info-card">
            <h3>Library status</h3>
            <p>{artistSongs.length > 0 ? 'Ready to play' : 'No songs in this section yet'}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Top Songs</h2>
          <span className="artist-count-badge">By plays</span>
        </div>
        <div className="songs-grid">
          {artistSongs.length > 0 ? (
            artistSongs.slice(0, 8).map((song, index) => (
              <SongCard
                key={song._id}
                song={song}
                rank={index + 1}
                onPlay={onSongSelect}
                onToggleFavorite={onToggleFavorite}
                isFavorited={favorites.includes(song._id)}
              />
            ))
          ) : (
            <p className="no-songs">No songs found for this artist.</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>All Songs</h2>
          <span className="artist-count-badge">Full catalog</span>
        </div>
        <div className="songs-grid">
          {artistSongs.length > 0 ? (
            artistSongs.map((song) => (
              <SongCard
                key={song._id}
                song={song}
                onPlay={onSongSelect}
                onToggleFavorite={onToggleFavorite}
                isFavorited={favorites.includes(song._id)}
              />
            ))
          ) : (
            <p className="no-songs">No songs available in this artist section.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default ArtistSection;
