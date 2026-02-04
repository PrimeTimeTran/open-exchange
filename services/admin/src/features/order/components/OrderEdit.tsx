'use client';

import { Order } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { OrderForm } from 'src/features/order/components/OrderForm';
import { orderFindApiCall } from 'src/features/order/orderApiCalls';
import { orderLabel } from 'src/features/order/orderLabel';
import { OrderWithRelationships } from 'src/features/order/orderSchemas';
import Breadcrumb from 'src/shared/components/Breadcrumb';
import { toast } from 'src/shared/components/ui/use-toast';
import { AppContext } from 'src/shared/controller/appContext';
import { Logger } from 'src/shared/lib/Logger';

export default function OrderEdit({
  context,
  id,
}: {
  context: AppContext;
  id: string;
}) {
  const dictionary = context.dictionary;
  const router = useRouter();
  const [order, setOrder] = useState<OrderWithRelationships>();

  useEffect(() => {
    async function doFetch() {
      try {
        setOrder(undefined);
        const order = await orderFindApiCall(id);

        if (!order) {
          router.push('/order');
        }

        setOrder(order);
      } catch (error: any) {
        Logger.error(error);
        toast({
          description: error.message || dictionary.shared.errors.unknown,
          variant: 'destructive',
        });
        router.push('/order');
      }
    }

    doFetch();
  }, [id, router, dictionary.shared.errors.unknown]);

  if (!order) {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col">
      <Breadcrumb
        items={[
          [dictionary.order.list.menu, '/order'],
          [orderLabel(order, context.dictionary), `/order/${order?.id}`],
          [dictionary.order.edit.menu],
        ]}
      />
      <div className="my-10">
        <OrderForm
          context={context}
          order={order}
          onSuccess={(order: Order) => router.push(`/order/${order.id}`)}
          onCancel={() => router.push('/order')}
        />
      </div>
    </div>
  );
}
