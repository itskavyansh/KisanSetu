require('dotenv').config();
const { geminiModel } = require('./src/config/googleCloud');
const fs = require('fs');
const path = require('path');

async function testGemini() {
  try {
    console.log('🧪 Testing Gemini connectivity...');
    
    // Test 1: Simple text generation
    console.log('\n1. Testing text generation...');
    const textResult = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say "Hello from Gemini" in one word' }] }],
      generationConfig: { maxOutputTokens: 10 }
    });
    
    const textResponse = textResult.response?.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('✅ Text response:', textResponse);
    
    // Test 2: Image analysis (if test image exists)
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    if (fs.existsSync(testImagePath)) {
      console.log('\n2. Testing image analysis...');
      const imageBuffer = fs.readFileSync(testImagePath);
      const base64Image = imageBuffer.toString('base64');
      
      const imageResult = await geminiModel.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: 'Is this image showing a plant? Answer with just "yes" or "no".' },
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: { maxOutputTokens: 10 }
      });
      
      const imageResponse = imageResult.response?.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log('✅ Image response:', imageResponse);
    } else {
      console.log('\n2. Skipping image test (no test-image.jpg found)');
    }
    
    console.log('\n🎉 All tests passed! Gemini is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Error details:', error);
    
    if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication issue detected. Check:');
      console.log('1. GOOGLE_CLOUD_PROJECT_ID in .env');
      console.log('2. Service account key file exists');
      console.log('3. Vertex AI API is enabled');
    }
  }
}

testGemini();
