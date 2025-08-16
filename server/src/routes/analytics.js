const express = require('express');
const advancedAnalyticsService = require('../services/advancedAnalyticsService');
const router = express.Router();

// 1. Price Prediction Models: AI-powered price forecasting for next 30-90 days
router.get('/price-prediction/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    const { days = 30 } = req.query;
    
    console.log(`🔮 [Analytics API] Price prediction request for ${commodity} in ${market}, ${state} for ${days} days`);
    
    const predictions = await advancedAnalyticsService.generatePricePrediction(
      commodity, 
      state, 
      market, 
      parseInt(days)
    );
    
    res.json({
      success: true,
      data: {
        commodity,
        state,
        market,
        predictionDays: parseInt(days),
        predictions,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Analytics API] Error in price prediction:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate price prediction',
      message: error.message
    });
  }
});

// 2. Seasonal Trends Analysis: Historical price patterns by season/month
router.get('/seasonal-trends/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    
    console.log(`📊 [Analytics API] Seasonal trends request for ${commodity} in ${market}, ${state}`);
    
    const seasonalTrends = await advancedAnalyticsService.generateSeasonalTrends(
      commodity, 
      state, 
      market
    );
    
    res.json({
      success: true,
      data: {
        commodity,
        state,
        market,
        seasonalTrends,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Analytics API] Error in seasonal trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate seasonal trends',
      message: error.message
    });
  }
});

// 3. Market Volatility Indicators: Risk assessment for different crops
router.get('/volatility-analysis/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    
    console.log(`📈 [Analytics API] Volatility analysis request for ${commodity} in ${market}, ${state}`);
    
    const volatilityAnalysis = await advancedAnalyticsService.generateVolatilityAnalysis(
      commodity, 
      state, 
      market
    );
    
    res.json({
      success: true,
      data: {
        commodity,
        state,
        market,
        volatilityAnalysis,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Analytics API] Error in volatility analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate volatility analysis',
      message: error.message
    });
  }
});

// 4. Supply-Demand Analysis: Market equilibrium indicators
router.get('/supply-demand/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    
    console.log(`⚖️ [Analytics API] Supply-demand analysis request for ${commodity} in ${market}, ${state}`);
    
    const supplyDemandAnalysis = await advancedAnalyticsService.generateSupplyDemandAnalysis(
      commodity, 
      state, 
      market
    );
    
    res.json({
      success: true,
      data: {
        commodity,
        state,
        market,
        supplyDemandAnalysis,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Analytics API] Error in supply-demand analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate supply-demand analysis',
      message: error.message
    });
  }
});

// 5. Export-Import Trends: International market influence on local prices
router.get('/export-import/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    
    console.log(`🌍 [Analytics API] Export-import trends request for ${commodity} in ${market}, ${state}`);
    
    const exportImportTrends = await advancedAnalyticsService.generateExportImportTrends(
      commodity, 
      state, 
      market
    );
    
    res.json({
      success: true,
      data: {
        commodity,
        state,
        market,
        exportImportTrends,
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Analytics API] Error in export-import trends:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate export-import trends',
      message: error.message
    });
  }
});

// Combined Analytics Dashboard: Get all analytics in one request
router.get('/dashboard/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    const { days = 30 } = req.query;
    
    console.log(`📊 [Analytics API] Dashboard request for ${commodity} in ${market}, ${state}`);
    
    // Generate all analytics in parallel
    const [
      pricePrediction,
      seasonalTrends,
      volatilityAnalysis,
      supplyDemandAnalysis,
      exportImportTrends
    ] = await Promise.all([
      advancedAnalyticsService.generatePricePrediction(commodity, state, market, parseInt(days)),
      advancedAnalyticsService.generateSeasonalTrends(commodity, state, market),
      advancedAnalyticsService.generateVolatilityAnalysis(commodity, state, market),
      advancedAnalyticsService.generateSupplyDemandAnalysis(commodity, state, market),
      advancedAnalyticsService.generateExportImportTrends(commodity, state, market)
    ]);
    
    res.json({
      success: true,
      data: {
        commodity,
        state,
        market,
        predictionDays: parseInt(days),
        analytics: {
          pricePrediction,
          seasonalTrends,
          volatilityAnalysis,
          supplyDemandAnalysis,
          exportImportTrends
        },
        generatedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ [Analytics API] Error in dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate analytics dashboard',
      message: error.message
    });
  }
});

module.exports = router;
