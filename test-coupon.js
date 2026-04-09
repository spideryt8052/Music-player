const http = require('http');

// Test with a coupon that should exist
const testCases = [
  {
    code: 'SAVE20',
    amount: 100,
    plan: 'premium',
    billingCycle: 'monthly'
  },
  {
    code: 'SAVE50',
    amount: 100,
    plan: 'premium',
    billingCycle: 'monthly'
  },
  {
    code: 'INVALID_CODE',
    amount: 100,
    plan: 'premium',
    billingCycle: 'monthly'
  }
];

function testValidation(testCase) {
  return new Promise((resolve) => {
    const data = JSON.stringify(testCase);

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/coupons/validate',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\n✓ Code: ${testCase.code}`);
        console.log(`  Response: ${body}`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error('Error:', e.message);
      resolve();
    });

    req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('Testing Coupon Validation API...\n');
  for (const testCase of testCases) {
    await testValidation(testCase);
  }
}

runTests();
