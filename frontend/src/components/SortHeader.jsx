import React from 'react';

export default function SortHeader({ label, field, sortField, sortOrder, onSort, className = "" }) {
  const isSorted = sortField === field;

  return (
    <th 
      className={`px-4 py-3 font-medium cursor-pointer hover:bg-gray-100 transition-colors select-none ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        <span className="text-gray-400 text-xs">
          {!isSorted && '⇅'}
          {isSorted && sortOrder === 'asc' && '⬆'}
          {isSorted && sortOrder === 'desc' && '⬇'}
        </span>
      </div>
    </th>
  );
}
