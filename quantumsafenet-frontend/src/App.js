// src/App.js
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from "./components/dashboard";
// import Customers from "./components/pages/Customers";
import { Sidebar } from "./components/ui/Sidebar";
import { SidebarToggle } from './components/ui/SidebarToggle';

function App() {
  return (
    <Router>
      <QuantumSafeNet />
    </Router>
  );
}

function QuantumSafeNet() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Array of header titles corresponding to sidebar items
  const headerTitles = [
    'Dashboard', 'Customers', 'Subscriptions', 'VPN Servers'
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} activeIndex={activeIndex} setActiveIndex={setActiveIndex} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Dynamic Header */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarToggle onClick={toggleSidebar} />
              <div>
                <h2 className="text-lg font-semibold">{headerTitles[activeIndex]}</h2>
                <p className="text-sm text-gray-500">{headerTitles[activeIndex]}</p>
              </div>
            </div>

            {/* Online Users Count */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-gray-600 text-sm">Online Users</span>
                <span className="text-lg font-bold">0</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* <Route path="/customers" element={<Customers />} /> */}
            {/* Add other routes here */}
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
