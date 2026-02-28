'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Line,
  LineChart,
  ResponsiveContainer,
  ReferenceLine,
  YAxis,
} from 'recharts';

const TIME_RANGES = ['1D', '1W', '1M', '3M', 'YTD', '1Y', 'ALL'];

// Mock data for the chart
const MOCK_DATA = Array.from({ length: 50 }, (_, i) => ({
  value: 11075 + Math.random() * 10 - 5 + (i > 25 ? -20 : 0), // Dip in middle
}));

export function PortfolioWidget() {
  const [isRevealed, setIsRevealed] = useState(true);
  const [activeRange, setActiveRange] = useState('1D');

  // Hardcoded values from screenshot
  const portfolioValue = 11075.8;
  const todayChange = 0.09;
  const todayChangePct = 0.0;
  const overnightChange = -0.92;
  const overnightChangePct = 0.01;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(val);
  };

  const formatChange = (val: number, pct: number) => {
    const sign = val >= 0 ? '+' : '-';
    return `${sign}${formatCurrency(Math.abs(val))} (${Math.abs(pct).toFixed(2)}%)`;
  };

  return (
    <div className="flex flex-col h-full bg-background/50 text-foreground relative font-sans p-4">
      {/* Top Header Row: Icons and Deposit Button */}
      <div className="flex justify-between items-start mb-1">
        {/* Placeholder for left side alignment if needed, or just spacers */}
        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
            onClick={() => setIsRevealed(!isRevealed)}
          >
            {isRevealed ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-foreground"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Title & Deposit */}
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-normal text-foreground">Individual</h2>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 text-xs font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 border-none"
        >
          Deposit
        </Button>
      </div>

      {/* Value */}
      <div className="mb-2">
        <h1 className="text-3xl font-medium tracking-tight">
          {isRevealed ? formatCurrency(portfolioValue) : '****'}
        </h1>
      </div>

      {/* Stats */}
      <div className="space-y-1 text-xs font-medium mb-6">
        <div className="flex items-center gap-2">
          <span className="text-green-500">
            ▲ {formatChange(todayChange, todayChangePct)}
          </span>
          <span className="text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-orange-500">
            ▼ {formatChange(overnightChange, overnightChangePct)}
          </span>
          <span className="text-muted-foreground">Overnight</span>
        </div>
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0 w-full -ml-2 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MOCK_DATA}>
            <ReferenceLine
              y={11070}
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#f97316" // Orange-500
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
            {/* Hidden YAxis to scale chart properly */}
            <YAxis domain={['auto', 'auto']} hide />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-4 text-xs font-bold border-t border-transparent pt-2">
        {TIME_RANGES.map((range) => (
          <button
            key={range}
            onClick={() => setActiveRange(range)}
            className={cn(
              'px-2 py-1 rounded transition-colors',
              activeRange === range
                ? 'bg-orange-500 text-white hover:bg-orange-400'
                : 'text-orange-500 hover:text-orange-400 bg-transparent',
            )}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}
