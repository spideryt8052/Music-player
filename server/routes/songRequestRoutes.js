const express = require('express');
const multer = require('multer');
const path = require('path');
const songRequestController = require('../controllers/songRequestController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  },
});

// User routes
router.post('/', protect, upload.single('file'), songRequestController.createSongRequest);
router.get('/my-requests', protect, songRequestController.getUserRequests);

// Admin routes
router.get('/', protect, adminOnly, songRequestController.getPendingRequests);
router.post('/:id/approve', protect, adminOnly, songRequestController.approveSongRequest);
router.post('/:id/deny', protect, adminOnly, songRequestController.denySongRequest);

module.exports = router;
