const express = require('express');
const router = express.Router();
const recentController = require('../controllers/recentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, recentController.getRecent);
router.post('/add', protect, recentController.addRecent);
router.delete('/clear', protect, recentController.clearRecent);

module.exports = router;