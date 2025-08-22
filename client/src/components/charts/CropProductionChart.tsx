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
  Line,
  AreaChart,
  Area
} from 'recharts';
import apiClient from '../../services/apiService';

interface ProductionData {
  crop: string;
  production: number;
  area: number;
  yield: number;
  trend: number;
}

interface CropProductionChartProps {
  year?: number;
  state?: string;
  height?: number;
  selectedCrop?: string;
  availableStates?: string[];
  onChangeState?: (newState: string) => void;
}

const CropProductionChart: React.FC<CropProductionChartProps> = ({
  year = new Date().getFullYear(),
  state = 'Karnataka',
  height = 400,
  selectedCrop = 'Rice',
  availableStates,
  onChangeState
}) => {
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'line' | 'area'>('bar');

  useEffect(() => {
    fetchProductionData();
  }, [year, state, selectedCrop]);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate realistic production data
      const mockData: ProductionData[] = generateProductionData(selectedCrop, state, year);
      setProductionData(mockData);
      
    } catch (err) {
      console.error('Error fetching production data:', err);
      setError('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const generateProductionData = (crop: string, state: string, year: number): ProductionData[] => {
    const baseCrops = [
      'Rice', 'Wheat', 'Maize', 'Pulses', 'Oilseeds', 
      'Sugarcane', 'Cotton', 'Potato', 'Tomato', 'Onion'
    ];
    
    // State-specific production patterns
    const statePatterns = {
      'Karnataka': { multiplier: 1.0, rainfall: 'Moderate' },
      'Maharashtra': { multiplier: 1.2, rainfall: 'High' },
      'Tamil Nadu': { multiplier: 0.9, rainfall: 'Moderate' },
      'Andhra Pradesh': { multiplier: 1.1, rainfall: 'High' },
      'Telangana': { multiplier: 0.8, rainfall: 'Low' },
      'Kerala': { multiplier: 0.7, rainfall: 'Very High' },
      'Gujarat': { multiplier: 1.3, rainfall: 'Low' },
      'Rajasthan': { multiplier: 0.6, rainfall: 'Very Low' }
    };

    const statePattern = statePatterns[state as keyof typeof statePatterns] || statePatterns['Karnataka'];
    
    return baseCrops.map(cropName => {
      const isSelectedCrop = cropName === crop;
      const baseProduction = Math.random() * 5000 + 1000;
      const baseArea = Math.random() * 800 + 200;
      
      // Apply state multiplier and crop-specific adjustments
      const production = Math.round(baseProduction * statePattern.multiplier * (isSelectedCrop ? 1.3 : 1));
      const area = Math.round(baseArea * statePattern.multiplier * (isSelectedCrop ? 1.2 : 1));
      const yieldValue = Math.round((production / area) * 100) / 100;
      const trend = Math.round((Math.random() - 0.5) * 20); // ±10% trend
      
      return {
        crop: cropName,
        production,
        area,
        yield: yieldValue,
        trend
      };
    });
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading production data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center text-red-600">
          <p>❌ {error}</p>
          <button 
            onClick={fetchProductionData}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
              {entry.dataKey === 'production' && ' tonnes'}
              {entry.dataKey === 'area' && ' hectares'}
              {entry.dataKey === 'yield' && ' t/ha'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    if (!productionData || productionData.length === 0) return null;

    const commonProps = {
      data: productionData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 }
    };

    switch (chartType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="crop" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="production" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                name="Production (tonnes)"
              />
              <Line 
                type="monotone" 
                dataKey="area" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                name="Area (hectares)"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="crop" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="production" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.3}
                name="Production (tonnes)"
              />
              <Area 
                type="monotone" 
                dataKey="area" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.2}
                name="Area (hectares)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default: // bar chart
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="crop" stroke="#666" fontSize={12} />
              <YAxis stroke="#666" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="production" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Production (tonnes)"
              />
              <Bar 
                dataKey="area" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="Area (hectares)"
              />
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const selectedCropData = productionData.find(item => item.crop === selectedCrop);
  const totalProduction = productionData.reduce((sum, item) => sum + item.production, 0);
  const totalArea = productionData.reduce((sum, item) => sum + item.area, 0);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">
            Crop Production Analysis
          </h3>
          <p className="text-sm text-gray-600">
            {state} • {year} • {selectedCrop ? `Focus: ${selectedCrop}` : 'All Crops'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* State selector */}
          {availableStates && availableStates.length > 0 && (
            <select
              value={state}
              onChange={(e) => onChangeState && onChangeState(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {availableStates.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          
          {/* Chart type selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'bar', label: 'Bar', icon: '📊' },
              { key: 'line', label: 'Line', icon: '📈' },
              { key: 'area', label: 'Area', icon: '🌊' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setChartType(key as 'bar' | 'line' | 'area')}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  chartType === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-1">{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      {renderChart()}

      {/* Summary stats */}
      {productionData && productionData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <p className="text-sm text-blue-600 font-medium">Total Production</p>
            <p className="text-2xl font-bold text-blue-900">
              {totalProduction.toLocaleString()} t
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <p className="text-sm text-green-600 font-medium">Total Area</p>
            <p className="text-2xl font-bold text-green-900">
              {totalArea.toLocaleString()} ha
            </p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <p className="text-sm text-purple-600 font-medium">Avg Yield</p>
            <p className="text-2xl font-bold text-purple-900">
              {totalArea > 0 ? (totalProduction / totalArea).toFixed(1) : '0.0'} t/ha
            </p>
          </div>
          
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <p className="text-sm text-orange-600 font-medium">Top Crop</p>
            <p className="text-lg font-bold text-orange-900">
              {productionData.reduce((max, item) => 
                item.production > max.production ? item : max
              ).crop}
            </p>
          </div>
        </div>
      )}

      {/* Selected crop details */}
      {selectedCropData && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-gray-800 mb-3">📊 {selectedCrop} Production Details</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Production</p>
              <p className="text-xl font-bold text-green-700">
                {selectedCropData.production.toLocaleString()} tonnes
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Area</p>
              <p className="text-xl font-bold text-blue-700">
                {selectedCropData.area.toLocaleString()} hectares
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Yield</p>
              <p className="text-xl font-bold text-purple-700">
                {selectedCropData.yield} t/ha
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CropProductionChart;
