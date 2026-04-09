import React, { useState } from 'react';
import '../styles/Login.css';

const AdminLogin = ({ onLoginSuccess, onBackToLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (data.success || data.token) {
        if (!data.isAdmin) {
          setError('Admin access required. Please sign in with an admin account.');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || formData.username);
        localStorage.setItem('isAdmin', 'true');

        onLoginSuccess?.('Admin login successful!', 'success');
        setFormData({ username: '', password: '' });
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg">
        <div className="music-note note-1">♪</div>
        <div className="music-note note-2">♫</div>
        <div className="music-note note-3">♪</div>
        <div className="music-note note-4">♫</div>
      </div>

      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-animation">
              <div className="logo-icon">★</div>
            </div>
            <h1>Admin Login</h1>
            <p>Sign in to manage uploads and requests</p>
          </div>

          {error && (
            <div className="error-message animate-shake">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="Admin username"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Admin password"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className={`submit-btn ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Logging in...
                </>
              ) : (
                'Admin Login'
              )}
            </button>
          </form>

          <div className="demo-info">
            <p>Admin access uses the same account database.</p>
            <code>Use a user account with isAdmin: true</code>
          </div>

          <div className="auth-switch">
            <p>
              Back to user login?
              <button onClick={onBackToLogin} className="switch-link" style={{ marginLeft: '6px' }}>
                Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;