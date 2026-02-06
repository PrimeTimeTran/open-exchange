'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { PriceUpdate } from 'src/proto/market/market';
import { PriceChart } from '@/components/charts/price-chart';
import { ChartHeader } from '@/components/charts/chart-header';
import { TimeRangeSelector } from '@/components/charts/time-range-selector';
import { ChartDataPoint, useMarketChart } from 'src/hooks/use-market-chart';

interface AssetClientProps {
  symbol: string;
  initialMarketData?: PriceUpdate;
  initialChartData?: ChartDataPoint[];
}

export function AssetClient({
  symbol,
  initialMarketData,
  initialChartData,
}: AssetClientProps) {
  const {
    timeRange,
    chartData,
    lineColor,
    displayPrice,
    displayChange,
    setHoveredData,
    handleRangeChange,
    isDisplayPositive,
    displayPercentChange,
  } = useMarketChart({
    symbol,
    initialMarketData,
    initialChartData,
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8">
        <div className="mb-6">
          <Link
            href="/home"
            className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">{symbol}</h1>
          <ChartHeader
            price={displayPrice}
            change={displayChange}
            percentChange={displayPercentChange}
            isPositive={isDisplayPositive}
          />
        </div>

        <PriceChart
          data={chartData}
          color={lineColor}
          timeRange={timeRange}
          onHover={setHoveredData}
        />

        <TimeRangeSelector
          currentRange={timeRange}
          onRangeChange={handleRangeChange}
        />

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
                    className="w-full bg-background border border-input rounded-md py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors">
                Review Order
              </button>
            </div>

            <div className="pt-4 border-t border-border">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Buying Power</span>
                <span>$12,450.00</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
