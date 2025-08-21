const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();

// Add fetch polyfill for Node.js
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

console.log('🔧 Google Cloud Configuration:');
console.log('Project ID:', process.env.GOOGLE_CLOUD_PROJECT_ID || 'NOT SET');
console.log('Location:', process.env.VERTEX_AI_LOCATION || 'us-central1 (default)');
console.log('Model:', process.env.GEMINI_MODEL_NAME || 'gemini-1.5-flash (default)');
console.log('API Key:', process.env.GOOGLE_API_KEY ? 'SET' : 'NOT SET');

try {
  // Use API key for direct Gemini access
  const geminiModel = {
    generateContent: async (request) => {
      const apiKey = process.env.GOOGLE_API_KEY || 'AIzaSyAnEATv0YIS1e9Zt9oKKkjm13w8CzViJuY';
      
      console.log('🔑 Using API key:', apiKey.substring(0, 10) + '...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: request.contents,
          generationConfig: request.generationConfig || {}
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API error response:', errorText);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ Gemini API response received');
      return {
        response: {
          candidates: data.candidates || []
        }
      };
    }
  };

  console.log('✅ Gemini model configured with API key');

  module.exports = {
    geminiModel,
  };
} catch (error) {
  console.error('❌ Failed to initialize Gemini:', error.message);
  throw error;
}