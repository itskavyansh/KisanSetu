import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend, BarChart, Bar } from 'recharts';
import ChartErrorBoundary from '../components/common/ChartErrorBoundary';

interface CropInfo {
  name: string;
  category: string;
  kharif: boolean;
  rabi: boolean;
  zaid: boolean;
  sowingStart: string;
  sowingEnd: string;
  harvestingStart: string;
  harvestingEnd: string;
  duration: string;
  description: string;
  tips: string[];
  requirements: {
    soil: string;
    climate: string;
    water: string;
    temperature: string;
  };
}

interface SeasonalData {
  month: string;
  kharif: number;
  rabi: number;
  zaid: number;
}

const CropCalendar: React.FC = () => {
  const [selectedSeason, setSelectedSeason] = useState<'kharif' | 'rabi' | 'zaid' | 'all'>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Comprehensive crop database
  const crops: CropInfo[] = [
    {
      name: 'Rice',
      category: 'Cereals',
      kharif: true,
      rabi: false,
      zaid: false,
      sowingStart: 'June',
      sowingEnd: 'July',
      harvestingStart: 'October',
      harvestingEnd: 'November',
      duration: '120-150 days',
      description: 'Staple food crop, requires high water and warm climate',
      tips: [
        'Sow when monsoon arrives',
        'Maintain 2-3 inches water level',
        'Apply nitrogen in 3 splits',
        'Control weeds early'
      ],
      requirements: {
        soil: 'Clay loam, alluvial',
        climate: 'Warm and humid',
        water: 'High (flooded conditions)',
        temperature: '25-35°C'
      }
    },
    {
      name: 'Wheat',
      category: 'Cereals',
      kharif: false,
      rabi: true,
      zaid: false,
      sowingStart: 'November',
      sowingEnd: 'December',
      harvestingStart: 'March',
      harvestingEnd: 'April',
      duration: '110-130 days',
      description: 'Winter crop, requires cool climate and moderate water',
      tips: [
        'Sow after rice harvest',
        'Ensure proper drainage',
        'Apply irrigation at crown root stage',
        'Control rust diseases'
      ],
      requirements: {
        soil: 'Loamy, well-drained',
        climate: 'Cool and dry',
        water: 'Moderate',
        temperature: '15-25°C'
      }
    },
    {
      name: 'Maize',
      category: 'Cereals',
      kharif: true,
      rabi: true,
      zaid: false,
      sowingStart: 'June',
      sowingEnd: 'July',
      harvestingStart: 'September',
      harvestingEnd: 'October',
      duration: '90-120 days',
      description: 'Versatile crop, can be grown in both seasons',
      tips: [
        'Plant in rows for better yield',
        'Apply irrigation at critical stages',
        'Control stem borer',
        'Harvest at physiological maturity'
      ],
      requirements: {
        soil: 'Well-drained loamy',
        climate: 'Warm and humid',
        water: 'Moderate to high',
        temperature: '20-30°C'
      }
    },
    {
      name: 'Cotton',
      category: 'Cash Crops',
      kharif: true,
      rabi: false,
      zaid: false,
      sowingStart: 'May',
      sowingEnd: 'June',
      harvestingStart: 'October',
      harvestingEnd: 'February',
      duration: '150-180 days',
      description: 'Long duration cash crop, requires careful management',
      tips: [
        'Sow early for better yield',
        'Control bollworms effectively',
        'Apply growth regulators',
        'Pick cotton in 3-4 rounds'
      ],
      requirements: {
        soil: 'Black cotton soil',
        climate: 'Warm and dry',
        water: 'Moderate',
        temperature: '25-35°C'
      }
    },
    {
      name: 'Sugarcane',
      category: 'Cash Crops',
      kharif: true,
      rabi: false,
      zaid: false,
      sowingStart: 'February',
      sowingEnd: 'March',
      harvestingStart: 'November',
      harvestingEnd: 'March',
      duration: '300-365 days',
      description: 'Annual crop, major source of sugar and ethanol',
      tips: [
        'Use healthy seed material',
        'Maintain proper spacing',
        'Apply irrigation regularly',
        'Control red rot disease'
      ],
      requirements: {
        soil: 'Deep loamy, well-drained',
        climate: 'Warm and humid',
        water: 'High',
        temperature: '25-35°C'
      }
    },
    {
      name: 'Tomato',
      category: 'Vegetables',
      kharif: true,
      rabi: true,
      zaid: true,
      sowingStart: 'June',
      sowingEnd: 'July',
      harvestingStart: 'September',
      harvestingEnd: 'November',
      duration: '90-120 days',
      description: 'High-value vegetable, requires careful pest management',
      tips: [
        'Use disease-resistant varieties',
        'Control early blight',
        'Support plants with stakes',
        'Harvest at proper maturity'
      ],
      requirements: {
        soil: 'Sandy loam, well-drained',
        climate: 'Warm and moderate',
        water: 'Moderate',
        temperature: '20-30°C'
      }
    },
    {
      name: 'Potato',
      category: 'Vegetables',
      kharif: false,
      rabi: true,
      zaid: false,
      sowingStart: 'October',
      sowingEnd: 'November',
      harvestingStart: 'January',
      harvestingEnd: 'February',
      duration: '90-110 days',
      description: 'Cool season crop, requires well-drained soil',
      tips: [
        'Use certified seed tubers',
        'Maintain proper soil moisture',
        'Control late blight',
        'Harvest when leaves turn yellow'
      ],
      requirements: {
        soil: 'Sandy loam, well-drained',
        climate: 'Cool and moderate',
        water: 'Moderate',
        temperature: '15-25°C'
      }
    },
    {
      name: 'Onion',
      category: 'Vegetables',
      kharif: true,
      rabi: true,
      zaid: false,
      sowingStart: 'May',
      sowingEnd: 'June',
      harvestingStart: 'August',
      harvestingEnd: 'September',
      duration: '90-120 days',
      description: 'Important vegetable crop, good storage life',
      tips: [
        'Use healthy seedlings',
        'Control thrips and purple blotch',
        'Stop irrigation before harvest',
        'Cure bulbs properly'
      ],
      requirements: {
        soil: 'Sandy loam, well-drained',
        climate: 'Moderate',
        water: 'Moderate',
        temperature: '20-30°C'
      }
    },
    {
      name: 'Pulses (Toor/Arhar)',
      category: 'Pulses',
      kharif: true,
      rabi: false,
      zaid: false,
      sowingStart: 'June',
      sowingEnd: 'July',
      harvestingStart: 'October',
      harvestingEnd: 'November',
      duration: '120-150 days',
      description: 'Important pulse crop, fixes nitrogen in soil',
      tips: [
        'Sow with onset of monsoon',
        'Control pod borer',
        'Harvest when pods turn brown',
        'Thresh carefully to avoid damage'
      ],
      requirements: {
        soil: 'Well-drained, loamy',
        climate: 'Warm and moderate',
        water: 'Low to moderate',
        temperature: '25-35°C'
      }
    },
    {
      name: 'Groundnut',
      category: 'Oilseeds',
      kharif: true,
      rabi: false,
      zaid: false,
      sowingStart: 'June',
      sowingEnd: 'July',
      harvestingStart: 'October',
      harvestingEnd: 'November',
      duration: '120-140 days',
      description: 'Important oilseed crop, good for crop rotation',
      tips: [
        'Sow in well-prepared soil',
        'Control leaf miner',
        'Harvest when leaves turn yellow',
        'Dry pods properly'
      ],
      requirements: {
        soil: 'Sandy loam, well-drained',
        climate: 'Warm and moderate',
        water: 'Low to moderate',
        temperature: '25-35°C'
      }
    }
  ];

  // Seasonal data for charts
  const seasonalData: SeasonalData[] = [
    { month: 'Jan', kharif: 0, rabi: 8, zaid: 0 },
    { month: 'Feb', kharif: 0, rabi: 8, zaid: 0 },
    { month: 'Mar', kharif: 0, rabi: 6, zaid: 0 },
    { month: 'Apr', kharif: 0, rabi: 4, zaid: 0 },
    { month: 'May', kharif: 2, rabi: 0, zaid: 0 },
    { month: 'Jun', kharif: 8, rabi: 0, zaid: 0 },
    { month: 'Jul', kharif: 8, rabi: 0, zaid: 0 },
    { month: 'Aug', kharif: 6, rabi: 0, zaid: 0 },
    { month: 'Sep', kharif: 4, rabi: 0, zaid: 0 },
    { month: 'Oct', kharif: 2, rabi: 2, zaid: 0 },
    { month: 'Nov', kharif: 0, rabi: 6, zaid: 0 },
    { month: 'Dec', kharif: 0, rabi: 8, zaid: 0 }
  ];

  // Filter crops based on selected season
  const filteredCrops = crops.filter(crop => {
    if (selectedSeason === 'all') return true;
    return crop[selectedSeason];
  });

  // Get current season
  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 5 && month <= 9) return 'kharif';
    if (month >= 10 || month <= 2) return 'rabi';
    return 'zaid';
  };

  // Get crops for current month
  const getCropsForMonth = (month: number) => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    return crops.filter(crop => {
      const sowingStart = new Date(`2000 ${crop.sowingStart} 1`).getMonth();
      const sowingEnd = new Date(`2000 ${crop.sowingEnd} 1`).getMonth();
      
      if (sowingStart <= sowingEnd) {
        return month >= sowingStart && month <= sowingEnd;
      } else {
        // Handles seasons that span across year end
        return month >= sowingStart || month <= sowingEnd;
      }
    });
  };

  const currentSeason = getCurrentSeason();
  const currentMonthCrops = getCropsForMonth(currentMonth);

  return (
    <div className="flex-1 overflow-auto relative min-h-screen p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Crop Calendar</h1>
        <div className="text-sm text-gray-600">
          Seasonal crop planning and management guide
        </div>
      </div>

      {/* Season Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors ${
          selectedSeason === 'kharif' ? 'border-kisan-green bg-green-50' : 'border-gray-200'
        }`} onClick={() => setSelectedSeason('kharif')}>
          <h3 className="font-semibold text-green-700">Kharif Season</h3>
          <p className="text-sm text-gray-600">June - October</p>
          <p className="text-xs text-gray-500 mt-1">Monsoon crops</p>
        </div>
        
        <div className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors ${
          selectedSeason === 'rabi' ? 'border-kisan-green bg-green-50' : 'border-gray-200'
        }`} onClick={() => setSelectedSeason('rabi')}>
          <h3 className="font-semibold text-blue-700">Rabi Season</h3>
          <p className="text-sm text-gray-600">November - March</p>
          <p className="text-xs text-gray-500 mt-1">Winter crops</p>
        </div>
        
        <div className={`bg-white border rounded-lg p-4 cursor-pointer transition-colors ${
          selectedSeason === 'zaid' ? 'border-kisan-green bg-green-50' : 'border-gray-200'
        }`} onClick={() => setSelectedSeason('zaid')}>
          <h3 className="font-semibold text-orange-700">Zaid Season</h3>
          <p className="text-sm text-gray-600">March - June</p>
          <p className="text-xs text-gray-500 mt-1">Summer crops</p>
        </div>
      </div>

      {/* Current Month Info */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">
          Current Month: {new Date(2000, currentMonth).toLocaleDateString('en-US', { month: 'long' })} 
          <span className="text-sm font-normal text-gray-600 ml-2">
            ({currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} Season)
          </span>
        </h2>
        
        {currentMonthCrops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentMonthCrops.map(crop => (
              <div key={crop.name} className="border rounded p-3 bg-green-50">
                <div className="font-medium text-green-800">{crop.name}</div>
                <div className="text-sm text-green-600">Sowing Time</div>
                <div className="text-xs text-gray-600">{crop.sowingStart} - {crop.sowingEnd}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No crops to sow this month</p>
        )}
      </div>

      {/* Seasonal Chart */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Seasonal Crop Distribution</h2>
        <div style={{ height: 300 }}>
          <ChartErrorBoundary>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="kharif" fill="#10b981" name="Kharif" />
                <Bar dataKey="rabi" fill="#3b82f6" name="Rabi" />
                <Bar dataKey="zaid" fill="#f59e0b" name="Zaid" />
              </BarChart>
            </ResponsiveContainer>
          </ChartErrorBoundary>
        </div>
      </div>

      {/* Crop Database */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {selectedSeason === 'all' ? 'All Crops' : `${selectedSeason.charAt(0).toUpperCase() + selectedSeason.slice(1)} Season Crops`}
          </h2>
          <select 
            className="border border-gray-300 rounded px-3 py-1 text-sm"
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
          >
            <option value="">All Crops</option>
            {filteredCrops.map(crop => (
              <option key={crop.name} value={crop.name}>{crop.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops
            .filter(crop => !selectedCrop || crop.name === selectedCrop)
            .map(crop => (
            <div key={crop.name} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{crop.name}</h3>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                  {crop.category}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{crop.description}</p>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{crop.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sowing:</span>
                  <span className="font-medium">{crop.sowingStart} - {crop.sowingEnd}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Harvesting:</span>
                  <span className="font-medium">{crop.harvestingStart} - {crop.harvestingEnd}</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t">
                <h4 className="font-medium text-sm mb-2">Key Tips:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  {crop.tips.slice(0, 2).map((tip, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 pt-3 border-t">
                <h4 className="font-medium text-sm mb-2">Requirements:</h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <div><span className="font-medium">Soil:</span> {crop.requirements.soil}</div>
                  <div><span className="font-medium">Climate:</span> {crop.requirements.climate}</div>
                  <div><span className="font-medium">Water:</span> {crop.requirements.water}</div>
                  <div><span className="font-medium">Temperature:</span> {crop.requirements.temperature}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Calendar View */}
      <div className="bg-white border rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Monthly Calendar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {Array.from({ length: 12 }, (_, i) => {
            const monthCrops = getCropsForMonth(i);
            return (
              <div 
                key={i} 
                className={`border rounded p-3 cursor-pointer transition-colors ${
                  currentMonth === i ? 'border-kisan-green bg-green-50' : 'border-gray-200'
                }`}
                onClick={() => setCurrentMonth(i)}
              >
                <div className="font-medium text-sm">
                  {new Date(2000, i).toLocaleDateString('en-US', { month: 'short' })}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {monthCrops.length} crops
                </div>
                {monthCrops.length > 0 && (
                  <div className="text-xs text-green-600 mt-1">
                    {monthCrops[0].name}
                    {monthCrops.length > 1 && ` +${monthCrops.length - 1}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CropCalendar;



