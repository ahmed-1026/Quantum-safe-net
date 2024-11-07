// src/components/Sidebar.jsx
import React from 'react';
import { SidebarMenuItem } from './SidebarMenuItem';
import logo from '../../images/logo.png';

import { 
  Layout, Package, Users, CreditCard, Server, 
  Settings, Bell, Link, Book, MessageSquare, List 
} from 'lucide-react';

const menuItems = [
  { icon: <Layout size={18} />, text: 'Dashboard' },
  { icon: <Package size={18} />, text: 'Bulk Batches' },
  { icon: <Users size={18} />, text: 'Customers' },
  { icon: <CreditCard size={18} />, text: 'Subscriptions' },
  { icon: <Server size={18} />, text: 'VPN Servers' },
  { icon: <Settings size={18} />, text: 'Settings' },
  { icon: <Bell size={18} />, text: 'Notifications' },
  { icon: <Link size={18} />, text: 'App Links' },
  { icon: <Book size={18} />, text: 'Knowledgebase' },
  { icon: <MessageSquare size={18} />, text: 'Support' },
  { icon: <List size={18} />, text: 'System Logs' }
];

export const Sidebar = ({ isOpen, activeIndex, setActiveIndex }) => (
  <div className={`
    fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 
    transform transition-transform duration-300 ease-in-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
  `}>
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center space-x-2">
        <img src={logo} alt="Logo" className="w-8 h-8" />
        <div>
          <h1 className="font-bold text-sm">QuantumSafeNet CMS</h1>
          <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">v1.12.0</span>
        </div>
      </div>
    </div>
    
    <div className="p-4">
      <div className="flex items-center space-x-2 mb-6">
        <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center text-white text-sm">
          AD
        </div>
        <span className="font-medium text-sm">Admin</span>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item, index) => (
          <SidebarMenuItem 
            key={index}
            {...item}
            isActive={index === activeIndex}
            onClick={() => setActiveIndex(index)}
          />
        ))}
      </nav>
    </div>
  </div>
);