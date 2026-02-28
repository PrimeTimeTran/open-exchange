'use client';

import { useState, useEffect } from 'react';
import { MOCK_OPTIONS_EXPIRATIONS } from './mock-data/data';
import { useOrderTicket } from '@/contexts/OrderTicketContext';

export interface OptionStrike {
  strike: number;
  isCurrent: boolean;
  call?: {
    last: number;
    change: number;
    volume: number;
    bid: number;
    ask: number;
  };
  put?: {
    last: number;
    change: number;
    volume: number;
    bid: number;
    ask: number;
  };
}

export interface OptionExpiration {
  id: string;
  label: string;
  date: string;
  strikes: OptionStrike[];
}

export function useOptionsChain() {
  const [isLoading, setIsLoading] = useState(true);
  const [chains, setChains] = useState<OptionExpiration[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>('1');
  const { addLeg, legs } = useOrderTicket();

  useEffect(() => {
    // Simulate fetch
    const timer = setTimeout(() => {
      setChains(MOCK_OPTIONS_EXPIRATIONS as OptionExpiration[]);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return {
    chains,
    isLoading,
    expandedId,
    toggleExpand,
    addLeg,
    legs,
  };
}
