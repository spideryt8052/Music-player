import React, { useState } from 'react';
import '../styles/InfoPages.css';

const Feedback = ({ onToast }) => {
  const [formData, setFormData] = useState({
    name: localStorage.getItem('username') || '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const token = localStorage.getItem('token');
      if (!token) {
        onToast?.('Please login before submitting feedback', 'error');
        return;
      }

      const response = await fetch('http://localhost:5000/api/contact/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'feedback',
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onToast?.(data.message || 'Feedback submitted', 'success');
        setFormData((prev) => ({ ...prev, subject: '', message: '' }));
      } else {
        onToast?.(data.message || 'Unable to submit feedback', 'error');
      }
    } catch (error) {
      onToast?.('Error sending feedback', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      <div className="info-page">
        <div className="info-hero">
          <p className="info-kicker">Feedback</p>
          <h1>Share Your Suggestions</h1>
          <p>Your feedback helps improve design, performance, and music experience.</p>
        </div>

        <section className="info-section">
          <h2>What You Can Share</h2>
          <ul>
            <li>UI improvements for pages or mobile layout.</li>
            <li>Playback bugs, lag issues, and unexpected errors.</li>
            <li>Feature requests like lyrics, queue management, and better filters.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>How To Send</h2>
          <ul>
            <li>Email your feedback to feedback@musicplayer.local</li>
            <li>Use clear subject line like: UI Feedback, Bug Report, Feature Request</li>
            <li>Add exact steps so issue can be reproduced quickly.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Thank You</h2>
          <p>
            We review feedback regularly and prioritize fixes/features based on impact and frequency.
            Your input directly shapes upcoming updates.
          </p>
        </section>

        <section className="info-section">
          <h2>Send Feedback</h2>
          <form className="info-form" onSubmit={handleSubmit}>
            <div className="info-form-grid">
              <input
                type="text"
                name="name"
                placeholder="Your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <input
              type="text"
              name="subject"
              placeholder="Feedback subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Share your feedback"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
            />
            <button type="submit" className="info-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Feedback;
