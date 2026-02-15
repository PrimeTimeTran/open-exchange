'use client';

import Link from 'next/link';
import { ArrowUpDown } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import {
  Hash,
  Scale,
  Coins,
  Receipt,
  CalendarClock,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Balance, OrderWithInstrument } from './account-client';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select';
import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
} from '@/shared/components/ui/dialog';
import { Dictionary } from '@/translation/locales';
import { CopyToClipboardButton } from '@/shared/components/CopyToClipboardButton';

function AssetLogo({ symbol, klass }: { symbol: string; klass: string }) {
  const [error, setError] = useState(false);

  if (klass === 'stock' && !error) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://www.pulserobotics.com/logos/${symbol}.png`}
        alt={symbol}
        className="h-10 w-10 rounded-full object-contain bg-white border border-outline-variant"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
      {symbol[0]}
    </div>
  );
}

export function OverviewTab({
  orders,
  balances,
  dictionary,
}: {
  balances: Balance[];
  orders: OrderWithInstrument[];
  dictionary: Dictionary;
}) {
  const [selectedOrder, setSelectedOrder] =
    useState<OrderWithInstrument | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [assetClassFilter, setAssetClassFilter] = useState<string>('all');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [balanceSortDirection, setBalanceSortDirection] = useState<
    'asc' | 'desc'
  >('desc');

  const totalValue = balances.reduce((acc, curr) => acc + curr.value, 0);

  const availableClasses = useMemo(() => {
    const classes = new Set(balances.map((b) => b.klass));
    return Array.from(classes).sort();
  }, [balances]);

  const filteredBalances = useMemo(() => {
    let result = [...balances];
    if (assetClassFilter !== 'all') {
      result = result.filter((b) => b.klass === assetClassFilter);
    }
    result.sort((a, b) => {
      return balanceSortDirection === 'asc'
        ? a.value - b.value
        : b.value - a.value;
    });
    return result;
  }, [balances, assetClassFilter, balanceSortDirection]);

  const filteredAndSortedOrders = useMemo(() => {
    let result = [...orders];

    // Filter
    if (statusFilter !== 'all') {
      result = result.filter((order) => order.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return result;
  }, [orders, sortDirection, statusFilter]);

  const toggleSort = () => {
    setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border border-outline-variant bg-surface p-6 shadow-sm">
        <h3 className="text-sm font-medium text-on-surface-variant">
          Total Balance
        </h3>
        <div className="mt-2 text-3xl font-bold text-on-surface">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">Asset Balances</h3>
          <div className="flex items-center gap-2">
            <div className="w-[140px]">
              <Select
                value={assetClassFilter}
                onValueChange={setAssetClassFilter}
              >
                <SelectTrigger className="h-8 text-xs bg-surface border-outline-variant">
                  <SelectValue placeholder="Asset Class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Assets</SelectItem>
                  {availableClasses.map((klass) => (
                    <SelectItem
                      key={klass}
                      value={klass}
                      className="capitalize"
                    >
                      {klass === 'stock' ? 'Stocks' : klass}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setBalanceSortDirection((prev) =>
                  prev === 'asc' ? 'desc' : 'asc',
                )
              }
              className="h-8 px-2 text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1"
            >
              <ArrowUpDown className="h-3 w-3" />
              {balanceSortDirection === 'asc' ? 'Low-High' : 'High-Low'}
            </Button>
          </div>
        </div>
        <div className="divide-y divide-outline-variant">
          {filteredBalances.length === 0 ? (
            <div className="p-8 text-center text-on-surface-variant">
              No assets found
            </div>
          ) : (
            filteredBalances.map((balance) => (
              <div
                key={balance.asset}
                className="flex items-center justify-between p-6 hover:bg-surface-variant/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <AssetLogo symbol={balance.asset} klass={balance.klass} />
                  <div>
                    <div className="font-medium text-on-surface flex items-center gap-2">
                      {balance.name}
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-surface-variant text-on-surface-variant uppercase tracking-wider font-semibold">
                        {balance.klass}
                      </span>
                    </div>
                    <div className="text-sm text-on-surface-variant">
                      {balance.asset}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-on-surface">
                    {balance.amount.toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: balance.decimals,
                    })}{' '}
                    {balance.asset}
                  </div>
                  <div className="text-sm text-on-surface-variant">
                    $
                    {balance.value.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="rounded-xl border border-outline-variant bg-surface shadow-sm overflow-hidden">
        <div className="p-6 border-b border-outline-variant flex items-center justify-between">
          <h3 className="font-semibold text-on-surface">Recent Orders</h3>
          <div className="flex items-center gap-2">
            <div className="w-[140px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs bg-surface border-outline-variant">
                  <SelectValue placeholder="Filter Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="filled">Filled</SelectItem>
                  <SelectItem value="partial_fill">Partial Fill</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSort}
              className="h-8 px-2 text-xs text-on-surface-variant hover:text-on-surface flex items-center gap-1"
            >
              <ArrowUpDown className="h-3 w-3" />
              {sortDirection === 'asc' ? 'Oldest' : 'Newest'}
            </Button>
          </div>
        </div>
        <div className="divide-y divide-outline-variant">
          {filteredAndSortedOrders.length === 0 ? (
            <div className="p-6 text-center text-on-surface-variant">
              No orders found
            </div>
          ) : (
            filteredAndSortedOrders.map((order) => (
              <Dialog key={order.id}>
                <DialogTrigger asChild>
                  <div
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center justify-between p-6 hover:bg-surface-variant/50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col gap-1">
                      <div className="font-medium text-on-surface flex items-center gap-2">
                        <span
                          className={
                            order.side === 'buy' ? 'text-success' : 'text-error'
                          }
                        >
                          {order.side.toUpperCase()}
                        </span>{' '}
                        {order.instrument.symbol}
                      </div>
                      <div className="text-sm text-on-surface-variant">
                        {new Date(order.createdAt).toLocaleDateString()} at{' '}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="font-medium text-on-surface">
                        {order.quantity} @ {order.price}
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            order.status === 'filled'
                              ? 'bg-success-container text-on-success-container'
                              : order.status === 'open'
                                ? 'bg-primary-container text-on-primary-container'
                                : 'bg-surface-variant text-on-surface-variant'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-surface border-outline-variant">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                      <Receipt className="h-5 w-5 text-primary" />
                      Order Details
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-6">
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                          <Hash className="h-3.5 w-3.5" /> Order ID
                        </div>
                        <div className="text-sm font-mono text-on-surface bg-surface-variant/30 p-2 rounded border border-outline-variant break-all">
                          <span className="mr-2">{order.id}</span>
                          <CopyToClipboardButton
                            text={order.id}
                            dictionary={dictionary}
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" /> Created At
                        </div>
                        <div className="text-sm text-on-surface p-2">
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                          <ArrowRightLeft className="h-3.5 w-3.5" /> Instrument
                        </div>
                        <div className="text-sm text-on-surface font-semibold p-2">
                          <Link
                            href={`/assets/${order.instrument.symbol.split('_')[0]}`}
                            className="hover:underline text-primary"
                          >
                            {order.instrument.symbol}
                          </Link>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                          <Scale className="h-3.5 w-3.5" /> Side
                        </div>
                        <div className="p-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium uppercase ${
                              order.side === 'buy'
                                ? 'bg-success/10 text-success'
                                : 'bg-error/10 text-error'
                            }`}
                          >
                            {order.side}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                          <Coins className="h-3.5 w-3.5" /> Price
                        </div>
                        <div className="text-sm text-on-surface font-medium p-2">
                          {order.price.toLocaleString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                          <Scale className="h-3.5 w-3.5" /> Quantity
                        </div>
                        <div className="text-sm text-on-surface font-medium p-2">
                          {order.quantityFilled} / {order.quantity}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-outline-variant pt-6">
                      <h4 className="text-sm font-semibold mb-4 flex items-center gap-2 text-on-surface">
                        <Receipt className="h-4 w-4" /> Trade Fills
                      </h4>
                      {order.fills.length === 0 ? (
                        <div className="text-sm text-on-surface-variant text-center py-8 bg-surface-variant/10 rounded-lg border border-dashed border-outline-variant">
                          No fills recorded
                        </div>
                      ) : (
                        <div className="rounded-lg border border-outline-variant overflow-hidden">
                          <div className="grid grid-cols-4 bg-surface-variant/50 border-b border-outline-variant px-4 py-2 text-xs font-medium text-on-surface-variant uppercase tracking-wider">
                            <div>Time</div>
                            <div className="text-right">Price</div>
                            <div className="text-right">Quantity</div>
                            <div className="text-right">Fee</div>
                          </div>
                          <div className="divide-y divide-outline-variant">
                            {order.fills.map((fill, i) => (
                              <div
                                key={i}
                                className="grid grid-cols-4 text-sm text-on-surface px-4 py-3 hover:bg-surface-variant/30 transition-colors"
                              >
                                <div className="text-xs text-on-surface-variant flex items-center">
                                  {new Date(
                                    fill.createdAt,
                                  ).toLocaleTimeString()}
                                </div>
                                <div className="text-right font-mono">
                                  {fill.price.toLocaleString()}
                                </div>
                                <div className="text-right font-mono">
                                  {fill.quantity}
                                </div>
                                <div className="text-right text-xs text-on-surface-variant flex flex-col justify-center items-end">
                                  <span className="font-medium text-on-surface">
                                    {fill.fee}
                                  </span>
                                  <span>{fill.feeCurrency}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
