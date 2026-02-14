'use client';

import { ArrowUpDown } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Balance, OrderWithInstrument } from './account-client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
}: {
  balances: Balance[];
  orders: OrderWithInstrument[];
}) {
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
              <div
                key={order.id}
                className="flex items-center justify-between p-6 hover:bg-surface-variant/50 transition-colors"
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
