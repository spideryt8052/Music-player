const mongoose = require('mongoose');

const recentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
  playedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Recent', recentSchema);