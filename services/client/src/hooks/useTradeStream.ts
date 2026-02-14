import { useEffect } from 'react';

export function useTradeStream(
  instrumentId: string | undefined,
  myOrderIds: Set<string>,
  onMatch: (trade: any) => void,
  onOrderUpdate?: (order: any) => void,
) {
  useEffect(() => {
    if (!instrumentId) return;

    console.log('[useTradeStream] Connecting to stream for:', instrumentId);
    const eventSource = new EventSource(
      `/api/stream/trades?instrumentId=${instrumentId}`,
    );

    eventSource.onopen = () => {
      console.log('[useTradeStream] Connected!');
    };

    eventSource.onerror = (err) => {
      console.error('[useTradeStream] Connection Error:', err);
    };

    eventSource.onmessage = (event) => {
      try {
        console.log('[useTradeStream] Raw Event:', event.data);
        const data = JSON.parse(event.data);

        if (data.eventType === 'trade') {
          // Check if this trade involves one of our orders
          if (
            myOrderIds.has(data.MakerOrderID) ||
            myOrderIds.has(data.TakerOrderID)
          ) {
            console.log('[useTradeStream] Trade MATCHED:', data);
            onMatch(data);
          }
        } else if (data.eventType === 'orderbook') {
          // Check if this order book event involves one of our orders
          if (myOrderIds.has(data.OrderID)) {
            console.log('[useTradeStream] Order UPDATE:', data);
            if (onOrderUpdate) onOrderUpdate(data);
          } else {
            // For debugging: verify if we are missing it
            // console.log('[useTradeStream] Ignoring order update for', data.OrderID);
          }
        }
      } catch (e) {
        console.error('Failed to parse stream event', e);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [instrumentId, myOrderIds, onMatch, onOrderUpdate]);
}
