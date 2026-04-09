const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
require('./config/db');

const testUserId = new mongoose.Types.ObjectId();

const createCoupon = async () => {
  try {
    const existing = await Coupon.findOne({ code: 'TESTCOUPON' });
    if (existing) {
      console.log('Coupon already exists');
      process.exit(0);
    }

    const coupon = new Coupon({
      code: 'TESTCOUPON',
      discountType: 'percentage',
      discountValue: 20,
      maxUsageCount: 100,
      description: 'Test coupon - 20% off',
      createdBy: testUserId
    });
    await coupon.save();
    console.log('Coupon created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createCoupon();
