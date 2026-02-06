import React from 'react';
import { marketClient } from 'src/services/MarketClient';
import { DashboardClient } from './DashboardClient';
import { fetchMarketData } from 'src/actions/market';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let marketData;
  let chartData;

  const now = Date.now();
  // Default to 1M view for SSR
  const startTime = now - 30 * 24 * 60 * 60 * 1000;

  try {
    const [priceRes, historyData] = await Promise.all([
      marketClient.getLatestPrice({ symbol: 'BTC_USD' }),
      fetchMarketData('BTC_USD', '1d', startTime, now),
    ]);

    marketData = priceRes;

    chartData = historyData.map((p) => ({
      time: p.time,
      value: p.value,
    }));
  } catch (error) {
    console.error('Failed to fetch market data:', error);
  }

  return (
    <DashboardClient
      initialMarketData={marketData}
      initialChartData={chartData}
    />
  );
}
