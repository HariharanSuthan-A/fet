/**
 * Simple API test script
 * Run with: node test-api.js
 * 
 * Tests basic connectivity and health check
 */

const BASE_URL = 'http://localhost:3000';

async function testHealthCheck() {
  console.log('\n📋 Testing Health Check...');
  try {
    const response = await fetch(`${BASE_URL}/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data);
    return true;
  } catch (error) {
    console.error('❌ Health Check Failed:', error.message);
    return false;
  }
}

async function testApiDocs() {
  console.log('\n📚 Testing API Documentation...');
  try {
    const response = await fetch(`${BASE_URL}/api/docs`);
    const data = await response.json();
    console.log('✅ API Docs Available');
    console.log('   Endpoints:', Object.keys(data.endpoints).length, 'categories');
    return true;
  } catch (error) {
    console.error('❌ API Docs Failed:', error.message);
    return false;
  }
}

async function testStartAuth() {
  console.log('\n🔐 Testing OAuth Start Auth...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/start-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: 'test-client-id.apps.googleusercontent.com',
        redirectUri: 'http://localhost:3000/callback',
        scopes: ['https://www.googleapis.com/auth/gmail.send']
      })
    });
    const data = await response.json();
    
    if (data.success && data.authUrl) {
      console.log('✅ OAuth URL Generated');
      console.log('   URL starts with:', data.authUrl.substring(0, 50) + '...');
      return true;
    } else {
      console.error('❌ Invalid response:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Start Auth Failed:', error.message);
    return false;
  }
}

async function testInvalidEndpoint() {
  console.log('\n🚫 Testing Invalid Endpoint...');
  try {
    const response = await fetch(`${BASE_URL}/api/invalid-endpoint`);
    const data = await response.json();
    
    if (response.status === 404 && data.error === 'Not found') {
      console.log('✅ 404 Error Handling Works');
      return true;
    } else {
      console.error('❌ Unexpected response:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Invalid Endpoint Test Failed:', error.message);
    return false;
  }
}

async function testMissingFields() {
  console.log('\n⚠️  Testing Missing Required Fields...');
  try {
    const response = await fetch(`${BASE_URL}/api/auth/start-auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        // Missing clientId and redirectUri
      })
    });
    const data = await response.json();
    
    if (response.status === 400 && data.error) {
      console.log('✅ Validation Error Handling Works');
      console.log('   Error:', data.error);
      return true;
    } else {
      console.error('❌ Unexpected response:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Missing Fields Test Failed:', error.message);
    return false;
  }
}

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  Multi-User Google Services Platform - API Test Suite      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log('Testing server connectivity and basic functionality...\n');

  const results = [];

  // Run tests
  results.push(await testHealthCheck());
  results.push(await testApiDocs());
  results.push(await testStartAuth());
  results.push(await testInvalidEndpoint());
  results.push(await testMissingFields());

  // Summary
  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log(`║  Test Results: ${passed}/${total} passed                                  ║`);
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  if (passed === total) {
    console.log('🎉 All tests passed! Server is ready to use.\n');
    console.log('Next steps:');
    console.log('1. Set up Google OAuth credentials');
    console.log('2. Test OAuth flow with your credentials');
    console.log('3. Try sending an email or accessing Sheets/Drive');
    console.log('4. See QUICKSTART.md for detailed examples\n');
  } else {
    console.log(`⚠️  ${total - passed} test(s) failed. Check the errors above.\n`);
  }

  process.exit(passed === total ? 0 : 1);
}

// Check if server is running
fetch(`${BASE_URL}/health`)
  .then(() => runAllTests())
  .catch(() => {
    console.error(`\n❌ Cannot connect to server at ${BASE_URL}`);
    console.error('Make sure the server is running: npm run dev\n');
    process.exit(1);
  });
