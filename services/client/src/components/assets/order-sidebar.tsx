'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, DollarSign } from 'lucide-react';
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
import { cn } from '@/lib/utils';

interface OrderSidebarProps {
  symbol: string;
  isAuthenticated?: boolean;
  onSubmit?: (data: {
    asset: string;
    side: 'buy' | 'sell';
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
  const { wallets, loading } = useLedger();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState('1');
  const [limitPrice, setLimitPrice] = useState('50000');
  const [timeInForce, setTimeInForce] = useState('gtc');
  const [orderType, setOrderType] = useState<'market' | 'limit'>('limit');

  // Find Quote wallet (USD)
  const quoteWallet = wallets.find((w) => w.assetSymbol === 'USD');
  // Find Base wallet (e.g. BTC)
  const baseWallet = wallets.find((w) => w.assetSymbol === symbol);

  const buyingPower = quoteWallet
    ? Number(quoteWallet.available) / Math.pow(10, quoteWallet.assetDecimals)
    : 0;

  const availableAsset = baseWallet
    ? Number(baseWallet.available) / Math.pow(10, baseWallet.assetDecimals)
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
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/50 rounded-lg">
            <button
              onClick={() => setSide('buy')}
              className={cn(
                'flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all duration-200',
                side === 'buy'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <TrendingUp className="w-4 h-4" />
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={cn(
                'flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-md transition-all duration-200',
                side === 'sell'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              <TrendingDown className="w-4 h-4" />
              Sell
            </button>
          </div>

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
                  <SelectItem value="market">Market</SelectItem>
                  <SelectItem value="limit">Limit</SelectItem>
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                    <DollarSign className="w-4 h-4" />
                  </span>
                  <Input
                    type="number"
                    className="pl-9"
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
              variant={side === 'buy' ? 'success' : 'destructive'}
              className="w-full font-bold shadow-md"
              disabled={!isAuthenticated}
              onClick={() =>
                onSubmit?.({
                  asset: symbol,
                  side,
                  type: orderType,
                  quantity,
                  price: orderType === 'limit' ? limitPrice : undefined,
                  timeInForce,
                })
              }
            >
              {isAuthenticated ? (
                <span className="flex items-center gap-2">
                  {side === 'buy' ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {side === 'buy' ? 'Buy' : 'Sell'} {symbol}
                </span>
              ) : (
                'Sign in to Trade'
              )}
            </Button>
          </div>

          <div className="pt-4 border-t border-border">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-muted-foreground flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                {side === 'buy' ? 'Buying Power' : 'Available'}
              </span>
              <span>
                {side === 'buy'
                  ? `$${buyingPower.toLocaleString()}`
                  : `${availableAsset.toLocaleString()} ${symbol}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
