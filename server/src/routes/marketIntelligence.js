const express = require('express');
const marketIntelligenceService = require('../services/marketIntelligenceService');
const router = express.Router();

// GET /api/market/prices/:cropType
router.get('/prices/:cropType', async (req, res) => {
  try {
    const { cropType } = req.params;
    const marketData = await marketIntelligenceService.getMarketPrices(cropType);
    res.json(marketData);
  } catch (error) {
    const isUnknown = /not available/i.test(error.message);
    res.status(isUnknown ? 404 : 500).json({
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
    const trendData = await marketIntelligenceService.getMarketTrends(cropType, parseInt(days));
    
    res.json(trendData);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/market/crops
router.get('/crops', async (req, res) => {
  try {
    const availableCrops = ['tomato', 'rice', 'wheat', 'potato', 'onion'];
    
    res.json({
      success: true,
      data: availableCrops.map(crop => ({
        name: crop,
        currentPrice: Math.floor(Math.random() * 50) + 20,
        trend: Math.random() > 0.5 ? 'up' : 'down'
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
