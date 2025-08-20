import React, { useState } from 'react';
import WeatherImpactChart from '../components/charts/WeatherImpactChart';

const WeatherPage: React.FC = () => {
  const [location, setLocation] = useState('Bangalore');
  const [cropType, setCropType] = useState('Rice');
  const [days, setDays] = useState(30);

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6">
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Weather Intelligence</h1>
          <p className="text-gray-600">Analyze how weather impacts your crops</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {['Bangalore','Mumbai','Chennai','Hyderabad','Pune'].map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Crop</label>
              <select
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {['Rice','Wheat','Maize','Potato','Tomato','Onion','Cotton','Sugarcane'].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Days</label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {[7, 14, 30, 60].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <WeatherImpactChart location={location} cropType={cropType} days={days} height={420} />
      </div>
    </div>
  );
};

export default WeatherPage;


