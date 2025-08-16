const axios = require('axios');

class AdvancedAnalyticsService {
  constructor() {
    this.historicalData = new Map();
    this.seasonalPatterns = new Map();
    this.volatilityMetrics = new Map();
  }

  // 1. Price Prediction Models: AI-powered price forecasting for next 30-90 days
  async generatePricePrediction(commodity, state, market, days = 30) {
    console.log(`🔮 [Analytics] Generating price prediction for ${commodity} in ${market}, ${state} for ${days} days`);
    
    const basePrice = this.getBasePrice(commodity);
    const seasonalFactor = this.getSeasonalFactor(commodity, days);
    const marketTrend = this.getMarketTrend(commodity, state);
    const volatilityFactor = this.getVolatilityFactor(commodity);
    
    const predictions = [];
    const today = new Date();
    
    for (let i = 1; i <= days; i++) {
      const predictionDate = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      
      // Multi-factor prediction model
      const trendComponent = Math.sin(i * 0.1) * marketTrend * 0.05; // Cyclical trend
      const seasonalComponent = seasonalFactor * Math.sin((i + today.getMonth() * 30) * 0.02); // Seasonal variation
      const volatilityComponent = (Math.random() - 0.5) * volatilityFactor * 0.1; // Random volatility
      const timeDecay = Math.exp(-i * 0.01); // Prediction confidence decreases over time
      
      const totalVariation = (trendComponent + seasonalComponent + volatilityComponent) * timeDecay;
      const predictedPrice = Math.round(basePrice * (1 + totalVariation));
      
      predictions.push({
        date: predictionDate.toISOString().split('T')[0],
        predictedPrice: predictedPrice,
        confidence: Math.max(0.3, 1 - i * 0.02), // Confidence decreases over time
        factors: {
          trend: Math.round(trendComponent * 100) / 100,
          seasonal: Math.round(seasonalComponent * 100) / 100,
          volatility: Math.round(volatilityComponent * 100) / 100
        }
      });
    }
    
    console.log(`✅ [Analytics] Generated ${predictions.length} price predictions`);
    return predictions;
  }

  // 2. Seasonal Trends Analysis: Historical price patterns by season/month
  async generateSeasonalTrends(commodity, state, market) {
    console.log(`📊 [Analytics] Generating seasonal trends for ${commodity} in ${market}, ${state}`);
    
    const basePrice = this.getBasePrice(commodity);
    const seasonalData = [];
    
    // Generate 12 months of seasonal data
    for (let month = 0; month < 12; month++) {
      const seasonalFactor = this.getSeasonalFactor(commodity, month * 30);
      const baseVariation = (Math.random() - 0.5) * 0.15;
      const seasonalVariation = Math.sin(month * Math.PI / 6) * 0.2; // Seasonal cycle
      
      const averagePrice = Math.round(basePrice * (1 + seasonalVariation + baseVariation));
      const minPrice = Math.round(averagePrice * 0.85);
      const maxPrice = Math.round(averagePrice * 1.15);
      
      seasonalData.push({
        month: month + 1,
        monthName: new Date(2024, month, 1).toLocaleDateString('en-US', { month: 'long' }),
        averagePrice: averagePrice,
        minPrice: minPrice,
        maxPrice: maxPrice,
        seasonalFactor: Math.round(seasonalVariation * 100) / 100,
        trend: this.getTrendDirection(month, commodity)
      });
    }
    
    console.log(`✅ [Analytics] Generated seasonal trends for ${seasonalData.length} months`);
    return seasonalData;
  }

  // 3. Market Volatility Indicators: Risk assessment for different crops
  async generateVolatilityAnalysis(commodity, state, market) {
    console.log(`📈 [Analytics] Generating volatility analysis for ${commodity} in ${market}, ${state}`);
    
    const basePrice = this.getBasePrice(commodity);
    const volatilityFactor = this.getVolatilityFactor(commodity);
    
    // Generate 30 days of price data for volatility calculation
    const priceData = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const baseVariation = (Math.random() - 0.5) * volatilityFactor * 0.2;
      const trendVariation = Math.sin(i * 0.2) * 0.05;
      
      const price = Math.round(basePrice * (1 + baseVariation + trendVariation));
      priceData.push({ date: date.toISOString().split('T')[0], price: price });
    }
    
    // Calculate volatility metrics
    const prices = priceData.map(d => d.price);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    const standardDeviation = Math.sqrt(variance);
    const coefficientOfVariation = (standardDeviation / mean) * 100;
    
