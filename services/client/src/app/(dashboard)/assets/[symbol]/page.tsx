import React from 'react';
import { marketClient } from 'src/services/MarketClient';
import { AssetClient } from './AssetClient';
import { fetchMarketData } from 'src/actions/market';

export const dynamic = 'force-dynamic';

export default async function AssetPage({
  params,
}: {
  params: { symbol: string };
}) {
  const symbol = params.symbol.toUpperCase();
  const apiSymbol = symbol.includes('_') ? symbol : `${symbol}_USD`;

  let marketData;
  let chartData;

  const now = Date.now();
  // Default to 1M view for SSR
  const startTime = now - 30 * 24 * 60 * 60 * 1000;

  try {
    const [priceRes, historyData] = await Promise.all([
      marketClient.getLatestPrice({ symbol: apiSymbol }),
      fetchMarketData(apiSymbol, '1d', startTime, now),
    ]);

    marketData = priceRes;

    chartData = historyData.map((p) => ({
      time: p.time,
      value: p.value,
    }));
  } catch (error) {
    console.error('Failed to fetch asset data:', error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <AssetClient
          symbol={symbol}
          initialMarketData={marketData}
          initialChartData={chartData}
        />
      </div>
    </div>
  );
}
