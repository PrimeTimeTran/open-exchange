'use client';

import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const DATA_RANGES = {
  '1D': Array.from({ length: 20 }, (_, i) => ({
    time: `9:${30 + i}`,
    value: 100 + Math.random() * 5,
  })),
  '1W': Array.from({ length: 7 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 100 + Math.random() * 10,
  })),
  '1M': Array.from({ length: 30 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 100 + Math.random() * 15,
  })),
  '3M': Array.from({ length: 90 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 100 + Math.random() * 20,
  })),
  YTD: Array.from({ length: 100 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 100 + Math.random() * 25,
  })),
  '1Y': Array.from({ length: 12 }, (_, i) => ({
    time: `Month ${i + 1}`,
    value: 100 + Math.random() * 30,
  })),
  ALL: Array.from({ length: 50 }, (_, i) => ({
    time: `Year ${i + 1}`,
    value: 100 + Math.random() * 100,
  })),
};

export default function AssetPage({ params }: { params: { symbol: string } }) {
  const [timeRange, setTimeRange] = useState<keyof typeof DATA_RANGES>('1D');
  const [chartData, setChartData] = useState(DATA_RANGES['1D']);
  const symbol = params.symbol.toUpperCase();

  const handleRangeChange = (range: keyof typeof DATA_RANGES) => {
    setTimeRange(range);
    setChartData(DATA_RANGES[range]);
  };

  const isPositive =
    chartData[chartData.length - 1].value >= chartData[0].value;
  const lineColor = isPositive ? '#22c55e' : '#ef4444';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <Link
            href="/home"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content (Chart & Details) */}
          <div className="flex-1 space-y-8">
            {/* Header */}
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">{symbol}</h1>
              <div className="text-2xl font-medium">$142.50</div>
              <div
                className={`flex items-center text-sm font-medium ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {isPositive ? '+' : ''}$2.12 (1.45%)
                <span className="text-muted-foreground ml-1">Today</span>
              </div>
            </div>

            {/* Chart Area */}
            <div className="h-[400px] w-full -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={lineColor}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                  <XAxis dataKey="time" hide />
                  <YAxis domain={['auto', 'auto']} hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      color: 'hsl(var(--popover-foreground))',
                    }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                    labelStyle={{ display: 'none' }}
                    formatter={(value: number) => [
                      `$${value.toFixed(2)}`,
                      'Price',
                    ]}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Time Range Selector */}
            <div className="flex items-center border-b border-border pb-2">
              {(
                Object.keys(DATA_RANGES) as Array<keyof typeof DATA_RANGES>
              ).map((range) => (
                <button
                  key={range}
                  onClick={() => handleRangeChange(range)}
                  className={`px-4 py-2 text-sm font-bold transition-colors ${
                    timeRange === range
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* About Section */}
            <div className="space-y-4 pt-4">
              <h2 className="text-2xl font-bold">About {symbol}</h2>
              <p className="text-muted-foreground leading-relaxed">
                This is a placeholder description for {symbol}. In a real
                application, this would fetch data about the company or asset,
                including its sector, description, CEO, headquarters, and other
                fundamental data.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4">
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase">
                    CEO
                  </div>
                  <div className="font-medium">Jane Doe</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase">
                    Market Cap
                  </div>
                  <div className="font-medium">$2.4T</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase">
                    P/E Ratio
                  </div>
                  <div className="font-medium">32.5</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-muted-foreground uppercase">
                    Dividend Yield
                  </div>
                  <div className="font-medium">0.54%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (Order Entry) */}
          <div className="lg:w-80 w-full shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-6 space-y-6">
                <h3 className="font-bold text-xl">Buy {symbol}</h3>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium">Order Type</span>
                    <span className="text-primary font-bold cursor-pointer">
                      Market Order
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">
                      Amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        className="w-full bg-background border border-input rounded-md h-10 pl-7 pr-3 focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="pt-2 text-xs font-medium text-muted-foreground flex justify-between">
                    <span>Est. Quantity</span>
                    <span>0.0000 {symbol}</span>
                  </div>
                </div>

                <Button className="w-full h-12 text-lg font-bold">
                  Review Order
                </Button>

                <div className="text-center pt-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    $12,450.00 Buying Power Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
