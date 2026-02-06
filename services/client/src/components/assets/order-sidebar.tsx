import React from 'react';
import { Button } from '@/components/ui';

interface OrderSidebarProps {
  symbol: string;
}

export function OrderSidebar({ symbol }: OrderSidebarProps) {
  return (
    <div className="lg:w-80 w-full shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-6 space-y-6">
          <h3 className="font-bold text-xl">Buy {symbol}</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Order Type</span>
              <span className="text-primary font-bold cursor-pointer">
                Market Order
              </span>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  className="w-full bg-background border border-input rounded-md py-2 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0.00"
                />
              </div>
            </div>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md font-medium transition-colors">
              Review Order
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Buying Power</span>
              <span>$12,450.00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
