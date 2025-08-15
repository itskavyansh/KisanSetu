import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MarketPage from './pages/MarketPage';
import SchemesPage from './pages/SchemesPage';
import SchemeDetailPage from './pages/SchemeDetailPage';
import CarbonCreditsPage from './pages/CarbonCreditsPage';
import CropScanPage from './pages/CropScanPage';
import './App.css';

function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/market" element={<MarketPage />} />
          <Route path="/schemes" element={<SchemesPage />} />
          <Route path="/schemes/:schemeId" element={<SchemeDetailPage />} />
          <Route path="/carbon-credits" element={<CarbonCreditsPage />} />
          <Route path="/scan-crop" element={<CropScanPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;