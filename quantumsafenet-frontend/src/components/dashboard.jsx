// src/components/Dashboard.jsx
import React, { useState } from 'react';
import { Card } from './ui/card';
import { Sidebar } from './ui/Sidebar';
import { SidebarToggle } from './ui/SidebarToggle';
import { ServerRow } from './ui/ServerRow';
import { StatsCard } from './ui/StatsCard';


const serverData = [
  { name: 'Tokyo', flag: 'jp', users: 0 },
  { name: 'Frankfurt', flag: 'de', users: 0 },
  { name: 'Atlanta', flag: 'us', users: 0 },
  { name: 'Amsterdam', flag: 'nl', users: 0 },
  { name: 'Frankfurt #2', flag: 'de', users: 0 },
];

const stats = [
  { title: 'Total VPN Accounts', value: '99', color: 'border-pink-500' },
  { title: 'Active VPN Accounts', value: '7', color: 'border-purple-500' },
  { title: 'Inactive VPN Accounts', value: '5', color: 'border-blue-500' },
  { title: 'Expired VPN Accounts', value: '20', color: 'border-red-500' },
];

const Dashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} activeIndex={activeIndex} setActiveIndex={setActiveIndex}  /> 

      {/* Main Content */}
      <div className="flex-1">
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <SidebarToggle onClick={toggleSidebar} />
              <div>
                <h2 className="text-lg font-semibold">Dashboard</h2>
                <p className="text-sm text-gray-500">Dashboard</p>
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

        <main className="p-6">
          {/* Online Users Card */}
          <Card className="mb-6">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold">Online Users</h3>
                <button className="p-1.5 hover:bg-gray-100 rounded-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
              
              <div className="divide-y">
                {serverData.map((server, index) => (
                  <ServerRow key={index} {...server} />
                ))}
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => (
              <StatsCard key={index} {...stat} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;