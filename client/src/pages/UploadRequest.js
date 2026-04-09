import React, { useState } from 'react';
import '../styles/Home.css';
import '../styles/UploadRequest.css';

const UploadRequest = ({ onToast }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    description: '',
    duration: ''
  });
  const [audioFile, setAudioFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
      if (!allowedTypes.includes(file.type)) {
        onToast('Only audio files are allowed (MP3, WAV, OGG, WebM)', 'error');
        return;
      }

      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        onToast('File size should not exceed 50MB', 'error');
        return;
      }

      setAudioFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.artist.trim()) {
      onToast('Title and Artist are required', 'error');
      return;
    }

    if (!audioFile) {
      onToast('Please select an audio file', 'error');
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append('title', formData.title);
      data.append('artist', formData.artist);
      data.append('genre', formData.genre);
      data.append('duration', formData.duration);
      data.append('description', formData.description);
      data.append('file', audioFile);

      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/song-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await response.json();

      if (result.success) {
        onToast('🎊 Song upload request submitted successfully! Waiting for admin approval...', 'success');
        setFormData({
          title: '',
          artist: '',
          genre: '',
          description: '',
          duration: ''
        });
        setAudioFile(null);
        setSubmitted(true);
      } else {
        onToast(result.message || 'Failed to submit request', 'error');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      onToast('Error submitting request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="upload-request-container">
        <div className="upload-request-header">
          <h1>📤 Upload Song Request</h1>
          <p>Submit your song for admin review and approval</p>
        </div>

        {submitted ? (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h2>Request Submitted!</h2>
            <p>Your song upload request has been submitted successfully.</p>
            <p className="info-text">Our admin team will review your song and notify you about the decision.</p>
            <button
              className="btn-primary"
              onClick={() => setSubmitted(false)}
            >
              Submit Another Request
            </button>
          </div>
        ) : (
          <form className="upload-request-form" onSubmit={handleSubmit}>
            {/* Audio File Upload */}
            <div className="form-group">
              <label htmlFor="audioFile">🎵 Audio File *</label>
              <div className="file-input-wrapper">
                <input
                  type="file"
                  id="audioFile"
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="file-input"
                />
                <label htmlFor="audioFile" className="file-input-label">
                  {audioFile ? (
                    <>
                      ✓ {audioFile.name}
                    </>
                  ) : (
                    <>Click to select audio file</>
                  )}
                </label>
              </div>
              <small>Supported formats: MP3, WAV, OGG, WebM (Max 50MB)</small>
            </div>

            {/* Song Title */}
            <div className="form-group">
              <label htmlFor="title">🎤 Song Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter song title"
                disabled={loading}
                maxLength="100"
              />
            </div>

            {/* Artist Name */}
            <div className="form-group">
              <label htmlFor="artist">👤 Artist Name *</label>
              <input
                type="text"
                id="artist"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                placeholder="Enter artist name"
                disabled={loading}
                maxLength="100"
              />
            </div>

            {/* Genre */}
            <div className="form-group">
              <label htmlFor="genre">🎵 Genre</label>
              <select
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                disabled={loading}
              >
                <option value="">Select a genre</option>
                <option value="Pop">Pop</option>
                <option value="Rock">Rock</option>
                <option value="Hip-Hop">Hip-Hop</option>
                <option value="Jazz">Jazz</option>
                <option value="Classical">Classical</option>
                <option value="Electronic">Electronic</option>
                <option value="Folk">Folk</option>
                <option value="Country">Country</option>
                <option value="R&B">R&B</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Duration */}
            <div className="form-group">
              <label htmlFor="duration">⏱️ Duration (seconds)</label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                placeholder="e.g., 180"
                disabled={loading}
                min="0"
              />
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">📝 Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell us about your song..."
                disabled={loading}
                rows="4"
                maxLength="500"
              />
              <small>{formData.description.length}/500 characters</small>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !audioFile}
            >
              {loading ? '⏳ Submitting...' : '✓ Submit Request'}
            </button>

            <div className="info-box">
              <p>ℹ️ <strong>Note:</strong> Your song will be reviewed by our admin team. You will be notified once the decision is made.</p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UploadRequest;
