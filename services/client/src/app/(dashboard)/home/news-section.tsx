import React from 'react';
import Link from 'next/link';

export function NewsSection() {
  return (
    <div className="space-y-6 pt-4">
      <h2 className="text-2xl font-bold">News</h2>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Link
            key={i}
            href={`/news/article-${i}`}
            className="flex gap-4 group cursor-pointer"
          >
            <div className="w-24 h-16 bg-muted rounded-md shrink-0" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-bold">CoinDesk</span>
                <span>•</span>
                <span>2h ago</span>
              </div>
              <h3 className="font-medium group-hover:text-primary transition-colors line-clamp-2">
                Bitcoin Surges Past $43k as Institutional Adoption Grows
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
