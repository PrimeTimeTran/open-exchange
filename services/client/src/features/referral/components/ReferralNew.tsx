'use client';

import { Referral } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ReferralForm } from 'src/features/referral/components/ReferralForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function ReferralNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <ReferralForm
      context={context}
      onSuccess={(referral: Referral) =>
        router.push(`/referral/${referral.id}`)
      }
      onCancel={() => router.push('/referral')}
    />
  );
}
