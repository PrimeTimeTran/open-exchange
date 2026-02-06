'use client';

import { LedgerEvent } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { LedgerEventForm } from 'src/features/ledgerEvent/components/LedgerEventForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function LedgerEventNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <LedgerEventForm
      context={context}
      onSuccess={(ledgerEvent: LedgerEvent) =>
        router.push(`/ledger-event/${ledgerEvent.id}`)
      }
      onCancel={() => router.push('/ledger-event')}
    />
  );
}
