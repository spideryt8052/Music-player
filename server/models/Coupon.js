const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { 
    type: String, 
    required: true, 
    unique: true,
    uppercase: true,
    trim: true 
  },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    default: 'percentage',
    required: true 
  },
  discountValue: { 
    type: Number, 
    required: true,
    min: 0 
  },
  maxUsageCount: { 
    type: Number, 
    default: null // null means unlimited 
  },
  currentUsageCount: { 
    type: Number, 
    default: 0 
  },
  expiryDate: { 
    type: Date,
    default: null // null means no expiry 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  description: { 
    type: String,
    default: '' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }

}, { timestamps: true });

module.exports = mongoose.model('Coupon', couponSchema);
