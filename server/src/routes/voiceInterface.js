const express = require('express');
const multer = require('multer');
const voiceInterfaceService = require('../services/voiceInterfaceService');
const aiAgentService = require('../services/aiAgentService');
const { geminiModel } = require('../config/googleCloud');
const router = express.Router();

// Configure multer for audio uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.mimetype === 'video/webm') {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'), false);
    }
  },
});

// POST /api/voice/process-audio
router.post('/process-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const { language = 'kannada' } = req.body;
    const audioBuffer = req.file.buffer;

    // Process voice input
    const voiceResult = await voiceInterfaceService.processVoiceInput(audioBuffer, language);
    
    // Process query with AI agent
    const aiResponse = await aiAgentService.processQuery(
      voiceResult.data.transcript, 
      language
    );

    res.json({
      success: true,
      data: {
        voiceInput: voiceResult.data,
        aiResponse: aiResponse.data,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice input',
      message: error.message
    });
  }
});

// POST /api/voice/generate-response
router.post('/generate-response', async (req, res) => {
  try {
    const { text, language = 'kannada' } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const voiceResponse = await voiceInterfaceService.generateVoiceResponse(text, language);
    
    res.json(voiceResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/voice/chat
router.post('/chat', async (req, res) => {
  try {
    const { query, userId = 'default' } = req.body;
    const language = 'english'; // Force English for chat-based queries to avoid translation-only replies
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Use Vertex AI Gemini primarily
    let replyText = null;
    let usedFallback = false;

    try {
      if (geminiModel && typeof geminiModel.generateContent === 'function') {
        const result = await geminiModel.generateContent({
          contents: [
            { role: 'user', parts: [{ text: `You are KisanSetu, an agricultural assistant. Answer concisely and helpfully.\nQuestion: ${query}` }] }
          ]
        });
        replyText = result?.candidates?.[0]?.content?.parts?.[0]?.text || null;
      }
    } catch (e) {
      usedFallback = true;
      console.warn('Vertex AI failed in /api/voice/chat:', e.message);
    }

    if (!replyText) {
      usedFallback = true;
      const fallback = await aiAgentService.processQuery(query, language, userId);
      replyText = fallback?.data?.reply || 'Sorry, I could not generate a response.';
    }

    return res.json({ success: true, data: { reply: replyText, language, usedFallback, timestamp: new Date().toISOString() } });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/voice/conversation-history/:userId
router.get('/conversation-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await aiAgentService.getConversationHistory(userId);
    
    res.json(history);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/voice/supported-languages
router.get('/supported-languages', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        languages: ['kannada', 'hindi', 'english', 'telugu', 'tamil'],
        defaultLanguage: 'kannada',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
