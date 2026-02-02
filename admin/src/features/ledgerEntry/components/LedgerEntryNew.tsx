'use client';

import { LedgerEntry } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { LedgerEntryForm } from 'src/features/ledgerEntry/components/LedgerEntryForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function LedgerEntryNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <LedgerEntryForm
      context={context}
      onSuccess={(ledgerEntry: LedgerEntry) =>
        router.push(`/ledger-entry/${ledgerEntry.id}`)
      }
      onCancel={() => router.push('/ledger-entry')}
    />
  );
}
