import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MarketPage from './pages/MarketPage';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import CarbonCreditsPage from './pages/CarbonCreditsPage';
import CropScanPage from './pages/CropScanPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';
import ProfitCalculator from './pages/ProfitCalculator';
import CropCalendar from './pages/CropCalender';
import WeatherPage from './pages/WeatherPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <Dashboard />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/market" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <MarketPage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/schemes" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <SchemesPage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/schemes/:schemeId" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <SchemeDetailPage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/carbon-credits" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <CarbonCreditsPage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/scan-crop" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <CropScanPage />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/profit-calculator" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <ProfitCalculator />
            </div>
          </ProtectedRoute>
        } />
        <Route path="/crop-calendar" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <CropCalendar />
            </div>
          </ProtectedRoute>
        } />

        <Route path="/weather" element={
          <ProtectedRoute>
            <div className="flex min-h-screen bg-gray-50">
              <Sidebar />
              <WeatherPage />
            </div>
          </ProtectedRoute>
        } />

        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;