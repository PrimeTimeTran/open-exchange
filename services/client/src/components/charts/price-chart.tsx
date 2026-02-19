'use client';

import React from 'react';
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  ResponsiveContainer,
} from 'recharts';

interface PriceChartProps {
  data: any[];
  color: string;
  timeRange: string;
  onHover?: (data: any | null) => void;
}

export function PriceChart({
  data,
  color,
  timeRange,
  onHover,
}: PriceChartProps) {
  const [tooltipPos, setTooltipPos] = React.useState<
    { x: number; y: number } | undefined
  >(undefined);

  const formatLabel = (label: string | number) => {
    if (typeof label === 'number') {
      const date = new Date(label);
      if (timeRange === '1D') {
        return date.toLocaleTimeString([], {
          hour: 'numeric',
          minute: '2-digit',
        });
      }
      if (timeRange === '1W') {
        return date.toLocaleString([], { weekday: 'short', hour: 'numeric' });
      }
      return date.toLocaleDateString();
    }

    // If it's already a time string (mock data), return as is
    if (
      label.includes(':') ||
      label.startsWith('Day') ||
      label.startsWith('Month') ||
      label.startsWith('Year')
    ) {
      return label;
    }

    // Try to parse as date
    const date = new Date(label);
    if (isNaN(date.getTime())) return label;

    if (timeRange === '1D') {
      return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      });
    }
    if (timeRange === '1W') {
      return date.toLocaleString([], { weekday: 'short', hour: 'numeric' });
    }
    // Default to date
    return date.toLocaleDateString();
  };

  return (
    <div className="h-100 w-full -ml-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          onMouseMove={(state) => {
            if (state.activeCoordinate) {
              setTooltipPos({ x: state.activeCoordinate.x, y: -20 });
            }
            if (
              onHover &&
              state.activePayload &&
              state.activePayload.length > 0
            ) {
              onHover(state.activePayload[0].payload);
            }
          }}
          onMouseLeave={() => {
            setTooltipPos(undefined);
            if (onHover) onHover(null);
          }}
        >
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
          <XAxis dataKey="time" hide />
          <YAxis domain={['auto', 'auto']} hide />
          <Tooltip
            position={tooltipPos}
            wrapperStyle={{ transform: 'translateX(-50%)' }}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--popover-foreground))',
              padding: '8px 12px',
              fontSize: '12px',
            }}
            itemStyle={{ color: 'hsl(var(--foreground))', padding: 0 }}
            labelStyle={{
              color: 'hsl(var(--muted-foreground))',
              marginBottom: '2px',
            }}
            labelFormatter={formatLabel}
            formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
            separator=""
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
