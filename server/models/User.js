const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  googleId: { type: String, unique: true, sparse: true },
  facebookId: { type: String, unique: true, sparse: true },
  profilePicture: { type: String },
  currentSubscriptionPlan: { 
    type: String, 
    enum: ['free', 'premium', 'pro'],
    default: 'free'
  },
  subscriptionEndDate: {
    type: Date,
    default: null
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);