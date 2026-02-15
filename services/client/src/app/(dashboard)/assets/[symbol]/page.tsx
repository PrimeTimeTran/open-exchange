import React from 'react';
import { cookies } from 'next/headers';
import { Metadata } from 'next';
import { marketClient } from 'src/services/MarketClient';
import { AssetClient } from './AssetClient';
import { fetchMarketData } from 'src/actions/market';
import { appContextForReact } from 'src/shared/controller/appContext';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { symbol: string };
}): Promise<Metadata> {
  const symbol = params.symbol.toUpperCase();
  return {
    title: `${symbol} Price | OpenExchange`,
    description: `View live price charts and trade ${symbol} on OpenExchange.`,
  };
}

export default async function AssetPage({
  params,
}: {
  params: { symbol: string };
}) {
  const symbol = params.symbol.toUpperCase();
  const apiSymbol = symbol.includes('_') ? symbol : `${symbol}_USDT`;
  const context = await appContextForReact(cookies());
  const isAuthenticated = !!context.currentUser;

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
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
