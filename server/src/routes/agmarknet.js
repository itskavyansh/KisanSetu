const express = require('express');
const agmarknetService = require('../services/agmarknetService');
const router = express.Router();

// Get market prices for a specific commodity, state, and market
router.get('/prices/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    
    console.log(`📊 Fetching Agmarknet prices for ${commodity} in ${market}, ${state}`);
    
    const prices = await agmarknetService.getMarketPrices(commodity, state, market);
    
    res.json({
      success: true,
      data: {
        commodity,
        state,
        market,
        prices,
        lastUpdated: new Date().toISOString(),
        source: 'Agmarknet.gov.in'
      }
    });
    
  } catch (error) {
    console.error('Error fetching Agmarknet prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market prices',
      message: error.message
    });
  }
});

// Get available commodities
router.get('/commodities', async (req, res) => {
  try {
    const commodities = await agmarknetService.getAvailableCommodities();
    
    res.json({
      success: true,
      data: commodities
    });
    
  } catch (error) {
    console.error('Error fetching commodities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commodities',
      message: error.message
    });
  }
});

// Get available states
router.get('/states', async (req, res) => {
  try {
    const states = await agmarknetService.getAvailableStates();
    
    res.json({
      success: true,
      data: states
    });
    
  } catch (error) {
    console.error('Error fetching states:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch states',
      message: error.message
    });
  }
});

// Get available markets for a state
router.get('/markets/:state', async (req, res) => {
  try {
    const { state } = req.params;
    const markets = await agmarknetService.getAvailableMarkets(state);
    
    res.json({
      success: true,
      data: {
        state,
        markets
      }
    });
    
  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch markets',
      message: error.message
    });
  }
});

// Get comprehensive market data with weather correlation
router.get('/analysis/:commodity/:state/:market', async (req, res) => {
  try {
    const { commodity, state, market } = req.params;
    
    console.log(`📈 Fetching comprehensive analysis for ${commodity} in ${market}, ${state}`);
    
    const prices = await agmarknetService.getMarketPrices(commodity, state, market);
    
    // Calculate trends and analysis
    const analysis = {
      commodity,
      state,
      market,
      prices,
      analysis: {
        priceTrend: calculatePriceTrend(prices),
        volatility: calculateVolatility(prices),
        recommendation: generateRecommendation(prices),
        marketInsights: generateMarketInsights(prices, commodity)
      },
      lastUpdated: new Date().toISOString()
    };
    
    res.json({
      success: true,
      data: analysis
    });
    
  } catch (error) {
    console.error('Error fetching market analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch market analysis',
      message: error.message
    });
  }
});

// Helper functions for analysis
function calculatePriceTrend(prices) {
  if (!prices || prices.length < 2) return 'stable';
  
  const recent = parseInt(prices[0]['Model Prize']);
  const previous = parseInt(prices[1]['Model Prize']);
  
  if (recent > previous * 1.05) return 'increasing';
  if (recent < previous * 0.95) return 'decreasing';
  return 'stable';
}

function calculateVolatility(prices) {
  if (!prices || prices.length < 2) return 'low';
  
  const variations = prices.slice(0, 5).map(price => {
    const min = parseInt(price['Min Prize']);
    const max = parseInt(price['Max Prize']);
    return (max - min) / min;
  });
  
  const avgVariation = variations.reduce((a, b) => a + b, 0) / variations.length;
  
  if (avgVariation > 0.2) return 'high';
  if (avgVariation > 0.1) return 'medium';
  return 'low';
}

function generateRecommendation(prices) {
  const trend = calculatePriceTrend(prices);
  const volatility = calculateVolatility(prices);
  
  if (trend === 'increasing' && volatility === 'low') {
    return 'Good time to sell - prices are rising steadily';
  } else if (trend === 'decreasing' && volatility === 'low') {
    return 'Consider holding - prices may stabilize soon';
  } else if (volatility === 'high') {
    return 'Market is volatile - monitor closely before making decisions';
  } else {
    return 'Market is stable - normal trading conditions';
  }
}

function generateMarketInsights(prices, commodity) {
  const insights = [];
  
  if (prices && prices.length > 0) {
    const latest = prices[0];
    const modalPrice = parseInt(latest['Model Prize']);
    
    insights.push(`Current modal price: ₹${modalPrice} per quintal`);
    insights.push(`Price range: ₹${latest['Min Prize']} - ₹${latest['Max Prize']}`);
    
    if (prices.length > 1) {
      const previous = prices[1];
      const change = modalPrice - parseInt(previous['Model Prize']);
      const changePercent = ((change / parseInt(previous['Model Prize'])) * 100).toFixed(1);
      
      if (change > 0) {
        insights.push(`Price increased by ₹${change} (${changePercent}%) from previous day`);
      } else if (change < 0) {
        insights.push(`Price decreased by ₹${Math.abs(change)} (${Math.abs(changePercent)}%) from previous day`);
      } else {
        insights.push('Price remained stable from previous day');
      }
    }
  }
  
  return insights;
}

module.exports = router;
