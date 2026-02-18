'use client';

import React from 'react';
import { PriceUpdate } from 'src/proto/market/market';
import { ChartDataPoint, useMarketChart } from '@/shared/hooks/useMarketChart';
import { useMutation } from '@tanstack/react-query';
import { placeMatchingEngineOrder } from 'src/actions/order';
import { instrumentAutocompleteApiCall } from 'src/features/instrument/instrumentApiCalls';
import { useToast } from 'src/shared/components/ui/use-toast';
import { useLedger } from 'src/contexts/LedgerProvider';

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
  isAuthenticated: boolean;
}

export function AssetClient({
  symbol,
  initialMarketData,
  initialChartData,
  isAuthenticated,
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
  const { refresh } = useLedger();

  const orderMutation = useMutation({
    mutationFn: async (data: {
      type: 'market' | 'limit';
      quantity: string;
      price?: string;
      timeInForce: string;
      asset: string;
      side: 'buy' | 'sell';
    }) => {
      // Find the instrument ID first
      // Prefer Spot USD pair if no specific symbol provided
      let search = data.asset;
      if (!search.includes('_')) {
        search = `${search}_USD`;
      }

      let instruments = await instrumentAutocompleteApiCall({
        search,
        take: 1,
      });

      // Fallback: If strict spot pair not found, try generic search
      if (!instruments || instruments.length === 0) {
        console.warn(
          `Spot instrument ${search} not found, falling back to ${data.asset}`,
        );
        instruments = await instrumentAutocompleteApiCall({
          search: data.asset,
          take: 1,
        });
      }
      // const instruments = await instrumentAutocompleteApiCall({
      //   search: data.asset,
      //   take: 1,
      // });

      if (!instruments || instruments.length === 0) {
        throw new Error(`Instrument ${data.asset} not found`);
      }

      const instrumentId = instruments[0].id;

      return await placeMatchingEngineOrder({
        instrumentId,
        side: data.side,
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        timeInForce: data.timeInForce,
      });
    },
    onSuccess: () => {
      refresh();
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
        isAuthenticated={isAuthenticated}
        onSubmit={(data) => orderMutation.mutate(data)}
      />
    </div>
  );
}
