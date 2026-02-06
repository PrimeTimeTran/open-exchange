'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import { PriceUpdate } from 'src/proto/market/market';
import { ChartDataPoint, useMarketChart } from 'src/hooks/use-market-chart';

import { PriceChart } from '@/components/charts/price-chart';
import { AssetAbout } from '@/components/assets/asset-about';
import { NewsSection } from '@/components/news/news-section';
import { ChartHeader } from '@/components/charts/chart-header';
import { OrderSidebar } from '@/components/assets/order-sidebar';
import { TimeRangeSelector } from '@/components/charts/time-range-selector';

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

        <AssetAbout symbol={symbol} />

        <NewsSection symbol={symbol} />
      </div>

      {/* Sidebar (Order Entry) */}
      <OrderSidebar symbol={symbol} />
    </div>
  );
}
