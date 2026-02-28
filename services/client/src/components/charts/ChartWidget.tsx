'use client';

import React from 'react';
import { ChartHeader } from '@/components/charts/chart-header';
import { PriceChart } from '@/components/charts/price-chart';
import { TimeRangeSelector } from '@/components/charts/time-range-selector';
import { PriceUpdate } from 'src/proto/market/market';
import { ChartDataPoint, useMarketChart } from '@/shared/hooks/useMarketChart';

interface ChartWidgetProps {
  symbol?: string;
  initialMarketData?: PriceUpdate;
  initialChartData?: ChartDataPoint[];
}

export function ChartWidget({
  symbol = 'BTC_USD',
  initialMarketData,
  initialChartData,
}: ChartWidgetProps) {
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
    <div className="flex flex-col h-full">
      <ChartHeader
        price={displayPrice}
        change={displayChange}
        percentChange={displayPercentChange}
        isPositive={isDisplayPositive}
      />

      <div className="flex-1 min-h-0">
        <PriceChart
          data={chartData}
          color={lineColor}
          timeRange={timeRange}
          onHover={setHoveredData}
        />
      </div>

      <TimeRangeSelector
        currentRange={timeRange}
        onRangeChange={handleRangeChange}
      />
    </div>
  );
}
