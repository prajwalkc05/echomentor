// Test Backend Endpoints
// Run this with: node test-backend.js

const API_BASE_URL = 'https://echobackend-dexy.onrender.com';

async function testEndpoint(method, endpoint, data = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (data) options.body = JSON.stringify(data);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const result = await response.json();
    console.log(`✓ ${method} ${endpoint}:`, response.status, result);
    return result;
  } catch (error) {
    console.log(`✗ ${method} ${endpoint}:`, error.message);
  }
}

async function runTests() {
  console.log('Testing Backend API Endpoints...\n');
  
  // Test root
  await testEndpoint('GET', '/');
  
  // Test common auth endpoints
  await testEndpoint('GET', '/api/auth');
  await testEndpoint('POST', '/api/auth/signup', { name: 'Test', email: 'test@test.com', password: '123456' });
  await testEndpoint('POST', '/api/auth/login', { email: 'test@test.com', password: '123456' });
  
  // Test user endpoints
  await testEndpoint('GET', '/api/users');
  await testEndpoint('GET', '/api/user');
  
  // Test other possible endpoints
  await testEndpoint('GET', '/api');
  await testEndpoint('GET', '/health');
  await testEndpoint('GET', '/api/health');
}

runTests();
