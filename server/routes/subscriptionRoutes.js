const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User routes
router.post('/create', protect, subscriptionController.createSubscription);
router.post('/payment/order', protect, subscriptionController.createPaymentOrder);
router.post('/payment/verify', protect, subscriptionController.verifyPaymentAndCreateSubscription);
router.get('/user', protect, subscriptionController.getUserSubscription);
router.post('/upgrade', protect, subscriptionController.upgradeSubscription);
router.post('/cancel', protect, subscriptionController.cancelSubscription);

// Admin routes
router.get('/admin/all', protect, adminOnly, subscriptionController.getAllSubscriptions);
router.get('/admin/stats', protect, adminOnly, subscriptionController.getSubscriptionStats);

module.exports = router;
