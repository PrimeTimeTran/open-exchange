'use client';

import { Account } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { AccountForm } from 'src/features/account/components/AccountForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function AccountNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <AccountForm
      context={context}
      onSuccess={(account: Account) =>
        router.push(`/account/${account.id}`)
      }
      onCancel={() => router.push('/account')}
    />
  );
}
