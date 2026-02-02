'use client';

import { TradeFill } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { TradeFillForm } from 'src/features/tradeFill/components/TradeFillForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function TradeFillNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <TradeFillForm
      context={context}
      onSuccess={(tradeFill: TradeFill) =>
        router.push(`/trade-fill/${tradeFill.id}`)
      }
      onCancel={() => router.push('/trade-fill')}
    />
  );
}
