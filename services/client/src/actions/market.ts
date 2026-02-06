'use server';

import { marketClient } from 'src/services/MarketClient';

export interface MarketDataPoint {
  time: number;
  value: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function fetchMarketData(
  symbol: string,
  interval: string,
  from: number,
  to: number,
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
      time: Number(c.timestamp),
      value: c.close || 0,
      open: c.open || 0,
      high: c.high || 0,
      low: c.low || 0,
      close: c.close || 0,
      volume: c.volume || 0,
    }));
  } catch (error) {
    console.error('Failed to fetch market data:', error);
    return [];
  }
}
