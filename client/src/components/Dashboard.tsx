import React from 'react';
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


const Dashboard: React.FC = () => {
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
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kisan-green focus:border-transparent"
              />
              <MicrophoneIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 ml-6">
            <button className="bg-kisan-green text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-600 transition-colors">
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
        
        <div className="mt-4">
          <h1 className="text-2xl font-bold text-gray-900">Namaskara, Rohan!</h1>
          <p className="text-gray-600">Here's what's happening with your farm today</p>
        </div>
      </div>

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
                <p className="text-sm text-green-600">₹28/kg (↑12%)</p>
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
                <h3 className="font-semibold text-purple-800">New Subsidy</h3>
                <p className="text-sm text-purple-600">Drip Irrigation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Crop Health Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Crop Health Analysis</h2>
              <a href="#" className="text-kisan-green hover:text-green-600 text-sm font-medium">View History</a>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="w-full h-64 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                        <CameraIcon className="w-16 h-16" />
                      </div>
                      <p className="text-sm">Crop Image</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-kisan-green text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors">
                    <CameraIcon className="w-5 h-5" />
                    <span>Take New Photo</span>
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span>Upload</span>
                  </button>
                </div>
              </div>
              
              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Early Blight Detected</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        The yellow spots on your tomato leaves indicate Early Blight (Alternaria solani), a common fungal disease.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">Recommended Actions:</h4>
                  <ul className="space-y-2">
                    {[
                      "Remove and destroy infected leaves to prevent spread",
                      "Apply copper-based fungicide available at Krishak Agro Store (2km away)",
                      "Avoid overhead watering to reduce leaf moisture",
                      "Consider crop rotation next season"
                    ].map((action, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-5 h-5 text-kisan-green mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="flex space-x-3">
                  <button className="flex-1 bg-kisan-green text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors">
                    <PlayIcon className="w-5 h-5" />
                    <span>Watch Treatment Video</span>
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-200 transition-colors">
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span>Ask Expert</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Market Analysis */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Market Analysis</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Last Updated: 2 hours ago</span>
                <ArrowPathIcon className="w-4 h-4 cursor-pointer hover:text-gray-700" />
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-4">
                  <CurrencyDollarIcon className="w-12 h-12 text-kisan-green mr-4" />
                  <div>
                    <div className="text-3xl font-bold text-gray-900">₹28/kg</div>
                    <div className="flex items-center text-sm text-green-600">
                      <span className="mr-1">↑12% from yesterday</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  Prices are expected to rise by 5-8% in the next 3 days due to reduced supply from Maharashtra.
                </p>
                
                <div className="bg-kisan-light-blue border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Recommendation:</strong> Consider waiting 2 days before selling your harvest for maximum profit.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col justify-end space-y-3">
                <a href="#" className="flex items-center text-kisan-green hover:text-green-600 font-medium">
                  <ChartBarIcon className="w-5 h-5 mr-2" />
                  View Price Trends
                </a>
                <a href="#" className="flex items-center text-kisan-green hover:text-green-600 font-medium">
                  <TruckIcon className="w-5 h-5 mr-2" />
                  Transport Options
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Carbon Credits */}
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
                <h4 className="font-medium text-gray-900 mb-2">MRV Challenge</h4>
                <p className="text-sm text-gray-600">
                  Current Monitoring, Reporting, and Verification (MRV) systems are expensive and complex for smallholder farmers.
                </p>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Our Solution</h4>
                <p className="text-sm text-gray-600">
                  Project Kisan provides affordable MRV tools specifically designed for small-scale farming operations.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Potential Annual Earnings</h4>
              <div className="text-2xl font-bold text-kisan-green">₹15,000 - ₹25,000</div>
            </div>
            
            <button className="bg-kisan-green text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors">
              Join Program
            </button>
          </div>
        </div>

        {/* Government Schemes and Nature-based Solutions */}
        <div className="p-6 space-y-8">
          {/* Government Schemes Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Government Schemes</h2>
              <a href="#" className="text-kisan-blue hover:text-blue-700 text-sm font-medium">View All</a>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PM Krishi Sinchai Yojana */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-kisan-light-blue rounded-full flex items-center justify-center">
                    <CloudArrowDownIcon className="w-6 h-6 text-kisan-blue" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">PM Krishi Sinchai Yojana</h3>
                <p className="text-gray-600 text-sm mb-4">Get 50% subsidy on drip irrigation equipment for water conservation.</p>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Eligible</span>
                  <a href="#" className="text-kisan-blue hover:text-blue-700 text-sm font-medium">Apply Now</a>
                </div>
              </div>

              {/* Soil Health Card Scheme */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-kisan-light-purple rounded-full flex items-center justify-center">
                    <SparklesIcon className="w-6 h-6 text-kisan-purple" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Soil Health Card Scheme</h3>
                <p className="text-gray-600 text-sm mb-4">Free soil testing and personalized fertilizer recommendations.</p>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Renewal Due</span>
                  <a href="#" className="text-kisan-blue hover:text-blue-700 text-sm font-medium">Renew</a>
                </div>
              </div>

              {/* Farm Mechanization Subsidy */}
              <div className="bg-white rounded-lg shadow-md p-6 border border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <CogIcon className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Farm Mechanization Subsidy</h3>
                <p className="text-gray-600 text-sm mb-4">40% subsidy on farm equipment purchase to increase productivity.</p>
                <div className="flex items-center justify-between">
                  <a href="#" className="text-kisan-blue hover:text-blue-700 text-sm font-medium">Check Eligibility</a>
                  <a href="#" className="text-kisan-blue hover:text-blue-700 text-sm font-medium">Learn More</a>
                </div>
              </div>
            </div>
          </div>

          {/* Nature-based Solutions Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Nature-based Solutions (NbS)</h2>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Climate Action</span>
            </div>
            
            <p className="text-gray-700 mb-6">
              Nature-based Solutions like agroforestry and climate-smart agriculture can help sequester carbon while improving your farm's ecosystem health and resilience.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
              {/* Agroforestry Benefits */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Agroforestry Benefits</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Additional income from timber and fruits</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Improved soil fertility and water retention</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Natural pest control through biodiversity</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Carbon credit opportunities</span>
                  </div>
                </div>
              </div>

              {/* Climate-Smart Rice Cultivation */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Climate-Smart Rice Cultivation</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Alternate wetting and drying to reduce methane</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Precision nutrient management</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Crop residue management</span>
                  </div>
                  <div className="flex items-start">
                    <CheckIcon className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">Lower costs and higher yield</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action Button */}
            <div className="text-center">
              <button className="bg-kisan-green hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg shadow-md flex items-center justify-center mx-auto">
                <SparklesIcon className="w-5 h-5 mr-2" />
                Get Personalized NbS Plan
              </button>
            </div>
          </div>

          {/* Floating Microphone Icon */}
          <div className="fixed bottom-6 right-6">
            <button className="w-14 h-14 bg-kisan-green hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-colors duration-200">
              <MicrophoneIcon className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 