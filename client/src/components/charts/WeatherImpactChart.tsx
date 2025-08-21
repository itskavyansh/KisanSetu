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
  ComposedChart,
  Area
} from 'recharts';
import apiClient from '../../services/apiService';

interface WeatherData {
  date: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  cropYield: number;
  diseaseRisk: number;
}

interface WeatherImpactChartProps {
  location: string;
  cropType?: string;
  days?: number;
  height?: number;
}

const WeatherImpactChart: React.FC<WeatherImpactChartProps> = ({
  location = 'Bangalore',
  cropType = 'Rice',
  days = 30,
  height = 400
}) => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWeatherData();
  }, [location, cropType, days]);

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Generate dynamic weather data based on crop type and location
      const mockData: WeatherData[] = generateDynamicWeatherData(cropType, location, days);
      
      setWeatherData(mockData);
      
    } catch (err) {
      console.error('Error fetching weather data:', err);
      setError('Failed to load weather data');
    } finally {
      setLoading(false);
    }
  };

  const generateDynamicWeatherData = (crop: string, location: string, days: number): WeatherData[] => {
    const mockData: WeatherData[] = [];
    const today = new Date();
    
    // Crop-specific weather preferences
    const cropPreferences = {
      'Rice': { optimalTemp: 25, optimalHumidity: 80, waterNeeded: true },
      'Wheat': { optimalTemp: 20, optimalHumidity: 60, waterNeeded: false },
      'Maize': { optimalTemp: 28, optimalHumidity: 70, waterNeeded: true },
      'Potato': { optimalTemp: 18, optimalHumidity: 75, waterNeeded: true },
      'Tomato': { optimalTemp: 25, optimalHumidity: 65, waterNeeded: true },
      'Onion': { optimalTemp: 22, optimalHumidity: 70, waterNeeded: true },
      'Cotton': { optimalTemp: 30, optimalHumidity: 60, waterNeeded: false },
      'Sugarcane': { optimalTemp: 32, optimalHumidity: 75, waterNeeded: true }
    };
    
    const cropPref = cropPreferences[crop as keyof typeof cropPreferences] || cropPreferences['Rice'];
    
    // Location-specific weather patterns
    const locationPatterns = {
      'Bangalore': { baseTemp: 25, baseHumidity: 65, rainfall: 0.3 },
      'Mumbai': { baseTemp: 30, baseHumidity: 75, rainfall: 0.4 },
      'Chennai': { baseTemp: 32, baseHumidity: 70, rainfall: 0.2 },
      'Hyderabad': { baseTemp: 28, baseHumidity: 60, rainfall: 0.25 },
      'Pune': { baseTemp: 26, baseHumidity: 55, rainfall: 0.2 }
    };
    
    const locPattern = locationPatterns[location as keyof typeof locationPatterns] || locationPatterns['Bangalore'];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Generate realistic weather patterns with crop-specific variations
      const baseTemp = locPattern.baseTemp + Math.sin(i * 0.2) * 5; // Seasonal variation
      const baseHumidity = locPattern.baseHumidity + Math.sin(i * 0.3) * 15;
      const rainfall = Math.random() > (1 - locPattern.rainfall) ? Math.random() * 50 : 0;
      
      // Adjust weather based on crop preferences
      const tempVariation = (cropPref.optimalTemp - baseTemp) * 0.1;
      const humidityVariation = (cropPref.optimalHumidity - baseHumidity) * 0.1;
      
      const temperature = Math.round(baseTemp + tempVariation + (Math.random() - 0.5) * 3);
      const humidity = Math.round(baseHumidity + humidityVariation + (Math.random() - 0.5) * 10);
      const rainfallAmount = Math.round(rainfall * 10) / 10;
      
      // Calculate crop yield based on weather conditions
      const tempFactor = 1 - Math.abs(temperature - cropPref.optimalTemp) / cropPref.optimalTemp * 0.5;
      const humidityFactor = 1 - Math.abs(humidity - cropPref.optimalHumidity) / cropPref.optimalHumidity * 0.3;
      const rainfallFactor = cropPref.waterNeeded ? (rainfallAmount > 5 ? 1.1 : 0.9) : 1.0;
      
      const cropYield = Math.round(80 * tempFactor * humidityFactor * rainfallFactor + (Math.random() - 0.5) * 10);
      
      // Calculate disease risk based on weather conditions
      let diseaseRisk = 20;
      if (humidity > 80) diseaseRisk += 30;
      if (temperature > 30) diseaseRisk += 20;
      if (rainfallAmount > 20) diseaseRisk += 25;
      if (crop === 'Tomato' && humidity > 70) diseaseRisk += 15; // Tomatoes are prone to fungal diseases
      if (crop === 'Rice' && temperature > 35) diseaseRisk += 20; // Rice is sensitive to high temperatures
      
      diseaseRisk = Math.round(diseaseRisk + (Math.random() - 0.5) * 10);
      diseaseRisk = Math.max(0, Math.min(100, diseaseRisk));
      
      mockData.push({
        date: date.toISOString().split('T')[0],
        temperature,
        humidity,
        rainfall: rainfallAmount,
        cropYield,
        diseaseRisk
      });
    }
    
    return mockData;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading weather data...</p>
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
            onClick={fetchWeatherData}
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
          <p className="text-red-600">
            Temperature: {payload[0]?.value}°C
          </p>
          <p className="text-blue-600">
            Humidity: {payload[1]?.value}%
          </p>
          <p className="text-green-600">
            Rainfall: {payload[2]?.value}mm
          </p>
          <p className="text-purple-600">
            Disease Risk: {payload[3]?.value}%
          </p>
        </div>
      );
    }
    return null;
  };

  const getWeatherAdvice = () => {
    const latest = weatherData[weatherData.length - 1];
    const avgTemp = weatherData.reduce((sum, d) => sum + d.temperature, 0) / weatherData.length;
    const totalRainfall = weatherData.reduce((sum, d) => sum + d.rainfall, 0);
    const avgDiseaseRisk = weatherData.reduce((sum, d) => sum + d.diseaseRisk, 0) / weatherData.length;

    const advice = [];

    // Crop-specific advice
    if (cropType === 'Rice') {
      if (latest.temperature > 35) {
        advice.push('High temperature stress on rice - increase irrigation frequency');
      }
      if (latest.humidity > 85) {
        advice.push('High humidity - monitor for blast disease in rice');
      }
      if (totalRainfall < 30) {
        advice.push('Low rainfall - rice needs more water, consider irrigation');
      }
    } else if (cropType === 'Tomato') {
      if (latest.temperature > 32) {
        advice.push('High temperature - tomatoes may drop flowers, provide shade');
      }
      if (latest.humidity > 80) {
        advice.push('High humidity - monitor for early blight in tomatoes');
      }
    } else if (cropType === 'Potato') {
      if (latest.temperature > 25) {
        advice.push('High temperature - potatoes may develop heat stress');
      }
      if (latest.humidity > 80) {
        advice.push('High humidity - watch for late blight in potatoes');
      }
    }

    // General weather advice
    if (latest.temperature > 35) {
      advice.push('High temperature alert - consider irrigation scheduling');
    } else if (latest.temperature < 15) {
      advice.push('Low temperature - protect crops from cold stress');
    }

    if (latest.humidity > 80) {
      advice.push('High humidity - monitor for fungal diseases');
    }

    if (totalRainfall > 100) {
      advice.push('Heavy rainfall - check for waterlogging');
    } else if (totalRainfall < 20) {
      advice.push('Low rainfall - irrigation may be needed');
    }

    if (avgDiseaseRisk > 50) {
      advice.push('High disease risk - consider preventive measures');
    }

    return advice.length > 0 ? advice : ['Weather conditions are favorable for crop growth'];
  };

  const avgTemperature = weatherData && weatherData.length > 0 ? weatherData.reduce((sum, d) => sum + (d?.temperature || 0), 0) / weatherData.length : 0;
  const totalRainfall = weatherData && weatherData.length > 0 ? weatherData.reduce((sum, d) => sum + (d?.rainfall || 0), 0) : 0;
  const avgDiseaseRisk = weatherData && weatherData.length > 0 ? weatherData.reduce((sum, d) => sum + (d?.diseaseRisk || 0), 0) / weatherData.length : 0;
  const avgCropYield = weatherData && weatherData.length > 0 ? weatherData.reduce((sum, d) => sum + (d?.cropYield || 0), 0) / weatherData.length : 0;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Weather Impact Analysis - {location}
        </h3>
        <p className="text-sm text-gray-600">
          {cropType} crop analysis for the last {days} days
        </p>
      </div>
      
      {weatherData && weatherData.length > 0 ? (
        <ResponsiveContainer width="100%" height={height}>
          <ComposedChart data={weatherData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date"
            stroke="#666"
            fontSize={12}
            tickFormatter={(value: string | number) => new Date(value).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short' 
            })}
          />
          <YAxis 
            yAxisId="left"
            stroke="#666"
            fontSize={12}
            tickFormatter={(value: number) => `${value}°C`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#666"
            fontSize={12}
            tickFormatter={(value: number) => `${value}%`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="temperature"
            stroke="#ef4444"
            strokeWidth={2}
            name="Temperature (°C)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="humidity"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Humidity (%)"
          />
          <Area
            type="monotone"
            dataKey="rainfall"
            stroke="#10b981"
            fill="#d1fae5"
            fillOpacity={0.6}
            name="Rainfall (mm)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="diseaseRisk"
            stroke="#8b5cf6"
            strokeWidth={2}
            strokeDasharray="5 5"
            name="Disease Risk (%)"
          />
          </ComposedChart>
        </ResponsiveContainer>
      ) : (
        <div style={{ height }} className="flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-gray-500">No weather data available</p>
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-4 gap-4 text-center">
        <div className="bg-red-50 p-3 rounded">
          <p className="text-sm text-gray-600">Avg Temperature</p>
          <p className="text-lg font-bold text-red-600">
            {avgTemperature.toFixed(1)}°C
          </p>
        </div>
        <div className="bg-blue-50 p-3 rounded">
          <p className="text-sm text-gray-600">Total Rainfall</p>
          <p className="text-lg font-bold text-blue-600">
            {totalRainfall.toFixed(1)}mm
          </p>
        </div>
        <div className="bg-purple-50 p-3 rounded">
          <p className="text-sm text-gray-600">Disease Risk</p>
          <p className="text-lg font-bold text-purple-600">
            {avgDiseaseRisk.toFixed(1)}%
          </p>
        </div>
        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-600">Crop Health</p>
          <p className="text-lg font-bold text-green-600">
            {avgDiseaseRisk < 30 ? 'Good' : avgDiseaseRisk < 60 ? 'Moderate' : 'Poor'}
          </p>
        </div>
      </div>
      
      {weatherData && weatherData.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-800 mb-2">Weather Advisory for {cropType}</h4>
          <div className="space-y-2">
            {getWeatherAdvice().map((advice, index) => (
              <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                <span className="text-yellow-600 mt-0.5">💡</span>
                <span className="text-sm text-gray-700">{advice}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherImpactChart;
