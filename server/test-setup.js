require('dotenv').config();

console.log('🧪 Testing KisanSetu Setup...\n');

console.log('📋 Environment Variables:');
console.log('GOOGLE_API_KEY:', process.env.GOOGLE_API_KEY ? 'SET' : '❌ NOT SET');
console.log('GOOGLE_CLOUD_PROJECT_ID:', process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT SET');
console.log('VERTEX_AI_LOCATION:', process.env.VERTEX_AI_LOCATION || '✅ Default: us-central1');
console.log('GEMINI_MODEL_NAME:', process.env.GEMINI_MODEL_NAME || '✅ Default: gemini-1.5-flash');

console.log('\n🔍 Checking API key...');
if (process.env.GOOGLE_API_KEY) {
  console.log('✅ API key is set');
} else {
  console.log('⚠️ Using fallback API key from code');
}

console.log('\n🚀 Testing Gemini connectivity...');

async function testGemini() {
  try {
    const { geminiModel } = require('./src/config/googleCloud');
    
    console.log('✅ Gemini model loaded successfully');
    
    // Test 1: Simple text generation
    console.log('\n1. Testing text generation...');
    const textResult = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say "Hello" in one word' }] }],
      generationConfig: { maxOutputTokens: 10 }
    });
    
    const response = textResult.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Gemini response:', response);
    
    // Test 2: Plant check (without image)
    console.log('\n2. Testing plant check logic...');
    const plantCheckResult = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Is a tomato plant a plant? Answer with only: {"isPlant": true}' }] }],
      generationConfig: { maxOutputTokens: 20 }
    });
    
    const plantResponse = plantCheckResult.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Plant check response:', plantResponse);
    
    console.log('\n🎉 All tests passed! Gemini is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('fetch')) {
      console.log('\n💡 Fetch error detected. Make sure node-fetch is installed:');
      console.log('npm install node-fetch@2');
    }
    
    if (error.message.includes('API')) {
      console.log('\n💡 API error detected. Check:');
      console.log('1. API key is valid');
      console.log('2. Gemini API is accessible');
    }
  }
}

testGemini();
