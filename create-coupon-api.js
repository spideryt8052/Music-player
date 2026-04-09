const http = require('http');

// Create test coupons via API
const createCouponRequest = {
  code: 'SAVE20',
  discountType: 'percentage',
  discountValue: 20,
  maxUsageCount: 100,
  description: 'Save 20% discount',
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
};

// Note: This will fail without admin auth, but let's try
const data = JSON.stringify(createCouponRequest);

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/coupons/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length,
    'Authorization': 'Bearer YOUR_ADMIN_TOKEN_HERE' // Would need real token
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Create Coupon Response:', body);
  });
});

req.on('error', (e) => {
  console.error('Error:', e.message);
});

req.write(data);
req.end();
