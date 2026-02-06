import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui';
import { WATCHLIST, LISTS } from './data';

export function WatchlistSidebar() {
  return (
    <div className="lg:w-80 w-full shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h2 className="font-bold">Lists</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="divide-y divide-border">
            <div className="bg-muted/50 p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-4">
              Watchlist
            </div>
            {WATCHLIST.map((item) => (
              <Link
                key={item.symbol}
                href={`/assets/${item.symbol}`}
                className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer block"
              >
                <div className="flex flex-col">
                  <span className="font-bold">{item.symbol}</span>
                  <span className="text-xs text-muted-foreground">
                    {item.name}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-medium">{item.price}</span>
                  <span
                    className={`text-xs font-medium flex items-center ${
                      item.up ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {item.up ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    )}
                    {item.change}
                  </span>
                </div>
              </Link>
            ))}

            {/* Render Categories */}
            {(Object.keys(LISTS) as Array<keyof typeof LISTS>).map(
              (category) => (
                <div key={category} className="divide-y divide-border">
                  <div className="bg-secondary/50 p-2 text-xs font-bold text-muted-foreground uppercase tracking-wider px-4">
                    {category}
                  </div>
                  {LISTS[category].map((item) => (
                    <Link
                      key={item.symbol}
                      href={`/assets/${item.symbol}`}
                      className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors cursor-pointer block"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold">{item.symbol}</span>
                        <span className="text-xs text-muted-foreground">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{item.price}</span>
                        <span
                          className={`text-xs font-medium flex items-center ${
                            item.up ? 'text-green-500' : 'text-red-500'
                          }`}
                        >
                          {item.up ? (
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                          )}
                          {item.change}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Deposit Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm text-center space-y-4">
          <h3 className="font-bold">Fund your account</h3>
          <p className="text-sm text-muted-foreground">
            You're ready to trade! Deposit funds to start building your
            portfolio.
          </p>
          <Button className="w-full">Deposit Funds</Button>
        </div>
      </div>
    </div>
  );
}
