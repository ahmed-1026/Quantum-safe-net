// src/components/ui/ServerRow.jsx
import React from 'react';

export const ServerRow = ({ name, flag, users }) => (
  <div className="py-2 flex justify-between items-center">
    <div className="flex items-center space-x-2">
      <img 
        src={`https://flagcdn.com/${flag}.svg`} 
        alt={name} 
        className="w-4 h-3 object-cover"
      />
      <span className="text-sm">{name}</span>
    </div>
    <span className="text-sm">{users}</span>
  </div>
);
