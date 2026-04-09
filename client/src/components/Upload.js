import React, { useState } from 'react';
import '../styles/Upload.css';

const Upload = ({ isAdmin, onUploadSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: '',
    duration: '',
  });
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [fileError, setFileError] = useState('');

  if (!isAdmin) {
    return <div className="upload-disabled">⚠️ Admin access required to upload songs</div>;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];

    if (selectedFile && !allowedTypes.includes(selectedFile.type)) {
      setFileError('Please select a valid audio file (MP3, WAV, OGG, WebM)');
      setFile(null);
    } else if (selectedFile && selectedFile.size > 50 * 1024 * 1024) {
      setFileError('File size must be less than 50MB');
      setFile(null);
    } else {
      setFile(selectedFile);
      setFileError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.artist || !file) {
      setFileError('Please fill all required fields');
      return;
    }

    setIsUploading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('artist', formData.artist);
    formDataToSend.append('genre', formData.genre);
    formDataToSend.append('duration', formData.duration);
    formDataToSend.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/songs', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        onUploadSuccess('Song uploaded successfully! ✓');
        setFormData({ title: '', artist: '', genre: '', duration: '' });
        setFile(null);
        document.getElementById('file-input').value = '';
      } else {
        setFileError(data.message || 'Upload failed');
      }
    } catch (error) {
      setFileError('Error uploading file: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h3>📁 Upload Song</h3>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          name="title"
          placeholder="Song Title *"
          value={formData.title}
          onChange={handleInputChange}
          required
          className="upload-input"
        />

        <input
          type="text"
          name="artist"
          placeholder="Artist Name *"
          value={formData.artist}
          onChange={handleInputChange}
          required
          className="upload-input"
        />

        <input
          type="text"
          name="genre"
          placeholder="Genre (optional)"
          value={formData.genre}
          onChange={handleInputChange}
          className="upload-input"
        />

        <input
          type="number"
          name="duration"
          placeholder="Duration (seconds)"
          value={formData.duration}
          onChange={handleInputChange}
          className="upload-input"
        />

        <label className="file-input-label">
          {file ? `📄 ${file.name}` : '📁 Choose Audio File *'}
          <input
            id="file-input"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="file-input-hidden"
          />
        </label>

        {fileError && <div className="error-message">{fileError}</div>}

        <button
          type="submit"
          disabled={isUploading}
          className="upload-btn"
        >
          {isUploading ? '⏳ Uploading...' : '🚀 Upload Song'}
        </button>
      </form>
    </div>
  );
};

export default Upload;
