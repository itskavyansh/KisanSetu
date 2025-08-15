import apiClient from './apiService';

export interface MarketPricesResponse {
  success: boolean;
  data: {
    crop: string;
    currentPrice: number;
    previousPrice: number;
    trend: string;
    percentageChange: number;
    recommendation: string;
    mandiPrices: Record<string, number>;
    lastUpdated: string;
  };
}

export interface MarketTrendsResponse {
  success: boolean;
  data: {
    crop: string;
    period: string;
    trends: Array<{
      date: string;
      price: number;
      volume: number;
    }>;
    analysis: {
      averagePrice: number;
      priceRange: { min: number; max: number };
      volatility: number;
      recommendation: string;
    };
  };
}

export const marketAPI = {
  // Get current market prices for a crop
  getPrices: async (cropType: string): Promise<MarketPricesResponse> => {
    const response = await apiClient.get(`/market/prices/${cropType}`);
    return response.data;
  },

  // Get market trends for a crop
  getTrends: async (cropType: string, days: number = 30): Promise<MarketTrendsResponse> => {
    const response = await apiClient.get(`/market/trends/${cropType}?days=${days}`);
    return response.data;
  },

  // Get available crops
  getCrops: async () => {
    const response = await apiClient.get('/market/crops');
    return response.data;
  },
};
