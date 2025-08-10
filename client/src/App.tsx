import React from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <Dashboard />
    </div>
  );
}

export default App;
