import React, { useEffect, useState } from 'react';
import '../styles/Login.css';

// Demo Account: username: "yaseen", password: "password"

const Login = ({ onLoginSuccess, onSwitchToSignup, onSwitchToAdminLogin }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authStatus = params.get('auth');

    if (authStatus) {
      const messages = {
        failed: 'Social login failed. Please try again.',
        'google-not-configured': 'Google login is not configured yet.',
        'facebook-not-configured': 'Facebook login is not configured yet.'
      };

      setError(messages[authStatus] || 'Social login could not be completed.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
        // Save token
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || formData.username);
        localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false');

        // Show success message
        onLoginSuccess?.('Login successful!', 'success');

        // Clear form
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

  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:5000/api/auth/${provider}`;
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="login-bg">
        <div className="music-note note-1">♪</div>
        <div className="music-note note-2">♫</div>
        <div className="music-note note-3">♪</div>
        <div className="music-note note-4">♫</div>
      </div>

      {/* Login Form */}
      <div className="login-wrapper">
        <div className="login-card">
          {/* Header */}
          <div className="login-header">
            <div className="logo-animation">
              <div className="logo-icon">♪</div>
            </div>
            <h1>MusicPlayer</h1>
            <p>Welcome back</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Username */}
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="e.g., yaseen"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label>Password</label>
              <div className="password-input">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="e.g., password"
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

            {/* Submit Button */}
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
                'Login'
              )}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <div className="social-login">
            <button
              type="button"
              className="social-btn google-btn"
              onClick={() => handleSocialLogin('google')}
              disabled={loading}
            >
              <span className="social-icon">G</span>
              Continue with Google
            </button>
            <button
              type="button"
              className="social-btn facebook-btn"
              onClick={() => handleSocialLogin('facebook')}
              disabled={loading}
            >
              <span className="social-icon">f</span>
              Continue with Facebook
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="demo-info">
            <p>🎵 Demo Account:</p>
            <code>username: demo | password: demo123</code>
          </div>

          {/* Switch to Signup */}
          <div className="auth-switch">
            <p>Don't have an account? <button onClick={onSwitchToSignup} className="switch-link">Sign up</button></p>
            <p style={{ marginTop: '10px' }}>
              Admin?
              <button onClick={onSwitchToAdminLogin} className="switch-link" style={{ marginLeft: '6px' }}>
                Admin Login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;