const Subscription = require('../models/Subscription');
const Coupon = require('../models/Coupon');
const User = require('../models/User');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const { incrementCouponUsage } = require('./couponController');

// Plan pricing by billing cycle
const planPricing = {
  free: { monthly: 0, yearly: 0 },
  premium: { monthly: 99, yearly: 990 },
  pro: { monthly: 199, yearly: 1990 }
};

const getPlanPrice = (plan, billingCycle = 'monthly') => {
  const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  return planPricing[plan]?.[cycle] ?? 0;
};

const validatePlanAndCycle = (plan, billingCycle) => {
  if (!plan || !['free', 'premium', 'pro'].includes(plan)) {
    return 'Invalid plan';
  }

  if (billingCycle && !['monthly', 'yearly'].includes(billingCycle)) {
    return 'Invalid billing cycle';
  }

  return null;
};

const getCouponPricing = async (plan, billingCycle, couponCode) => {
  const normalizedBillingCycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  const basePrice = getPlanPrice(plan, normalizedBillingCycle);

  let finalPrice = basePrice;
  let couponUsed = null;
  let discountAmount = 0;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return { error: 'Invalid coupon code' };
    }

    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return { error: 'Coupon has expired' };
    }

    if (coupon.maxUsageCount && coupon.currentUsageCount >= coupon.maxUsageCount) {
      return { error: 'Coupon usage limit reached' };
    }

    if (coupon.discountType === 'percentage') {
      discountAmount = (basePrice * coupon.discountValue) / 100;
    } else {
      discountAmount = Math.min(coupon.discountValue, basePrice);
    }

    finalPrice = Math.max(0, basePrice - discountAmount);
    couponUsed = coupon._id;
  }

  return {
    normalizedBillingCycle,
    basePrice,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discountAmount: Math.round(discountAmount * 100) / 100,
    couponUsed
  };
};

const createCompletedSubscription = async ({ userId, plan, billingCycle, couponCode, paymentMethod = null, transactionId = null }) => {
  const pricing = await getCouponPricing(plan, billingCycle, couponCode);
  if (pricing.error) {
    return { error: pricing.error };
  }

  const startDate = new Date();
  const endDate = new Date(startDate);
  if (pricing.normalizedBillingCycle === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  } else {
    endDate.setMonth(endDate.getMonth() + 1);
  }

  const subscription = new Subscription({
    user: userId,
    plan,
    price: pricing.basePrice,
    billingCycle: pricing.normalizedBillingCycle,
    startDate,
    endDate,
    couponUsed: pricing.couponUsed,
    discountAmount: pricing.discountAmount,
    paymentStatus: 'completed',
    paymentMethod,
    transactionId,
    isActive: true
  });

  await subscription.save();

  if (couponCode) {
    await incrementCouponUsage(couponCode);
  }

  await User.findByIdAndUpdate(userId, {
    currentSubscriptionPlan: plan,
    subscriptionEndDate: endDate
  }, { new: true });

  return {
    subscription,
    finalPrice: pricing.finalPrice
  };
};

const getRazorpayInstance = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
};

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const { plan, billingCycle, couponCode } = req.body;
    const userId = req.user.id;

    const validationError = validatePlanAndCycle(plan, billingCycle);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Free plan cannot use coupons
    if (plan === 'free' && couponCode) {
      return res.status(400).json({
        success: false,
        message: 'Coupons cannot be applied to free plan'
      });
    }

    if (plan !== 'free') {
      return res.status(400).json({
        success: false,
        message: 'Payment required for paid plans. Use Razorpay payment flow.'
      });
    }

    // Check if user already has active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      isActive: true,
      paymentStatus: 'completed'
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription'
      });
    }

    const created = await createCompletedSubscription({
      userId,
      plan,
      billingCycle,
      couponCode,
      paymentMethod: 'none',
      transactionId: null
    });

    if (created.error) {
      return res.status(400).json({
        success: false,
        message: created.error
      });
    }

    const { subscription, finalPrice } = created;

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      subscription: {
        plan: subscription.plan,
        billingCycle: subscription.billingCycle,
        basePrice: subscription.price,
        discountAmount: subscription.discountAmount,
        finalPrice,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        autoRenew: subscription.autoRenew
      }
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subscription'
    });
  }
};

