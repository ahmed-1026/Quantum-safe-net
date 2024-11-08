// src/components/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { SidebarMenuItem } from './SidebarMenuItem';
import logo from '../../images/logo.png';
// import { Layout, Users, CreditCard, Server } from 'lucide-react';

import { 
  Layout, Package, Users, CreditCard, Server, 
  Settings, Bell, Link, Book, MessageSquare, List 
} from 'lucide-react';

const menuItems = [
  { icon: <Layout size={18} />, text: 'Dashboard', path: '/dashboard' },
  { icon: <Package size={18} />, text: 'Bulk Batches', path: '/bulk-batches' },
  { icon: <Users size={18} />, text: 'Customers', path: '/customers' },
  { icon: <CreditCard size={18} />, text: 'Subscriptions', path: '/subscriptions' },
  { icon: <Server size={18} />, text: 'VPN Servers', path: '/vpn-servers' },
  { icon: <Settings size={18} />, text: 'Settings', path: '/settings' },
  { icon: <Bell size={18} />, text: 'Notifications', path: '/notifications' },
  { icon: <Link size={18} />, text: 'App Links', path: '/app-links' },
  { icon: <Book size={18} />, text: 'Knowledgebase', path: '/knowledgebase' },
  { icon: <MessageSquare size={18} />, text: 'Support', path: '/support' },
  { icon: <List size={18} />, text: 'System Logs', path: '/system-logs' }
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
          <NavLink 
            key={index} 
            to={item.path}
            className={({ isActive }) => `flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm ${isActive ? 'bg-gray-100' : ''}`}
          >
            {item.icon}
            <span>{item.text}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  </div>
);