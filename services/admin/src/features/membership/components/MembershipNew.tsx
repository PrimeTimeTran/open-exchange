'use client';

import { Membership } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { MembershipNewForm } from 'src/features/membership/components/MembershipNewForm';
import { AppContext } from 'src/shared/controller/appContext';

export function MembershipNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <MembershipNewForm
      context={context}
      onSuccess={(membership: Membership) =>
        router.push(`/membership/${membership.id}`)
      }
      onCancel={() => router.push('/membership')}
    />
  );
}
