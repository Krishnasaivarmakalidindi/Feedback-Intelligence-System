import React from 'react';

export const Sparkline = ({ data = [], color = '#6366f1', width = 90, height = 24 }) => {
  // If data is empty or too short, return a flat dummy line
  const pointsData = data.length >= 2 ? data : [1, 2, 1, 3, 2, 4];
  
  const max = Math.max(...pointsData);
  const min = Math.min(...pointsData);
  const range = max - min === 0 ? 1 : max - min;

  const points = pointsData
    .map((val, index) => {
      const x = (index / (pointsData.length - 1)) * width;
      const y = height - 2 - ((val - min) / range) * (height - 4); // Include small padding
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};
export default Sparkline;
