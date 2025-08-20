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
import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col h-screen sticky top-0 overflow-y-auto no-scrollbar">
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
          <NavLink to="/dashboard" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <CheckIcon className="w-5 h-5" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/scan-crop" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <SparklesIcon className="w-5 h-5" />
            <span>Crop Health</span>
          </NavLink>
          <NavLink to="/market" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <CurrencyDollarIcon className="w-5 h-5" />
            <span>Market Prices</span>
          </NavLink>
          <NavLink to="/carbon-credits" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <GlobeAltIcon className="w-5 h-5" />
            <span>Carbon Credits</span>
          </NavLink>
          <NavLink to="/schemes" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <DocumentTextIcon className="w-5 h-5" />
            <span>Govt. Schemes</span>
          </NavLink>
          <NavLink to="/weather" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <CloudIcon className="w-5 h-5" />
            <span>Weather</span>
          </NavLink>
        </div>
      </nav>

      {/* Tools Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">TOOLS</h3>
        <div className="space-y-2">
          <NavLink to="/scan-crop" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <CameraIcon className="w-5 h-5" />
            <span>Scan Crop</span>
          </NavLink>
          <NavLink to="/profit-calculator" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <CalculatorIcon className="w-5 h-5" />
            <span>Profit Calculator</span>
          </NavLink>
          <NavLink to="/crop-calendar" className={({ isActive }) => (isActive ? 'text-kisan-green' : 'text-gray-700') + ' flex items-center gap-3'}>
            <CalendarIcon className="w-5 h-5" />
            <span>Crop Calendar</span>
          </NavLink>
        </div>
      </div>

      {/* Language Section */}
      <div className="p-4 border-t border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">LANGUAGES</h3>
        <div className="space-y-1">
          <button
            onClick={() => { i18n.changeLanguage('kn'); localStorage.setItem('language', 'kn'); }}
            className={`block w-full text-left ${i18n.language === 'kn' ? 'text-kisan-green font-medium' : 'text-gray-700'}`}
          >
            {i18n.language === 'kn' ? '✓ ' : ''}ಕನ್ನಡ
          </button>
          <button
            onClick={() => { i18n.changeLanguage('en'); localStorage.setItem('language', 'en'); }}
            className={`block w-full text-left ${i18n.language === 'en' ? 'text-kisan-green font-medium' : 'text-gray-700'}`}
          >
            {i18n.language === 'en' ? '✓ ' : ''}English
          </button>
          <button
            onClick={() => { i18n.changeLanguage('hi'); localStorage.setItem('language', 'hi'); }}
            className={`block w-full text-left ${i18n.language === 'hi' ? 'text-kisan-green font-medium' : 'text-gray-700'}`}
          >
            {i18n.language === 'hi' ? '✓ ' : ''}हिन्दी
          </button>
          <button
            onClick={() => { i18n.changeLanguage('ta'); localStorage.setItem('language', 'ta'); }}
            className={`block w-full text-left ${i18n.language === 'ta' ? 'text-kisan-green font-medium' : 'text-gray-700'}`}
          >
            {i18n.language === 'ta' ? '✓ ' : ''}தமிழ்
          </button>
          <button
            onClick={() => { i18n.changeLanguage('te'); localStorage.setItem('language', 'te'); }}
            className={`block w-full text-left ${i18n.language === 'te' ? 'text-kisan-green font-medium' : 'text-gray-700'}`}
          >
            {i18n.language === 'te' ? '✓ ' : ''}తెలుగు
          </button>
        </div>
      </div>

      {/* User Profile (moved below languages) */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <UserCircleIcon className="w-10 h-10 text-gray-400 mr-3" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {currentUser?.displayName || currentUser?.email}
            </p>
            <p className="text-xs text-gray-500">Farmer, Karnataka</p>
          </div>
        </div>
      </div>

      {/* Sign Out (placed after Languages) */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full text-left text-sm text-red-600 hover:text-red-800"
        >
          Sign out
        </button>
      </div>

      {/* Make inner content scrollable while header stays */}
      
    </div>
  );
};

export default Sidebar;