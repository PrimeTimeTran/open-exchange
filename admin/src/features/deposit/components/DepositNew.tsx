'use client';

import { Deposit } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { DepositForm } from 'src/features/deposit/components/DepositForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function DepositNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <DepositForm
      context={context}
      onSuccess={(deposit: Deposit) =>
        router.push(`/deposit/${deposit.id}`)
      }
      onCancel={() => router.push('/deposit')}
    />
  );
}
