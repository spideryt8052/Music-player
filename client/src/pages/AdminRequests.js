import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import '../styles/AdminRequests.css';

const AdminRequests = ({ onToast }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/song-requests?status=${currentFilter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setRequests(data.requests || []);
      } else {
        onToast(data.message || 'Failed to load requests', 'error');
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      onToast('Error loading requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApprove = async (requestId) => {
    try {
      setReviewLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/song-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviewNotes })
      });

      const data = await response.json();

      if (data.success) {
        onToast('✓ Song approved successfully!', 'success');
        setSelectedRequest(null);
        setReviewNotes('');
        fetchRequests();
      } else {
        onToast(data.message || 'Failed to approve request', 'error');
      }
    } catch (error) {
      console.error('Error approving request:', error);
      onToast('Error approving request', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeny = async (requestId) => {
    if (!reviewNotes.trim()) {
      onToast('Please provide a reason for rejection', 'error');
      return;
    }

    try {
      setReviewLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`http://localhost:5000/api/song-requests/${requestId}/deny`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reviewNotes })
      });

      const data = await response.json();

      if (data.success) {
        onToast('✗ Song rejected', 'info');
        setSelectedRequest(null);
        setReviewNotes('');
        fetchRequests();
      } else {
        onToast(data.message || 'Failed to deny request', 'error');
      }
    } catch (error) {
      console.error('Error denying request:', error);
      onToast('Error denying request', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className="home-container"><div className="loading">Loading requests...</div></div>;
  }

  return (
    <div className="home-container">
      <div className="admin-requests-container">
        <div className="admin-header">
          <h1>🔔 Admin: Song Upload Requests</h1>
          <p>Review and approve user song submissions</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${currentFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('pending')}
          >
            ⏳ Pending ({requests.length})
          </button>
          <button
            className={`filter-tab ${currentFilter === 'approved' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('approved')}
          >
            ✓ Approved
          </button>
          <button
            className={`filter-tab ${currentFilter === 'rejected' ? 'active' : ''}`}
            onClick={() => setCurrentFilter('rejected')}
          >
            ✗ Rejected
          </button>
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <div className="no-requests">
            <p>📭 No {currentFilter} requests</p>
          </div>
        ) : (
          <div className="requests-list">
            {requests.map(request => (
              <div key={request._id} className={`request-card ${request.status}`}>
                <div className="request-info">
                  <div className="request-basic">
                    <h3>{request.title}</h3>
                    <p className="artist">{request.artist}</p>
                  </div>
                  <div className="request-meta">
                    <span className="uploader">By: {request.requestedBy?.username}</span>
                    <span className="date">{formatDate(request.createdAt)}</span>
                    <span className={`status ${request.status}`}>
                      {request.status === 'pending' && '⏳ Pending'}
                      {request.status === 'approved' && '✓ Approved'}
                      {request.status === 'rejected' && '✗ Rejected'}
                    </span>
                  </div>
                </div>

                {/* Preview Section */}
                <div className="request-preview">
                  <div className="preview-item">
                    <span className="label">Genre:</span>
                    <span>{request.genre || 'Not specified'}</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">Duration:</span>
                    <span>{request.duration || 0} seconds</span>
                  </div>
                  <div className="preview-item">
                    <span className="label">Description:</span>
                    <span>{request.description || 'No description'}</span>
                  </div>
                </div>

                {/* Audio Player */}
                <div className="audio-player-section">
                  <label>🎵 Listen to the Song:</label>
                  <audio
                    controls
                    className="audio-player"
                    src={request.audioUrl}
                  >
                    Your browser does not support the audio player.
                  </audio>
                </div>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="request-actions">
                    <button
                      className="btn-view-details"
                      onClick={() => setSelectedRequest(request)}
                    >
                      📋 Review & Decide
                    </button>
                  </div>
                )}

                {/* Review Notes */}
                {request.reviewNotes && (
                  <div className="review-notes">
                    <p><strong>Admin Notes:</strong> {request.reviewNotes}</p>
                    {request.reviewedBy && (
                      <p className="reviewer">Reviewed by: {request.reviewedBy.username}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedRequest && (
          <div className="modal-overlay" onClick={() => setSelectedRequest(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Review: {selectedRequest.title}</h2>
                <button
                  className="close-btn"
                  onClick={() => setSelectedRequest(null)}
                >
                  ✕
                </button>
              </div>

              <div className="modal-body">
                <div className="song-details">
                  <h3>{selectedRequest.title}</h3>
                  <p className="artist">{selectedRequest.artist}</p>
                  <p className="uploader">Submitted by: {selectedRequest.requestedBy?.username} ({selectedRequest.requestedBy?.email})</p>
                </div>

                <div className="audio-player-large">
                  <label>Listen to the full song:</label>
                  <audio
                    controls
                    className="audio-player"
                    src={selectedRequest.audioUrl}
                    autoPlay
                  />
                </div>

                <div className="review-form">
                  <label htmlFor="reviewNotes">📝 Admin Notes (Optional)</label>
                  <textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows="3"
                    disabled={reviewLoading}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn-approve"
                  onClick={() => handleApprove(selectedRequest._id)}
                  disabled={reviewLoading}
                >
                  {reviewLoading ? '⏳ Processing...' : '✓ Approve'}
                </button>
                <button
                  className="btn-deny"
                  onClick={() => handleDeny(selectedRequest._id)}
                  disabled={reviewLoading || !reviewNotes.trim()}
                >
                  {reviewLoading ? '⏳ Processing...' : '✗ Reject'}
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => setSelectedRequest(null)}
                  disabled={reviewLoading}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRequests;
