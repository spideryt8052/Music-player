import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import '../styles/Playlist.css';
import SongCard from '../components/SongCard';

const Playlist = ({ onSongSelect, onToast, favorites, onToggleFavorite }) => {
  const [playlists, setPlaylists] = useState([]);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const songsRes = await fetch('http://localhost:5000/api/songs');
      const songsData = await songsRes.json();

      if (songsData.songs) {
        setAllSongs(songsData.songs);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      onToast('Error loading songs', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    loadPlaylists();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPlaylists = () => {
    const savedPlaylists = localStorage.getItem('userPlaylists');
    if (savedPlaylists) {
      setPlaylists(JSON.parse(savedPlaylists));
    }
  };

  const savePlaylists = (updatedPlaylists) => {
    localStorage.setItem('userPlaylists', JSON.stringify(updatedPlaylists));
    setPlaylists(updatedPlaylists);
  };

  const createPlaylist = () => {
    if (!newPlaylistName.trim()) {
      onToast('Please enter a playlist name', 'error');
      return;
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      songs: [],
      createdAt: new Date().toISOString(),
    };

    const updatedPlaylists = [...playlists, newPlaylist];
    savePlaylists(updatedPlaylists);
    setNewPlaylistName('');
    setShowCreateForm(false);
    setCurrentPlaylist(newPlaylist);
    onToast(`Playlist "${newPlaylist.name}" created!`, 'success');
  };

  const deletePlaylist = (playlistId) => {
    const updatedPlaylists = playlists.filter(p => p.id !== playlistId);
    savePlaylists(updatedPlaylists);

    if (currentPlaylist && currentPlaylist.id === playlistId) {
      setCurrentPlaylist(null);
    }

    onToast('Playlist deleted', 'info');
  };

  const addSongToPlaylist = (song) => {
    if (!currentPlaylist) {
      onToast('Please select a playlist first', 'error');
      return;
    }

    const isAlreadyInPlaylist = currentPlaylist.songs.some(s => s._id === song._id);
    if (isAlreadyInPlaylist) {
      onToast('Song already in playlist', 'warning');
      return;
    }

    const updatedPlaylist = {
      ...currentPlaylist,
      songs: [...currentPlaylist.songs, song]
    };

    const updatedPlaylists = playlists.map(p =>
      p.id === currentPlaylist.id ? updatedPlaylist : p
    );

    savePlaylists(updatedPlaylists);
    setCurrentPlaylist(updatedPlaylist);
    onToast(`Added "${song.title}" to playlist`, 'success');
  };

  const removeSongFromPlaylist = (songId) => {
    if (!currentPlaylist) return;

    const updatedPlaylist = {
      ...currentPlaylist,
      songs: currentPlaylist.songs.filter(s => s._id !== songId)
    };

    const updatedPlaylists = playlists.map(p =>
      p.id === currentPlaylist.id ? updatedPlaylist : p
    );

    savePlaylists(updatedPlaylists);
    setCurrentPlaylist(updatedPlaylist);
    onToast('Song removed from playlist', 'info');
  };

  const filteredSongs = allSongs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading playlists...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <h1>🎵 My Playlists</h1>
        <button
          className="create-playlist-btn"
          onClick={() => setShowCreateForm(true)}
        >
          ➕ Create Playlist
        </button>
      </div>

      {/* Create Playlist Form */}
      {showCreateForm && (
        <div className="create-playlist-form">
          <div className="form-overlay" onClick={() => setShowCreateForm(false)}></div>
          <div className="form-content">
            <h3>Create New Playlist</h3>
            <input
              type="text"
              placeholder="Playlist name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && createPlaylist()}
            />
            <div className="form-buttons">
              <button onClick={createPlaylist}>Create</button>
              <button onClick={() => setShowCreateForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="playlist-content">
        {/* Playlists Sidebar */}
        <div className="playlists-sidebar">
          <h2>Your Playlists</h2>
          {playlists.length === 0 ? (
            <p className="no-playlists">No playlists yet. Create your first playlist!</p>
          ) : (
            <div className="playlist-list">
              {playlists.map(playlist => (
                <div
                  key={playlist.id}
                  className={`playlist-item ${currentPlaylist?.id === playlist.id ? 'active' : ''}`}
                  onClick={() => setCurrentPlaylist(playlist)}
                >
                  <div className="playlist-info">
                    <h3>{playlist.name}</h3>
                    <p>{playlist.songs.length} songs</p>
                  </div>
                  <button
                    className="delete-playlist-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePlaylist(playlist.id);
                    }}
                    title="Delete playlist"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="playlist-main">
          {currentPlaylist ? (
            <>
              {/* Current Playlist */}
              <div className="current-playlist">
                <h2>{currentPlaylist.name}</h2>
                <p className="playlist-stats">
                  {currentPlaylist.songs.length} songs • Created {new Date(currentPlaylist.createdAt).toLocaleDateString()}
                </p>

                {currentPlaylist.songs.length === 0 ? (
                  <div className="empty-playlist">
                    <p>🎵 This playlist is empty</p>
                    <p>Add songs from the library below</p>
                  </div>
                ) : (
                  <div className="playlist-songs">
                    {currentPlaylist.songs.map((song, index) => (
                      <div key={song._id} className="playlist-song-item">
                        <div className="song-number">{index + 1}</div>
                        <div className="song-details">
                          <h4>{song.title}</h4>
                          <p>{song.artist}</p>
                        </div>
                        <div className="song-actions">
                          <button
                            className="play-btn"
                            onClick={() => onSongSelect(song)}
                            title="Play"
                          >
                            ▶️
                          </button>
                          <button
                            className="remove-btn"
                            onClick={() => removeSongFromPlaylist(song._id)}
                            title="Remove from playlist"
                          >
                            ❌
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add Songs Section */}
              <div className="add-songs-section">
                <h3>Add Songs to Playlist</h3>
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search songs to add..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="songs-grid">
                  {filteredSongs.map(song => (
                    <div key={song._id} className="song-add-card">
                      <SongCard
                        song={song}
                        onPlay={() => addSongToPlaylist(song)}
                        onToggleFavorite={onToggleFavorite}
                        isFavorited={favorites.includes(song._id)}
                      />
                      <button
                        className="add-to-playlist-btn"
                        onClick={() => addSongToPlaylist(song)}
                        title="Add to playlist"
                      >
                        ➕ Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="select-playlist">
              <h2>Select a Playlist</h2>
              <p>Choose a playlist from the sidebar or create a new one to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Playlist;