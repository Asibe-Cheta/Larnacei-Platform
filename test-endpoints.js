const https = require('https');

const BASE_URL = 'https://larnacei-platform-5zw5-8j3248824-asibe-chetas-projects.vercel.app';

const endpoints = [
  '/api/test-sendgrid-simple',
  '/api/validate-sendgrid',
  '/api/debug/forgot-password',
  '/api/test-db'
];

async function testEndpoint(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    console.log(`\n🔍 Testing: ${url}`);

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          console.log(`✅ Status: ${res.statusCode}`);
          console.log('📄 Response:', JSON.stringify(jsonData, null, 2));
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          console.log(`❌ Status: ${res.statusCode}`);
          console.log('📄 Raw Response:', data);
          resolve({ status: res.statusCode, data: data });
        }
      });
    }).on('error', (error) => {
      console.log(`❌ Error: ${error.message}`);
      reject(error);
    });
  });
}

async function runTests() {
  console.log('🚀 Testing Larnacei Platform Endpoints');
  console.log('=====================================');

  for (const endpoint of endpoints) {
    try {
      await testEndpoint(endpoint);
    } catch (error) {
      console.log(`❌ Failed to test ${endpoint}: ${error.message}`);
    }
  }

  console.log('\n📋 Manual Testing Instructions:');
  console.log('================================');
  console.log('1. Test SendGrid Configuration:');
  console.log(`   ${BASE_URL}/api/test-sendgrid-simple`);
  console.log('\n2. Validate SendGrid Setup:');
  console.log(`   ${BASE_URL}/api/validate-sendgrid`);
  console.log('\n3. Debug Forgot Password:');
  console.log(`   ${BASE_URL}/api/debug/forgot-password`);
  console.log('\n4. Test Database Connection:');
  console.log(`   ${BASE_URL}/api/test-db`);
  console.log('\n5. Test Forgot Password (Manual):');
  console.log(`   ${BASE_URL}/forgot-password`);
}

runTests().catch(console.error); 