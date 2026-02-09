'use client';

import React from 'react';
import { PriceUpdate } from 'src/proto/market/market';
import { ChartDataPoint, useMarketChart } from 'src/hooks/use-market-chart';
import { useMutation } from '@tanstack/react-query';
import { placeMatchingEngineOrder } from 'src/actions/order';
import { instrumentAutocompleteApiCall } from 'src/features/instrument/instrumentApiCalls';
import { useToast } from 'src/shared/components/ui/use-toast';

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

  const { toast } = useToast();

  const orderMutation = useMutation({
    mutationFn: async (data: {
      type: 'market' | 'limit';
      quantity: string;
      price?: string;
      timeInForce: string;
      asset: string;
    }) => {
      console.log('Hi');
      // Find the instrument ID first
      const instruments = await instrumentAutocompleteApiCall({
        search: data.asset,
        take: 1,
      });

      if (!instruments || instruments.length === 0) {
        throw new Error(`Instrument ${data.asset} not found`);
      }

      const instrumentId = instruments[0].id;

      return placeMatchingEngineOrder({
        instrumentId,
        side: 'buy', // Hardcoded for now based on UI
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        timeInForce: data.timeInForce,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Order placed',
        description: 'Your order has been successfully placed.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Order failed',
        description: error.message || 'Failed to place order',
        variant: 'destructive',
      });
    },
  });

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-8">
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
      <OrderSidebar
        symbol={symbol}
        onSubmit={(data) => orderMutation.mutate(data)}
      />
    </div>
  );
}
