const express = require('express');
const realMarketService = require('../services/realMarketService');
const router = express.Router();

// GET /api/market/prices/:cropType
router.get('/prices/:cropType', async (req, res) => {
  try {
    const { cropType } = req.params;
    const { state } = req.query;
    
    console.log(`📊 Fetching real market prices for ${cropType} in ${state || 'Karnataka'}`);
    
    const marketData = await realMarketService.getRealMarketPrices(cropType, state);
    res.json(marketData);
    
  } catch (error) {
    console.error('Market prices error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/market/trends/:cropType
router.get('/trends/:cropType', async (req, res) => {
  try {
    const { cropType } = req.params;
    const { days = 30 } = req.query;
    
    console.log(`📈 Fetching market trends for ${cropType} over ${days} days`);
    
    const trendsData = await realMarketService.getRealMarketTrends(cropType, parseInt(days));
    res.json(trendsData);
    
  } catch (error) {
    console.error('Market trends error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/market/weather/:cropType
router.get('/weather/:cropType', async (req, res) => {
  try {
    const { cropType } = req.params;
    const { location = 'Mysuru, Karnataka' } = req.query;
    
    console.log(`🌤️ Fetching weather data for ${cropType} in ${location}`);
    
    const weatherData = await realMarketService.getCropWeatherData(location, cropType);
    
    if (weatherData) {
      res.json({
        success: true,
        data: weatherData
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Weather data not available'
      });
    }
    
  } catch (error) {
    console.error('Weather data error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/market/crops
router.get('/crops', async (req, res) => {
  try {
    const crops = [
      { value: 'tomato', label: 'Tomato', category: 'Vegetables' },
      { value: 'rice', label: 'Rice', category: 'Grains' },
      { value: 'wheat', label: 'Wheat', category: 'Grains' },
      { value: 'potato', label: 'Potato', category: 'Vegetables' },
      { value: 'onion', label: 'Onion', category: 'Vegetables' },
      { value: 'cotton', label: 'Cotton', category: 'Cash Crops' },
      { value: 'sugarcane', label: 'Sugarcane', category: 'Cash Crops' },
      { value: 'maize', label: 'Maize', category: 'Grains' }
    ];
    
    res.json({
      success: true,
      data: crops
    });
    
  } catch (error) {
    console.error('Crops list error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/market/analysis/:cropType
router.get('/analysis/:cropType', async (req, res) => {
  try {
    const { cropType } = req.params;
    const { state = 'Karnataka', location = 'Mysuru' } = req.query;
    
    console.log(`🔍 Generating comprehensive market analysis for ${cropType}`);
    
    // Get both market and weather data
    const [marketData, weatherData] = await Promise.all([
      realMarketService.getRealMarketPrices(cropType, state),
      realMarketService.getCropWeatherData(location, cropType)
    ]);
    
    // Combine data for comprehensive analysis
    const analysis = {
      crop: cropType,
      market: marketData.data,
      weather: weatherData,
      recommendations: [],
      riskAssessment: 'Low',
      timestamp: new Date().toISOString()
    };
    
    // Generate smart recommendations based on market + weather
    if (marketData.data.trend === 'rising' && weatherData?.riskLevel === 'Low') {
      analysis.recommendations.push('Optimal conditions for selling - prices are rising with low weather risk');
      analysis.riskAssessment = 'Low';
    } else if (marketData.data.trend === 'falling' && weatherData?.riskLevel === 'High') {
      analysis.recommendations.push('Consider holding - prices are falling and weather conditions are risky');
      analysis.riskAssessment = 'High';
    } else {
      analysis.recommendations.push('Monitor market conditions and weather closely for optimal timing');
      analysis.riskAssessment = 'Medium';
    }
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Market analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
