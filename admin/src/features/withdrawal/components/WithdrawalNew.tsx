'use client';

import { Withdrawal } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { WithdrawalForm } from 'src/features/withdrawal/components/WithdrawalForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function WithdrawalNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <WithdrawalForm
      context={context}
      onSuccess={(withdrawal: Withdrawal) =>
        router.push(`/withdrawal/${withdrawal.id}`)
      }
      onCancel={() => router.push('/withdrawal')}
    />
  );
}
