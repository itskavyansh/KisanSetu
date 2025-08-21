const express = require('express');
const multer = require('multer');
const realCropHealthService = require('../services/realCropHealthService');
const cropHealthService = require('../services/cropHealthService');
const { geminiModel } = require('../config/googleCloud');
const router = express.Router();

// Multer configuration for handling image uploads (memory storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// GET /api/crop-health/test-image
router.get('/test-image', async (req, res) => {
  try {
    console.log('🧪 Testing image processing...');
    
    // Create a simple test image (1x1 pixel)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    console.log('📸 Test image created, size:', testImageBuffer.length, 'bytes');
    
    // Test the analysis service
    const cropHealthService = require('../services/cropHealthService');
    const result = await cropHealthService.analyzeCropImageStructured(testImageBuffer, 'test', 'image/png');
    
    res.json({
      success: true,
      data: {
        message: 'Image processing test successful',
        result: result,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Image test failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Image test failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// GET /api/crop-health/test-gemini
router.get('/test-gemini', async (req, res) => {
  try {
    console.log('🧪 Testing Gemini connectivity...');
    
    // Simple text test
    const testResult = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: 'Say "Hello" in one word' }] }],
      generationConfig: { maxOutputTokens: 10 }
    });
    
    const response = testResult.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    
    res.json({
      success: true,
      data: {
        status: 'Gemini connected',
        testResponse: response,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Gemini test failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Gemini test failed',
      details: error.message,
      stack: error.stack
    });
  }
});

// GET /api/crop-health/health
router.get('/health', async (req, res) => {
  try {
    console.log('🏥 Crop health service health check');
    
    // Test Gemini connectivity
    const testPrompt = 'Hello, this is a test. Please respond with "Gemini is working"';
    const testResult = await geminiModel.generateContent({
      contents: [{ role: 'user', parts: [{ text: testPrompt }] }],
      generationConfig: { maxOutputTokens: 50 }
    });
    
    const response = testResult.response?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    
    res.json({
      success: true,
      data: {
        status: 'healthy',
        gemini: 'connected',
        testResponse: response,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      details: error.message
    });
  }
});

// POST /api/crop-health/analyze
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    const cropType = req.body.cropType;
    const file = req.file;
    
    console.log('📸 Crop health analysis request received');
    console.log('File info:', {
      fieldname: file?.fieldname,
      originalname: file?.originalname,
      mimetype: file?.mimetype,
      size: file?.size,
      buffer: file?.buffer ? `${file.buffer.length} bytes` : 'No buffer'
    });
    console.log('Crop type:', cropType);
    
    if (!file || !file.buffer) {
      return res.status(400).json({
        success: false,
        error: 'Image is required for analysis'
      });
    }

    console.log(`🔍 Analyzing crop health (Gemini) for ${cropType || 'unknown crop'}`);

    // Use Gemini for structured crop analysis and validation
    const analysis = await cropHealthService.analyzeCropImageStructured(file.buffer, cropType, file.mimetype || 'image/jpeg');
    
    console.log('✅ Analysis completed:', analysis);
    return res.json(analysis);
  } catch (error) {
    console.error('❌ Crop health analysis error:', error.message);
    console.error('Error stack:', error.stack);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/crop-health/disease-risk
router.get('/disease-risk', async (req, res) => {
  try {
    const { location = 'Mysuru, Karnataka', cropType } = req.query;
    
    if (!cropType) {
      return res.status(400).json({
        success: false,
        error: 'Crop type is required'
      });
    }
    
    console.log(`🌤️ Assessing disease risk for ${cropType} in ${location}`);
    
    const riskAssessment = await realCropHealthService.getDiseaseRiskAssessment(location, cropType);
    
    if (riskAssessment) {
      res.json({
        success: true,
        data: riskAssessment
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Disease risk assessment not available'
      });
    }
    
  } catch (error) {
    console.error('Disease risk assessment error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/crop-health/comprehensive-report
router.post('/comprehensive-report', async (req, res) => {
  try {
    const { image, cropType, location = 'Mysuru, Karnataka' } = req.body;
    
    if (!image || !cropType) {
      return res.status(400).json({
        success: false,
        error: 'Both image and crop type are required'
      });
    }
    
    console.log(`📋 Generating comprehensive health report for ${cropType}`);
    
    const report = await realCropHealthService.getComprehensiveHealthReport(image, location, cropType);
    res.json(report);
    
  } catch (error) {
    console.error('Comprehensive report error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/crop-health/weather-impact
router.get('/weather-impact', async (req, res) => {
  try {
    const { location = 'Mysuru, Karnataka', cropType } = req.query;
    
    console.log(`🌦️ Analyzing weather impact on crops in ${location}`);
    
    const weatherData = await realCropHealthService.fetchWeatherData(location);
    const diseaseRisk = await realCropHealthService.analyzeDiseaseRisk(weatherData, cropType);
    
    res.json({
      success: true,
      data: {
        location,
        cropType,
        weather: {
          temperature: weatherData.main.temp,
          humidity: weatherData.main.humidity,
          conditions: weatherData.weather[0].main,
          description: weatherData.weather[0].description
        },
        diseaseRisk,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Weather impact analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/crop-health/supported-crops
router.get('/supported-crops', async (req, res) => {
  try {
    const crops = [
      { name: 'Tomato', category: 'Vegetables', diseases: ['Early Blight', 'Late Blight', 'Bacterial Wilt'] },
      { name: 'Rice', category: 'Grains', diseases: ['Rice Blast', 'Bacterial Leaf Blight', 'Sheath Blight'] },
      { name: 'Wheat', category: 'Grains', diseases: ['Rust', 'Powdery Mildew', 'Fusarium Head Blight'] },
      { name: 'Potato', category: 'Vegetables', diseases: ['Late Blight', 'Early Blight', 'Blackleg'] },
      { name: 'Onion', category: 'Vegetables', diseases: ['Purple Blotch', 'Downy Mildew', 'Neck Rot'] },
      { name: 'Cotton', category: 'Cash Crops', diseases: ['Bacterial Blight', 'Verticillium Wilt', 'Fusarium Wilt'] },
      { name: 'Sugarcane', category: 'Cash Crops', diseases: ['Red Rot', 'Smut', 'Wilt'] },
      { name: 'Maize', category: 'Grains', diseases: ['Northern Leaf Blight', 'Southern Leaf Blight', 'Common Rust'] }
    ];
    
    res.json({
      success: true,
      data: crops
    });
    
  } catch (error) {
    console.error('Supported crops error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/crop-health/prevention-tips
router.get('/prevention-tips', async (req, res) => {
  try {
    const { cropType, weatherCondition } = req.query;
    
    const tips = {
      general: [
        'Maintain proper spacing between plants for air circulation',
        'Use disease-resistant varieties when possible',
        'Practice crop rotation to break disease cycles',
        'Keep fields clean and remove infected plant debris',
        'Monitor plants regularly for early signs of disease'
      ],
      highHumidity: [
        'Avoid overhead watering to reduce leaf wetness',
        'Improve air circulation with proper spacing',
        'Apply preventive fungicides before disease appears',
        'Water early in the day to allow leaves to dry'
      ],
      highTemperature: [
        'Provide shade during peak heat hours',
        'Increase irrigation frequency',
        'Use mulch to maintain soil moisture',
        'Monitor for heat stress symptoms'
      ],
      rainyConditions: [
        'Avoid working in wet fields',
        'Apply preventive treatments before rain',
        'Improve drainage to prevent waterlogging',
        'Monitor for fungal disease development'
      ]
    };
    
    let relevantTips = [...tips.general];
    
    if (weatherCondition === 'high_humidity') {
      relevantTips.push(...tips.highHumidity);
    } else if (weatherCondition === 'high_temperature') {
      relevantTips.push(...tips.highTemperature);
    } else if (weatherCondition === 'rainy') {
      relevantTips.push(...tips.rainyConditions);
    }
    
    res.json({
      success: true,
      data: {
        cropType: cropType || 'All Crops',
        weatherCondition: weatherCondition || 'General',
        tips: relevantTips,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Prevention tips error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;