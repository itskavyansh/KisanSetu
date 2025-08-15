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
import { NavLink } from 'react-router-dom';

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
          <NavLink to="/" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <CheckIcon className="w-5 h-5 mr-3" />
            Dashboard
          </NavLink>
          <NavLink to="/scan-crop" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <SparklesIcon className="w-5 h-5 mr-3" />
            Crop Health
          </NavLink>
          <NavLink to="/market" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <CurrencyDollarIcon className="w-5 h-5 mr-3" />
            Market Prices
          </NavLink>
          <NavLink to="/carbon-credits" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <GlobeAltIcon className="w-5 h-5 mr-3" />
            Carbon Credits
          </NavLink>
          <NavLink to="/schemes" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <DocumentTextIcon className="w-5 h-5 mr-3" />
            Govt. Schemes
          </NavLink>
          <NavLink to="/weather" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <CloudIcon className="w-5 h-5 mr-3" />
            Weather
          </NavLink>
        </div>
      </nav>

      {/* Tools Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">TOOLS</h3>
        <div className="space-y-2">
          <NavLink to="/scan-crop" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <CameraIcon className="w-5 h-5 mr-3" />
            Scan Crop
          </NavLink>
          <NavLink to="/voice-assistant" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <MicrophoneIcon className="w-5 h-5 mr-3" />
            Voice Assistant
          </NavLink>
          <NavLink to="/profit-calculator" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <CalculatorIcon className="w-5 h-5 mr-3" />
            Profit Calculator
          </NavLink>
          <NavLink to="/crop-calendar" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <CalendarIcon className="w-5 h-5 mr-3" />
            Crop Calendar
          </NavLink>
        </div>
      </div>

      {/* Language Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">LANGUAGE</h3>
        <div className="space-y-2">
          <NavLink to="/kannada" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            <CheckIcon className="w-5 h-5 mr-3" />
            Kannada
          </NavLink>
          <NavLink to="/english" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            English
          </NavLink>
          <NavLink to="/hindi" className={({ isActive }) => isActive ? 'text-kisan-green' : 'text-gray-700'}>
            Hindi
          </NavLink>
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