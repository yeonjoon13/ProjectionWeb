// BarChart.js

import React from 'react';

const Card = ({ children }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border-2 flex items-center justify-center" style={{ minHeight: '100px' }}>
    {children}
  </div>
);

const BarChart = ({ label, value, unit, ranges }) => {
  const colorRange = [
    { label: 'Low', min: 0, max: 20, color: 'from-red-400 to-orange-400' },
    { label: 'Below Optimal', min: 20, max: 40, color: 'from-orange-400 to-green-400' },
    { label: 'Optimal', min: 40, max: 60, color: 'from-green-400 to-green-400' },
    { label: 'Above Optimal', min: 60, max: 80, color: 'from-green-400 to-orange-400' },
    { label: 'High', min: 80, max: 100, color: 'from-orange-400 to-red-400' },
  ];

  const calculatePosition = (value) => {
    const numericValue = parseFloat(value);
    let position = 0;
    for (let range of colorRange) {
      if (numericValue >= range.min && numericValue <= range.max) {
        position = ((numericValue - range.min) / (range.max - range.min)) * 100;
        break;
      }
    }
    return position;
  };

  const getColorGradient = (value) => {
    const numericValue = parseFloat(value);
    for (let range of colorRange) {
      if (numericValue >= range.min && numericValue <= range.max) {
        return range.color;
      }
    }
    return 'from-gray-500 to-gray-500'; // Default gradient if value is out of range
  };

  const barSegments = colorRange.map((range, index) => (
    <div
      key={index}
      className={`h-5 rounded-full bg-gradient-to-r ${range.color}`}
      style={{ width: `${(range.max - range.min) / 100 * 100}%` }}
    />
  ));

  return (
    <Card>
      <div className="flex items-center w-full justify-between">
        <div className="flex items-center ml-3 gap-14">
          <span className="font-bold text-xl mr-10 text-gray-700">{label}</span>
          <span className={`font-bold text-xl py-1 rounded-md text-gray-700 ${getColorGradient(value)}`}>
            {value}
          </span>
        </div>
        <div className="relative mr-7 mt-1" style={{ width: '60%' }}>
          <div className="h-5 rounded-full overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 right-0 flex">
              {barSegments}
              <div className="absolute top-0 bottom-0 left-0 w-5 h-5 rounded-full border-4 border-white" style={{ marginLeft: `${calculatePosition(value)}%` }} />
            </div>
          </div>
          <div className="flex justify-between mt-2">
            {colorRange.map((range, index) => (
              <span key={index} className="text-xs absolute font-medium" style={{ left: `${(range.min + range.max) / 2}%`, transform: 'translateX(-50%)' }}>
                {range.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BarChart;
