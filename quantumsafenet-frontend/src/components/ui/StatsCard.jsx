// src/components/ui/StatsCard.jsx
import React from 'react';

export const StatsCard = ({ title, value, color }) => (
  <div className={`bg-white p-4 rounded-lg border-l-4 ${color}`}>
    <h4 className="text-gray-500 text-sm">{title}</h4>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);
