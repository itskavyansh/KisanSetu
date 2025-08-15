class MarketIntelligenceService {
  constructor() {
    // Mock market data - we'll replace with real APIs later
    this.mockMarketData = {
      tomato: {
        currentPrice: 28,
        previousPrice: 25,
        trend: 'up',
        percentageChange: 12,
        recommendation: 'Hold for 2-3 days, prices expected to rise',
        mandiPrices: {
          'Mysuru': 30,
          'Bangalore': 28,
          'Chennai': 26
        }
      },
      rice: {
        currentPrice: 45,
        previousPrice: 42,
        trend: 'up',
        percentageChange: 7,
        recommendation: 'Good time to sell, prices are stable',
        mandiPrices: {
          'Mysuru': 45,
          'Bangalore': 43,
          'Chennai': 47
        }
      },
      onion: {
        currentPrice: 24,
        previousPrice: 22,
        trend: 'up',
        percentageChange: 9,
        recommendation: 'Hold 1–2 days; nearby mandi demand rising',
        mandiPrices: { Mysuru: 25, Bangalore: 24, Chennai: 23 }
      },
      wheat: {
        currentPrice: 28,
        previousPrice: 29,
        trend: 'down',
        percentageChange: -3,
        recommendation: 'Sell within 1–2 days; mild downward trend',
        mandiPrices: { Mysuru: 27, Bangalore: 28, Chennai: 29 }
      },
      potato: {
        currentPrice: 18,
        previousPrice: 18,
        trend: 'stable',
        percentageChange: 0,
        recommendation: 'Stable; sell at convenience',
        mandiPrices: { Mysuru: 18, Bangalore: 19, Chennai: 17 }
      }
    };
  }

  async getMarketPrices(cropType) {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const cropData = this.mockMarketData[cropType.toLowerCase()];
      if (!cropData) {
        throw new Error(`Market data not available for ${cropType}`);
      }

      return {
        success: true,
        data: {
          crop: cropType,
          ...cropData,
          lastUpdated: new Date().toISOString(),
          source: 'Mock Data - Real API integration pending'
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch market data: ${error.message}`);
    }
  }

  async getMarketTrends(cropType, days = 30) {
    try {
      // Generate mock trend data
      const trendData = this.generateMockTrendData(cropType, days);
      
      return {
        success: true,
        data: {
          crop: cropType,
          period: `${days} days`,
          trends: trendData,
          analysis: this.generateTrendAnalysis(trendData),
          lastUpdated: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch market trends: ${error.message}`);
    }
  }

  generateMockTrendData(cropType, days) {
    const trends = [];
    let basePrice = this.mockMarketData[cropType.toLowerCase()]?.currentPrice || 30;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some realistic price variation
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const price = basePrice * (1 + variation);
      
      trends.push({
        date: date.toISOString().split('T')[0],
        price: Math.round(price * 100) / 100,
        volume: Math.floor(Math.random() * 1000) + 500
      });
    }
    
    return trends;
  }

  generateTrendAnalysis(trends) {
    const prices = trends.map(t => t.price);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    let recommendation = 'Hold current position';
    if (prices[prices.length - 1] > avgPrice * 1.05) {
      recommendation = 'Consider selling - prices above average';
    } else if (prices[prices.length - 1] < avgPrice * 0.95) {
      recommendation = 'Good buying opportunity - prices below average';
    }
    
    return {
      averagePrice: Math.round(avgPrice * 100) / 100,
      priceRange: { min: minPrice, max: maxPrice },
      volatility: this.calculateVolatility(prices),
      recommendation
    };
  }

  calculateVolatility(prices) {
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / prices.length;
    return Math.sqrt(variance);
  }
}

module.exports = new MarketIntelligenceService();
