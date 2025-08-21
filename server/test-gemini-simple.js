require('dotenv').config();

console.log('🧪 Testing Gemini API Key...\n');

const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyAnEATv0YIS1e9Zt9oKKkjm13w8CzViJuY';
console.log('🔑 API Key:', apiKey.substring(0, 10) + '...');

async function testGeminiAPI() {
  try {
    console.log('\n📤 Testing Gemini API directly...');
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: 'Say "Hello from Gemini" in one word' }]
        }],
        generationConfig: { maxOutputTokens: 10 }
      })
    });

    console.log('📊 Response status:', response.status);
    console.log('📊 Response headers:', response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.candidates && data.candidates[0]) {
      const text = data.candidates[0].content.parts[0].text;
      console.log('🎯 Extracted text:', text);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Add fetch polyfill if needed
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

testGeminiAPI();
