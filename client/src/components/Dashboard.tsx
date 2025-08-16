import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  MicrophoneIcon,
  BellIcon,
  Cog6ToothIcon,
  Squares2X2Icon,
  CameraIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  CloudIcon,
  ExclamationCircleIcon,
  CheckIcon,
  PlayIcon,
  ChatBubbleLeftIcon,
  ArrowPathIcon,
  ChartBarIcon,
  TruckIcon,
  CloudArrowDownIcon,
  SparklesIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { marketAPI } from '../services/marketService';
import { governmentSchemesAPI } from '../services/governmentSchemesService';
import { carbonCreditsAPI } from '../services/carbonCreditsService';
import { voiceAPI } from '../services/voiceService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [carbonInfo, setCarbonInfo] = useState<any>(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load market data for tomato (default crop)
      const marketResponse = await marketAPI.getPrices('tomato');
      setMarketData(marketResponse.data);

      // Load government schemes
      const schemesResponse = await governmentSchemesAPI.searchSchemes({});
      setSchemes(schemesResponse.data.schemes.slice(0, 3)); // Show first 3 schemes

      // Load carbon credit market info
      const carbonResponse = await carbonCreditsAPI.getMarketInfo();
      setCarbonInfo(carbonResponse.data);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceQuery = async () => {
    if (!voiceQuery.trim()) return;

    try {
      setIsLoading(true);
      const response = await voiceAPI.chat({
        query: voiceQuery,
        language: 'english', // Default to English for now
        userId: 'farmer001'
      });

      setAiResponse(response.data.response);
    } catch (error) {
      console.error('Error processing voice query:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCropScan = () => {
    navigate('/scan-crop');
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask anything..."
                value={voiceQuery}
                onChange={(e) => setVoiceQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kisan-green focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleVoiceQuery()}
              />
              <button
                onClick={handleVoiceQuery}
                disabled={isLoading}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 hover:text-kisan-green"
              >
                <MicrophoneIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-6">
            <button 
              onClick={handleCropScan}
              className="bg-kisan-green text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors"
            >
              <CameraIcon className="w-5 h-5" />
              <span>Scan Crop</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <BellIcon className="w-6 h-6 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </div>
              <Cog6ToothIcon className="w-6 h-6 text-gray-600" />
              <Squares2X2Icon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Namaskara, {currentUser?.displayName || 'Farmer'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your farm today</p>
          </div>
        </div>
      </div>

      {/* AI Response Display */}
      {aiResponse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mt-4">
          <div className="flex items-start">
            <SparklesIcon className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">AI Assistant Response</h3>
              <p className="text-blue-700 mt-1">{aiResponse}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-8 h-8 text-red-500 mr-3" />
              <div>
                <h3 className="font-semibold text-red-800">Crop Alert</h3>
                <p className="text-sm text-red-600">Yellow spots detected</p>
              </div>
            </div>
          </div>
          
          <div className="bg-kisan-light-green border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-8 h-8 text-kisan-green mr-3" />
              <div>
                <h3 className="font-semibold text-green-800">Today's Price</h3>
                <p className="text-sm text-green-600">
                  {marketData ? `₹${marketData.currentPrice}/kg (↑${marketData.percentageChange}%)` : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-kisan-light-blue border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <CloudIcon className="w-8 h-8 text-kisan-blue mr-3" />
              <div>
                <h3 className="font-semibold text-blue-800">Weather</h3>
                <p className="text-sm text-blue-600">32°C, Partly Cloudy</p>
              </div>
            </div>
          </div>
          
          <div className="bg-kisan-light-purple border border-purple-200 rounded-lg p-4">
            <div className="flex items-center">
              <ExclamationCircleIcon className="w-8 h-8 text-kisan-purple mr-3" />
              <div>
                <h3 className="font-semibold text-purple-800">Carbon Credits</h3>
                <p className="text-sm text-purple-600">
                  {carbonInfo ? `₹${carbonInfo.currentPrice}/tonne` : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Market Analysis with Real Data */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Market Analysis</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Last Updated: {marketData?.lastUpdated ? new Date(marketData.lastUpdated).toLocaleString() : 'Loading...'}</span>
                <button 
                  onClick={loadDashboardData}
                  disabled={isLoading}
                  className="hover:text-gray-700"
                >
                  <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {marketData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <CurrencyDollarIcon className="w-12 h-12 text-kisan-green mr-4" />
                  <div>
                      <div className="text-3xl font-bold text-gray-900">₹{marketData.currentPrice}/kg</div>
                    <div className="flex items-center text-sm text-green-600">
                        <span className="mr-1">↑{marketData.percentageChange}% from yesterday</span>
                    </div>
                  </div>
                </div>
                
                  <p className="text-gray-700 mb-4">{marketData.recommendation}</p>
                
                <div className="bg-kisan-light-blue border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                      <strong>Recommendation:</strong> {marketData.recommendation}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col justify-end space-y-3">
                  <button 
                    onClick={() => navigate('/market')}
                    className="flex items-center text-kisan-green hover:text-green-600 font-medium"
                  >
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  View Price Trends
                  </button>
                  <button 
                    onClick={() => navigate('/market')}
                    className="flex items-center text-kisan-green hover:text-green-600 font-medium"
                  >
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Transport Options
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kisan-green mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading market data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Government Schemes with Real Data */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Government Schemes</h2>
              <button 
                onClick={() => navigate('/schemes')}
                className="text-kisan-blue hover:text-blue-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {schemes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {schemes.map((scheme) => (
                  <div key={scheme.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-bold text-gray-800 mb-2">{scheme.shortName}</h3>
                    <p className="text-gray-600 text-sm mb-4">{scheme.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        scheme.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {scheme.status}
                      </span>
                      <button 
                        onClick={() => navigate(`/schemes/${scheme.id}`)}
                        className="text-kisan-blue hover:text-blue-700 text-sm font-medium"
                      >
                        Learn More
                      </button>
              </div>
            </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kisan-green mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading schemes...</p>
              </div>
            )}
          </div>
        </div>

        {/* Carbon Credits Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Carbon Credits</h2>
              <span className="bg-kisan-green text-white text-xs font-medium px-3 py-1 rounded-full">New Opportunity</span>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-gray-700 mb-4">
              Agroforestry practices qualify for carbon credit programs. Earn money while helping the environment.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Market Price</h4>
                <p className="text-sm text-gray-600">
                  {carbonInfo ? `₹${carbonInfo.currentPrice} per tonne CO₂` : 'Loading...'}
                </p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Market Trend</h4>
                <p className="text-sm text-gray-600">
                  {carbonInfo ? carbonInfo.trend : 'Loading...'}
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Potential Annual Earnings</h4>
              <div className="text-2xl font-bold text-kisan-green">₹15,000 - ₹25,000</div>
            </div>
            
            <button 
              onClick={() => navigate('/carbon-credits')}
              className="bg-kisan-green text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
            >
              Join Program
              </button>
            </div>
          </div>

          {/* Floating Microphone Icon */}
          <div className="fixed bottom-6 right-6">
          <button 
            onClick={() => setVoiceQuery('')}
            className="w-14 h-14 bg-kisan-green hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
          >
              <MicrophoneIcon className="w-6 h-6 text-white" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 