import React, { useState } from 'react';
import '../styles/Login.css';

// Demo Account: username: "yaseen", password: "password"

const Login = ({ onLoginSuccess, onSwitchToSignup, onSwitchToAdminLogin, onSwitchToForgotPassword }) => {
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState('password');
  const [otpSent, setOtpSent] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const [mobileLoginData, setMobileLoginData] = useState({
    mobileNumber: '',
    otp: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (message) setMessage('');
  };

  const handleMobileInputChange = (e) => {
    const { name, value } = e.target;
    setMobileLoginData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (message) setMessage('');
  };

  const handleAuthSuccess = (data, successMessage = 'Login successful!') => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username || formData.username || 'User');
    localStorage.setItem('isAdmin', data.isAdmin ? 'true' : 'false');
    onLoginSuccess?.(successMessage, 'success');
    setFormData({ username: '', password: '' });
    setMobileLoginData({ mobileNumber: '', otp: '' });
    setOtpSent(false);
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
        handleAuthSuccess(data, 'Login successful!');
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

  const handleSendOtp = async () => {
    setOtpLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/request-mobile-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber: mobileLoginData.mobileNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setMessage(data.message || 'OTP sent successfully');
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error(err);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/verify-mobile-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber: mobileLoginData.mobileNumber,
          otp: mobileLoginData.otp,
        }),
      });

      const data = await response.json();

      if (data.success || data.token) {
        handleAuthSuccess(data, 'OTP login successful!');
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error(err);
    } finally {
      setOtpLoading(false);
    }
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

          <div className="auth-mode-toggle">
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'password' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('password');
                setError('');
                setMessage('');
              }}
            >
              Password Login
            </button>
            <button
              type="button"
              className={`auth-mode-btn ${authMode === 'mobile' ? 'active' : ''}`}
              onClick={() => {
                setAuthMode('mobile');
                setError('');
                setMessage('');
              }}
            >
              Mobile OTP Login
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message animate-shake">
              ⚠️ {error}
            </div>
          )}

          {message && !error && (
            <div className="success-message-inline">
              ✅ {message}
            </div>
          )}

          {/* Form */}
          {authMode === 'password' ? (
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
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={onSwitchToForgotPassword}
                >
                  Forgot password?
                </button>
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
          ) : (
            <form onSubmit={handleVerifyOtp} className="login-form">
              <div className="form-group">
                <label>Mobile Number</label>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={mobileLoginData.mobileNumber}
                  onChange={handleMobileInputChange}
                  placeholder="e.g., 9876543210"
                  required
                  disabled={otpLoading}
                />
              </div>

              <button
                type="button"
                className="submit-btn otp-send-btn"
                onClick={handleSendOtp}
                disabled={otpLoading || !mobileLoginData.mobileNumber}
              >
                {otpLoading ? 'Sending OTP...' : (otpSent ? 'Resend OTP' : 'Send OTP')}
              </button>

              <div className="form-group">
                <label>OTP</label>
                <input
                  type="text"
                  name="otp"
                  value={mobileLoginData.otp}
                  onChange={handleMobileInputChange}
                  placeholder="Enter 6-digit OTP"
                  required
                  disabled={otpLoading || !otpSent}
                  maxLength="6"
                />
              </div>

              <button
                type="submit"
                className={`submit-btn ${otpLoading ? 'loading' : ''}`}
                disabled={otpLoading || !otpSent}
              >
                {otpLoading ? (
                  <>
                    <span className="spinner"></span>
                    Verifying...
                  </>
                ) : (
                  'Verify OTP & Login'
                )}
              </button>
            </form>
          )}

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