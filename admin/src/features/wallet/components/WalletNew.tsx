'use client';

import { Wallet } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { WalletForm } from 'src/features/wallet/components/WalletForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function WalletNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <WalletForm
      context={context}
      onSuccess={(wallet: Wallet) =>
        router.push(`/wallet/${wallet.id}`)
      }
      onCancel={() => router.push('/wallet')}
    />
  );
}
