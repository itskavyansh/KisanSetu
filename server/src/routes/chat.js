const express = require('express');
const router = express.Router();
require('dotenv').config();

// Import Google AI configuration
const { geminiModel, modelName } = require('../config/googleCloud');

// POST /chat: Receives user query and returns Gemini AI response
router.post('/', async (req, res) => {
  try {
    const { prompt, userId = 'default' } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt field in request body',
        example: { prompt: "What is the weather like today?" }
      });
    }

    console.log(` Processing prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);

    // Call Google AI Gemini model
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const aiResponse = response.text();

    console.log(`✅ Generated response (${aiResponse.length} chars)`);

    return res.json({
      success: true,
      response: aiResponse,
      model: modelName,
      userId: userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat route error:', error);

    return res.status(500).json({
      error: 'Failed to generate response from Google AI',
      details: error.message
    });
  }
});

module.exports = router;