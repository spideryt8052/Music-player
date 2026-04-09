const Playlist = require('../models/Playlist');

const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('user', 'username')
      .populate('songs')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, playlists });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createPlaylist = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Playlist name is required' });
    }

    const playlist = new Playlist({
      name,
      user: req.user?.id,
      songs: [],
    });

    await playlist.save();
    res.status(201).json({ success: true, message: 'Playlist created', playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getPlaylists, createPlaylist };