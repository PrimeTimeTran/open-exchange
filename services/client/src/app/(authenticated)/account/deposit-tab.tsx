'use client';

import React, { useState } from 'react';
import { CreditCard, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function DepositTab({ assets }: { assets: string[] }) {
  const [selectedAsset, setSelectedAsset] = useState('BTC');
  const [copied, setCopied] = useState(false);

  const depositAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'; // Dummy BTC address

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface)] p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-[var(--on-surface)]">
          Deposit Funds
        </h3>

        <div className="space-y-4">
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

          {selectedAsset === 'USD' ? (
            <div className="p-4 rounded-lg bg-[var(--surface-variant)] border border-[var(--outline-variant)]">
              <div className="flex items-center gap-3 mb-2">
                <CreditCard className="h-5 w-5 text-[var(--primary)]" />
                <span className="font-medium text-[var(--on-surface-variant)]">
                  Bank Transfer (Wire/ACH)
                </span>
              </div>
              <p className="text-sm text-[var(--on-surface-variant)] mb-4">
                To deposit USD, please initiate a wire transfer from your bank
                account using the following details.
              </p>
              <Button variant="outline" className="w-full">
                View Wire Instructions
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-[var(--surface-variant)] flex flex-col items-center justify-center min-h-[200px]">
                {/* QR Code Placeholder */}
                <div className="w-32 h-32 bg-white rounded-lg mb-4 flex items-center justify-center text-black font-mono text-xs">
                  [QR CODE]
                </div>
                <p className="text-sm text-[var(--on-surface-variant)]">
                  Scan to deposit {selectedAsset}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block text-[var(--on-surface)]">
                  Deposit Address
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={depositAddress}
                    className="font-mono text-sm bg-[var(--surface)] border-[var(--outline)] text-[var(--on-surface)]"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopy}>
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-[var(--success)]" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-[var(--on-surface-variant)] mt-2 text-center">
                  Only send {selectedAsset} to this address. Sending any other
                  asset may result in permanent loss.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
