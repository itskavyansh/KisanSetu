import React, { useState, useEffect } from 'react';
import CropProductionChart from './CropProductionChart';
import WeatherImpactChart from './WeatherImpactChart';

interface AnalyticsDashboardProps {
  className?: string;
  initialCommodity?: string;
  initialState?: string;
  initialYear?: number;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  className = '',
  initialCommodity = 'Potato',
  initialState = 'Karnataka',
  initialYear = new Date().getFullYear()
}) => {
  const [selectedCommodity, setSelectedCommodity] = useState(initialCommodity);
  const [selectedState, setSelectedState] = useState(initialState);
  const [selectedLocation, setSelectedLocation] = useState(initialState);
  const [selectedYear, setSelectedYear] = useState(initialYear);

  // Update local state when props change
  useEffect(() => {
    setSelectedCommodity(initialCommodity);
    setSelectedState(initialState);
    setSelectedLocation(initialState);
    setSelectedYear(initialYear);
  }, [initialCommodity, initialState, initialYear]);



  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Agricultural Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights for informed farming decisions</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last updated</p>
            <p className="text-sm font-semibold text-gray-700">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>



      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Impact Chart */}
        <div>
          <WeatherImpactChart
            location={selectedLocation}
            cropType={selectedCommodity}
            days={30}
            height={400}
          />
        </div>

        {/* Crop Production Chart */}
        <div>
          <CropProductionChart
            year={selectedYear}
            state={selectedState}
            height={400}
            selectedCrop={selectedCommodity}
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">🌡️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Weather</p>
              <p className="text-lg font-semibold text-gray-800">Favorable</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">🌱</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Crop Health</p>
              <p className="text-lg font-semibold text-gray-800">Good</p>
            </div>
          </div>
        </div>


      </div>

      {/* Insights Panel */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Weather Advisory</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">ℹ</span>
                Temperature conditions are optimal for {selectedCommodity}
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                Rainfall patterns are favorable
              </li>
              <li className="flex items-start">
                <span className="text-yellow-500 mr-2">⚠</span>
                Monitor humidity levels for disease prevention
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
