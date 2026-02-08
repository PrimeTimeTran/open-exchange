'use client';

import React, { useState } from 'react';
import { Copy, Clock, Building, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from '@/components/ui/select';
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '@/shared/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Mock data for deposit instructions
const DEPOSIT_INFO: Record<string, any> = {
  USD: {
    type: 'fiat',
    method: 'Bank Wire / ACH',
    beneficiaryName: 'Open Exchange Inc.',
    bankName: 'Silvergate Bank',
    routingNumber: '021000021',
    accountNumber: '9876543210',
    reference: 'USER-88392-DEP', // In production, this would be dynamic per user
    estimatedTime: '1-3 Business Days',
    instructions: [
      'Initiate a wire transfer from your bank account.',
      'Include your Reference ID in the memo field.',
      'Transfers without a Reference ID may be delayed or returned.',
    ],
  },
  BTC: {
    type: 'crypto',
    network: 'Bitcoin',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    confirmations: 3,
    estimatedTime: '~30-60 minutes',
    warning: 'Send only BTC to this address.',
  },
  ETH: {
    type: 'crypto',
    network: 'Ethereum (ERC-20)',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    confirmations: 12,
    estimatedTime: '~5-15 minutes',
    warning: 'Send only ETH or ERC-20 tokens to this address.',
  },
  OPENC: {
    type: 'crypto',
    network: 'Ethereum (ERC-20)',
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    confirmations: 12,
    estimatedTime: '~5-15 minutes',
    warning: 'Send only OPENC tokens to this address.',
  },
};

export function DepositTab({ assets }: { assets: string[] }) {
  const [selectedAsset, setSelectedAsset] = useState(assets[0] || 'BTC');
  const [copied, setCopied] = useState(false);

  const assetInfo = DEPOSIT_INFO[selectedAsset] || {
    type: 'crypto',
    network: 'Unknown',
    address: 'Generating address...',
    confirmations: 0,
    estimatedTime: 'Unknown',
    warning: `Send only ${selectedAsset} to this address.`,
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Deposit Funds</CardTitle>
          <CardDescription>
            Select an asset and follow the instructions to fund your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Select Asset
            </label>
            <Select value={selectedAsset} onValueChange={setSelectedAsset}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset} value={asset}>
                    {asset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {assetInfo.type === 'fiat' ? (
            <div className="space-y-6">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertTitle>Estimated Settlement Time</AlertTitle>
                <AlertDescription>{assetInfo.estimatedTime}</AlertDescription>
              </Alert>

              <div className="space-y-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
                <div className="flex items-center gap-2 border-b pb-2 font-semibold">
                  <Building className="h-5 w-5" />
                  Wire Instructions
                </div>

                <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
                  <div>
                    <span className="block mb-1 text-muted-foreground">
                      Beneficiary Name
                    </span>
                    <div className="font-medium">
                      {assetInfo.beneficiaryName}
                    </div>
                  </div>
                  <div>
                    <span className="block mb-1 text-muted-foreground">
                      Bank Name
                    </span>
                    <div className="font-medium">{assetInfo.bankName}</div>
                  </div>
                  <div>
                    <span className="block mb-1 text-muted-foreground">
                      Routing Number
                    </span>
                    <div className="flex items-center gap-2 font-medium">
                      {assetInfo.routingNumber}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopy(assetInfo.routingNumber)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div>
                    <span className="block mb-1 text-muted-foreground">
                      Account Number
                    </span>
                    <div className="flex items-center gap-2 font-medium">
                      {assetInfo.accountNumber}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 text-muted-foreground hover:text-foreground"
                        onClick={() => handleCopy(assetInfo.accountNumber)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-dashed border-primary/50 bg-muted/50 p-3">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-primary">
                    Important Reference / Memo
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg font-bold">
                      {assetInfo.reference}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                      onClick={() => handleCopy(assetInfo.reference)}
                    >
                      {copied ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    You MUST include this Reference ID in your bank transfer
                    memo field to ensure your deposit is credited automatically.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Instructions</h4>
                <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {assetInfo.instructions.map((step: string, i: number) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Estimated Arrival</AlertTitle>
                  <AlertDescription>
                    {assetInfo.estimatedTime} ({assetInfo.confirmations}{' '}
                    confirmations)
                  </AlertDescription>
                </Alert>
                <Alert
                  variant="default"
                  className="border-yellow-500/50 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                >
                  <AlertCircle className="h-4 w-4 stroke-yellow-600 dark:stroke-yellow-400" />
                  <AlertTitle>Network</AlertTitle>
                  <AlertDescription>
                    Send only on <strong>{assetInfo.network}</strong> network.
                  </AlertDescription>
                </Alert>
              </div>

              <div className="flex flex-col items-center justify-center rounded-lg border border-border bg-background p-6">
                {/* QR Code Placeholder */}
                <div className="mb-4 flex h-48 w-48 items-center justify-center rounded bg-surface font-mono text-xs text-white">
                  [QR CODE: {assetInfo.address.substring(0, 8)}...]
                </div>
                <p className="text-sm text-gray-500">
                  Scan to deposit {selectedAsset}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Deposit Address
                </label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={assetInfo.address}
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleCopy(assetInfo.address)}
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {assetInfo.warning}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
