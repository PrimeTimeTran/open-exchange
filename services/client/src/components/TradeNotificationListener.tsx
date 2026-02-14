'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { orderFindManyApiCall } from 'src/features/order/orderApiCalls';
import { orderEnumerators } from 'src/features/order/orderEnumerators';
import { useTradeStream } from 'src/hooks/useTradeStream';
import { toast } from 'src/shared/components/ui/use-toast';

export function TradeNotificationListener() {
  const queryClient = useQueryClient();

  // Fetch OPEN orders
  const openOrdersQuery = useQuery({
    queryKey: ['order', 'open'],
    queryFn: async ({ signal }) => {
      return await orderFindManyApiCall(
        {
          filter: { status: orderEnumerators.status.open },
        },
        signal,
      );
    },
    refetchInterval: 30000,
  });

  // Fetch PARTIALLY FILLED orders
  const partialOrdersQuery = useQuery({
    queryKey: ['order', 'partial_fill'],
    queryFn: async ({ signal }) => {
      return await orderFindManyApiCall(
        {
          filter: { status: orderEnumerators.status.partial_fill },
        },
        signal,
      );
    },
    refetchInterval: 30000,
  });

  const orders = useMemo(() => {
    return [
      ...(openOrdersData(openOrdersQuery) || []),
      ...(openOrdersData(partialOrdersQuery) || []),
    ];
  }, [openOrdersQuery.data, partialOrdersQuery.data]);

  const myOrderIds = useMemo(() => new Set(orders.map((o) => o.id)), [orders]);

  const instrumentIds = useMemo(() => {
    const ids = new Set(orders.map((o) => o.instrumentId));
    console.log('[Listener] Active Instruments:', Array.from(ids));
    // Hardcoded BTC_USD ID for debugging
    ids.add('2873cb5e-d8e5-4965-9ac1-e23c9faacab1');
    return Array.from(ids).join(',');
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
