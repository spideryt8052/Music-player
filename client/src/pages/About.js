import React from 'react';
import developerAvatar from '../assets/images/developer-avatar.svg';
import '../styles/About.css';

const About = () => {
  return (
    <div className="home-container">
      <div className="about-page">
        <div className="about-left">
          <div className="developer-photo-wrap">
            <img src={developerAvatar} alt="Developer" className="developer-photo" />
          </div>
          <p className="developer-tag">Lead Developer</p>
        </div>

        <div className="about-right">
          <p className="about-kicker">About Developer</p>
          <h1>Yaseen Jamshed</h1>
          <p>
            Passionate full-stack developer focused on creating fast, modern, and user-friendly web apps.
            This MusicPlayer project is designed to provide smooth playback, simple navigation, and scalable
            backend architecture with a clean user experience.
          </p>

          <div className="about-points">
            <div className="about-point">
              <h3>Specialization</h3>
              <p>React, Node.js, REST APIs, responsive UI engineering.</p>
            </div>
            <div className="about-point">
              <h3>Project Vision</h3>
              <p>Deliver a Spotify/Saavn-inspired app that feels premium and easy to use.</p>
            </div>
            <div className="about-point">
              <h3>Focus Areas</h3>
              <p>Performance, maintainability, and practical feature implementation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
