const Song = require('../models/Song');

// Get songs with search functionality
const getSongs = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { artist: { $regex: search, $options: 'i' } },
          { genre: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const songs = await Song.find(query)
      .populate('uploadedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload song (Admin only)
const addSong = async (req, res) => {
  try {
    const { title, artist, genre, duration } = req.body;
    const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
    const url = req.file ? `${baseUrl}/uploads/${req.file.filename}` : req.body.url;

    if (!title || !artist || !url) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const song = new Song({
      title,
      artist,
      genre,
      duration: parseInt(duration) || 0,
      url,
      uploadedBy: req.user?.id,
    });

    await song.save();
    res.status(201).json({ success: true, message: 'Song added successfully', song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Increment play count
const playSong = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findByIdAndUpdate(
      id,
      { $inc: { playCount: 1 } },
      { new: true }
    );
    res.status(200).json({ success: true, song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get most played songs (Analytics)
const getMostPlayed = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const songs = await Song.find()
      .sort({ playCount: -1 })
      .limit(limit)
      .populate('uploadedBy', 'username');

    res.status(200).json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get song by ID
const getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    const song = await Song.findById(id).populate('uploadedBy', 'username');

    if (!song) {
      return res.status(404).json({ success: false, message: 'Song not found' });
    }

    res.status(200).json({ success: true, song });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSongs, addSong, playSong, getMostPlayed, getSongById };