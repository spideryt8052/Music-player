import React, { useState, useEffect, useCallback } from 'react';
import '../styles/AdminCoupons.css';

const AdminCoupons = ({ onToast }) => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    maxUsageCount: '',
    expiryDate: '',
    description: ''
  });

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/coupons/all', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setCoupons(data.coupons || []);
      } else {
        onToast(data.message || 'Failed to load coupons', 'error');
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      onToast('Error loading coupons', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code || !formData.discountValue) {
      onToast('Code and discount value are required', 'error');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editingId 
        ? `http://localhost:5000/api/coupons/${editingId}`
        : 'http://localhost:5000/api/coupons/create';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: formData.code.toUpperCase(),
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          maxUsageCount: formData.maxUsageCount ? parseInt(formData.maxUsageCount) : null,
          expiryDate: formData.expiryDate || null,
          description: formData.description
        })
      });

      const data = await response.json();
      
      if (data.success) {
        onToast(editingId ? 'Coupon updated successfully' : 'Coupon created successfully', 'success');
        setFormData({
          code: '',
          discountType: 'percentage',
          discountValue: '',
          maxUsageCount: '',
          expiryDate: '',
          description: ''
        });
        setEditingId(null);
        setShowForm(false);
        fetchCoupons();
      } else {
        onToast(data.message || 'Error saving coupon', 'error');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      onToast('Error saving coupon', 'error');
    }
  };

  const handleEdit = (coupon) => {
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      maxUsageCount: coupon.maxUsageCount || '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.split('T')[0] : '',
      description: coupon.description || ''
    });
    setEditingId(coupon._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/coupons/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        onToast('Coupon deleted successfully', 'success');
        fetchCoupons();
      } else {
        onToast(data.message || 'Error deleting coupon', 'error');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      onToast('Error deleting coupon', 'error');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setShowForm(false);
    setFormData({
      code: '',
      discountType: 'percentage',
      discountValue: '',
      maxUsageCount: '',
      expiryDate: '',
      description: ''
    });
  };

  if (loading && !showForm) {
    return <div className="admin-coupons"><p className="loading">Loading coupons...</p></div>;
  }

  return (
    <div className="admin-coupons">
      <div className="coupons-header">
        <h2>💳 Coupon Management</h2>
        <button 
          className="create-btn"
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            setFormData({
              code: '',
              discountType: 'percentage',
              discountValue: '',
              maxUsageCount: '',
              expiryDate: '',
              description: ''
            });
          }}
        >
          ➕ Create Coupon
        </button>
      </div>

      {showForm && (
        <div className="coupon-form-container">
          <h3>{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
          <form onSubmit={handleSubmit} className="coupon-form">
            <div className="form-row">
              <div className="form-group">
                <label>Coupon Code</label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SAVE20"
                  disabled={editingId !== null}
                />
              </div>
              <div className="form-group">
                <label>Discount Type</label>
                <select
                  name="discountType"
                  value={formData.discountType}
                  onChange={handleInputChange}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (₹)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 20"
                  min="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Max Usage Count (Leave empty for unlimited)</label>
                <input
                  type="number"
                  name="maxUsageCount"
                  value={formData.maxUsageCount}
                  onChange={handleInputChange}
                  placeholder="e.g., 100"
                  min="1"
                />
              </div>
              <div className="form-group">
                <label>Expiry Date (Leave empty for no expiry)</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Summer sale discount"
                rows="3"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                {editingId ? '✏️ Update Coupon' : '➕ Create Coupon'}
              </button>
              <button 
                type="button" 
                className="cancel-btn"
                onClick={handleCancelEdit}
              >
                ✕ Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="coupons-list">
        {coupons.length === 0 ? (
          <p className="empty-state">No coupons yet. Create one to get started!</p>
        ) : (
          <div className="coupons-grid">
            {coupons.map(coupon => (
              <div key={coupon._id} className={`coupon-card ${!coupon.isActive ? 'inactive' : ''}`}>
                <div className="coupon-code">{coupon.code}</div>
                <div className="coupon-details">
                  <p><strong>Discount:</strong> {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}</p>
                  <p><strong>Used:</strong> {coupon.currentUsageCount}{coupon.maxUsageCount ? ` / ${coupon.maxUsageCount}` : ' (unlimited)'}</p>
                  {coupon.expiryDate && (
                    <p><strong>Expires:</strong> {new Date(coupon.expiryDate).toLocaleDateString()}</p>
                  )}
                  {coupon.description && (
                    <p><strong>Note:</strong> {coupon.description}</p>
                  )}
                  <p><strong>Status:</strong> <span className={`status ${coupon.isActive ? 'active' : 'inactive'}`}>
                    {coupon.isActive ? '✓ Active' : '✗ Inactive'}
                  </span></p>
                </div>
                <div className="coupon-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(coupon)}
                  >
                    ✏️ Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDelete(coupon._id)}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCoupons;
