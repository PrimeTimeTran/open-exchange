'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';

interface MarketDataState {
  prices: Record<string, { last: number; change: number; pct: number }>;
  portfolio: {
    balance: number;
    positions: any[];
  };
  orders: any[];
}

const MarketDataContext = createContext<MarketDataState | null>(null);

export function MarketDataProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [data, setData] = useState<MarketDataState>({
    prices: {},
    portfolio: { balance: 0, positions: [] },
    orders: [],
  });

  // Example SSE connection (mocked for now based on your disabled stream route)
  useEffect(() => {
    console.log('MarketDataProvider: Initializing connection...');
    // In real app: const eventSource = new EventSource('/api/stream/trades?instrumentId=ALL');

    // Mock update loop
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        prices: {
          ...prev.prices,
          PLTR: {
            last: 136.93 + (Math.random() - 0.5),
            change: 0.99,
            pct: 0.73,
          },
          BTC_USD: {
            last: 24212.19 + (Math.random() * 10 - 5),
            change: 108.7,
            pct: 0.45,
          },
        },
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <MarketDataContext.Provider value={data}>
      {children}
    </MarketDataContext.Provider>
  );
}

export function useMarketData() {
  const context = useContext(MarketDataContext);
  if (!context) {
    throw new Error('useMarketData must be used within a MarketDataProvider');
  }
  return context;
}
