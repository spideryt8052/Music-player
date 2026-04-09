import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import SongCard from '../components/SongCard';
import AdsenseBanner from '../components/AdsenseBanner';

const Home = ({
  onSongSelect,
  onToast,
  favorites,
  onToggleFavorite,
  onSelectArtist,
  onOpenArtistsPage,
  showAds = false,
}) => {
  const [featured, setFeatured] = useState([]);
  const [recent, setRecent] = useState([]);
  const [topCharts, setTopCharts] = useState([]);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all songs
      const songsRes = await fetch('http://localhost:5000/api/songs');
      const songsData = await songsRes.json();
      
      // Fetch top charts
      const chartsRes = await fetch('http://localhost:5000/api/songs/most-played?limit=8');
      const chartsData = await chartsRes.json();
      
      // Fetch recent
      const recentRes = await fetch('http://localhost:5000/api/recent');
      const recentData = await recentRes.json();

      if (songsData.songs) {
        setAllSongs(songsData.songs);
        // Featured is first 8 songs
        setFeatured(songsData.songs.slice(0, 8));
      }
      
      if (chartsData.songs) {
        setTopCharts(chartsData.songs);
      }
      
      if (recentData.songs) {
        setRecent(recentData.songs.slice(0, 8));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      onToast('Error loading songs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const searchResults = allSongs.filter(song =>
    song.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const artistDirectory = allSongs.reduce((acc, song) => {
    const artistName = (song.artist || 'Unknown Artist').trim();
    const key = artistName.toLowerCase();
    const existing = acc.get(key);

    if (!existing) {
      acc.set(key, { name: artistName, count: 1, topSong: song });
      return acc;
    }

    existing.count += 1;
    if ((song.playCount || 0) > (existing.topSong?.playCount || 0)) {
      existing.topSong = song;
    }

    return acc;
  }, new Map());

  const homeArtists = Array.from(artistDirectory.values())
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, 8);

  if (loading) {
    return <div className="home-loading">🎵 Loading your music library...</div>;
  }

  return (
    <div className="home-container">
      {/* Search Bar */}
      <div className="home-search">
        <input
          type="text"
          placeholder="🔍 Search songs, artists..."
          value={searchTerm}
          onChange={handleSearch}
          className="search-input-home"
        />
      </div>

      {/* Show search results if searching */}
      {searchTerm && (
        <div className="section">
          <h2>🔎 Search Results ({searchResults.length})</h2>
          <div className="songs-grid">
            {searchResults.length > 0 ? (
              searchResults.map(song => (
                <SongCard 
                  key={song._id} 
                  song={song} 
                  onPlay={onSongSelect}
                  onToggleFavorite={onToggleFavorite}
                  isFavorited={favorites.includes(song._id)}
                />
              ))
            ) : (
              <p className="no-results">No songs found for "{searchTerm}"</p>
            )}
          </div>
        </div>
      )}

      {/* Featured Playlist */}
      {!searchTerm && (
        <>
          <div className="section">
            <div className="section-header">
              <h2>⭐ Featured</h2>
              <a href="#featured" className="see-all">See all</a>
            </div>
            <div className="songs-grid">
              {featured.length > 0 ? (
                featured.map(song => (
                  <SongCard 
                    key={song._id} 
                    song={song} 
                    onPlay={onSongSelect}
                    onToggleFavorite={onToggleFavorite}
                    isFavorited={favorites.includes(song._id)}
                  />
                ))
              ) : (
                <p className="no-songs">No songs available</p>
              )}
            </div>
          </div>

          {showAds && (
            <AdsenseBanner slot={process.env.REACT_APP_ADSENSE_SLOT_HOME_TOP} />
          )}

          {/* Top Charts */}
          <div className="section">
            <div className="section-header">
              <h2>🔥 Top Charts</h2>
              <a href="#charts" className="see-all">See all</a>
            </div>
            <div className="songs-grid">
              {topCharts.length > 0 ? (
                topCharts.map((song, idx) => (
                  <SongCard 
                    key={song._id} 
                    song={song} 
                    rank={idx + 1}
                    onPlay={onSongSelect}
                    onToggleFavorite={onToggleFavorite}
                    isFavorited={favorites.includes(song._id)}
                  />
                ))
              ) : (
                <p className="no-songs">No top charts yet</p>
              )}
            </div>
          </div>

          {/* Artists */}
          <div className="section">
            <div className="section-header">
              <h2>🎤 Artists</h2>
              <button type="button" className="see-all see-all-btn" onClick={onOpenArtistsPage}>
                See all artists
              </button>
            </div>
            <div className="home-artists-grid">
              {homeArtists.length > 0 ? (
                homeArtists.map((artist) => (
                  <button
                    key={artist.name}
                    type="button"
                    className="home-artist-card"
                    onClick={() => onSelectArtist?.({ name: artist.name })}
                  >
                    <div className="home-artist-avatar">{artist.name.charAt(0).toUpperCase()}</div>
                    <div className="home-artist-info">
                      <h3>{artist.name}</h3>
                      <p>{artist.count} songs</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="no-songs">No artists available</p>
              )}
            </div>
          </div>

          {showAds && (
            <AdsenseBanner slot={process.env.REACT_APP_ADSENSE_SLOT_HOME_MID} />
          )}

          {/* Recently Played */}
          {recent.length > 0 && (
            <div className="section">
              <div className="section-header">
                <h2>⏰ Recently Played</h2>
                <a href="#recent" className="see-all">See all</a>
              </div>
              <div className="songs-grid">
                {recent.map(song => (
                  <SongCard 
                    key={song._id} 
                    song={song} 
                    onPlay={onSongSelect}
                    onToggleFavorite={onToggleFavorite}
                    isFavorited={favorites.includes(song._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Songs */}
          <div className="section">
            <div className="section-header">
              <h2>🎵 All Songs</h2>
              <a href="#all" className="see-all">See all</a>
            </div>
            <div className="songs-grid">
              {allSongs.length > 0 ? (
                allSongs.map(song => (
                  <SongCard 
                    key={song._id} 
                    song={song} 
                    onPlay={onSongSelect}
                    onToggleFavorite={onToggleFavorite}
                    isFavorited={favorites.includes(song._id)}
                  />
                ))
              ) : (
                <p className="no-songs">No songs yet. Upload one!</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;