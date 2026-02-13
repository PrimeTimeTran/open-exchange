'use client';

import React, { useState, useMemo } from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Balance, OrderWithInstrument } from './account-client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function OverviewTab({
  balances,
  orders,
}: {
  balances: Balance[];
  orders: OrderWithInstrument[];
}) {
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const totalValue = balances.reduce((acc, curr) => acc + curr.value, 0);

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
        <div className="p-6 border-b border-outline-variant">
          <h3 className="font-semibold text-on-surface">Asset Balances</h3>
        </div>
        <div className="divide-y divide-outline-variant">
          {balances.map((balance) => (
            <div
              key={balance.asset}
              className="flex items-center justify-between p-6 hover:bg-surface-variant/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
                  {balance.asset[0]}
                </div>
                <div>
                  <div className="font-medium text-on-surface">
                    {balance.name}
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
          ))}
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
