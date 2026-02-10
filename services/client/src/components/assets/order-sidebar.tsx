'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select';
import { useLedger } from 'src/contexts/LedgerProvider';

interface OrderSidebarProps {
  symbol: string;
  isAuthenticated?: boolean;
  onSubmit?: (data: {
    asset: string;
    price?: string;
    quantity: string;
    timeInForce: string;
    type: 'market' | 'limit';
  }) => void;
}

export function OrderSidebar({
  symbol,
  isAuthenticated,
  onSubmit,
}: OrderSidebarProps) {
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('50000');
  const [timeInForce, setTimeInForce] = useState('gtc');
  const { wallets, loading } = useLedger();

  // Find Quote wallet (USD)
  const quoteWallet = wallets.find((w) => w.assetSymbol === 'USD');

  const buyingPower = quoteWallet
    ? Number(quoteWallet.available) / Math.pow(10, quoteWallet.assetDecimals)
    : 0;

  if (loading) {
    return (
      <div className="lg:w-80 w-full shrink-0">
        <div className="sticky top-24 space-y-6">
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-6 space-y-6">
            <h3 className="font-bold text-xl">Buy {symbol}</h3>
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-muted rounded w-full" />
              <div className="h-10 bg-muted rounded w-full" />
              <div className="h-10 bg-muted rounded w-full" />
              <div className="h-10 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:w-80 w-full shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden p-6 space-y-6">
          <h3 className="font-bold text-xl">Buy {symbol}</h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Order Type
              </label>
              <Select
                value={orderType}
                onValueChange={(value: 'market' | 'limit') =>
                  setOrderType(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select order type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="market">Market Order</SelectItem>
                  <SelectItem value="limit">Limit Order</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Quantity
              </label>
              <Input
                type="number"
                placeholder="0.00"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {orderType === 'limit' && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">
                  Limit Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm z-10">
                    $
                  </span>
                  <Input
                    type="number"
                    className="pl-7"
                    placeholder="0.00"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">
                Time in Force
              </label>
              <Select
                value={timeInForce}
                onValueChange={(value) => setTimeInForce(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gtc">Good Till Cancelled (GTC)</SelectItem>
                  <SelectItem value="ioc">Immediate or Cancel (IOC)</SelectItem>
                  <SelectItem value="fok">Fill or Kill (FOK)</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="primary"
              disabled={!isAuthenticated}
              onClick={() =>
                onSubmit?.({
                  asset: symbol,
                  type: orderType,
                  quantity,
                  price: orderType === 'limit' ? limitPrice : undefined,
                  timeInForce,
                })
              }
            >
              {isAuthenticated ? 'Create Order' : 'Sign in to Trade'}
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Buying Power</span>
              <span>${buyingPower.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
