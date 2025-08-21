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

interface PricePredictionChartProps {
  commodity: string;
  state: string;
  market: string;
  days?: number;
  height?: number;
  className?: string;
}

interface PredictionData {
  date: string;
  predictedPrice: number;
  confidence: number;
  factors: {
    trend: number;
    seasonal: number;
    volatility: number;
  };
}

const PricePredictionChart: React.FC<PricePredictionChartProps> = ({
  commodity,
  state,
  market,
  days = 30,
  height = 400,
  className = ''
}) => {
  const [predictions, setPredictions] = useState<PredictionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPricePredictions();
  }, [commodity, state, market, days]);

  const loadPricePredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log(`🔮 Loading price predictions for ${commodity} in ${market}, ${state} for ${days} days`);
      
      const response = await apiClient.get(`/analytics/price-prediction/${commodity}/${state}/${market}?days=${days}`);
      
      if (response.data.success && response.data.data.predictions) {
        console.log(`✅ Received ${response.data.data.predictions.length} price predictions`);
        setPredictions(response.data.data.predictions);
      } else {
        throw new Error('No prediction data received');
      }
    } catch (err: any) {
      console.error('❌ Error loading price predictions:', err);
      setError(err.message || 'Failed to load price predictions');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return '#10B981'; // Green
    if (confidence >= 0.6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getAveragePrediction = () => {
    if (predictions.length === 0) return 0;
    const sum = predictions.reduce((acc, pred) => acc + pred.predictedPrice, 0);
    return Math.round(sum / predictions.length);
  };

  const getPriceChange = () => {
    if (predictions.length < 2) return 0;
    const firstPrice = predictions[0].predictedPrice;
    const lastPrice = predictions[predictions.length - 1].predictedPrice;
    return Math.round(((lastPrice - firstPrice) / firstPrice) * 100);
  };

  if (loading) {
    return (
      <div className={`bg-white p-6 rounded-lg shadow-md ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Generating price predictions...</span>
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
            onClick={loadPricePredictions}
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
          🔮 AI Price Prediction ({days} Days)
        </h3>
        <p className="text-sm text-gray-600">
          {commodity} in {market}, {state}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-green-800">Average Prediction</h4>
          <p className="text-2xl font-bold text-green-900">₹{getAveragePrediction()}/kg</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800">Price Change</h4>
          <p className={`text-2xl font-bold ${getPriceChange() >= 0 ? 'text-green-900' : 'text-red-900'}`}>
            {getPriceChange() >= 0 ? '+' : ''}{getPriceChange()}%
          </p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-purple-800">Confidence</h4>
          <p className="text-2xl font-bold text-purple-900">
            {Math.round(predictions[0]?.confidence * 100 || 0)}%
          </p>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={predictions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tickFormatter={(value: number) => `₹${value}`}
              tick={{ fontSize: 12 }}
            />
            <Tooltip 
              formatter={(value: any, name: string) => [
                `₹${value}/kg`, 
                name === 'predictedPrice' ? 'Predicted Price' : name
              ]}
              labelFormatter={formatDate}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="predictedPrice"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              name="Predicted Price"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Confidence Indicators */}
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Prediction Confidence</h4>
        <div className="space-y-2">
          {predictions.slice(0, 7).map((prediction, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {formatDate(prediction.date)}
              </span>
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${prediction.confidence * 100}%`,
                      backgroundColor: getConfidenceColor(prediction.confidence)
                    }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">
                  {Math.round(prediction.confidence * 100)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factors Analysis */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Prediction Factors</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {Math.round(predictions[0]?.factors.trend * 100 || 0)}%
            </div>
            <div className="text-xs text-gray-600">Trend Factor</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {Math.round(predictions[0]?.factors.seasonal * 100 || 0)}%
            </div>
            <div className="text-xs text-gray-600">Seasonal Factor</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              {Math.round(predictions[0]?.factors.volatility * 100 || 0)}%
            </div>
            <div className="text-xs text-gray-600">Volatility Factor</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricePredictionChart;
