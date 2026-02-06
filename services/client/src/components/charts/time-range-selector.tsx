import React from 'react';
import { CHART_RANGES } from './constants';

interface TimeRangeSelectorProps {
  currentRange: string;
  onRangeChange: (range: string) => void;
}

export function TimeRangeSelector({
  currentRange,
  onRangeChange,
}: TimeRangeSelectorProps) {
  return (
    <div className="flex items-center border-b border-border pb-2">
      {CHART_RANGES.map((range) => (
        <button
          key={range}
          onClick={() => onRangeChange(range)}
          className={`px-4 py-2 text-sm font-bold transition-colors ${
            currentRange === range
              ? 'text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {range}
        </button>
      ))}
    </div>
  );
}
