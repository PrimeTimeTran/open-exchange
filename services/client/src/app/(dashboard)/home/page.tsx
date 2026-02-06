'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  ResponsiveContainer,
} from 'recharts';
import { Button } from '@/components/ui';

const DATA_RANGES = {
  '1D': [
    { time: '9:30', value: 24500 },
    { time: '10:00', value: 24650 },
    { time: '10:30', value: 24580 },
    { time: '11:00', value: 24720 },
    { time: '11:30', value: 24800 },
    { time: '12:00', value: 24750 },
    { time: '12:30', value: 24890 },
    { time: '13:00', value: 24950 },
    { time: '13:30', value: 24900 },
    { time: '14:00', value: 25100 },
    { time: '14:30', value: 25050 },
    { time: '15:00', value: 25150 },
    { time: '15:30', value: 25232 },
    { time: '16:00', value: 25232 },
  ],
  '1W': Array.from({ length: 7 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 24000 + Math.random() * 2000,
  })),
  '1M': Array.from({ length: 30 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 23000 + Math.random() * 3000,
  })),
  '3M': Array.from({ length: 90 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 20000 + Math.random() * 6000,
  })),
  YTD: Array.from({ length: 100 }, (_, i) => ({
    time: `Day ${i + 1}`,
    value: 18000 + Math.random() * 8000,
  })),
  '1Y': Array.from({ length: 12 }, (_, i) => ({
    time: `Month ${i + 1}`,
    value: 15000 + Math.random() * 12000,
  })),
  ALL: Array.from({ length: 50 }, (_, i) => ({
    time: `Year ${i + 1}`,
    value: 5000 + Math.random() * 25000,
  })),
};

const LISTS = {
  Stocks: [
    {
      symbol: 'AAPL',
      price: '185.90',
      change: '+0.4%',
      up: true,
      name: 'Apple',
    },
    {
      symbol: 'TSLA',
      price: '215.30',
      change: '-1.2%',
      up: false,
      name: 'Tesla',
    },
    {
      symbol: 'NVDA',
      price: '540.20',
      change: '+3.5%',
      up: true,
      name: 'Nvidia',
    },
    {
      symbol: 'MSFT',
      price: '390.10',
      change: '+0.8%',
      up: true,
      name: 'Microsoft',
    },
  ],
  Options: [
    {
      symbol: 'SPY 480C',
      price: '2.45',
      change: '+15%',
      up: true,
      name: 'Jan 19 Call',
    },
    {
      symbol: 'TSLA 200P',
      price: '5.20',
      change: '+8.4%',
      up: true,
      name: 'Feb 16 Put',
    },
    {
      symbol: 'AMD 160C',
      price: '3.10',
      change: '-12%',
      up: false,
      name: 'Mar 15 Call',
    },
  ],
  Futures: [
    {
      symbol: 'ES_F',
      price: '4805.25',
      change: '+0.2%',
      up: true,
      name: 'S&P 500 E-Mini',
    },
    {
      symbol: 'NQ_F',
      price: '16950.50',
      change: '-0.1%',
      up: false,
      name: 'Nasdaq 100 E-Mini',
    },
    {
      symbol: 'CL_F',
      price: '72.40',
      change: '+1.5%',
      up: true,
      name: 'Crude Oil',
    },
  ],
  Crypto: [
    {
      symbol: 'BTC',
      price: '43,240.50',
      change: '+2.4%',
      up: true,
      name: 'Bitcoin',
    },
    {
      symbol: 'ETH',
      price: '2,310.20',
      change: '+1.8%',
      up: true,
      name: 'Ethereum',
    },
    {
      symbol: 'SOL',
      price: '98.45',
      change: '-0.5%',
      up: false,
      name: 'Solana',
    },
  ],
};

const WATCHLIST = [...LISTS.Crypto.slice(0, 2), ...LISTS.Stocks.slice(0, 2)];

export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState<keyof typeof DATA_RANGES>('1D');
  const [chartData, setChartData] = useState(DATA_RANGES['1D']);

  const handleRangeChange = (range: keyof typeof DATA_RANGES) => {
    setTimeRange(range);
    setChartData(DATA_RANGES[range]);
  };

  const isPositive =
    chartData[chartData.length - 1].value >= chartData[0].value;
  const lineColor = isPositive ? '#22c55e' : '#ef4444'; // green-500 : red-500

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content (Chart & Portfolio) */}
          <div className="flex-1 space-y-8">
            {/* Portfolio Header */}
            <div className="space-y-1">
              <h1 className="text-4xl font-bold tracking-tight">$25,232.45</h1>
              <div
                className={`flex items-center text-sm font-medium ${
                  isPositive ? 'text-green-500' : 'text-red-500'
                }`}
              >
                {isPositive ? '+' : ''}$842.12 (3.45%)
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
                      'Value',
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

            {/* Buying Power */}
            <div className="flex justify-between items-center py-6 border-b border-border">
              <span className="text-muted-foreground font-medium">
                Buying Power
              </span>
              <span className="font-bold">$12,450.00</span>
            </div>

            {/* News / Activity Section Placeholder */}
            <div className="space-y-6 pt-4">
              <h2 className="text-2xl font-bold">News</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Link
                    key={i}
                    href={`/news/article-${i}`}
                    className="flex gap-4 group cursor-pointer"
                  >
                    <div className="w-24 h-16 bg-muted rounded-md shrink-0" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-bold">CoinDesk</span>
                        <span>•</span>
                        <span>2h ago</span>
                      </div>
                      <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                        Bitcoin Surges Past $43k as Institutional Adoption Grows
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar (Watchlist) */}
          <div className="lg:w-80 w-full shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-bold">Lists</h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                <div className="divide-y divide-border">
                  <div className="bg-muted/50 p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-4">
                    Watchlist
                  </div>
                  {WATCHLIST.map((item) => (
                    <Link
                      key={item.symbol}
                      href={`/assets/${item.symbol}`}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer block"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{item.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{item.price}</span>
                        <span
                          className={`text-xs font-medium flex items-center ${
                            item.up ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {item.up ? (
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          )}
                          {item.change}
                        </span>
                      </div>
                    </Link>
                  ))}

                  {/* Render Categories */}
                  {(Object.keys(LISTS) as Array<keyof typeof LISTS>).map(
                    (category) => (
                      <div key={category} className="divide-y divide-border">
                        <div className="bg-secondary/50 p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-4">
                          {category}
                        </div>
                        {LISTS[category].map((item) => (
                          <Link
                            key={item.symbol}
                            href={`/assets/${item.symbol}`}
                            className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer block"
                          >
                            <div className="flex flex-col">
                              <span className="font-bold">{item.symbol}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.name}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="font-medium">{item.price}</span>
                              <span
                                className={`text-xs font-medium flex items-center ${
                                  item.up ? 'text-green-500' : 'text-red-500'
                                }`}
                              >
                                {item.up ? (
                                  <ArrowUpRight className="h-3 w-3 mr-0.5" />
                                ) : (
                                  <ArrowDownRight className="h-3 w-3 mr-0.5" />
                                )}
                                {item.change}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Deposit Card */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center space-y-4">
                <h3 className="font-bold">Fund your account</h3>
                <p className="text-sm text-muted-foreground">
                  You're ready to trade! Deposit funds to start building your
                  portfolio.
                </p>
                <Button className="w-full">Deposit Funds</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