// Create Razorpay payment order for paid subscriptions
exports.createPaymentOrder = async (req, res) => {
  try {
    const { plan, billingCycle, couponCode } = req.body;
    const userId = req.user.id;

    const validationError = validatePlanAndCycle(plan, billingCycle);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Free plan does not require payment'
      });
    }

    const existingSubscription = await Subscription.findOne({
      user: userId,
      isActive: true,
      paymentStatus: 'completed'
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription'
      });
    }

    const pricing = await getCouponPricing(plan, billingCycle, couponCode);
    if (pricing.error) {
      return res.status(400).json({ success: false, message: pricing.error });
    }

    if (pricing.finalPrice <= 0) {
      const created = await createCompletedSubscription({
        userId,
        plan,
        billingCycle,
        couponCode,
        paymentMethod: 'coupon',
        transactionId: null
      });

      if (created.error) {
        return res.status(400).json({ success: false, message: created.error });
      }

      return res.status(201).json({
        success: true,
        paymentRequired: false,
        message: 'Subscription created successfully via full coupon discount',
        subscription: created.subscription
      });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay is not configured on server'
      });
    }

    const amountInPaise = Math.round(pricing.finalPrice * 100);
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `sub_${userId}_${Date.now()}`,
      notes: {
        userId: String(userId),
        plan,
        billingCycle: pricing.normalizedBillingCycle,
        couponCode: couponCode || ''
      }
    });

    return res.json({
      success: true,
      paymentRequired: true,
      order,
      pricing: {
        basePrice: pricing.basePrice,
        discountAmount: pricing.discountAmount,
        finalPrice: pricing.finalPrice
      }
    });
  } catch (error) {
    console.error('Create payment order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating payment order'
    });
  }
};

// Verify Razorpay payment and activate subscription
exports.verifyPaymentAndCreateSubscription = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      billingCycle,
      couponCode
    } = req.body;
    const userId = req.user.id;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification fields'
      });
    }

    const validationError = validatePlanAndCycle(plan, billingCycle);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (plan === 'free') {
      return res.status(400).json({
        success: false,
        message: 'Free plan does not require Razorpay verification'
      });
    }

    const existingSubscription = await Subscription.findOne({
      user: userId,
      isActive: true,
      paymentStatus: 'completed'
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription'
      });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

    const created = await createCompletedSubscription({
      userId,
      plan,
      billingCycle,
      couponCode,
      paymentMethod: 'razorpay',
      transactionId: razorpay_payment_id
    });

    if (created.error) {
      return res.status(400).json({ success: false, message: created.error });
    }

    res.status(201).json({
      success: true,
      message: 'Payment verified and subscription activated',
      subscription: created.subscription
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying payment'
    });
  }
};

// Get user subscription
exports.getUserSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      isActive: true
    }).populate('couponUsed', 'code discountType discountValue');

    if (!subscription) {
      return res.json({
        success: true,
        subscription: null,
        plan: 'free'
      });
    }

    // Check if subscription is expired
    if (new Date() > subscription.endDate) {
      await Subscription.updateOne(
        { _id: subscription._id },
        { isActive: false }
      );
      return res.json({
        success: true,
        subscription: null,
        plan: 'free'
      });
    }

    res.json({
      success: true,
      subscription,
      plan: subscription.plan
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription'
    });
  }
};

// Upgrade subscription
exports.upgradeSubscription = async (req, res) => {
  try {
    const { newPlan, billingCycle, couponCode } = req.body;
    const userId = req.user.id;

    if (!newPlan || !['premium', 'pro'].includes(newPlan)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan for upgrade'
      });
    }

    const existingSubscription = await Subscription.findOne({
      user: userId,
      isActive: true
    });

    if (!existingSubscription) {
      // Create new subscription if none exists
      return exports.createSubscription(req, res);
    }

    // Deactivate old subscription
    await Subscription.updateOne(
      { _id: existingSubscription._id },
      { isActive: false }
    );

    // Create new subscription with same logic as createSubscription
    req.body.plan = newPlan;
    return exports.createSubscription(req, res);
  } catch (error) {
    console.error('Upgrade subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error upgrading subscription'
    });
  }
};

// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOneAndUpdate(
      { user: userId, isActive: true },
      { isActive: false, paymentStatus: 'cancelled' },
      { new: true }
    );

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'No active subscription found'
      });
    }

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling subscription'
    });
  }
};

// Get all subscriptions (Admin)
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'username email')
      .populate('couponUsed', 'code discountValue')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions
    });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscriptions'
    });
  }
};

// Get subscription stats (Admin)
exports.getSubscriptionStats = async (req, res) => {
  try {
    const activeSubscriptions = await Subscription.countDocuments({
      isActive: true,
      paymentStatus: 'completed'
    });

    const totalRevenue = await Subscription.aggregate([
      { $match: { paymentStatus: 'completed' } },
      { $group: { _id: null, total: { $sum: { $subtract: ['$price', '$discountAmount'] } } } }
    ]);

    const planBreakdown = await Subscription.aggregate([
      { $match: { isActive: true, paymentStatus: 'completed' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      stats: {
        activeSubscriptions,
        totalRevenue: totalRevenue[0]?.total || 0,
        planBreakdown
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching subscription stats'
    });
  }
};
