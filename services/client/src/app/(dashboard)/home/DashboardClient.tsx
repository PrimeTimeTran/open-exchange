'use client';

import React, { useEffect } from 'react';
import { ChartHeader } from '@/components/charts/chart-header';
import { PriceChart } from '@/components/charts/price-chart';
import { TimeRangeSelector } from '@/components/charts/time-range-selector';
import { NewsSection } from '@/components/news/news-section';
import { WatchlistSidebar } from './watchlist-sidebar';
import { PriceUpdate } from 'src/proto/market/market';
import { ChartDataPoint, useMarketChart } from 'src/hooks/use-market-chart';

interface DashboardClientProps {
  userId: string | null;
  initialMarketData?: PriceUpdate;
  initialChartData?: ChartDataPoint[];
}

export function DashboardClient({
  initialMarketData,
  initialChartData,
  userId,
}: DashboardClientProps) {
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
    symbol: 'BTC_USD',
    initialMarketData,
    initialChartData,
  });
  useEffect(() => {
    if (!window.gtag) return;
    if (userId) {
      window.gtag('config', 'G-MFFQRL807K', {
        user_id: 'Loi-Tran-123',
      });

      window.gtag('event', 'login', {
        method: 'password',
      });
    } else {
      window.gtag('config', 'G-MFFQRL807K', {
        user_id: 'Loi-Tran-123-SignedIn',
      });
    }
  }, [userId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <ChartHeader
              price={displayPrice}
              change={displayChange}
              percentChange={displayPercentChange}
              isPositive={isDisplayPositive}
            />

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

            {/* Buying Power */}
            <div className="flex justify-between items-center py-6 border-b border-border">
              <span className="text-muted-foreground font-medium">
                Buying Power
              </span>
              <span className="font-bold">$12,450.00</span>
            </div>

            <NewsSection />
          </div>

          <WatchlistSidebar />
        </div>
      </div>
    </div>
  );
}
