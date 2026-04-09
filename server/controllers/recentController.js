const Recent = require('../models/Recent');

const getRecent = async (req, res) => {
  try {
    const recent = await Recent.find({ user: req.user?.id })
      .populate('song')
      .sort({ playedAt: -1 })
      .limit(20);

    res.status(200).json({ success: true, recent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addRecent = async (req, res) => {
  try {
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ success: false, message: 'Song ID is required' });
    }

    // Remove any existing entry for this song by this user
    await Recent.findOneAndDelete({ user: req.user.id, song: songId });

    // Add new recent entry
    const recentEntry = new Recent({
      user: req.user.id,
      song: songId,
      playedAt: new Date()
    });

    await recentEntry.save();

    res.status(200).json({ success: true, message: 'Song added to recent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const clearRecent = async (req, res) => {
  try {
    await Recent.deleteMany({ user: req.user.id });
    res.status(200).json({ success: true, message: 'Recent songs cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRecent, addRecent, clearRecent };