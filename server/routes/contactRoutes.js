const express = require('express');
const router = express.Router();
const { submitContactMessage } = require('../controllers/contactController');
const { protect } = require('../middleware/authMiddleware');

router.post('/submit', protect, submitContactMessage);

module.exports = router;
