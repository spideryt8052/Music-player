import React, { useState, useEffect, useRef } from 'react';
import './styles/darkMode.css';
import './styles/global.css';
import './styles/AppLayout.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Playlist from './pages/Playlist';
import Recent from './pages/Recent';
import Favorites from './pages/Favorites';
import UploadRequest from './pages/UploadRequest';
import AdminRequests from './pages/AdminRequests';
import AdminCoupons from './pages/AdminCoupons';
import Subscription from './pages/Subscription';
import Upload from './components/Upload';
import Toast from './components/Toast';
import Analytics from './pages/Analytics';
import HelpCenter from './pages/HelpCenter';
import Documentation from './pages/Documentation';
import Support from './pages/Support';
import Feedback from './pages/Feedback';
import About from './pages/About';
import Artists from './pages/Artists';
import ArtistSection from './pages/ArtistSection';
import Player from './components/Player';
import NowPlayingSidebar from './components/NowPlayingSidebar';
import AdModal from './components/AdModal';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentSong, setCurrentSong] = useState(null);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState('');
  const [authPage, setAuthPage] = useState('login'); // 'login', 'signup', or 'admin-login'
  const [allSongs, setAllSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(-1);
  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const songsPlayedCountRef = useRef(0);
  const [showAdModal, setShowAdModal] = useState(false);
  const [subscriptionPlan, setSubscriptionPlan] = useState('free');
  const [selectedArtist, setSelectedArtist] = useState(null);

  // Handle social login redirects that return with a token in the URL.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const username = params.get('username');
    const isAdminParam = params.get('isAdmin');

    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('username', username || 'User');
      localStorage.setItem('isAdmin', isAdminParam === 'true' ? 'true' : 'false');

      window.history.replaceState({}, document.title, window.location.pathname);
      setIsLoggedIn(true);
      setUserName(username || 'User');
      setIsAdmin(isAdminParam === 'true');
      setAuthPage('login');
      setCurrentPage('home');
    }
  }, []);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    if (token) {
      setIsLoggedIn(true);
      setUserName(username || 'User');
      setIsAdmin(adminStatus);
    }
  }, []);

  // Fetch all songs
  useEffect(() => {
    const fetchAllSongs = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/songs');
        const data = await response.json();
        if (data.songs) {
          setAllSongs(data.songs);
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      }
    };
    fetchAllSongs();
  }, []);

  // Fetch favorites and subscription on login
  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
      fetchUserSubscription();
    }
  }, [isLoggedIn]);

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success && data.favorites) {
        const favoriteSongIds = data.favorites.map(fav => fav.song._id).filter(id => id);
        setFavorites(favoriteSongIds);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const fetchUserSubscription = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/subscriptions/user', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setSubscriptionPlan(data.subscription?.plan || data.plan || 'free');
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
      setSubscriptionPlan('free');
    }
  };

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  // Handle login
  const handleLoginSuccess = (message, type = 'success') => {
    setIsLoggedIn(true);
    const username = localStorage.getItem('username');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setUserName(username || 'User');
    setIsAdmin(adminStatus);
    showToast(message, type);
    setCurrentPage('home');
  };

  // Handle signup
  const handleSignupSuccess = (message, type = 'success') => {
    setIsLoggedIn(true);
    const username = localStorage.getItem('username');
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    setUserName(username || 'User');
    setIsAdmin(adminStatus);
    showToast(message, type);
    setCurrentPage('home');
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsLoggedIn(false);
    setUserName('');
    setCurrentPage('home');
    setSelectedArtist(null);
    setCurrentSong(null);
    songsPlayedCountRef.current = 0;
    setShowAdModal(false);
    setSubscriptionPlan('free');
    showToast('Logged out successfully', 'info');
  };

  // Handle song play
  const handleSongPlay = async (song) => {
    const index = allSongs.findIndex(s => s._id === song._id);
    if (index !== -1) {
      setCurrentSongIndex(index);
    }
    setCurrentSong({ ...song, playTimestamp: Date.now() });
    setShowNowPlaying(true); // Show sidebar when song plays
    showToast(`Playing: ${song.title} by ${song.artist}`, 'info');

    // Show 30s ad after every 4 songs for free users.
    const isFreePlanUser = !isAdmin && subscriptionPlan === 'free';
    if (isFreePlanUser && !showAdModal) {
      songsPlayedCountRef.current += 1;
      if (songsPlayedCountRef.current >= 4) {
        setShowAdModal(true);
        songsPlayedCountRef.current = 0;
      }
    }

    // Track recent play (optional - won't break if not authenticated)
    try {
      const token = localStorage.getItem('token');
      if (token && song._id) {
        await fetch('http://localhost:5000/api/recent/add', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ songId: song._id })
        });
      }
    } catch (error) {
      // Silently fail - recent tracking is optional
      console.log('Recent tracking failed:', error);
    }
  };

  // Handle next song
  const handleNext = () => {
    if (allSongs.length > 0) {
      const nextIndex = (currentSongIndex + 1) % allSongs.length;
      setCurrentSongIndex(nextIndex);
      handleSongPlay(allSongs[nextIndex]);
    }
  };

  // Handle previous song
  const handlePrevious = () => {
    if (allSongs.length > 0) {
      const prevIndex = currentSongIndex > 0 ? currentSongIndex - 1 : allSongs.length - 1;
      setCurrentSongIndex(prevIndex);
      handleSongPlay(allSongs[prevIndex]);
    }
  };

  // Handle upload success
  const handleUploadSuccess = (message) => {
    showToast(message, 'success');
  };

  const handleArtistSelect = (artist) => {
    setSelectedArtist(artist);
    setCurrentPage('artist-section');
  };

  const handleBackToArtists = () => {
    setCurrentPage('artists');
  };

  // Show Now Playing sidebar only on Home when a song exists.
  useEffect(() => {
    if (!currentSong || currentPage !== 'home') {
      setShowNowPlaying(false);
      return;
    }

    setShowNowPlaying(true);
  }, [currentPage, currentSong]);

  // Toggle favorite
  const toggleFavorite = async (song) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to manage favorites', 'error');
        return;
      }

      const isCurrentlyFavorited = favorites.includes(song._id);
      const method = isCurrentlyFavorited ? 'DELETE' : 'POST';
      const url = isCurrentlyFavorited
        ? `http://localhost:5000/api/favorites/${song._id}`
        : 'http://localhost:5000/api/favorites';

      const body = isCurrentlyFavorited ? null : JSON.stringify({ songId: song._id });

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body
      });

      const data = await response.json();

      if (data.success) {
        if (isCurrentlyFavorited) {
          setFavorites(prev => prev.filter(id => id !== song._id));
          showToast(`"${song.title}" removed from favorites`, 'info');
        } else {
          setFavorites(prev => [...prev, song._id]);
          showToast(`"${song.title}" added to favorites`, 'success');
        }
      } else {
        showToast(data.message || 'Failed to update favorites', 'error');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      showToast('Failed to update favorites', 'error');
    }
  };

  // Check if song is favorited
  const isSongFavorited = (songId) => {
    return favorites.includes(songId);
  };

  const shouldShowNowPlayingSidebar = currentPage === 'home' && !!currentSong && showNowPlaying;

  // Render page content
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            onSongSelect={handleSongPlay}
            onToast={showToast}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            showAds={!isAdmin && subscriptionPlan === 'free'}
          />
        );
      case 'playlist':
        return (
          <Playlist 
            onSongSelect={handleSongPlay}
            onToast={showToast}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'recent':
        return (
          <Recent 
            onSongSelect={handleSongPlay}
            onToast={showToast}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'favorites':
        return (
          <Favorites 
            onSongSelect={handleSongPlay}
            onToast={showToast}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        );
      case 'upload-request':
        return (
          <UploadRequest
            onToast={showToast}
          />
        );
      case 'admin-requests':
        return (
          <AdminRequests
            onToast={showToast}
          />
        );
      case 'admin-coupons':
        return (
          <AdminCoupons
            onToast={showToast}
          />
        );
      case 'subscription':
        return (
          <Subscription
            onToast={showToast}
          />
        );
      case 'upload':
        return <Upload isAdmin={isAdmin} onUploadSuccess={handleUploadSuccess} />;
      case 'analytics':
        return <Analytics />;
      case 'help-center':
        return <HelpCenter />;
      case 'documentation':
        return <Documentation />;
      case 'support':
        return <Support onToast={showToast} />;
      case 'feedback':
        return <Feedback onToast={showToast} />;
      case 'about':
        return <About />;
      case 'artists':
        return (
          <Artists
            songs={allSongs}
            onSongSelect={handleSongPlay}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onSelectArtist={handleArtistSelect}
          />
        );
      case 'artist-section':
        return (
          <ArtistSection
            artist={selectedArtist}
            songs={allSongs}
            onSongSelect={handleSongPlay}
            onToggleFavorite={toggleFavorite}
            favorites={favorites}
            onBack={handleBackToArtists}
          />
        );
      default:
        return null;
    }
  };

  // Show auth pages if not logged in
  if (!isLoggedIn) {
    if (authPage === 'login') {
      return (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignup={() => setAuthPage('signup')}
          onSwitchToAdminLogin={() => setAuthPage('admin-login')}
        />
      );
    } else if (authPage === 'admin-login') {
      return (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onBackToLogin={() => setAuthPage('login')}
        />
      );
    } else {
      return <Signup onSignupSuccess={handleSignupSuccess} onSwitchToLogin={() => setAuthPage('login')} />;
    }
  }

  return (
    <div className="app-layout">
      <Header
        onNavClick={setCurrentPage}
        isAdmin={isAdmin}
        userName={userName}
        onLogout={handleLogout}
      />
      <main className="main-content">
        <div className="main-content-layout">
          <div className="left-content">
            <div className="page-shell">
              {renderPage()}
            </div>
          </div>
          <div className={`right-sidebar ${shouldShowNowPlayingSidebar ? '' : 'hidden'}`}>
            {shouldShowNowPlayingSidebar && (
              <NowPlayingSidebar
                currentSong={currentSong}
                isFavorited={isSongFavorited(currentSong._id)}
                onToggleFavorite={toggleFavorite}
                onClose={() => setShowNowPlaying(false)}
              />
            )}
          </div>
        </div>
      </main>
      <Player
        currentSong={currentSong}
        onNext={handleNext}
        onPrevious={handlePrevious}
        shouldPause={showAdModal}
      />
      <Footer onNavClick={setCurrentPage} />
      <AdModal 
        isVisible={showAdModal}
        onUpgrade={() => {
          setShowAdModal(false);
          setCurrentPage('subscription');
        }}
        onClose={() => setShowAdModal(false)}
      />
      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

export default App;