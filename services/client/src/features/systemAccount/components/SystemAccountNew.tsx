'use client';

import { SystemAccount } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { SystemAccountForm } from 'src/features/systemAccount/components/SystemAccountForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function SystemAccountNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <SystemAccountForm
      context={context}
      onSuccess={(systemAccount: SystemAccount) =>
        router.push(`/system-account/${systemAccount.id}`)
      }
      onCancel={() => router.push('/system-account')}
    />
  );
}
