// client/src/pages/CarbonCreditsPage.tsx
import React, { useEffect, useState } from 'react';
import { carbonCreditsAPI } from '../services/carbonCreditsService';

const CarbonCreditsPage: React.FC = () => {
  const [market, setMarket] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [calcResult, setCalcResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [calcError, setCalcError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const [m, t] = await Promise.all([
        carbonCreditsAPI.getMarketInfo(),
        carbonCreditsAPI.getProjectTemplates(),
      ]);
      setMarket(m.data);
      setTemplates(t.data);
    })();
  }, []);

  const calculateExample = async () => {
    setLoading(true);
    setCalcError(null);
    try {
      const r = await carbonCreditsAPI.calculateCredits({
        projectType: 'tree_planting',
        details: { treeCount: 100, species: 'teak' },
        location: 'Mysuru, Karnataka',
        startDate: '2024-01-01',
      });
      setCalcResult(r.data);
    } catch (e: any) {
      setCalcError(e?.response?.data?.error || 'Calculation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">Carbon Credits</h1>

      {market && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold">Current Price</div>
          <div className="text-xl">₹{market.currentPrice} per tonne CO₂</div>
          <div className="text-gray-600 mt-2">Trend: {market.trend}</div>
        </div>
      )}

      <div className="bg-white border rounded-lg p-4">
        <div className="font-semibold mb-2">Project Templates</div>
        <ul className="list-disc ml-6 text-gray-700">
          {templates.map((t) => <li key={t.id}>{t.name} — {t.description}</li>)}
        </ul>
      </div>

      <button onClick={calculateExample} disabled={loading} className="bg-kisan-green text-white px-4 py-2 rounded-lg">
        {loading ? 'Calculating...' : 'Calculate Example (100 Teak Trees)'}
      </button>

      {calcError && <div className="text-red-600">{calcError}</div>}

      {calcResult && (
        <div className="bg-white border rounded-lg p-4">
          <div className="font-semibold mb-2">Estimates</div>
          <div>Annual: {calcResult.carbonCredits.annual} {calcResult.carbonCredits.unit}</div>
          <div>Lifetime: {calcResult.carbonCredits.lifetime} {calcResult.carbonCredits.unit}</div>
          <div className="mt-2">Annual Earnings: ₹{calcResult.financialBenefits.annualEarnings}</div>
        </div>
      )}
    </div>
  );
};

export default CarbonCreditsPage;