import React, { useMemo, useState } from 'react';
import '../styles/Artists.css';
import SongCard from '../components/SongCard';

const normalizeArtist = (artist) => (artist || 'Unknown Artist').trim();

const buildArtistDirectory = (songs = []) => {
  const artistMap = new Map();

  songs.forEach((song) => {
    const artistName = normalizeArtist(song.artist);
    const artistKey = artistName.toLowerCase();
    const existing = artistMap.get(artistKey);

    if (!existing) {
      artistMap.set(artistKey, {
        name: artistName,
        songs: [song],
        genres: song.genre ? [song.genre] : [],
        totalPlays: song.playCount || 0,
        latestSong: song,
      });
      return;
    }

    existing.songs.push(song);
    existing.totalPlays += song.playCount || 0;
    existing.latestSong = new Date(song.createdAt || 0) > new Date(existing.latestSong?.createdAt || 0)
      ? song
      : existing.latestSong;

    if (song.genre && !existing.genres.includes(song.genre)) {
      existing.genres.push(song.genre);
    }
  });

  return Array.from(artistMap.values())
    .sort((a, b) => {
      if (b.songs.length !== a.songs.length) return b.songs.length - a.songs.length;
      return a.name.localeCompare(b.name);
    })
    .map((artist) => ({
      ...artist,
      topSongs: [...artist.songs].sort((a, b) => (b.playCount || 0) - (a.playCount || 0)).slice(0, 3),
    }));
};

const Artists = ({ songs = [], onSongSelect, onToggleFavorite, favorites = [], onSelectArtist }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const artists = useMemo(() => buildArtistDirectory(songs), [songs]);

  const filteredArtists = artists.filter((artist) => {
    const query = searchTerm.toLowerCase();
    return (
      artist.name.toLowerCase().includes(query) ||
      artist.genres.some((genre) => genre.toLowerCase().includes(query)) ||
      artist.songs.some((song) => song.title?.toLowerCase().includes(query))
    );
  });

  const featuredArtists = filteredArtists.slice(0, 6);

  return (
    <div className="artists-page fade-in-up">
      <section className="artist-hero section">
        <div className="artist-hero-copy">
          <span className="artist-kicker">Artist Library</span>
          <h1>Discover artists, explore their catalog, and jump into their best songs.</h1>
          <p>
            Browse the most active artists in your collection, then open a dedicated section page for
            deep listening.
          </p>
        </div>
        <div className="artist-search-wrap">
          <input
            type="text"
            className="artist-search"
            placeholder="Search artists, genres, or songs"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Featured Artists</h2>
          <span className="artist-count-badge">{filteredArtists.length} total</span>
        </div>

        <div className="artist-grid">
          {featuredArtists.length > 0 ? (
            featuredArtists.map((artist) => (
              <button
                key={artist.name}
                type="button"
                className="artist-card"
                onClick={() => onSelectArtist(artist)}
              >
                <div className="artist-avatar">
                  {artist.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="artist-card-body">
                  <h3>{artist.name}</h3>
                  <p>{artist.songs.length} songs</p>
                  <div className="artist-meta-row">
                    <span>{artist.totalPlays} plays</span>
                    <span>{artist.genres.length || 1} genres</span>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <p className="no-songs">No artists found for "{searchTerm}"</p>
          )}
        </div>
      </section>

      <section className="section">
        <div className="section-header">
          <h2>Popular Tracks by Artist</h2>
          <span className="artist-count-badge">Top picks</span>
        </div>

        <div className="artist-track-list">
          {featuredArtists.length > 0 ? (
            featuredArtists.map((artist) => (
              <article key={artist.name} className="artist-track-block">
                <div className="artist-track-header">
                  <div>
                    <h3>{artist.name}</h3>
                    <p>{artist.songs.length} songs in collection</p>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => onSelectArtist(artist)}>
                    Open section
                  </button>
                </div>
                <div className="songs-grid">
                  {artist.topSongs.map((song) => (
                    <SongCard
                      key={song._id}
                      song={song}
                      onPlay={onSongSelect}
                      onToggleFavorite={onToggleFavorite}
                      isFavorited={favorites.includes(song._id)}
                    />
                  ))}
                </div>
              </article>
            ))
          ) : (
            <p className="no-songs">No artist tracks available yet.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Artists;
