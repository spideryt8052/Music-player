import React from 'react';
import '../styles/InfoPages.css';

const HelpCenter = () => {
  return (
    <div className="home-container">
      <div className="info-page">
        <div className="info-hero">
          <p className="info-kicker">Help Center</p>
          <h1>How To Use MusicPlayer</h1>
          <p>Everything you need to listen, manage your library, and enjoy smooth playback.</p>
        </div>

        <section className="info-section">
          <h2>1. Getting Started</h2>
          <ul>
            <li>Sign up or log in with your account.</li>
            <li>Use the top navigation to open Home, Playlist, Favorites, and Recent pages.</li>
            <li>Start any song by pressing the play button on a card.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>2. Home Page</h2>
          <ul>
            <li>Search songs and artists using the search bar.</li>
            <li>Browse featured songs, top charts, and all available tracks.</li>
            <li>Use the heart button to add or remove songs from favorites.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>3. Player Controls</h2>
          <ul>
            <li>Play/Pause, Next/Previous, Shuffle, Repeat controls are at the bottom player.</li>
            <li>Adjust song progress and volume with sliders.</li>
            <li>On free plan, ads can appear after a few songs. Song pauses during ad break.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>4. Personal Library</h2>
          <ul>
            <li>Playlist: view and manage your saved song collections.</li>
            <li>Favorites: quickly access liked songs.</li>
            <li>Recent: revisit songs you listened to recently.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>5. Subscription</h2>
          <ul>
            <li>Open Subscription page to upgrade plan.</li>
            <li>Use coupon codes (if available) before making payment.</li>
            <li>Premium plans unlock ad-free and better quality features.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
