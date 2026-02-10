'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getLedgerAccounts, getLedgerWallets } from 'src/actions/ledger';
import { Account } from 'src/proto/common/account';
import { Wallet } from 'src/proto/common/wallet';

export interface WalletWithAsset extends Wallet {
  assetSymbol: string;
  assetDecimals: number;
}

// Define context shape
interface LedgerContextType {
  accounts: Account[];
  wallets: WalletWithAsset[];
  loading: boolean;
  refresh: () => Promise<void>;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export function LedgerProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [wallets, setWallets] = useState<WalletWithAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = React.useRef(false);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const accs = await getLedgerAccounts();
      setAccounts(accs);
      const allWallets: WalletWithAsset[] = [];
      for (const acc of accs) {
        const accWallets = await getLedgerWallets(acc.id!);
        allWallets.push(...accWallets);
      }
      setWallets(allWallets);
    } catch (err) {
      console.error('LedgerProvider: Error fetching accounts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchAccounts();
  }, []);

  return (
    <LedgerContext.Provider
      value={{ accounts, wallets, loading, refresh: fetchAccounts }}
    >
      {children}
    </LedgerContext.Provider>
  );
}

export function useLedger() {
  const context = useContext(LedgerContext);
  if (context === undefined) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
}
