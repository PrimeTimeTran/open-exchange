'use client';

import React, { useEffect, useState } from 'react';

type TickerItem = {
  s: string;
  p: string;
  c: string;
  up: boolean;
};

const INITIAL_DATA: TickerItem[] = [
  { s: 'BTC/USD', p: '43,240.50', c: '+2.4%', up: true },
  { s: 'ETH/USD', p: '2,310.20', c: '+1.8%', up: true },
  { s: 'SOL/USD', p: '98.45', c: '-0.5%', up: false },
  { s: 'AAPL', p: '185.90', c: '+0.4%', up: true },
  { s: 'TSLA', p: '215.30', c: '-1.2%', up: false },
  { s: 'AMD', p: '148.20', c: '+3.1%', up: true },
  { s: 'ES_F', p: '4,890.50', c: '+0.1%', up: true },
  { s: 'NQ_F', p: '17,450.25', c: '-0.2%', up: false },
];

export function MarketTicker() {
  const [data, setData] = useState<TickerItem[]>(INITIAL_DATA);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prevData) => {
        return prevData.map((item) => {
          // 30% chance to update any given item
          if (Math.random() > 0.3) return item;

          // Parse price
          const price = parseFloat(item.p.replace(/,/g, ''));
          // Random move between -0.2% and +0.2%
          const move = (Math.random() - 0.5) * 0.004;
          const newPrice = price * (1 + move);

          // Update percentage change roughly
          const currentChange = parseFloat(item.c.replace('%', ''));
          const newChange = currentChange + move * 100;

          return {
            ...item,
            p: newPrice.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
            c: `${newChange > 0 ? '+' : ''}${newChange.toFixed(1)}%`,
            up: newChange > 0,
          };
        });
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-surface-variant/50 border-y border-outline-variant/50 overflow-hidden py-3">
      <div className="group flex overflow-hidden">
        <div
          className="flex shrink-0 animate-scroll items-center gap-12 px-6"
          style={{ '--animation-duration': '40s' } as React.CSSProperties}
        >
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm font-mono">
              <span className="font-bold text-on-surface">{item.s}</span>
              <span className="text-muted-foreground">{item.p}</span>
              <span className={item.up ? 'text-green-500' : 'text-red-500'}>
                {item.c}
              </span>
            </div>
          ))}
        </div>
        <div
          className="flex shrink-0 animate-scroll items-center gap-12 px-6"
          style={{ '--animation-duration': '40s' } as React.CSSProperties}
          aria-hidden="true"
        >
          {data.map((item, i) => (
            <div
              key={`dup-${i}`}
              className="flex items-center gap-2 text-sm font-mono"
            >
              <span className="font-bold text-on-surface">{item.s}</span>
              <span className="text-muted-foreground">{item.p}</span>
              <span className={item.up ? 'text-green-500' : 'text-red-500'}>
                {item.c}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
