'use client';

import { Fill } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FillForm } from 'src/features/fill/components/FillForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function FillNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <FillForm
      context={context}
      onSuccess={(fill: Fill) =>
        router.push(`/fill/${fill.id}`)
      }
      onCancel={() => router.push('/fill')}
    />
  );
}
