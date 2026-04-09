const mongoose = require('mongoose');
const Coupon = require('./server/models/Coupon');
require('./server/config/db');

const testUserId = new mongoose.Types.ObjectId();

const testCoupon = {
  code: 'TESTCOUPON',
  discountType: 'percentage',
  discountValue: 20,
  maxUsageCount: 100,
  description: 'Test coupon - 20% off',
  createdBy: testUserId
};

async function createTestCoupon() {
  try {
    // Check if coupon already exists
    const existing = await Coupon.findOne({ code: 'TESTCOUPON' });
    if (existing) {
      console.log('Coupon already exists:', existing);
      process.exit(0);
    }

    const coupon = new Coupon(testCoupon);
    await coupon.save();
    console.log('Test coupon created:', coupon);
    process.exit(0);
  } catch (error) {
    console.error('Error creating coupon:', error.message);
    process.exit(1);
  }
}

createTestCoupon();
