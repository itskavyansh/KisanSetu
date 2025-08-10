import React from 'react';
import {
  CheckIcon,
  ChevronDownIcon,
  HomeIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  DocumentTextIcon,
  CloudIcon,
  CameraIcon,
  MicrophoneIcon,
  CalculatorIcon,
  CalendarIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white shadow-lg">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-kisan-green">Project Kisan</h1>
            <p className="text-sm text-gray-600">Farmer's AI Assistant</p>
          </div>
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <div className="space-y-2">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-kisan-green bg-kisan-light-green rounded-lg">
            <CheckIcon className="w-5 h-5 mr-3" />
            Dashboard
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <SparklesIcon className="w-5 h-5 mr-3" />
            Crop Health
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <CurrencyDollarIcon className="w-5 h-5 mr-3" />
            Market Prices
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <GlobeAltIcon className="w-5 h-5 mr-3" />
            Carbon Credits
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <DocumentTextIcon className="w-5 h-5 mr-3" />
            Govt. Schemes
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <CloudIcon className="w-5 h-5 mr-3" />
            Weather
          </a>
        </div>
      </nav>

      {/* Tools Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">TOOLS</h3>
        <div className="space-y-2">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <CameraIcon className="w-5 h-5 mr-3" />
            Scan Crop
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <MicrophoneIcon className="w-5 h-5 mr-3" />
            Voice Assistant
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <CalculatorIcon className="w-5 h-5 mr-3" />
            Profit Calculator
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <CalendarIcon className="w-5 h-5 mr-3" />
            Crop Calendar
          </a>
        </div>
      </div>

      {/* Language Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">LANGUAGE</h3>
        <div className="space-y-2">
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-kisan-green bg-kisan-light-green rounded-lg">
            <CheckIcon className="w-5 h-5 mr-3" />
            Kannada
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            English
          </a>
          <a href="#" className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            Hindi
          </a>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <div className="flex items-center">
          <UserCircleIcon className="w-10 h-10 text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">Rohan Kumar</p>
            <p className="text-xs text-gray-500">Tomato Farmer, Karnataka</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 