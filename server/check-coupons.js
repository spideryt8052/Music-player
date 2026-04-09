const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
require('./config/db');

(async () => {
  try {
    const coupons = await Coupon.find({});
    console.log('Total Coupons:', coupons.length);
    coupons.forEach(c => {
      console.log(`\nCode: ${c.code}`);
      console.log(`Active: ${c.isActive}`);
      console.log(`Expiry: ${c.expiryDate}`);
      console.log(`Discount: ${c.discountValue}% (${c.discountType})`);
      console.log(`Usage: ${c.currentUsageCount}/${c.maxUsageCount || 'unlimited'}`);
    });
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
