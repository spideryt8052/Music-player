const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  song: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);