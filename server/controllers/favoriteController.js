const Favorite = require('../models/Favorite');

const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user?.id })
      .populate('song')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, favorites });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addFavorite = async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'Song ID is required' });
    }

    // Check if already favorited
    const existing = await Favorite.findOne({ user: req.user?.id, song: songId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already favorited' });
    }

    const favorite = new Favorite({
      user: req.user?.id,
      song: songId,
    });

    await favorite.save();
    res.status(201).json({ success: true, message: 'Added to favorites', favorite });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { songId } = req.params;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'Song ID is required' });
    }

    const favorite = await Favorite.findOneAndDelete({ user: req.user?.id, song: songId });

    if (!favorite) {
      return res.status(404).json({ success: false, message: 'Favorite not found' });
    }

    res.status(200).json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getFavorites, addFavorite, removeFavorite };