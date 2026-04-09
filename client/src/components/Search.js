import React, { useState, useEffect } from 'react';
import '../styles/Search.css';

const Search = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const performSearch = async (searchTerm) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/songs?search=${encodeURIComponent(searchTerm)}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.songs);
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (song) => {
    onSearch(song);
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 Search songs, artists..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          className="search-input"
        />
        {query && (
          <button className="clear-btn" onClick={() => { setQuery(''); setShowResults(false); }}>
            ✕
          </button>
        )}
      </div>

      {showResults && (
        <div className="search-results">
          {isLoading && <div className="loading">Loading...</div>}
          {!isLoading && results.length === 0 && query && (
            <div className="no-results">No songs found</div>
          )}
          {!isLoading && results.length > 0 && (
            <ul className="results-list">
              {results.map((song) => (
                <li key={song._id} className="result-item" onClick={() => handleResultClick(song)}>
                  <div className="result-info">
                    <h4>{song.title}</h4>
                    <p>{song.artist}</p>
                  </div>
                  <span className="play-count">▶ {song.playCount || 0}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default Search;
