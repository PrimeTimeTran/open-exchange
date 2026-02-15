import React from 'react';
import { cookies } from 'next/headers';
import { DashboardClient } from './DashboardClient';
import { fetchMarketData } from 'src/actions/market';
import { marketClient } from 'src/services/MarketClient';
import { appContextForReact } from '@/shared/controller/appContext';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  let marketData;
  let chartData;
  const context = await appContextForReact(cookies());

  const now = Date.now();
  const startTime = now - 7 * 24 * 60 * 60 * 1000;

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
    // Fallback to hardcoded data for testing
    marketData = {
      symbol: 'BTC_USD',
      price: '95000.00',
      timestamp: Date.now().toString(),
      change24h: 2.5,
      volume24h: 1000000,
    };
    chartData = Array.from({ length: 100 }, (_, i) => ({
      time: Date.now() - (100 - i) * 60 * 60 * 1000,
      value: 90000 + Math.random() * 10000,
    }));
  }

  return (
    <DashboardClient
      initialChartData={chartData}
      initialMarketData={marketData}
      userId={context.currentUser?.id ?? null}
    />
  );
}
