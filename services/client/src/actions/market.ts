'use server';

import { marketClient } from 'src/services/MarketClient';

export interface MarketDataPoint {
  low: number;
  time: number;
  open: number;
  high: number;
  value: number;
  close: number;
  volume: number;
}

export async function fetchMarketData(
  to: number,
  from: number,
  symbol: string,
  interval: string,
): Promise<MarketDataPoint[]> {
  try {
    const response = await marketClient.getMarketData({
      symbol,
      interval,
      startTime: from.toString(),
      endTime: to.toString(),
    });

    if (!response.candles) {
      return [];
    }

    return response.candles.map((c) => ({
      value: c.close || 0,
      open: c.open || 0,
      high: c.high || 0,
      low: c.low || 0,
      close: c.close || 0,
      volume: c.volume || 0,
      time: Number(c.timestamp),
    }));
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    return [];
  }
}
