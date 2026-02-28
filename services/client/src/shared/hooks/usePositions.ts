'use client';

import { useState, useEffect } from 'react';
import { MOCK_POSITIONS } from './mock-data/data';

export interface Position {
  id: string;
  dte: string;
  last?: number;
  symbol: string;
  dayPnl: number;
  openPnl: number;
  openPnlPct: number;
  qty: number | string;
  isExpanded?: boolean;
  children?: Position[];
  avgPrice: number | string;
}

export function usePositions() {
  const [isLoading, setIsLoading] = useState(true);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    // Simulate fetch
    const timer = setTimeout(() => {
      setPositions(MOCK_POSITIONS as Position[]);
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Helper to toggle expansion locally for now,
  // though if we fetch, we might want to handle this differently.
  const toggleExpand = (id: string) => {
    setPositions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isExpanded: !p.isExpanded } : p)),
    );
  };

  return {
    positions,
    isLoading,
    toggleExpand,
  };
}
