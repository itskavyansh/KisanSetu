const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Use API key authentication for Google AI
const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!apiKey) {
  console.error('❌ Missing required environment variable: GEMINI_API_KEY');
  console.error('Please set your Gemini API key in the .env file');
  process.exit(1);
}

console.log('🔧 Initializing Google AI with API key:');
console.log(`   Model: ${modelName}`);

let genAI;
let geminiModel;

try {
  genAI = new GoogleGenerativeAI(apiKey);
  geminiModel = genAI.getGenerativeModel({ model: modelName });

  console.log('✅ Google AI initialized successfully with API key');
} catch (error) {
  console.error('❌ Failed to initialize Google AI:', error?.message || error);
  console.error('Please check your API key.');
  process.exit(1);
}

module.exports = {
  genAI,
  geminiModel,
  modelName,
  // Keep these for compatibility with existing code
  vertexAI: null,
  projectId: 'api-key-mode',
  location: 'api-key-mode',
};