const mongoose = require('mongoose');

const songRequestSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  genre: { type: String },
  duration: { type: Number },
  audioUrl: { type: String, required: true },
  coverUrl: { type: String },
  description: { type: String },
  requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewNotes: { type: String },
  approvedSongId: { type: mongoose.Schema.Types.ObjectId, ref: 'Song' },
}, { timestamps: true });

module.exports = mongoose.model('SongRequest', songRequestSchema);
