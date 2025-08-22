require('dotenv').config();

console.log('🚀 Quick Server Test...\n');

// Test 1: Check environment
console.log('📋 Environment Check:');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'SET' : '❌ NOT SET');
console.log('PORT:', process.env.PORT || '5000 (default)');

// Test 2: Check if node-fetch is available
console.log('\n📦 Dependency Check:');
try {
  require('node-fetch');
  console.log('✅ node-fetch is available');
} catch (e) {
  console.log('❌ node-fetch not found, installing...');
  console.log('Run: npm install node-fetch@2');
}

// Test 3: Test Gemini API directly
console.log('\n🔑 Testing Gemini API...');
async function testGemini() {
  try {
    // Add fetch polyfill
    if (typeof fetch === 'undefined') {
      global.fetch = require('node-fetch');
    }
    
    const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
  console.error('❌ GOOGLE_API_KEY not found in environment variables');
  process.exit(1);
}
    console.log('Using API key:', apiKey.substring(0, 10) + '...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Say "Test successful" in one word' }] }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✅ Gemini API working! Response:', text);
    } else {
      const error = await response.text();
      console.log('❌ Gemini API error:', response.status, error);
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testGemini();
