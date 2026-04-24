import React from 'react';

const colorMap = {
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800 ring-yellow-400/50',
  green: 'bg-green-50 border-green-200 text-green-800 ring-green-400/50',
  red: 'bg-red-50 border-red-200 text-red-800 ring-red-400/50',
  blue: 'bg-blue-50 border-blue-200 text-blue-800 ring-blue-400/50',
  darkRed: 'bg-rose-50 border-rose-200 text-rose-900 ring-rose-500/50',
  default: 'bg-white border-gray-200 text-gray-800 ring-gray-200'
};

export default function StatsCard({ title, value, color = 'default', icon }) {
  const colorStyles = colorMap[color] || colorMap.default;

  return (
    <div className={`rounded-xl border shadow-sm p-6 flex items-center transition-all hover:shadow-md ring-1 ${colorStyles}`}>
      <div className="flex-1">
        <h3 className="text-sm font-semibold uppercase tracking-wider opacity-80">{title}</h3>
        <p className="mt-2 text-3xl font-bold">{value}</p>
      </div>
      {icon && (
        <div className="ml-4 p-3 rounded-full bg-white/50 backdrop-blur-sm shadow-sm text-2xl">
          {icon}
        </div>
      )}
    </div>
  );
}
