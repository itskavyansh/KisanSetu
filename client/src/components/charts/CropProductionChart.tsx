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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import apiClient from '../../services/apiService';

interface ProductionData {
  crop: string;
  production: number;
  area: number;
  yield: number;
}

interface CropProductionChartProps {
  year?: number;
  state?: string;
  height?: number;
  selectedCrop?: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const CropProductionChart: React.FC<CropProductionChartProps> = ({
  year = new Date().getFullYear(),
  state = 'Karnataka',
  height = 400,
  selectedCrop = 'Rice'
}) => {
  const [productionData, setProductionData] = useState<ProductionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');

  useEffect(() => {
    fetchProductionData();
  }, [year, state, selectedCrop]);

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate dynamic production data based on selected crop and state
      const mockData: ProductionData[] = generateDynamicProductionData(selectedCrop, state, year);
      
      setProductionData(mockData);
      
    } catch (err) {
      console.error('Error fetching production data:', err);
      setError('Failed to load production data');
    } finally {
      setLoading(false);
    }
  };

  const generateDynamicProductionData = (crop: string, state: string, year: number): ProductionData[] => {
    // Base production data for different crops
    const baseData = {
      'Rice': { baseProduction: 8500, baseArea: 1200, baseYield: 7.08 },
      'Wheat': { baseProduction: 6200, baseArea: 800, baseYield: 7.75 },
      'Maize': { baseProduction: 3200, baseArea: 450, baseYield: 7.11 },
      'Pulses': { baseProduction: 1800, baseArea: 300, baseYield: 6.00 },
      'Oilseeds': { baseProduction: 2200, baseArea: 350, baseYield: 6.29 },
      'Sugarcane': { baseProduction: 45000, baseArea: 500, baseYield: 90.00 },
      'Potato': { baseProduction: 2800, baseArea: 200, baseYield: 14.00 },
      'Tomato': { baseProduction: 1500, baseArea: 100, baseYield: 15.00 },
      'Onion': { baseProduction: 1200, baseArea: 80, baseYield: 15.00 },
      'Cotton': { baseProduction: 1800, baseArea: 300, baseYield: 6.00 }
    };

    // State-specific multipliers
    const stateMultipliers = {
      'Karnataka': { production: 1.0, area: 1.0, yield: 1.0 },
      'Maharashtra': { production: 1.2, area: 1.1, yield: 1.1 },
      'Tamil Nadu': { production: 0.9, area: 0.8, yield: 1.2 },
      'Andhra Pradesh': { production: 1.1, area: 1.0, yield: 1.1 },
      'Telangana': { production: 0.8, area: 0.7, yield: 1.3 }
    };

    const cropData = baseData[crop as keyof typeof baseData] || baseData['Rice'];
    const stateMultiplier = stateMultipliers[state as keyof typeof stateMultipliers] || stateMultipliers['Karnataka'];
    
    // Add some year-based variation
    const yearFactor = 1 + (year - new Date().getFullYear()) * 0.05;
    
    // Generate data for the selected crop and related crops
    const crops = [crop, 'Rice', 'Wheat', 'Maize', 'Pulses', 'Oilseeds'];
    const uniqueCrops = crops.filter((item, index) => crops.indexOf(item) === index);
    
    return uniqueCrops.map(cropName => {
      const base = baseData[cropName as keyof typeof baseData] || baseData['Rice'];
      const isSelectedCrop = cropName === crop;
      
      // Apply multipliers
      const production = Math.round(base.baseProduction * stateMultiplier.production * yearFactor * (isSelectedCrop ? 1.1 : 1));
      const area = Math.round(base.baseArea * stateMultiplier.area * yearFactor * (isSelectedCrop ? 1.05 : 1));
      const yieldValue = base.baseYield * stateMultiplier.yield * (isSelectedCrop ? 1.05 : 1);
      
      return {
        crop: cropName,
        production,
        area,
        yield: yieldValue
      };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading production data...</p>
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
            onClick={fetchProductionData}
            className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600">
            Production: {payload[0].value} thousand tonnes
          </p>
          <p className="text-green-600">
            Area: {payload[1]?.value || 0} thousand hectares
          </p>
          <p className="text-purple-600">
            Yield: {payload[2]?.value || 0} tonnes/hectare
          </p>
        </div>
      );
    }
    return null;
  };

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={productionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="crop" 
          stroke="#666"
          fontSize={12}
        />
        <YAxis 
          stroke="#666"
          fontSize={12}
          tickFormatter={(value) => `${value}k`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="production" fill="#3b82f6" name="Production (k tonnes)" />
        <Bar dataKey="area" fill="#10b981" name="Area (k hectares)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={productionData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ crop, production }) => `${crop}: ${production}k`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="production"
        >
          {productionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => [`${value} thousand tonnes`, 'Production']}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const totalProduction = productionData.reduce((sum, item) => sum + item.production, 0);
  const totalArea = productionData.reduce((sum, item) => sum + item.area, 0);
  const selectedCropData = productionData.find(item => item.crop === selectedCrop);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Crop Production - {state} ({year})
          </h3>
          <p className="text-sm text-gray-600">
            Production data in thousand tonnes | Focus: {selectedCrop}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'bar' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'pie' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pie Chart
          </button>
        </div>
      </div>
      
      {chartType === 'bar' ? renderBarChart() : renderPieChart()}
      
      <div className="mt-6 grid grid-cols-3 gap-4 text-center">
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Total Production</p>
          <p className="text-lg font-bold text-blue-600">
            {totalProduction.toLocaleString()}k tonnes
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-600">Total Area</p>
          <p className="text-lg font-bold text-green-600">
            {totalArea.toLocaleString()}k hectares
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <p className="text-sm text-gray-600">Avg Yield</p>
          <p className="text-lg font-bold text-purple-600">
            {(totalProduction / totalArea).toFixed(1)} t/ha
          </p>
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="font-semibold text-gray-800 mb-2">Production Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-yellow-50 p-3 rounded">
            <h5 className="font-medium text-yellow-800 mb-1">Selected Crop: {selectedCrop}</h5>
            {selectedCropData && (
              <div className="text-sm text-yellow-700">
                <p>Production: {selectedCropData.production.toLocaleString()}k tonnes</p>
                <p>Area: {selectedCropData.area.toLocaleString()}k hectares</p>
                <p>Yield: {selectedCropData.yield.toFixed(1)} t/ha</p>
              </div>
            )}
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <h5 className="font-medium text-gray-800 mb-1">Top Producing Crops</h5>
            <div className="space-y-1">
              {[...productionData]
                .sort((a, b) => b.production - a.production)
                .slice(0, 3)
                .map((crop, index) => (
                  <div key={crop.crop} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{crop.crop}</span>
                    <span className="font-semibold text-gray-800">
                      {crop.production}k tonnes
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropProductionChart;
