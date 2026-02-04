'use client';

import { BalanceSnapshot } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { BalanceSnapshotForm } from 'src/features/balanceSnapshot/components/BalanceSnapshotForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function BalanceSnapshotNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <BalanceSnapshotForm
      context={context}
      onSuccess={(balanceSnapshot: BalanceSnapshot) =>
        router.push(`/balance-snapshot/${balanceSnapshot.id}`)
      }
      onCancel={() => router.push('/balance-snapshot')}
    />
  );
}
