const axios = require('axios');

class CropSpecificIntelligenceService {
  constructor() {
    this.cropData = new Map();
    this.harvestTimingData = new Map();
    this.storageRecommendations = new Map();
  }

  // 1. Optimal Harvest Timing: Best time to harvest for maximum profit
  async generateOptimalHarvestTiming(commodity, state, market) {
    console.log(`🌾 [Crop Intelligence] Generating optimal harvest timing for ${commodity} in ${market}, ${state}`);
    
    const basePrice = this.getBasePrice(commodity);
    const currentMonth = new Date().getMonth() + 1;
    const harvestData = this.getHarvestTimingData(commodity, state);
    
    // Calculate optimal harvest window
    const optimalWindow = this.calculateOptimalHarvestWindow(commodity, currentMonth, harvestData);
    const priceTrend = this.getPriceTrendForHarvest(commodity, currentMonth);
    const weatherConditions = this.getWeatherConditions(state, currentMonth);
    
    const analysis = {
      commodity: commodity,
      state: state,
      market: market,
      currentMonth: currentMonth,
      optimalHarvestWindow: optimalWindow,
      priceAnalysis: {
        currentPrice: basePrice,
        expectedPriceAtHarvest: Math.round(basePrice * (1 + priceTrend.priceFactor)),
        priceTrend: priceTrend.direction,
        priceFactor: priceTrend.priceFactor
      },
      weatherConditions: weatherConditions,
      recommendations: this.getHarvestRecommendations(optimalWindow, priceTrend, weatherConditions),
      riskFactors: this.getHarvestRiskFactors(commodity, currentMonth),
      profitPotential: this.calculateProfitPotential(commodity, basePrice, priceTrend.priceFactor)
    };
    
    console.log(`✅ [Crop Intelligence] Generated optimal harvest timing analysis`);
    return analysis;
  }

  // Helper methods for harvest timing
  getHarvestTimingData(commodity, state) {
    const harvestData = {
      'Potato': {
        'Karnataka': { optimalMonths: [1, 2, 3, 10, 11, 12], duration: 90, pricePeak: [10, 11] },
        'Maharashtra': { optimalMonths: [1, 2, 3, 10, 11, 12], duration: 90, pricePeak: [10, 11] }
      },
      'Tomato': {
        'Karnataka': { optimalMonths: [5, 6, 7, 8], duration: 75, pricePeak: [5, 6] },
        'Maharashtra': { optimalMonths: [5, 6, 7, 8], duration: 75, pricePeak: [5, 6] }
      },
      'Onion': {
        'Karnataka': { optimalMonths: [2, 3, 4, 8, 9, 10], duration: 60, pricePeak: [8, 9] },
        'Maharashtra': { optimalMonths: [2, 3, 4, 8, 9, 10], duration: 60, pricePeak: [8, 9] }
      }
    };
    
    const commodityData = harvestData[commodity] || harvestData['Potato'];
    return commodityData[state] || commodityData['Karnataka'];
  }

  calculateOptimalHarvestWindow(commodity, currentMonth, harvestData) {
    const { optimalMonths, duration, pricePeak } = harvestData;
    const isOptimalMonth = optimalMonths.includes(currentMonth);
    const isPricePeak = pricePeak.includes(currentMonth);
    
    return {
      isOptimalMonth: isOptimalMonth,
      isPricePeak: isPricePeak,
      recommendedHarvest: isOptimalMonth && isPricePeak ? 'Immediate' : 
                         isOptimalMonth ? 'Within 2 weeks' : 'Wait for optimal timing',
      nextOptimalWindow: this.getNextOptimalWindow(optimalMonths, currentMonth),
      harvestDuration: duration,
      confidence: isOptimalMonth ? 0.9 : isPricePeak ? 0.7 : 0.4
    };
  }

  getPriceTrendForHarvest(commodity, currentMonth) {
    const trends = {
      'Potato': { [10]: 0.15, [11]: 0.2, [4]: -0.1, [5]: -0.15 },
      'Tomato': { [5]: 0.2, [6]: 0.25, [11]: -0.1, [12]: -0.15 },
      'Onion': { [8]: 0.15, [9]: 0.2, [2]: -0.1, [3]: -0.15 }
    };
    
    const commodityTrends = trends[commodity] || trends['Potato'];
    const priceFactor = commodityTrends[currentMonth] || 0;
    
    return {
      priceFactor: priceFactor,
      direction: priceFactor > 0 ? 'Rising' : priceFactor < 0 ? 'Falling' : 'Stable'
    };
  }

