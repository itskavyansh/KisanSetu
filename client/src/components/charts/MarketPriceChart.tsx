import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import apiClient from '../../services/apiService';

interface PriceData {
  date: string;
  modalPrice: number;
  minPrice: number;
  maxPrice: number;
}

interface MarketPriceChartProps {
  commodity: string;
  state: string;
  market: string;
  height?: number;
}

const MarketPriceChart: React.FC<MarketPriceChartProps> = ({
  commodity,
  state,
  market,
  height = 400
}) => {
  const [priceData, setPriceData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPriceData();
  }, [commodity, state, market]);

  const fetchPriceData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get(`/agmarknet/prices/${commodity}/${state}/${market}`);
      
      if (response.data.success && response.data.data.prices) {
        const formattedData = response.data.data.prices
          .slice(0, 10) // Last 10 days
          .map((price: any) => ({
            date: price.Date,
            modalPrice: parseInt(price['Model Prize']) || 0,
            minPrice: parseInt(price['Min Prize']) || 0,
            maxPrice: parseInt(price['Max Prize']) || 0
          }))
          .reverse(); // Show oldest to newest
        
        setPriceData(formattedData);
      } else {
        setError('No price data available');
      }
    } catch (err) {
      console.error('Error fetching price data:', err);
      setError('Failed to load price data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading price data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchPriceData}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (priceData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-gray-400 text-2xl mb-2">📊</div>
          <p className="text-gray-600">No price data available for {commodity}</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-green-600">
            Modal Price: ₹{payload[0].value}
          </p>
          <p className="text-blue-600">
            Min Price: ₹{payload[1].value}
          </p>
          <p className="text-red-600">
            Max Price: ₹{payload[2].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {commodity} Price Trends - {market}, {state}
        </h3>
        <p className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={priceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short' 
            })}
          />
          <YAxis 
            stroke="#666"
            fontSize={12}
            tickFormatter={(value) => `₹${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Area
            type="monotone"
            dataKey="maxPrice"
            stackId="1"
            stroke="#ef4444"
            fill="#fecaca"
            fillOpacity={0.6}
            name="Max Price"
          />
          <Area
            type="monotone"
            dataKey="modalPrice"
            stackId="2"
            stroke="#10b981"
            fill="#d1fae5"
            fillOpacity={0.8}
            name="Modal Price"
          />
          <Area
            type="monotone"
            dataKey="minPrice"
            stackId="3"
            stroke="#3b82f6"
            fill="#dbeafe"
            fillOpacity={0.6}
            name="Min Price"
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-600">Current Modal</p>
          <p className="text-lg font-bold text-green-600">
            ₹{priceData[priceData.length - 1]?.modalPrice || 0}
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Price Range</p>
          <p className="text-lg font-bold text-blue-600">
            ₹{priceData[priceData.length - 1]?.minPrice || 0} - ₹{priceData[priceData.length - 1]?.maxPrice || 0}
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <p className="text-sm text-gray-600">Trend</p>
          <p className="text-lg font-bold text-purple-600">
            {getPriceTrend(priceData)}
          </p>
        </div>
      </div>
    </div>
  );
};

const getPriceTrend = (data: PriceData[]): string => {
  if (data.length < 2) return 'Stable';
  
  const current = data[data.length - 1].modalPrice;
  const previous = data[data.length - 2].modalPrice;
  const change = ((current - previous) / previous) * 100;
  
  if (change > 5) return '↗️ Rising';
  if (change < -5) return '↘️ Falling';
  return '→ Stable';
};

export default MarketPriceChart;
