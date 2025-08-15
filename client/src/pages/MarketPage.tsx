// client/src/pages/MarketPage.tsx
import React, { useEffect, useState } from 'react';
import { marketAPI } from '../services/marketService';

const MarketPage: React.FC = () => {
  const [crops, setCrops] = useState<any[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [marketData, setMarketData] = useState<any>(null);
  const [trends, setTrends] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const r = await marketAPI.getCrops();
      setCrops(r.data || []);
      if (!selectedCrop && r.data?.length) {
        setSelectedCrop(r.data[0].name); // use first available crop
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedCrop) return;
    (async () => {
      setLoading(true);
      try {
        const [p, t] = await Promise.all([
          marketAPI.getPrices(selectedCrop),
          marketAPI.getTrends(selectedCrop, 30),
        ]);
        setMarketData(p.data);
        setTrends(t.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedCrop]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Market Intelligence</h1>

      <div>
        <label className="block text-sm text-gray-700 mb-2">Select Crop</label>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-kisan-green focus:border-transparent"
        >
          {crops.map((c: any) => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}

      {marketData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between">
            <div>
              <div className="text-gray-600">Current Price</div>
              <div className="text-2xl font-bold">₹{marketData.currentPrice}/kg</div>
            </div>
            <div className="text-right">
              <div className="text-gray-600">Change</div>
              <div className="text-2xl font-bold text-green-600">↑{marketData.percentageChange}%</div>
            </div>
          </div>
          <p className="mt-4 text-gray-700">{marketData.recommendation}</p>
        </div>
      )}

      {trends && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-2">Price Trends (30 days)</h2>
          <div className="h-48 rounded bg-gray-100 flex items-center justify-center">
            <span className="text-gray-500">Chart coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketPage;