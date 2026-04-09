const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
    unique: true 
  },
  plan: { 
    type: String, 
    enum: ['free', 'premium', 'pro'], 
    default: 'free',
    required: true 
  },
  price: { 
    type: Number, 
    required: true,
    default: 0 
  },
  billingCycle: { 
    type: String, 
    enum: ['monthly', 'yearly'], 
    default: 'monthly' 
  },
  startDate: { 
    type: Date,
    default: () => new Date()
  },
  endDate: { 
    type: Date,
    required: true 
  },
  autoRenew: { 
    type: Boolean, 
    default: true 
  },
  couponUsed: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Coupon',
    default: null 
  },
  discountAmount: { 
    type: Number,
    default: 0 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'completed', 'failed', 'cancelled'], 
    default: 'pending' 
  },
  paymentMethod: { 
    type: String,
    default: null 
  },
  transactionId: { 
    type: String,
    default: null 
  },
  isActive: { 
    type: Boolean,
    default: true 
  }
}, { timestamps: true });

// Index for quick lookups
subscriptionSchema.index({ user: 1, isActive: 1 });
subscriptionSchema.index({ endDate: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
