import React from 'react';

interface ChartHeaderProps {
  price: string;
  change: string;
  percentChange: string;
  isPositive: boolean;
}

export function ChartHeader({
  price,
  change,
  percentChange,
  isPositive,
}: ChartHeaderProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-4xl font-bold tracking-tight">{price}</h1>
      <div
        className={`flex items-center text-sm font-medium ${
          isPositive ? 'text-green-500' : 'text-red-500'
        }`}
      >
        {isPositive ? '+' : '-'}
        {change} ({percentChange})
        <span className="text-muted-foreground ml-1">Today</span>
      </div>
    </div>
  );
}
