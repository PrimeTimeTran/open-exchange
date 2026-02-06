import React from 'react';
import Link from 'next/link';

interface NewsSectionProps {
  symbol?: string;
}

export function NewsSection({ symbol }: NewsSectionProps) {
  // Mock data generation based on symbol
  const getNewsItems = () => {
    if (symbol) {
      return [
        {
          id: 1,
          source: 'CoinDesk',
          time: '2h ago',
          title: `${symbol} Shows Strong Momentum as Trading Volume Spikes`,
        },
        {
          id: 2,
          source: 'Bloomberg',
          time: '4h ago',
          title: `Analysts Predict New Highs for ${symbol} in Q4`,
        },
        {
          id: 3,
          source: 'Decrypt',
          time: '6h ago',
          title: `Institutional Investors Accumulate ${symbol} During Dip`,
        },
      ];
    }
    return [
      {
        id: 1,
        source: 'CoinDesk',
        time: '2h ago',
        title: 'Bitcoin Surges Past $65k as Institutional Adoption Grows',
      },
      {
        id: 2,
        source: 'The Block',
        time: '3h ago',
        title: 'SEC Approved New Crypto ETFs, Market Reacts Positively',
      },
      {
        id: 3,
        source: 'CoinTelegraph',
        time: '5h ago',
        title: 'Global Crypto Market Cap Reclaims $2 Trillion Level',
      },
    ];
  };

  const newsItems = getNewsItems();

  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-2xl font-bold">
        {symbol ? `${symbol} News` : 'Top News'}
      </h2>
      <div className="space-y-4">
        {newsItems.map((item) => (
          <Link
            key={item.id}
            href={`/news/article-${item.id}`}
            className="flex gap-4 group cursor-pointer"
          >
            <div className="w-24 h-16 bg-muted rounded-md shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold">{item.source}</span>
                <span>•</span>
                <span>{item.time}</span>
              </div>
              <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                {item.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
