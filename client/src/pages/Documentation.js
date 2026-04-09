import React from 'react';
import '../styles/InfoPages.css';

const Documentation = () => {
  return (
    <div className="home-container">
      <div className="info-page">
        <div className="info-hero">
          <p className="info-kicker">Documentation</p>
          <h1>Platform Guide</h1>
          <p>Technical and functional overview of the MusicPlayer web application.</p>
        </div>

        <section className="info-section">
          <h2>Core Modules</h2>
          <ul>
            <li>Authentication: signup, login, admin login, social login support.</li>
            <li>Music Library: songs listing, search, featured, top charts, and playback tracking.</li>
            <li>User Data: favorites, recent songs, playlists, and subscription records.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Frontend Features</h2>
          <ul>
            <li>Responsive UI for desktop and mobile devices.</li>
            <li>Bottom sticky player with shuffle, repeat, and fast controls.</li>
            <li>Now Playing panel available on home screen when song is active.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Backend Services</h2>
          <ul>
            <li>REST APIs for auth, songs, favorites, recents, coupons, and subscriptions.</li>
            <li>Protected routes for user-specific and admin-specific operations.</li>
            <li>MongoDB models for scalable data storage and retrieval.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Admin Tools</h2>
          <ul>
            <li>Upload songs and review song requests.</li>
            <li>Create, edit, and remove coupon codes.</li>
            <li>Manage request status and monitor usage analytics.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Documentation;
