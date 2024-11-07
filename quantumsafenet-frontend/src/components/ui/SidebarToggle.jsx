// src/components/ui/SidebarToggle.jsx
import React from 'react';
import { Menu } from 'lucide-react';

export const SidebarToggle = ({ onClick }) => (
  <button 
    onClick={onClick}
    className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
  >
    <Menu size={20} />
  </button>
);