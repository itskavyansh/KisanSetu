const express = require('express');
const cropSpecificIntelligenceService = require('../services/cropSpecificIntelligenceService');
const router = express.Router();

// 1. Optimal Harvest Timing: Best time to harvest for maximum profit
router.get('/harvest-timing/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    console.log(`🌾 [Crop Intelligence API] Harvest timing request for ${commodity} in ${market}, ${state}`);
    
    const harvestTiming = await cropSpecificIntelligenceService.generateOptimalHarvestTiming(commodity, state, market);
    
    res.json({
      success: true,
      data: {
        commodity,
        state,
        market,
        harvestTiming,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('❌ [Crop Intelligence API] Error in harvest timing:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate harvest timing analysis',
      message: error.message
    });
  }
});

module.exports = router;
