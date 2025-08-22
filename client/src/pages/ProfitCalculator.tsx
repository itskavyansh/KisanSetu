import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import ChartErrorBoundary from '../components/common/ChartErrorBoundary';
import apiClient from '../services/apiService';

interface CropTemplate {
  name: string;
  category: string;
  seedsCost: number;
  fertilizerCost: number;
  laborCost: number;
  otherCosts: number;
  expectedYield: number;
  expectedPrice: number;
  duration: string;
  description: string;
}

interface CalculationResult {
  totalCost: number;
  totalRevenue: number;
  profit: number;
  profitMargin: number;
  roi: number;
  breakEvenYield: number;
  costBreakdown: Array<{ name: string; value: number; color: string }>;
}

const ProfitCalculator: React.FC = () => {
  const [formData, setFormData] = useState({
    cropName: '',
    seedsCost: 0,
    fertilizerCost: 0,
    laborCost: 0,
    otherCosts: 0,
    expectedYield: 0,
    expectedPrice: 0,
    area: 0,
    duration: ''
  });

  const [result, setResult] = useState<CalculationResult | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [marketPrices, setMarketPrices] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<any[]>([]);

  // Crop templates with realistic data
  const cropTemplates: CropTemplate[] = [
    {
      name: 'Rice',
      category: 'Cereals',
      seedsCost: 1200,
      fertilizerCost: 3000,
      laborCost: 8000,
      otherCosts: 2000,
      expectedYield: 4000,
      expectedPrice: 25,
      duration: '120-150 days',
      description: 'Kharif season rice cultivation'
    },
    {
      name: 'Wheat',
      category: 'Cereals',
      seedsCost: 1500,
      fertilizerCost: 3500,
      laborCost: 7000,
      otherCosts: 1800,
      expectedYield: 3500,
      expectedPrice: 22,
      duration: '110-130 days',
      description: 'Rabi season wheat cultivation'
    },
    {
      name: 'Tomato',
      category: 'Vegetables',
      seedsCost: 800,
      fertilizerCost: 2500,
      laborCost: 12000,
      otherCosts: 3000,
      expectedYield: 8000,
      expectedPrice: 15,
      duration: '90-120 days',
      description: 'High-value vegetable crop'
    },
    {
      name: 'Potato',
      category: 'Vegetables',
      seedsCost: 2000,
      fertilizerCost: 4000,
      laborCost: 10000,
      otherCosts: 2500,
      expectedYield: 12000,
      expectedPrice: 12,
      duration: '90-110 days',
      description: 'Staple vegetable crop'
    },
    {
      name: 'Cotton',
      category: 'Cash Crops',
      seedsCost: 1800,
      fertilizerCost: 4500,
      laborCost: 15000,
      otherCosts: 4000,
      expectedYield: 2000,
      expectedPrice: 65,
      duration: '150-180 days',
      description: 'Long-duration cash crop'
    },
    {
      name: 'Sugarcane',
      category: 'Cash Crops',
      seedsCost: 3000,
      fertilizerCost: 6000,
      laborCost: 20000,
      otherCosts: 5000,
      expectedYield: 80000,
      expectedPrice: 3.5,
      duration: '300-365 days',
      description: 'Annual cash crop'
    }
  ];

  // Load saved calculations from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('profit_calculations');
      if (saved) {
        setSavedCalculations(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading saved calculations:', error);
    }
  }, []);

  // Save calculations to localStorage
  const saveCalculation = () => {
    if (!result) return;
    
    const calculation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...formData,
      ...result
    };

    const updated = [calculation, ...savedCalculations].slice(0, 10); // Keep last 10
    setSavedCalculations(updated);
    
    try {
      localStorage.setItem('profit_calculations', JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving calculation:', error);
    }
  };

  // Load market prices for selected crop
  const loadMarketPrices = async (cropName: string) => {
    if (!cropName) return;
    
    try {
      setLoading(true);
      const response = await apiClient.get(`/agmarknet/prices/${cropName}/Karnataka/Bangalore`);
      
      if (response.data.success && response.data.data?.prices?.length > 0) {
        const currentPricePerQuintal = parseInt(response.data.data.prices[0]?.['Model Prize']) || 0;
        const currentPrice = Math.round(currentPricePerQuintal / 100); // Convert to per kg
        
        setMarketPrices({
          currentPrice,
          lastUpdated: response.data.data.lastUpdated,
          source: 'Agmarknet'
        });
        
        // Update form with current market price
        setFormData(prev => ({
          ...prev,
          expectedPrice: currentPrice
        }));
      }
    } catch (error) {
      console.error('Error loading market prices:', error);
    } finally {
      setLoading(false);
    }
  };

  // Apply crop template
  const applyTemplate = (template: CropTemplate) => {
    setFormData({
      cropName: template.name,
      seedsCost: template.seedsCost,
      fertilizerCost: template.fertilizerCost,
      laborCost: template.laborCost,
      otherCosts: template.otherCosts,
      expectedYield: template.expectedYield,
      expectedPrice: template.expectedPrice,
      area: 1, // Default 1 acre
      duration: template.duration
    });
    
    setSelectedTemplate(template.name);
    loadMarketPrices(template.name);
  };

  // Calculate profit analysis
  const calculateProfit = () => {
    const { seedsCost, fertilizerCost, laborCost, otherCosts, expectedYield, expectedPrice } = formData;
    
    const totalCost = seedsCost + fertilizerCost + laborCost + otherCosts;
    const totalRevenue = expectedYield * expectedPrice;
    const profit = totalRevenue - totalCost;
    const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    const breakEvenYield = expectedPrice > 0 ? totalCost / expectedPrice : 0;

    const costBreakdown = [
      { name: 'Seeds', value: seedsCost, color: '#10b981' },
      { name: 'Fertilizer', value: fertilizerCost, color: '#3b82f6' },
      { name: 'Labor', value: laborCost, color: '#f59e0b' },
      { name: 'Other', value: otherCosts, color: '#ef4444' }
    ];

    const result: CalculationResult = {
      totalCost,
      totalRevenue,
      profit,
      profitMargin,
      roi,
      breakEvenYield,
      costBreakdown
    };

    setResult(result);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: number | string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Profit Calculator</h1>
        <div className="text-sm text-gray-600">
          Calculate crop profitability and analyze costs
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Crop Templates */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Quick Templates</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {cropTemplates.map((template) => (
                <button
                  key={template.name}
                  onClick={() => applyTemplate(template)}
                  className={`p-3 border rounded-lg text-left hover:shadow-md transition-shadow ${
                    selectedTemplate === template.name ? 'border-kisan-green bg-green-50' : 'border-gray-200'
                  }`}
                >
                  <div className="font-medium text-sm">{template.name}</div>
                  <div className="text-xs text-gray-600">{template.category}</div>
                  <div className="text-xs text-gray-500 mt-1">{template.duration}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Calculation Form */}
          <div className="bg-white border rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-4">Crop Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Crop Name</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.cropName}
                  onChange={(e) => handleInputChange('cropName', e.target.value)}
                  placeholder="e.g., Rice, Wheat, Tomato"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area (acres)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.area}
                  onChange={(e) => handleInputChange('area', Number(e.target.value))}
                  placeholder="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seeds Cost (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.seedsCost}
                  onChange={(e) => handleInputChange('seedsCost', Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fertilizer Cost (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.fertilizerCost}
                  onChange={(e) => handleInputChange('fertilizerCost', Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labor Cost (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.laborCost}
                  onChange={(e) => handleInputChange('laborCost', Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Other Costs (₹)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.otherCosts}
                  onChange={(e) => handleInputChange('otherCosts', Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Yield (kg)</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.expectedYield}
                  onChange={(e) => handleInputChange('expectedYield', Number(e.target.value))}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Price per kg (₹)
                  {marketPrices && (
                    <span className="text-xs text-blue-600 ml-2">
                      Market: ₹{marketPrices.currentPrice}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.expectedPrice}
                  onChange={(e) => handleInputChange('expectedPrice', Number(e.target.value))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={calculateProfit}
                className="bg-kisan-green text-white px-6 py-2 rounded-lg hover:bg-green-600"
              >
                Calculate Profit
              </button>
              {result && (
                <button
                  onClick={saveCalculation}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Save Calculation
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* Market Prices */}
          {marketPrices && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Market Prices</h3>
              <div className="text-2xl font-bold text-green-600">
                ₹{marketPrices.currentPrice}/kg
              </div>
              <div className="text-sm text-gray-600">
                Last updated: {new Date(marketPrices.lastUpdated).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Source: {marketPrices.source}
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="bg-white border rounded-lg p-4 space-y-4">
              <h3 className="font-semibold">Profit Analysis</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Cost:</span>
                  <span className="font-medium">{formatCurrency(result.totalCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium">{formatCurrency(result.totalRevenue)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {result.profit >= 0 ? 'Net Profit:' : 'Net Loss:'}
                    </span>
                    <span className={`font-bold text-lg ${
                      result.profit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatCurrency(result.profit)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-3 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className={`font-medium ${
                    result.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(result.profitMargin)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">ROI:</span>
                  <span className={`font-medium ${
                    result.roi >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(result.roi)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Break-even Yield:</span>
                  <span className="font-medium">{result.breakEvenYield.toFixed(0)} kg</span>
                </div>
              </div>

              {/* Cost Breakdown Chart */}
              <div className="pt-3 border-t">
                <h4 className="font-medium mb-2">Cost Breakdown</h4>
                <div style={{ height: 200 }}>
                  <ChartErrorBoundary>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={result.costBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {result.costBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(value)} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartErrorBoundary>
                </div>
              </div>
            </div>
          )}

          {/* Saved Calculations */}
          {savedCalculations.length > 0 && (
            <div className="bg-white border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Recent Calculations</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedCalculations.map((calc) => (
                  <div key={calc.id} className="border rounded p-2 text-sm">
                    <div className="font-medium">{calc.cropName}</div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>{new Date(calc.timestamp).toLocaleDateString()}</span>
                      <span className={calc.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(calc.profit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfitCalculator;



