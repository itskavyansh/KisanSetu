import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import apiClient from '../../services/apiService';

interface SeasonalTrendsChartProps {
  commodity: string;
  state: string;
  market: string;
  height?: number;
  className?: string;
}

interface SeasonalData {
  month: number;
  monthName: string;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  seasonalFactor: number;
  trend: string;
}

const SeasonalTrendsChart: React.FC<SeasonalTrendsChartProps> = ({
  commodity,
  state,
  market,
  height = 400,
  className = ''
}) => {
  const [seasonalData, setSeasonalData] = useState<SeasonalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSeasonalTrends();
  }, [commodity, state, market]);

  const loadSeasonalTrends = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`📊 Loading seasonal trends for ${commodity} in ${market}, ${state}`);
      
      const response = await apiClient.get(`/analytics/seasonal-trends/${commodity}/${state}/${market}`);
      
      if (response.data.success && response.data.data.seasonalTrends) {
        console.log(`✅ Received ${response.data.data.seasonalTrends.length} seasonal trends`);
        setSeasonalData(response.data.data.seasonalTrends);
      } else {
        throw new Error('No seasonal data received');
      }
    } catch (err: any) {
      console.error('❌ Error loading seasonal trends:', err);
      setError(err.message || 'Failed to load seasonal trends');
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Rising': return '#10B981';
      case 'Peak': return '#F59E0B';
      case 'Falling': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'Rising': return '↗️';
      case 'Peak': return '⬆️';
      case 'Falling': return '↘️';
      default: return '➡️';
    }
  };

  const getPeakMonths = () => {
    return seasonalData.filter(item => item.trend === 'Peak').map(item => item.monthName);
  };

  const getLowMonths = () => {
    return seasonalData.filter(item => item.trend === 'Falling').slice(0, 2).map(item => item.monthName);
  };

  const getAveragePrice = () => {
    if (seasonalData.length === 0) return 0;
    const sum = seasonalData.reduce((acc, item) => acc + item.averagePrice, 0);
    return Math.round(sum / seasonalData.length);
  };

  const getPriceRange = () => {
    if (seasonalData.length === 0) return { min: 0, max: 0 };
    const prices = seasonalData.map(item => item.averagePrice);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices)
    };
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Analyzing seasonal patterns...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="text-center text-red-600">
          <p>❌ {error}</p>
          <button 
            onClick={loadSeasonalTrends}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          📊 Seasonal Price Trends
        </h3>
        <p className="text-sm text-gray-600">
          {commodity} in {market}, {state} - 12 Month Analysis
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Average Price</h4>
          <p className="text-2xl font-bold text-blue-900">₹{getAveragePrice()}/kg</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-800">Peak Months</h4>
          <p className="text-lg font-semibold text-green-900">
            {getPeakMonths().join(', ')}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-red-800">Low Months</h4>
          <p className="text-lg font-semibold text-red-900">
            {getLowMonths().join(', ')}
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-800">Price Range</h4>
          <p className="text-lg font-semibold text-purple-900">
            ₹{getPriceRange().min} - ₹{getPriceRange().max}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={seasonalData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="monthName" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value: number) => `₹${value}`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                `₹${value}/kg`, 
                name === 'averagePrice' ? 'Average Price' : 
                name === 'minPrice' ? 'Min Price' : 
                name === 'maxPrice' ? 'Max Price' : name
              ]}
            />
            <Legend />
            <Bar 
              dataKey="averagePrice" 
              fill="#10B981" 
              name="Average Price"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="minPrice" 
              fill="#EF4444" 
              name="Min Price"
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="maxPrice" 
              fill="#F59E0B" 
              name="Max Price"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend Analysis */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Monthly Trend Analysis</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {seasonalData.map((item, index) => (
            <div 
              key={index} 
              className="text-center p-3 rounded-lg border"
              style={{ borderColor: getTrendColor(item.trend) }}
            >
              <div className="text-lg font-semibold text-gray-800">
                {item.monthName}
              </div>
              <div className="text-sm font-medium text-gray-600">
                ₹{item.averagePrice}/kg
              </div>
              <div className="flex items-center justify-center mt-1">
                <span className="text-lg mr-1">{getTrendIcon(item.trend)}</span>
                <span 
                  className="text-xs font-medium"
                  style={{ color: getTrendColor(item.trend) }}
                >
                  {item.trend}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seasonal Insights */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">🌾 Seasonal Insights</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <p>
            <strong>Peak Season:</strong> {getPeakMonths().join(', ')} - Best time to sell for maximum profit
          </p>
          <p>
            <strong>Low Season:</strong> {getLowMonths().join(', ')} - Consider storage or alternative markets
          </p>
          <p>
            <strong>Price Variation:</strong> {Math.round(((getPriceRange().max - getPriceRange().min) / getPriceRange().min) * 100)}% difference between peak and low seasons
          </p>
          <p>
            <strong>Recommendation:</strong> Plan your harvest and storage strategy based on these seasonal patterns
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeasonalTrendsChart;
