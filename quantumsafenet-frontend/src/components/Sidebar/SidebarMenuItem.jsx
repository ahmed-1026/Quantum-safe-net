// src/components/ui/SidebarMenuItem.jsx
import React from 'react';

export const SidebarMenuItem = ({ icon, text, isActive, onClick }) => (
  <a
    href="#"
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 text-sm
      ${isActive ? 'bg-gray-100' : ''}`}
  >
    {icon}
    <span>{text}</span>
  </a>
);
