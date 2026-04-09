const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/request-mobile-otp', authController.requestMobileOtp);
router.post('/verify-mobile-otp', authController.verifyMobileOtp);

module.exports = router;