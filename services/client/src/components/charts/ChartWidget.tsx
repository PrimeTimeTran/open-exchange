'use client';

import React from 'react';
import { PriceUpdate } from 'src/proto/market/market';
import { PriceChart } from '@/components/charts/price-chart';
import { ChartHeader } from '@/components/charts/chart-header';
import { TimeRangeSelector } from '@/components/charts/time-range-selector';
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
    hoveredData,
  } = useMarketChart({
    symbol,
    initialMarketData,
    initialChartData,
  });

  const displayData =
    hoveredData ||
    (chartData.length > 0 ? chartData[chartData.length - 1] : null);

  const formatVal = (val?: number) =>
    val !== undefined ? val.toFixed(2) : '--';
  const formatVol = (val?: number) =>
    val !== undefined
      ? val >= 1000000
        ? `${(val / 1000000).toFixed(2)}M`
        : val >= 1000
          ? `${(val / 1000).toFixed(2)}K`
          : val
      : '--';

  return (
    <div className="flex flex-col h-full bg-background/50 relative">
      <ChartHeader
        symbol={symbol}
        price={displayPrice}
        change={displayChange}
        percentChange={displayPercentChange}
        isPositive={isDisplayPositive}
      />

      <div className="flex-1 min-h-0 relative">
        <div className="absolute top-2 left-2 z-10 flex gap-4 pointer-events-none">
          <div className="flex gap-1 items-baseline">
            <span className="text-[10px] text-muted-foreground">O</span>
            <span className="text-xs font-medium text-foreground">
              {formatVal(displayData?.open)}
            </span>
          </div>
          <div className="flex gap-1 items-baseline">
            <span className="text-[10px] text-muted-foreground">H</span>
            <span className="text-xs font-medium text-foreground">
              {formatVal(displayData?.high)}
            </span>
          </div>
          <div className="flex gap-1 items-baseline">
            <span className="text-[10px] text-muted-foreground">L</span>
            <span className="text-xs font-medium text-foreground">
              {formatVal(displayData?.low)}
            </span>
          </div>
          <div className="flex gap-1 items-baseline">
            <span className="text-[10px] text-muted-foreground">C</span>
            <span className="text-xs font-medium text-foreground">
              {formatVal(displayData?.close)}
            </span>
          </div>
          <div className="flex gap-1 items-baseline">
            <span className="text-[10px] text-muted-foreground">V</span>
            <span className="text-xs font-medium text-foreground">
              {formatVol(displayData?.volume)}
            </span>
          </div>
        </div>
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
