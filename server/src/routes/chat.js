const express = require('express');
const router = express.Router();
require('dotenv').config();

// Import Google AI configuration
const { geminiModel, modelName } = require('../config/googleCloud');
const aiAgentService = require('../services/aiAgentService');

// POST /chat: Receives user query and returns Gemini AI response.
// Falls back to internal agent (with market data and lightweight tools) when Gemini fails or yields no text.
router.post('/', async (req, res) => {
  try {
    const { prompt, userId = 'default', language = 'en' } = req.body || {};

    if (!prompt) {
      return res.status(400).json({
        error: 'Missing prompt field in request body',
        example: { prompt: "What is the weather like today?" }
      });
    }

    console.log(` Processing prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);

    let aiResponse = null;
    let provider = 'gemini';
    let usedFallback = false;

    // Always try Gemini first with a robust prompt to prevent failures
    try {
      if (geminiModel && typeof geminiModel.generateContent === 'function') {
        const robustPrompt = `You are KisanSetu, a helpful agricultural assistant for Indian farmers. Answer the following question in a helpful, informative way. If you don't know something specific, provide general guidance or suggest where to find more information. Never say you cannot help or don't have access to information.

Question: ${prompt}

Please provide a helpful response:`;
        const result = await geminiModel.generateContent(robustPrompt);
        const response = await result.response;
        aiResponse = response && typeof response.text === 'function' ? response.text() : null;
      }
    } catch (e) {
      console.warn('Gemini primary call failed, will attempt agent fallback:', e.message);
    }

    // Only fall back to agent if Gemini truly failed or returned nothing
    if (!aiResponse || !String(aiResponse).trim() || aiResponse.toLowerCase().includes('cannot') || aiResponse.toLowerCase().includes('don\'t have access')) {
      usedFallback = true;
      provider = 'agent';
      try {
        const agentResult = await aiAgentService.processQuery(prompt, language, userId);
        aiResponse = agentResult?.data?.reply || null;
        // If agent still empty, force web tool as last resort
        if (!aiResponse && typeof aiAgentService.answerViaWeb === 'function') {
          aiResponse = await aiAgentService.answerViaWeb(prompt);
        }
        if (!aiResponse) aiResponse = 'I can help with agricultural topics, market prices, weather, and general farming advice. Try asking about specific crops, farming techniques, or current agricultural information.';
      } catch (agentErr) {
        console.error('Agent fallback failed:', agentErr);
        aiResponse = 'I can help with agricultural topics, market prices, weather, and general farming advice. Try asking about specific crops, farming techniques, or current agricultural information.';
      }
    }

    console.log(`✅ Responding via ${provider}${usedFallback ? ' (fallback)' : ''} (${(aiResponse || '').length} chars)`);

    return res.json({
      success: true,
      response: aiResponse,
      model: provider === 'gemini' ? modelName : 'internal-agent',
      provider,
      usedFallback,
      userId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Chat route error:', error);

    return res.status(500).json({
      error: 'Failed to generate response',
      details: error.message
    });
  }
});

module.exports = router;