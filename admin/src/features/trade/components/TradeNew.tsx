'use client';

import { Trade } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { TradeForm } from 'src/features/trade/components/TradeForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function TradeNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <TradeForm
      context={context}
      onSuccess={(trade: Trade) =>
        router.push(`/trade/${trade.id}`)
      }
      onCancel={() => router.push('/trade')}
    />
  );
}
