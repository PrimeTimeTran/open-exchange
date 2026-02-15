'use client';

import React, { useState } from 'react';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet as WalletIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OverviewTab } from './overview-tab';
import { DepositTab } from './deposit-tab';
import { WithdrawTab } from './withdraw-tab';

export type Balance = {
  asset: string;
  name: string;
  klass: string;
  amount: number;
  value: number;
  decimals: number;
};

export type OrderWithInstrument = {
  id: string;
  side: string;
  type: string;
  price: number;
  quantity: number;
  quantityFilled: number;
  status: string;
  createdAt: Date;
  instrument: { symbol: string };
};

export type DepositWithAsset = {
  id: string;
  amount: number;
  status: string;
  chain: string;
  txHash: string;
  createdAt: Date;
  asset: { symbol: string };
};

export type WithdrawalWithAsset = {
  id: string;
  amount: number;
  status: string;
  destinationAddress: string;
  chain: string;
  txHash: string;
  createdAt: Date;
  asset: { symbol: string };
};

interface AccountClientProps {
  balances: Balance[];
  assets: string[];
  orders: OrderWithInstrument[];
  deposits: DepositWithAsset[];
  withdrawals: WithdrawalWithAsset[];
  initialTab?: 'overview' | 'deposit' | 'withdraw';
}

export function AccountClient({
  balances,
  assets,
  orders,
  deposits,
  withdrawals,
  initialTab = 'overview',
}: AccountClientProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'deposit' | 'withdraw'
  >(initialTab);

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4 ">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight ">Wallet & Funds</h1>
        <p>Manage your assets, make deposits, and request withdrawals.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="lg:w-1/4">
          <nav className="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1">
            <Button
              variant={activeTab === 'overview' ? 'primary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('overview')}
            >
              <WalletIcon className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === 'deposit' ? 'primary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('deposit')}
            >
              <ArrowDownCircle className="mr-2 h-4 w-4" />
              Deposit
            </Button>
            <Button
              variant={activeTab === 'withdraw' ? 'primary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('withdraw')}
            >
              <ArrowUpCircle className="mr-2 h-4 w-4" />
              Withdraw
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-h-125">
          {activeTab === 'overview' && (
            <OverviewTab balances={balances} orders={orders} />
          )}
          {activeTab === 'deposit' && <DepositTab assets={assets} />}
          {activeTab === 'withdraw' && <WithdrawTab assets={assets} />}
        </main>
      </div>
    </div>
  );
}
