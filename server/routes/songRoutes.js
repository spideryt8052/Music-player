const express = require('express');
const multer = require('multer');
const path = require('path');
const songController = require('../controllers/songController');
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

// Routes
router.get('/most-played', songController.getMostPlayed);
router.get('/', songController.getSongs);
router.post('/', protect, adminOnly, upload.single('file'), songController.addSong);
router.get('/:id', songController.getSongById);
router.put('/:id/play', songController.playSong);

module.exports = router;