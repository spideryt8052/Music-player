const SongRequest = require('../models/SongRequest');
const Song = require('../models/Song');

// User: Create a song upload request
const createSongRequest = async (req, res) => {
  try {
    const { title, artist, genre, duration, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!title || !artist) {
      return res.status(400).json({ success: false, message: 'Title and artist are required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Audio file is required' });
    }

    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const audioUrl = `${baseUrl}/uploads/${req.file.filename}`;

    // Check for duplicate pending requests
    const existingRequest = await SongRequest.findOne({
      title,
      artist,
      requestedBy: userId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending request for this song'
      });
    }

    const songRequest = new SongRequest({
      title,
      artist,
      genre,
      duration: parseInt(duration) || 0,
      description,
      audioUrl,
      requestedBy: userId
    });

    await songRequest.save();
    await songRequest.populate('requestedBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Song upload request submitted successfully',
      request: songRequest
    });
  } catch (error) {
    console.error('Error creating song request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all pending requests
const getPendingRequests = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    const requests = await SongRequest.find({ status })
      .populate('requestedBy', 'username email')
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Approve a song request
const approveSongRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const adminId = req.user?.id;

    const songRequest = await SongRequest.findById(id).populate('requestedBy');

    if (!songRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (songRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${songRequest.status}`
      });
    }

    // Create actual song from the request
    const newSong = new Song({
      title: songRequest.title,
      artist: songRequest.artist,
      genre: songRequest.genre,
      duration: songRequest.duration,
      url: songRequest.audioUrl,
      cover: songRequest.coverUrl,
      uploadedBy: songRequest.requestedBy._id
    });

    await newSong.save();

    // Update the request
    songRequest.status = 'approved';
    songRequest.reviewedBy = adminId;
    songRequest.reviewNotes = reviewNotes;
    songRequest.approvedSongId = newSong._id;

    await songRequest.save();
    await songRequest.populate('reviewedBy', 'username');

    res.status(200).json({
      success: true,
      message: 'Song request approved successfully',
      request: songRequest,
      song: newSong
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Deny a song request
const denySongRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes } = req.body;
    const adminId = req.user?.id;

    if (!reviewNotes) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const songRequest = await SongRequest.findById(id);

    if (!songRequest) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    if (songRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request is already ${songRequest.status}`
      });
    }

    songRequest.status = 'rejected';
    songRequest.reviewedBy = adminId;
    songRequest.reviewNotes = reviewNotes;

    await songRequest.save();
    await songRequest.populate('reviewedBy', 'username');

    res.status(200).json({
      success: true,
      message: 'Song request rejected',
      request: songRequest
    });
  } catch (error) {
    console.error('Error denying request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// User: Get their own requests
const getUserRequests = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const requests = await SongRequest.find({ requestedBy: userId })
      .populate('reviewedBy', 'username')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, requests });
  } catch (error) {
    console.error('Error fetching user requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSongRequest,
  getPendingRequests,
  approveSongRequest,
  denySongRequest,
  getUserRequests
};
