const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

router.get('/', playlistController.getPlaylists);
router.post('/', playlistController.createPlaylist);

module.exports = router;