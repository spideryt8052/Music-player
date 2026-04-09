const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Admin routes
router.post('/create', protect, adminOnly, couponController.createCoupon);
router.get('/all', protect, adminOnly, couponController.getAllCoupons);
router.put('/:id', protect, adminOnly, couponController.updateCoupon);
router.delete('/:id', protect, adminOnly, couponController.deleteCoupon);

// User routes
router.post('/validate', couponController.validateCoupon);

module.exports = router;
