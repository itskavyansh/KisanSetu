const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Use API key authentication for Google AI (supports multiple env var names)
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!apiKey) {
  console.warn('⚠️ Missing Gemini API key (set GEMINI_API_KEY or GOOGLE_API_KEY). Gemini features will be disabled.');
}

console.log('🔧 Initializing Google AI with API key:');
console.log(`   Model: ${modelName}`);

let genAI;
let geminiModel;

try {
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({ model: modelName });
    console.log('✅ Google AI initialized successfully with API key');
  } else {
    geminiModel = null;
  }
} catch (error) {
  console.error('❌ Failed to initialize Google AI:', error?.message || error);
  console.error('Please check your API key.');
  geminiModel = null;
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
