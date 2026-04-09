const express = require('express');
const router = express.Router();
const favoriteController = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, favoriteController.getFavorites);
router.post('/', protect, favoriteController.addFavorite);
router.delete('/:songId', protect, favoriteController.removeFavorite);

module.exports = router;