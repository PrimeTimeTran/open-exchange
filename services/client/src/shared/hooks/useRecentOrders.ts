'use client';

import { useState, useEffect } from 'react';
import { MOCK_RECENT_ORDERS } from './mock-data/data';

export interface Order {
  id: string;
  symbol: string;
  status: string;
  limit: number;
  exp: string;
  type: string;
  qty: number;
  [key: string]: any; // Allow index access for dynamic columns
}

export function useRecentOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetch
    const timer = setTimeout(() => {
      setOrders(MOCK_RECENT_ORDERS);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return {
    orders,
    isLoading,
  };
}
