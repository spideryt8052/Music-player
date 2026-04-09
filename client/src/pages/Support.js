import React, { useState } from 'react';
import '../styles/InfoPages.css';

const Support = ({ onToast }) => {
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
        onToast?.('Please login before sending support request', 'error');
        return;
      }

      const response = await fetch('http://localhost:5000/api/contact/submit', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'support',
          ...formData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onToast?.(data.message || 'Support request submitted', 'success');
        setFormData((prev) => ({ ...prev, subject: '', message: '' }));
      } else {
        onToast?.(data.message || 'Unable to submit support request', 'error');
      }
    } catch (error) {
      onToast?.('Error sending support request', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="home-container">
      <div className="info-page">
        <div className="info-hero">
          <p className="info-kicker">Support</p>
          <h1>Need Help?</h1>
          <p>Use these support channels for account, payment, and playback related issues.</p>
        </div>

        <section className="info-section">
          <h2>Common Issues</h2>
          <ul>
            <li>If songs are not playing, refresh page and check internet connection.</li>
            <li>If login fails, verify username/password and try again.</li>
            <li>If favorites/recent not loading, sign out and sign in again.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Billing Support</h2>
          <ul>
            <li>Subscription payment issues can be retried from Subscription page.</li>
            <li>Coupon validation errors mean code is expired, invalid, or not applicable.</li>
            <li>For payment verification delays, wait a minute and refresh subscription status.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Contact</h2>
          <ul>
            <li>Email: support@musicplayer.local</li>
            <li>Response Time: within 24 to 48 hours</li>
            <li>Include screenshot, page name, and error message for faster help.</li>
          </ul>
        </section>

        <section className="info-section">
          <h2>Submit Support Request</h2>
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
              placeholder="Subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
            <textarea
              name="message"
              placeholder="Describe your issue"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
            />
            <button type="submit" className="info-submit-btn" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Support Request'}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

export default Support;
