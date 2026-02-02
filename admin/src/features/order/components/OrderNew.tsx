'use client';

import { Order } from '@prisma/client';
import { useRouter } from 'next/navigation';
import React from 'react';
import { OrderForm } from 'src/features/order/components/OrderForm';
import { AppContext } from 'src/shared/controller/appContext';

export default function OrderNew({ context }: { context: AppContext }) {
  const router = useRouter();

  return (
    <OrderForm
      context={context}
      onSuccess={(order: Order) =>
        router.push(`/order/${order.id}`)
      }
      onCancel={() => router.push('/order')}
    />
  );
}
