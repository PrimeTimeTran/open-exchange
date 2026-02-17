'use client';

import React, { useMemo, useState } from 'react';

interface DataItem {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: DataItem[];
  size?: number;
}

export function PieChart({ data, size = 200 }: PieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = useMemo(
    () => data.reduce((acc, item) => acc + item.value, 0),
    [data],
  );

  if (total === 0) return null;

  // Handle single item case (100% circle)
  if (data.length === 1) {
    const item = data[0];
    return (
      <div className="relative flex flex-col items-center">
        <svg
          viewBox="-105 -105 210 210"
          width={size}
          height={size}
          className="overflow-visible"
        >
          <circle
            cx="0"
            cy="0"
            r="100"
            fill={item.color}
            stroke="white"
            strokeWidth="2"
            className="transition-opacity duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredIndex(0)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        </svg>
        {/* Tooltip / Legend Overlay */}
        {hoveredIndex !== null && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded shadow-md text-xs pointer-events-none whitespace-nowrap z-10">
            <span className="font-bold">{item.name}</span>
            <span className="ml-2 text-muted-foreground">100.0%</span>
          </div>
        )}
      </div>
    );
  }

  let cumulativeAngle = 0;

  const paths = data
    .map((item, index) => {
      const percentage = item.value / total;
      const angle = percentage * 360;

      // Avoid drawing extremely small slices that cause rendering artifacts
      if (percentage < 0.001) return null;

      // Convert polar to cartesian
      const x1 = Math.cos(((cumulativeAngle - 90) * Math.PI) / 180) * 100;
      const y1 = Math.sin(((cumulativeAngle - 90) * Math.PI) / 180) * 100;

      const x2 =
        Math.cos(((cumulativeAngle + angle - 90) * Math.PI) / 180) * 100;
      const y2 =
        Math.sin(((cumulativeAngle + angle - 90) * Math.PI) / 180) * 100;

      // SVG Path command
      const largeArcFlag = angle > 180 ? 1 : 0;
      const pathD = `M 0 0 L ${x1} ${y1} A 100 100 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

      cumulativeAngle += angle;

      return {
        pathD,
        color: item.color,
        name: item.name,
        value: item.value,
        percentage,
      };
    })
    .filter(Boolean) as {
    pathD: string;
    color: string;
    name: string;
    value: number;
    percentage: number;
  }[];

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="-105 -105 210 210"
        width={size}
        height={size}
        className="overflow-visible"
      >
        {paths.map((slice, index) => (
          <path
            key={index}
            d={slice.pathD}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
            className="transition-opacity duration-200 cursor-pointer hover:opacity-80"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          />
        ))}
      </svg>

      {/* Tooltip / Legend Overlay */}
      {hoveredIndex !== null && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-popover text-popover-foreground px-2 py-1 rounded shadow-md text-xs pointer-events-none whitespace-nowrap z-10">
          <span className="font-bold">{paths[hoveredIndex].name}</span>
          <span className="ml-2 text-muted-foreground">
            {(paths[hoveredIndex].percentage * 100).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
