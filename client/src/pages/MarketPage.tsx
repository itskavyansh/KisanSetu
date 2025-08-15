// client/src/pages/MarketPage.tsx
import React, { useState, useEffect } from 'react';
import { marketAPI } from '../services/marketService';

const MarketPage: React.FC = () => {
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [marketData, setMarketData] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const crops = [
    { value: 'tomato', label: 'Tomato' },
    { value: 'rice', label: 'Rice' },
    { value: 'wheat', label: 'Wheat' },
    { value: 'potato', label: 'Potato' },
    { value: 'onion', label: 'Onion' },
    { value: 'cotton', label: 'Cotton' },
    { value: 'sugarcane', label: 'Sugarcane' },
    { value: 'maize', label: 'Maize' }
  ];

  useEffect(() => {
    loadMarketData();
  }, [selectedCrop]);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [pricesResponse, trendsResponse] = await Promise.all([
        marketAPI.getPrices(selectedCrop),
        marketAPI.getTrends(selectedCrop, 7)
      ]);

      setMarketData(pricesResponse.data);
      setTrends(trendsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return '↗';
    if (change < 0) return '↘';
    return '→';
  };

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Market Intelligence</h1>
          <p className="text-gray-600">
            Real-time mandi prices, market trends, and selling recommendations
          </p>
        </div>

        {/* Crop Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Crop
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            {crops.map((crop) => (
              <button
                key={crop.value}
                onClick={() => setSelectedCrop(crop.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCrop === crop.value
                    ? 'bg-kisan-green text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {crop.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kisan-green mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading market data...</p>
          </div>
        ) : (
          <>
            {/* Current Price Card */}
            {marketData && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {crops.find(c => c.value === selectedCrop)?.label} Prices
                  </h2>
                  <span className="text-sm text-gray-500">
                    Last updated: {marketData.lastUpdated ? new Date(marketData.lastUpdated).toLocaleString() : 'N/A'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ₹{marketData.currentPrice}/kg
                    </div>
                    <div className="text-sm text-gray-600">Current Price</div>
                  </div>

                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-2 ${getPriceChangeColor(marketData.percentageChange)}`}>
                      {getPriceChangeIcon(marketData.percentageChange)} {Math.abs(marketData.percentageChange)}%
                    </div>
                    <div className="text-sm text-gray-600">Price Change</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 mb-2">
                      ₹{marketData.previousPrice}/kg
                    </div>
                    <div className="text-sm text-gray-600">Previous Price</div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Market Recommendation</h3>
                  <p className="text-blue-800">{marketData.recommendation}</p>
                </div>
              </div>
            )}

            {/* Mandi Prices */}
            {marketData?.mandiPrices && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mandi Prices</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(marketData.mandiPrices).map(([mandi, price]) => (
                    <div key={mandi} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">{mandi}</span>
                        <span className="text-lg font-bold text-kisan-green">₹{price as number}/kg</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Trends */}
            {trends && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Price Trends (Last 7 Days)</h2>
                <div className="space-y-4">
                  {trends.dailyPrices?.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium text-gray-900">{day.date}</span>
                        <span className="text-sm text-gray-500 ml-2">{day.day}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-gray-900">₹{day.price}/kg</span>
                        {day.change !== 0 && (
                          <span className={`text-sm ${getPriceChangeColor(day.change)}`}>
                            {getPriceChangeIcon(day.change)} {Math.abs(day.change)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Market Analysis */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Analysis</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900 mb-2">Supply Factors</h3>
                  <ul className="text-green-800 text-sm space-y-1">
                    <li>• Current harvest season</li>
                    <li>• Weather conditions</li>
                    <li>• Transportation availability</li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Demand Factors</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Festival season approaching</li>
                    <li>• Export demand</li>
                    <li>• Processing industry needs</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">Trading Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
                  <div>
                    <strong>Best Time to Sell:</strong> {marketData?.bestTimeToSell || 'Morning hours (6-10 AM)'}
                  </div>
                  <div>
                    <strong>Transport Options:</strong> {marketData?.transportOptions || 'Truck, Tractor trolley'}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MarketPage;