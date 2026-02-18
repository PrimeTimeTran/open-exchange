'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useMemo } from 'react';
import { orderFindManyApiCall } from 'src/features/order/orderApiCalls';
import { orderEnumerators } from 'src/features/order/orderEnumerators';
import { useTradeStream } from '@/shared/hooks/useTradeStream';
import { toast } from 'src/shared/components/ui/use-toast';

export function TradeStreamProvider({
  currentUserId,
}: {
  currentUserId?: string;
}) {
  const queryClient = useQueryClient();

  // Fetch OPEN orders
  const openOrdersQuery = useQuery({
    queryKey: ['order', 'open', currentUserId],
    queryFn: async ({ signal }) => {
      if (!currentUserId) return { orders: [] };
      return await orderFindManyApiCall(
        {
          filter: {
            status: orderEnumerators.status.open,
            createdByUserId: currentUserId,
          },
        },
        signal,
      );
    },
    enabled: !!currentUserId,
    refetchInterval: 30000,
  });

  // Fetch PARTIALLY FILLED orders
  const partialOrdersQuery = useQuery({
    queryKey: ['order', 'partial_fill', currentUserId],
    queryFn: async ({ signal }) => {
      if (!currentUserId) return { orders: [] };
      return await orderFindManyApiCall(
        {
          filter: {
            status: orderEnumerators.status.partial_fill,
            createdByUserId: currentUserId,
          },
        },
        signal,
      );
    },
    enabled: !!currentUserId,
    refetchInterval: 30000,
  });

  const orders = useMemo(() => {
    return [
      ...(openOrdersData(openOrdersQuery) || []),
      ...(openOrdersData(partialOrdersQuery) || []),
    ];
  }, [openOrdersQuery.data, partialOrdersQuery.data]);
  const myOrderIds = useMemo(() => new Set(orders.map((o) => o.id)), [orders]);
  const prevIdsRef = useRef<string>('');
  const instrumentIds = useMemo(() => {
    const ids = new Set(orders.map((o) => o.instrumentId));
    ids.add('2873cb5e-d8e5-4965-9ac1-e23c9faacab1');
    const idsArr = Array.from(ids).sort();
    const idsStr = idsArr.join(',');

    if (idsStr !== prevIdsRef.current) {
      console.log('[Listener] Active Instruments:', idsArr);
      prevIdsRef.current = idsStr;
    }

    return idsStr;
  }, [orders]);

  useTradeStream(
    instrumentIds,
    myOrderIds,
    (trade) => {
      console.log('[Listener] Received Trade:', trade);
      toast({
        title: 'Order Matched!',
        description: `Fill for ${trade.InstrumentID}: ${trade.Quantity} @ ${trade.Price}`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
    (order) => {
      console.log('[Listener] Received Order Update:', order);
      if (order.Type === 'CREATED') {
        toast({
          title: 'Order Open',
          description: `Order ${order.OrderID} is now open in the book for ${order.InstrumentID}`,
        });
      } else if (order.Type === 'CANCELLED') {
        toast({
          title: 'Order Cancelled',
          description: `Order ${order.OrderID} has been cancelled`,
        });
      }

      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  );

  return null;
}

function openOrdersData(query: any) {
  return query.data?.orders;
}
