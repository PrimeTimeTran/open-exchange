import { useMarketData } from '../contexts/MarketDataProvider';

export function useTicker(symbol: string) {
  const { prices } = useMarketData();
  return prices[symbol] || { last: 0, change: 0, pct: 0 };
}