  getWeatherConditions(state, currentMonth) {
    const weather = {
      'Karnataka': {
        [1]: { temperature: 'Cool', rainfall: 'Low', humidity: 'Moderate' },
        [2]: { temperature: 'Cool', rainfall: 'Low', humidity: 'Moderate' },
        [3]: { temperature: 'Warm', rainfall: 'Low', humidity: 'Low' },
        [4]: { temperature: 'Hot', rainfall: 'Low', humidity: 'Low' },
        [5]: { temperature: 'Hot', rainfall: 'Moderate', humidity: 'High' },
        [6]: { temperature: 'Warm', rainfall: 'High', humidity: 'High' },
        [7]: { temperature: 'Warm', rainfall: 'High', humidity: 'High' },
        [8]: { temperature: 'Warm', rainfall: 'Moderate', humidity: 'High' },
        [9]: { temperature: 'Warm', rainfall: 'Moderate', humidity: 'Moderate' },
        [10]: { temperature: 'Cool', rainfall: 'Low', humidity: 'Moderate' },
        [11]: { temperature: 'Cool', rainfall: 'Low', humidity: 'Low' },
        [12]: { temperature: 'Cool', rainfall: 'Low', humidity: 'Low' }
      }
    };
    
    return weather[state] || weather['Karnataka'];
  }

  getHarvestRecommendations(optimalWindow, priceTrend, weatherConditions) {
    const recommendations = [];
    
    if (optimalWindow.isOptimalMonth && optimalWindow.isPricePeak) {
      recommendations.push('Harvest immediately for maximum profit');
      recommendations.push('Market conditions are optimal');
    } else if (optimalWindow.isOptimalMonth) {
      recommendations.push('Good time to harvest, but monitor price trends');
      recommendations.push('Consider harvesting in smaller lots');
    } else if (priceTrend.direction === 'Rising') {
      recommendations.push('Consider delaying harvest for better prices');
      recommendations.push('Monitor weather conditions for storage');
    } else {
      recommendations.push('Wait for optimal harvest window');
      recommendations.push('Focus on crop maintenance and protection');
    }
    
    return recommendations;
  }

  getHarvestRiskFactors(commodity, currentMonth) {
    const risks = {
      'Potato': ['Late blight risk in monsoon', 'Storage rot in high humidity'],
      'Tomato': ['Fruit fly infestation in summer', 'Sunscald in peak summer'],
      'Onion': ['Bulb rot in high humidity', 'Thrips infestation']
    };
    
    return risks[commodity] || risks['Potato'];
  }

  calculateProfitPotential(commodity, basePrice, priceFactor) {
    const potentialIncrease = basePrice * priceFactor;
    const profitPotential = Math.round((potentialIncrease / basePrice) * 100);
    
    return {
      potentialIncrease: Math.round(potentialIncrease),
      profitPotential: profitPotential,
      recommendation: profitPotential > 10 ? 'High profit potential' : 
                     profitPotential > 5 ? 'Moderate profit potential' : 'Low profit potential'
    };
  }

  // Utility methods
  getBasePrice(commodity) {
    const prices = {
      // Vegetables (per kg)
      'Potato': 25, 'Tomato': 40, 'Onion': 30, 'Carrot': 35, 'Cauliflower': 45,
      'Cabbage': 20, 'Brinjal': 35, 'Capsicum': 60, 'Cucumber': 25, 'Ladies Finger': 40,
      
      // Grains (per kg)
      'Rice': 45, 'Wheat': 35, 'Maize': 25, 'Bajra': 30, 'Jowar': 28,
      
      // Pulses (per kg)
      'Pulses': 120, 'Lentils': 100, 'Chickpeas': 80, 'Kidney Beans': 90,
      
      // Commercial Crops (per kg)
      'Sugarcane': 3.5, 'Cotton': 60, 'Soybean': 45, 'Groundnut': 80,
      
      // Oilseeds (per kg)
      'Oilseeds': 55, 'Mustard': 50, 'Sunflower': 65, 'Sesame': 120
    };
    return prices[commodity] || 40;
  }

  getNextOptimalWindow(optimalMonths, currentMonth) {
    const nextMonths = optimalMonths.filter(month => month > currentMonth);
    if (nextMonths.length > 0) {
      return nextMonths[0];
    } else {
      return optimalMonths[0]; // Next year
    }
  }
}

module.exports = new CropSpecificIntelligenceService();
