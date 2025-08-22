import React, { useState, useEffect } from 'react';
import defaultAvatar from '../public/default-avatar.png';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<any>(null);
  const [schemes, setSchemes] = useState<any[]>([]);
  const [carbonInfo, setCarbonInfo] = useState<any>(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Chatbot state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ sender: 'user' | 'ai', text: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);

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

  // Send user query to Gemini AI backend (for top bar)
  const handleVoiceQuery = async () => {
    if (!voiceQuery.trim()) return;
    try {
      setIsLoading(true);
      const response = await axios.post('/chat', { prompt: voiceQuery });
      const aiText = response?.data?.response || 'Sorry, I could not generate a response.';
      setAiResponse(aiText);
    } catch (error) {
      console.error('Error processing AI query:', error);
      setAiResponse('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Chatbot send message
  const handleChatSend = async () => {
    if (!chatInput.trim()) return;
    setChatLoading(true);
    setChatHistory((prev) => [...prev, { sender: 'user', text: chatInput }]);
    try {
      const response = await axios.post('/chat', { prompt: chatInput });
      const aiText = response?.data?.response || 'Sorry, I encountered an error. Please try again.';
      setChatHistory((prev) => [...prev, { sender: 'ai', text: aiText }]);
    } catch (error) {
      console.error('Chat error:', error);
      setChatHistory((prev) => [...prev, { sender: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setChatInput('');
      setChatLoading(false);
    }
  };

  const handleCropScan = () => {
    navigate('/scan-crop');
  };

  return (
  <div className="flex-1 overflow-auto relative min-h-screen">
      {/* Top Bar with Personalization and Quick Actions */}
      <div className="bg-white border-b border-gray-200 p-6">
        {/* Profile and Greeting */}
        <div className="flex items-center space-x-4 pb-6">
          <img
            src={currentUser?.photoURL || '/default-avatar.png'}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-kisan-green"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Namaskara, {currentUser?.displayName || 'Farmer'}!
            </h1>
            <p className="text-gray-600">Here's what's happening with your farm today</p>
          </div>
        </div>
        {/* Achievements/Activity */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 flex items-center">
          <CheckIcon className="w-6 h-6 text-green-600 mr-2" />
          <span className="text-green-800 font-medium">You earned 1200 carbon credits this month!</span>
        </div>
        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <button className="bg-kisan-green text-white px-4 py-2 rounded-lg shadow hover:bg-green-600 transition">Add Crop</button>
          <button className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition">Ask AI Assistant</button>
          <button className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg shadow hover:bg-gray-300 transition">Download Report</button>
        </div>
        {/* Search/Voice/Notifications/Settings */}
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <input
                type="text"
                placeholder="Ask the AI assistant anything..."
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
      </div>

      {/* AI Assistant Response Display */}
      {aiResponse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mx-6 mt-4">
          <div className="flex items-start">
            <SparklesIcon className="w-6 h-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">Gemini AI Assistant Response</h3>
              <p className="text-blue-700 mt-1">{aiResponse}</p>
            </div>
          </div>
        </div>
      )}

  {/* Main Content */}
  <div className="p-6 space-y-6 pb-32">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Crop Alert Card */}
          <div className="rounded-xl shadow-md bg-gradient-to-br from-red-50 to-white border border-red-200 p-5 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="w-9 h-9 text-red-500 mr-3" />
              <div>
                <h3 className="font-bold text-red-800 text-lg">Crop Alert</h3>
                <p className="text-sm text-red-600">Yellow spots detected</p>
              </div>
            </div>
          </div>
          {/* Today's Price Card */}
          <div className="rounded-xl shadow-md bg-gradient-to-br from-green-50 to-white border border-green-200 p-5 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <CurrencyDollarIcon className="w-9 h-9 text-kisan-green mr-3" />
              <div>
                <h3 className="font-bold text-green-800 text-lg">Today's Price</h3>
                <p className="text-sm text-green-600">
                  {marketData ? `₹${marketData.currentPrice}/kg` : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
          {/* Weather Card */}
          <div className="rounded-xl shadow-md bg-gradient-to-br from-blue-50 to-white border border-blue-200 p-5 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <CloudIcon className="w-9 h-9 text-kisan-blue mr-3" />
              <div>
                <h3 className="font-bold text-blue-800 text-lg">Weather</h3>
                <p className="text-sm text-blue-600">32°C, Partly Cloudy</p>
              </div>
            </div>
          </div>
          {/* Carbon Credits Card */}
          <div className="rounded-xl shadow-md bg-gradient-to-br from-purple-50 to-white border border-purple-200 p-5 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <ExclamationCircleIcon className="w-9 h-9 text-kisan-purple mr-3" />
              <div>
                <h3 className="font-bold text-purple-800 text-lg">Carbon Credits</h3>
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
                <span>Last Updated: {marketData?.lastUpdated ? new Date(marketData.lastUpdated).toLocaleString() : ''}</span>
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
                {/* ...existing code for real data... */}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 w-full">
                <div className="w-full max-w-xl bg-gray-50 rounded-xl shadow-md p-6">
                  <div className="flex items-center mb-4">
                    <ChartBarIcon className="w-7 h-7 text-kisan-green mr-2" />
                    <span className="text-lg font-semibold text-gray-800">Market Price Trend</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={[
                      { day: 'Mon', price: 24 },
                      { day: 'Tue', price: 22 },
                      { day: 'Wed', price: 25 },
                      { day: 'Thu', price: 27 },
                      { day: 'Fri', price: 23 },
                      { day: 'Sat', price: 28 },
                      { day: 'Sun', price: 26 },
                    ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="price" stroke="#10B981" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 7 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
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
              <div className="flex flex-col items-center">
                <img src="/undraw_empty.svg" alt="No data" className="w-32 h-32 mb-2" />
                <p className="text-gray-500">No schemes available right now.</p>
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

      {/* Floating Chatbot Icon and Window */}
      <div className="fixed bottom-6 right-6 z-50">
        {!chatOpen && (
          <button
            onClick={() => setChatOpen(true)}
            className="w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200"
            title="Open AI Chatbot"
          >
            <ChatBubbleLeftIcon className="w-7 h-7 text-white" />
          </button>
        )}
        {chatOpen && (
          <div className="w-80 h-96 bg-white rounded-xl shadow-2xl flex flex-col border border-blue-200">
            <div className="flex items-center justify-between px-4 py-2 border-b border-blue-100 bg-blue-50 rounded-t-xl">
              <span className="font-semibold text-blue-700">Gemini AI Chatbot</span>
              <button onClick={() => setChatOpen(false)} className="text-gray-400 hover:text-gray-700 text-lg">×</button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2">
              {chatHistory.length === 0 && (
                <div className="text-gray-400 text-sm text-center mt-8">Start a conversation with the AI assistant...</div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-blue-100 bg-blue-50 rounded-b-xl">
              <form
                onSubmit={e => { e.preventDefault(); handleChatSend(); }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-400"
                  placeholder="Type your message..."
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading || !chatInput.trim()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default Dashboard;