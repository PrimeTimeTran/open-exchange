import React from 'react';
import { Balance, OrderWithInstrument } from './account-client';

export function OverviewTab({
  balances,
  orders,
}: {
  balances: Balance[];
  orders: OrderWithInstrument[];
}) {
  const totalValue = balances.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
        <h3 className="text-sm font-medium text-[var(--on-surface-variant)]">
          Total Balance
        </h3>
        <div className="mt-2 text-3xl font-bold text-[var(--on-surface)]">
          ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
      </div>

      <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--outline-variant)]">
          <h3 className="font-semibold text-[var(--on-surface)]">
            Asset Balances
          </h3>
        </div>
        <div className="divide-y divide-[var(--outline-variant)]">
          {balances.map((balance) => (
            <div
              key={balance.asset}
              className="flex items-center justify-between p-6 hover:bg-[var(--surface-variant)]/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-[var(--primary-container)] flex items-center justify-center font-bold text-[var(--on-primary-container)]">
                  {balance.asset[0]}
                </div>
                <div>
                  <div className="font-medium text-[var(--on-surface)]">
                    {balance.name}
                  </div>
                  <div className="text-sm text-[var(--on-surface-variant)]">
                    {balance.asset}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-[var(--on-surface)]">
                  {balance.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: balance.decimals,
                  })}{' '}
                  {balance.asset}
                </div>
                <div className="text-sm text-[var(--on-surface-variant)]">
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
      <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--outline-variant)]">
          <h3 className="font-semibold text-[var(--on-surface)]">
            Recent Orders
          </h3>
        </div>
        <div className="divide-y divide-[var(--outline-variant)]">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-[var(--on-surface-variant)]">
              No recent orders
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-6 hover:bg-[var(--surface-variant)]/50 transition-colors"
              >
                <div className="flex flex-col gap-1">
                  <div className="font-medium text-[var(--on-surface)] flex items-center gap-2">
                    <span
                      className={
                        order.side === 'buy'
                          ? 'text-[var(--success)]'
                          : 'text-[var(--error)]'
                      }
                    >
                      {order.side.toUpperCase()}
                    </span>{' '}
                    {order.instrument.symbol}
                  </div>
                  <div className="text-sm text-[var(--on-surface-variant)]">
                    {new Date(order.createdAt).toLocaleDateString()} at{' '}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <div className="font-medium text-[var(--on-surface)]">
                    {order.quantity} @ {order.price}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        order.status === 'filled'
                          ? 'bg-[var(--success-container)] text-[var(--on-success-container)]'
                          : order.status === 'open'
                          ? 'bg-[var(--primary-container)] text-[var(--on-primary-container)]'
                          : 'bg-[var(--surface-variant)] text-[var(--on-surface-variant)]'
                      }`}
                    >
                      {order.status}
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
