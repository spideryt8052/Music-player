const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
require('./config/db');

const testUserId = new mongoose.Types.ObjectId();

const createCoupons = async () => {
  try {
    // Delete existing test coupons
    await Coupon.deleteMany({ code: { $in: ['SAVE20', 'SAVE50', 'TESTCOUPON'] } });

    // Create test coupons
    const coupons = [
      {
        code: 'SAVE20',
        discountType: 'percentage',
        discountValue: 20,
        maxUsageCount: 100,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        description: 'Save 20% on subscription',
        createdBy: testUserId,
        isActive: true
      },
      {
        code: 'SAVE50',
        discountType: 'fixed',
        discountValue: 50,
        maxUsageCount: 50,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        description: 'Save fixed ₹50',
        createdBy: testUserId,
        isActive: true
      }
    ];

    const created = await Coupon.insertMany(coupons);
    console.log('✓ Created test coupons:');
    created.forEach(c => {
      console.log(`  - ${c.code} (${c.discountValue}${c.discountType === 'percentage' ? '%' : '₹'}) - Active: ${c.isActive}`);
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createCoupons();
