const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, playlistController.getPlaylists);
router.post('/', protect, playlistController.createPlaylist);

module.exports = router;