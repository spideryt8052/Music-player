import React, { useState, useEffect } from 'react';
import '../styles/Analytics.css';

const Analytics = () => {
  const [topSongs, setTopSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(10);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchMostPlayedSongs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/songs/most-played?limit=${limit}`);
        const data = await response.json();

        if (data.success) {
          setTopSongs(data.songs);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMostPlayedSongs();
  }, [limit]);

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h2>📊 Analytics - Most Played Songs</h2>
        <select value={limit} onChange={(e) => setLimit(parseInt(e.target.value))} className="limit-select">
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
          <option value={50}>Top 50</option>
        </select>
      </div>

      {isLoading ? (
        <div className="loading-spinner">Loading analytics...</div>
      ) : topSongs.length === 0 ? (
        <div className="no-data">No songs yet</div>
      ) : (
        <div className="analytics-grid">
          <div className="stats-summary">
            <div className="stat-card">
              <h4>Total Songs</h4>
              <p className="stat-number">{topSongs.length}</p>
            </div>
            <div className="stat-card">
              <h4>Total Plays</h4>
              <p className="stat-number">
                {topSongs.reduce((sum, song) => sum + song.playCount, 0).toLocaleString()}
              </p>
            </div>
            <div className="stat-card">
              <h4>Most Played</h4>
              <p className="stat-number">{topSongs[0]?.playCount || 0}</p>
            </div>
          </div>

          <div className="songs-table">
            <h3>🎵 Top Tracks</h3>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Plays</th>
                  <th>Uploaded By</th>
                </tr>
              </thead>
              <tbody>
                {topSongs.map((song, index) => (
                  <tr key={song._id} className={index < 3 ? 'top-rank' : ''}>
                    <td className="rank">
                      {index === 0 && '🥇'}
                      {index === 1 && '🥈'}
                      {index === 2 && '🥉'}
                      {index > 2 && `#${index + 1}`}
                    </td>
                    <td className="title">{song.title}</td>
                    <td className="artist">{song.artist}</td>
                    <td className="plays">
                      <span className="play-badge">{song.playCount.toLocaleString()}</span>
                    </td>
                    <td className="uploader">{song.uploadedBy?.username || 'System'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
