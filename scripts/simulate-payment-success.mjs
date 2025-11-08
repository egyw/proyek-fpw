/**
 * Script untuk simulate payment success di Sandbox
 * Gunakan ini untuk test payment flow tanpa bayar real
 * 
 * Usage:
 * 1. Create order di web
 * 2. Copy Order ID (e.g., "ORD-20251108-001")
 * 3. Run: node scripts/simulate-payment-success.mjs ORD-20251108-001
 */

import https from 'https';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Get order ID from command line
const orderId = process.argv[2];

if (!orderId) {
  console.error('❌ Error: Order ID required!');
  console.log('\nUsage: node scripts/simulate-payment-success.mjs <ORDER_ID>');
  console.log('Example: node scripts/simulate-payment-success.mjs ORD-20251108-001');
  process.exit(1);
}

const serverKey = process.env.MIDTRANS_SERVER_KEY;

if (!serverKey) {
  console.error('❌ Error: MIDTRANS_SERVER_KEY not found in .env.local');
  process.exit(1);
}

// Encode server key for Basic Auth
const auth = Buffer.from(serverKey + ':').toString('base64');

console.log('🔄 Simulating payment success...');
console.log(`📦 Order ID: ${orderId}`);
console.log(`🔑 Using server key: ${serverKey.substring(0, 15)}...`);
console.log('');

// Prepare request data
const postData = JSON.stringify({
  transaction_status: 'settlement',
  status_code: '200',
  fraud_status: 'accept'
});

// API endpoint
const options = {
  hostname: 'api.sandbox.midtrans.com',
  port: 443,
  path: `/v2/${orderId}/status/b2b`,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Basic ${auth}`,
    'Content-Length': Buffer.byteLength(postData)
  }
};

// Make request
const req = https.request(options, (res) => {
  let responseData = '';

  res.on('data', (chunk) => {
    responseData += chunk;
  });

  res.on('end', () => {
    console.log(`📡 Response Status: ${res.statusCode}`);
    console.log('📄 Response Data:');
    
    try {
      const jsonResponse = JSON.parse(responseData);
      console.log(JSON.stringify(jsonResponse, null, 2));
      
      if (res.statusCode === 200 || res.statusCode === 201) {
        console.log('');
        console.log('✅ Payment simulation SUCCESS!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Refresh halaman order detail di browser');
        console.log('2. Status seharusnya berubah jadi "Paid"');
        console.log('3. Jika webhook configured, order akan auto-update');
      } else if (res.statusCode === 404) {
        console.log('');
        console.log('❌ Order not found!');
        console.log('');
        console.log('Possible issues:');
        console.log('- Order ID salah atau tidak ada');
        console.log('- Transaction belum created di Midtrans');
        console.log('- Check: https://dashboard.sandbox.midtrans.com/transactions');
      } else {
        console.log('');
        console.log('⚠️ Unexpected response!');
      }
    } catch {
      console.log(responseData);
      console.log('');
      console.log('❌ Failed to parse response');
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request Error:', error.message);
});

// Send request
req.write(postData);
req.end();
