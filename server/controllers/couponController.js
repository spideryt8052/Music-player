const Coupon = require('../models/Coupon');
const Subscription = require('../models/Subscription');

const planPricing = {
  free: { monthly: 0, yearly: 0 },
  premium: { monthly: 99, yearly: 990 },
  pro: { monthly: 199, yearly: 1990 }
};

const getPlanPrice = (plan, billingCycle = 'monthly') => {
  const cycle = billingCycle === 'yearly' ? 'yearly' : 'monthly';
  return planPricing[plan]?.[cycle] ?? 0;
};

// Create a new coupon (Admin only)
exports.createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, maxUsageCount, expiryDate, description } = req.body;
    const userId = req.user.id;

    if (!code || !discountValue) {
      return res.status(400).json({ 
        success: false, 
        message: 'Code and discount value are required' 
      });
    }

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return res.status(400).json({ 
        success: false, 
        message: 'Coupon code already exists' 
      });
    }

    const coupon = new Coupon({
      code,
      discountType,
      discountValue,
      maxUsageCount: maxUsageCount || null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      description,
      createdBy: userId
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating coupon'
    });
  }
};

// Get all coupons (Admin only)
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      coupons
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coupons'
    });
  }
};

// Validate coupon (For users)
exports.validateCoupon = async (req, res) => {
  try {
    const { code, amount, plan, billingCycle } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired coupon'
      });
    }

    // Check expiry
    if (coupon.expiryDate && new Date() > coupon.expiryDate) {
      return res.status(400).json({
        success: false,
        message: 'Coupon has expired'
      });
    }

    // Check usage limit
    if (coupon.maxUsageCount && coupon.currentUsageCount >= coupon.maxUsageCount) {
      return res.status(400).json({
        success: false,
        message: 'Coupon usage limit reached'
      });
    }

    const calculatedAmount = Number.isFinite(Number(amount))
      ? Number(amount)
      : getPlanPrice(plan, billingCycle);

    if (!Number.isFinite(calculatedAmount) || calculatedAmount < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount'
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (calculatedAmount * coupon.discountValue) / 100;
    } else {
      // Cap fixed discount at amount (don't give discount more than price)
      discountAmount = Math.min(coupon.discountValue, calculatedAmount);
    }

    const finalAmount = Math.max(0, calculatedAmount - discountAmount);

    res.json({
      success: true,
      message: 'Coupon is valid',
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Math.round(discountAmount * 100) / 100,
        finalAmount: Math.round(finalAmount * 100) / 100
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error validating coupon'
    });
  }
};

// Update coupon (Admin only)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { discountValue, maxUsageCount, expiryDate, isActive, description } = req.body;

    const coupon = await Coupon.findByIdAndUpdate(
      id,
      {
        discountValue,
        maxUsageCount: maxUsageCount || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive,
        description
      },
      { new: true }
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coupon'
    });
  }
};

// Delete coupon (Admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByIdAndDelete(id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coupon'
    });
  }
};

// Increment coupon usage (Internal use)
exports.incrementCouponUsage = async (couponCode) => {
  try {
    await Coupon.updateOne(
      { code: couponCode.toUpperCase() },
      { $inc: { currentUsageCount: 1 } }
    );
  } catch (error) {
    console.error('Increment coupon usage error:', error);
  }
};
