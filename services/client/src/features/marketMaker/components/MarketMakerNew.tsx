'use client';

import { MarketMaker } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { MarketMakerForm } from 'src/features/marketMaker/components/MarketMakerForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function MarketMakerNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <MarketMakerForm
      context={context}
      onSuccess={(marketMaker: MarketMaker) =>
        router.push(`/market-maker/${marketMaker.id}`)
      }
      onCancel={() => router.push('/market-maker')}
    />
  );
}
