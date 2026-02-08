'use client';

import React, { useState } from 'react';
import { History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function WithdrawTab({ assets }: { assets: string[] }) {
  const [selectedAsset, setSelectedAsset] = useState('BTC');

  return (
    <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-[var(--on-surface)]">
          Withdraw Funds
        </h3>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="text-sm font-medium mb-2 block text-[var(--on-surface)]">
              Select Asset
            </label>
            <select
              className="flex h-10 w-full items-center justify-between rounded-md border border-[var(--outline)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--on-surface)] ring-offset-background placeholder:text-[var(--on-surface-variant)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
            >
              {assets.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-[var(--on-surface)]">
              Destination Address
            </label>
            <Input
              placeholder={`Enter ${selectedAsset} address`}
              className="bg-[var(--surface)] border-[var(--outline)] text-[var(--on-surface)]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block text-[var(--on-surface)]">
              Amount
            </label>
            <div className="relative">
              <Input
                type="number"
                placeholder="0.00"
                className="pr-16 bg-[var(--surface)] border-[var(--outline)] text-[var(--on-surface)]"
              />
              <div className="absolute right-3 top-2.5 text-sm text-[var(--on-surface-variant)]">
                {selectedAsset}
              </div>
            </div>
            <div className="text-xs text-[var(--on-surface-variant)] mt-1 text-right">
              Available: 0.00 {selectedAsset}
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full">
              Withdraw {selectedAsset}
            </Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
        <div className="flex items-center gap-2 text-[var(--on-surface-variant)] mb-4">
          <History className="h-4 w-4" />
          <h4 className="text-sm font-medium">Recent Withdrawals</h4>
        </div>
        <div className="text-sm text-center py-8 text-[var(--on-surface-variant)]">
          No recent withdrawals found.
        </div>
      </div>
    </div>
  );
}
