'use client';

import { Chater } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { ChaterForm } from 'src/features/chater/components/ChaterForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function ChaterNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <ChaterForm
      context={context}
      onSuccess={(chater: Chater) =>
        router.push(`/chater/${chater.id}`)
      }
      onCancel={() => router.push('/chater')}
    />
  );
}