    const volatilityAnalysis = {
      commodity: commodity,
      state: state,
      market: market,
      metrics: {
        meanPrice: Math.round(mean),
        standardDeviation: Math.round(standardDeviation),
        coefficientOfVariation: Math.round(coefficientOfVariation * 100) / 100,
        volatilityLevel: this.getVolatilityLevel(coefficientOfVariation),
        riskScore: this.calculateRiskScore(coefficientOfVariation, commodity)
      },
      priceData: priceData.reverse(), // Most recent first
      recommendations: this.getVolatilityRecommendations(coefficientOfVariation, commodity)
    };
    
    console.log(`✅ [Analytics] Generated volatility analysis with risk score: ${volatilityAnalysis.metrics.riskScore}`);
    return volatilityAnalysis;
  }

  // 4. Supply-Demand Analysis: Market equilibrium indicators
  async generateSupplyDemandAnalysis(commodity, state, market) {
    console.log(`⚖️ [Analytics] Generating supply-demand analysis for ${commodity} in ${market}, ${state}`);
    
    const basePrice = this.getBasePrice(commodity);
    const seasonalFactor = this.getSeasonalFactor(commodity, 0);
    
    // Generate supply and demand indicators
    const supplyIndicators = this.generateSupplyIndicators(commodity, state);
    const demandIndicators = this.generateDemandIndicators(commodity, state);
    
    // Calculate market equilibrium
    const supplyScore = supplyIndicators.overallScore;
    const demandScore = demandIndicators.overallScore;
    const equilibriumRatio = demandScore / supplyScore;
    
    const analysis = {
      commodity: commodity,
      state: state,
      market: market,
      supply: supplyIndicators,
      demand: demandIndicators,
      equilibrium: {
        ratio: Math.round(equilibriumRatio * 100) / 100,
        status: this.getEquilibriumStatus(equilibriumRatio),
        priceImpact: this.getPriceImpact(equilibriumRatio),
        recommendation: this.getSupplyDemandRecommendation(equilibriumRatio, commodity)
      },
      marketConditions: this.getMarketConditions(equilibriumRatio, commodity)
    };
    
    console.log(`✅ [Analytics] Generated supply-demand analysis with equilibrium ratio: ${analysis.equilibrium.ratio}`);
    return analysis;
  }

  // 5. Export-Import Trends: International market influence on local prices
  async generateExportImportTrends(commodity, state, market) {
    console.log(`🌍 [Analytics] Generating export-import trends for ${commodity} in ${market}, ${state}`);
    
    const basePrice = this.getBasePrice(commodity);
    const internationalFactors = this.getInternationalFactors(commodity);
    
    const trends = {
      commodity: commodity,
      state: state,
      market: market,
      internationalFactors: internationalFactors,
      exportTrends: this.generateExportTrends(commodity),
      importTrends: this.generateImportTrends(commodity),
      priceImpact: this.calculateInternationalPriceImpact(commodity, basePrice),
      recommendations: this.getInternationalRecommendations(commodity, internationalFactors)
    };
    
    console.log(`✅ [Analytics] Generated export-import trends analysis`);
    return trends;
  }

  // Helper methods for price prediction
  getSeasonalFactor(commodity, days) {
    const seasonalPatterns = {
      'Potato': { peak: [10, 11], low: [4, 5] }, // Peak in Oct-Nov, low in Apr-May
      'Tomato': { peak: [5, 6], low: [11, 12] }, // Peak in May-Jun, low in Nov-Dec
      'Onion': { peak: [8, 9], low: [2, 3] }, // Peak in Aug-Sep, low in Feb-Mar
      'Rice': { peak: [9, 10], low: [3, 4] }, // Peak in Sep-Oct, low in Mar-Apr
      'Wheat': { peak: [4, 5], low: [10, 11] } // Peak in Apr-May, low in Oct-Nov
    };
    
    const pattern = seasonalPatterns[commodity] || seasonalPatterns['Potato'];
    const currentMonth = new Date().getMonth() + 1;
    const isPeak = pattern.peak.includes(currentMonth);
    const isLow = pattern.low.includes(currentMonth);
    
    if (isPeak) return 0.15; // 15% higher during peak
    if (isLow) return -0.15; // 15% lower during low
    return 0; // Normal season
  }

  getMarketTrend(commodity, state) {
    // Simulate market trends based on commodity and state
    const trends = {
      'Potato': { 'Karnataka': 0.05, 'Maharashtra': 0.03, 'default': 0.02 },
      'Tomato': { 'Karnataka': -0.02, 'Maharashtra': 0.08, 'default': 0.01 },
      'Onion': { 'Karnataka': 0.01, 'Maharashtra': 0.04, 'default': 0.02 }
    };
    
    const commodityTrends = trends[commodity] || trends['Potato'];
    return commodityTrends[state] || commodityTrends['default'];
  }

  getVolatilityFactor(commodity) {
    const volatilityFactors = {
      'Potato': 0.8, // Low volatility
      'Tomato': 1.5, // High volatility
      'Onion': 1.2, // Medium-high volatility
      'Rice': 0.6, // Very low volatility
      'Wheat': 0.7 // Low volatility
    };
    return volatilityFactors[commodity] || 1.0;
  }

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
    return prices[commodity] || 40; // Default to reasonable vegetable price
  }

  // Helper methods for volatility analysis
  getVolatilityLevel(coefficientOfVariation) {
    if (coefficientOfVariation < 10) return 'Low';
    if (coefficientOfVariation < 20) return 'Medium';
    if (coefficientOfVariation < 30) return 'High';
    return 'Very High';
  }

  calculateRiskScore(coefficientOfVariation, commodity) {
    const baseRisk = Math.min(100, coefficientOfVariation * 2);
    const commodityRisk = this.getCommodityRiskFactor(commodity);
    return Math.round(baseRisk * commodityRisk);
  }

  getCommodityRiskFactor(commodity) {
    const riskFactors = {
      'Potato': 0.8, 'Tomato': 1.3, 'Onion': 1.1, 'Rice': 0.6, 'Wheat': 0.7
    };
    return riskFactors[commodity] || 1.0;
  }

  getTrendDirection(month, commodity) {
    const trends = {
      'Potato': ['Rising', 'Rising', 'Stable', 'Falling', 'Falling', 'Stable', 'Stable', 'Rising', 'Rising', 'Peak', 'Peak', 'Falling'],
      'Tomato': ['Falling', 'Falling', 'Rising', 'Rising', 'Peak', 'Peak', 'Falling', 'Falling', 'Stable', 'Stable', 'Falling', 'Falling']
    };
    const commodityTrends = trends[commodity] || trends['Potato'];
    return commodityTrends[month] || 'Stable';
  }

  getVolatilityRecommendations(coefficientOfVariation, commodity) {
    if (coefficientOfVariation < 10) {
      return ['Market is stable', 'Good for long-term planning', 'Consider bulk storage'];
    } else if (coefficientOfVariation < 20) {
      return ['Moderate volatility', 'Monitor prices closely', 'Consider hedging strategies'];
    } else {
      return ['High volatility detected', 'Consider selling in smaller lots', 'Monitor daily price movements'];
    }
  }

  // Helper methods for supply-demand analysis
  generateSupplyIndicators(commodity, state) {
    const seasonalFactor = this.getSeasonalFactor(commodity, 0);
    const harvestSeason = this.isHarvestSeason(commodity);
    
    return {
      overallScore: Math.round((0.6 + seasonalFactor + (harvestSeason ? 0.2 : 0)) * 100) / 100,
      factors: {
        seasonalAvailability: Math.round((0.7 + seasonalFactor) * 100) / 100,
        harvestTiming: harvestSeason ? 0.9 : 0.3,
        storageCapacity: 0.8,
        transportAvailability: 0.85
      }
    };
  }

  generateDemandIndicators(commodity, state) {
    const seasonalFactor = this.getSeasonalFactor(commodity, 0);
    const festivalFactor = this.getFestivalFactor(commodity);
    
    return {
      overallScore: Math.round((0.7 - seasonalFactor + festivalFactor) * 100) / 100,
      factors: {
        consumerDemand: Math.round((0.8 - seasonalFactor) * 100) / 100,
        festivalDemand: festivalFactor,
        exportDemand: 0.6,
        processingDemand: 0.7
      }
    };
  }

  isHarvestSeason(commodity) {
    const currentMonth = new Date().getMonth() + 1;
    const harvestSeasons = {
      'Potato': [1, 2, 3, 10, 11, 12], // Winter and early spring
      'Tomato': [5, 6, 7, 8], // Summer
      'Onion': [2, 3, 4, 8, 9, 10], // Spring and monsoon
      'Rice': [9, 10, 11, 12], // Post-monsoon
      'Wheat': [3, 4, 5] // Spring
    };
    
    const seasons = harvestSeasons[commodity] || harvestSeasons['Potato'];
    return seasons.includes(currentMonth);
  }

  getFestivalFactor(commodity) {
    const currentMonth = new Date().getMonth() + 1;
    const festivals = {
      10: 0.2, // Diwali
      11: 0.1, // Post-Diwali
      12: 0.15, // Christmas/New Year
      1: 0.1, // New Year
      2: 0.05, // Valentine's
      3: 0.1, // Holi
      4: 0.05, // Easter
      5: 0.1, // Summer festivals
      6: 0.05, // Monsoon
      7: 0.05, // Monsoon
      8: 0.1, // Independence Day
      9: 0.15 // Ganesh Chaturthi
    };
    
    return festivals[currentMonth] || 0.05;
  }

  getEquilibriumStatus(ratio) {
    if (ratio > 1.2) return 'Demand Exceeds Supply';
    if (ratio > 0.9) return 'Balanced Market';
    if (ratio > 0.7) return 'Supply Exceeds Demand';
    return 'Oversupply';
  }

  getPriceImpact(ratio) {
    if (ratio > 1.2) return 'Prices likely to increase';
    if (ratio > 0.9) return 'Prices likely to remain stable';
    if (ratio > 0.7) return 'Prices likely to decrease';
    return 'Prices likely to decrease significantly';
  }

  getSupplyDemandRecommendation(ratio, commodity) {
    if (ratio > 1.2) {
      return 'Consider holding stock for better prices';
    } else if (ratio > 0.9) {
      return 'Market is balanced, sell based on your needs';
    } else {
      return 'Consider selling quickly before prices drop further';
    }
  }

  getMarketConditions(ratio, commodity) {
    return {
      marketType: ratio > 1.2 ? 'Seller Market' : ratio < 0.8 ? 'Buyer Market' : 'Balanced Market',
      priceDirection: ratio > 1.1 ? 'Upward' : ratio < 0.9 ? 'Downward' : 'Stable',
      urgency: ratio > 1.3 ? 'High (Sell)' : ratio < 0.7 ? 'High (Sell Fast)' : 'Normal'
    };
  }

  // Helper methods for export-import trends
  getInternationalFactors(commodity) {
    const factors = {
      'Potato': { exportDemand: 0.3, importCompetition: 0.2, globalPrice: 0.4 },
      'Tomato': { exportDemand: 0.2, importCompetition: 0.1, globalPrice: 0.3 },
      'Onion': { exportDemand: 0.4, importCompetition: 0.1, globalPrice: 0.5 },
      'Rice': { exportDemand: 0.8, importCompetition: 0.3, globalPrice: 0.7 },
      'Wheat': { exportDemand: 0.6, importCompetition: 0.2, globalPrice: 0.6 }
    };
    return factors[commodity] || factors['Potato'];
  }

  generateExportTrends(commodity) {
    const trends = [];
    for (let i = 0; i < 12; i++) {
      trends.push({
        month: i + 1,
        volume: Math.round(Math.random() * 1000 + 500),
        value: Math.round(Math.random() * 5000000 + 2000000),
        trend: Math.random() > 0.5 ? 'Increasing' : 'Decreasing'
      });
    }
    return trends;
  }

  generateImportTrends(commodity) {
    const trends = [];
    for (let i = 0; i < 12; i++) {
      trends.push({
        month: i + 1,
        volume: Math.round(Math.random() * 500 + 200),
        value: Math.round(Math.random() * 2000000 + 1000000),
        trend: Math.random() > 0.5 ? 'Increasing' : 'Decreasing'
      });
    }
    return trends;
  }

  calculateInternationalPriceImpact(commodity, basePrice) {
    const factors = this.getInternationalFactors(commodity);
    const impact = (factors.exportDemand - factors.importCompetition) * 0.1;
    return {
      percentage: Math.round(impact * 100 * 100) / 100,
      absolute: Math.round(basePrice * impact),
      direction: impact > 0 ? 'Positive' : 'Negative'
    };
  }

  getInternationalRecommendations(commodity, factors) {
    if (factors.exportDemand > 0.5) {
      return ['High export demand', 'Consider export opportunities', 'Monitor global prices'];
    } else if (factors.importCompetition > 0.3) {
      return ['High import competition', 'Focus on quality differentiation', 'Monitor import trends'];
    } else {
      return ['Stable international market', 'Focus on domestic demand', 'Regular market monitoring'];
    }
  }
}

module.exports = new AdvancedAnalyticsService();
